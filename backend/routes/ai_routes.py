import json
import re

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_cors import CORS
import os
import google.generativeai as genai
import pdfplumber
from docx import Document
import supabase

from config.auth import admin_required

# Create Blueprint
ai_bp = Blueprint("ai_bp", __name__)
CORS(ai_bp)

# Configure Gemini
genai.configure(api_key=os.getenv("gemini_resume_builder_api_key"))

# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")


# =========================
# GENERATE PROFESSIONAL SUMMARY
# =========================
@ai_bp.route("/generate-summary", methods=["POST", "OPTIONS"])
@cross_origin(origin="https://ai-resume-builder-sable-beta.vercel.app")
def generate_summary():

    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.json or {}
    years = data.get("years", 0)
    experience_level = data.get("experienceLevel", "Junior")
    job_title = data.get("jobTitle", "Professional").strip()
    skills = ", ".join(data.get("skills", [])) or "Not specified"
    rough_summary = data.get("roughSummary", "").strip()

    prompt = f"""
        You are a professional resume writer.

        Your task is to generate a concise, polished, recruiter-friendly resume summary
        STRICTLY based on the information provided by the user.

        IMPORTANT RULES:
        - Do NOT assume the candidate is from any specific field unless explicitly stated
        - Do NOT add tools, technologies, roles, or domains that are not mentioned
        - Do NOT invent experience, education, or achievements
        - Use only the details explicitly provided below
        - If details are limited, write a general but professional summary without guessing

        Candidate Information:
        - Job Title/Role: {job_title}
        - Total Experience: {years} years
        - Experience Level: {experience_level}
        - Skills (as provided by the user): {skills}

        User-Provided Rough Summary:
        "{rough_summary}"

        Writing Guidelines:
        - Write 3–4 professional sentences
        - Use third-person language (no "I", "me", "my")
        - Tailor content specifically to a {job_title} role
        - Focus on core strengths, responsibilities, and value relevant to {job_title}
        - Keep the summary ATS-friendly and industry-specific
        - Ensure originality and clarity
    """.strip()

    try:
        response = model.generate_content(prompt)

        return jsonify({
            "status": "success",
            "optimized_resume": response.text.strip()
        })
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================
# ENHANCE JOB DESCRIPTION
# =========================
@ai_bp.route("/enhance-job-description", methods=["POST", "OPTIONS"])
@cross_origin(origin="https://ai-resume-builder-sable-beta.vercel.app")
def enhance_job_description():

    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.json or {}
    company_name = data.get("companyName", "").strip()
    job_title = data.get("jobTitle", "").strip()
    start_date = data.get("startDate", "").strip()
    end_date = data.get("endDate", "").strip()
    is_current = data.get("isCurrent", False)
    job_description = data.get("jobDescription", "").strip()

    prompt = f"""
        You are an expert resume writer specializing in professional experience descriptions.

        Your task is to enhance and optimize the job description for a resume based on the information provided.

        IMPORTANT RULES:
        - Do NOT invent achievements or responsibilities not mentioned
        - Do NOT add technologies or tools not mentioned by the user
        - Enhance clarity and impact of existing information
        - Use action verbs and quantifiable results where possible
        - Keep it concise and ATS-friendly
        - Write in bullet point format (3-5 points)

        Job Information:
        - Company Name: {company_name}
        - Job Title: {job_title}
        - Start Date: {start_date}
        - End Date: {end_date if end_date else "Present" if is_current else "Not specified"}
        - Current Role: {"Yes" if is_current else "No"}

        User-Provided Job Description:
        "{job_description}"

        Instructions:
        - Rewrite the description as 3-5 impactful bullet points
        - Start each bullet with a strong action verb
        - Include specific metrics or outcomes if mentioned
        - Focus on accomplishments and impact, not just duties
        - Make it relevant to the job title and company
        - Keep professional tone, no "I" or "me"

        Generate ONLY the bullet points, nothing else. Each point should start with a bullet (•).
    """.strip()

    try:
        response = model.generate_content(prompt)

        return jsonify({
            "status": "success",
            "enhanced_description": response.text.strip()
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================
# PARSE UPLOADED RESUME
# =========================
# ...existing code...

@ai_bp.route("/parse_resume", methods=["POST"])
@cross_origin(origin="https://ai-resume-builder-sable-beta.vercel.app")
def parse_resume():
    try:
        # =========================
        # FILE CHECK
        # =========================
        if "file" not in request.files:
            return jsonify({"status": "error", "message": "No file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"status": "error", "message": "No file selected"}), 400

        # =========================
        # EXTRACT TEXT
        # =========================
        text = ""

        if file.filename.endswith(".pdf"):
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""

        elif file.filename.endswith(".docx"):
            doc = Document(file)
            for para in doc.paragraphs:
                text += para.text + "\n"

        else:
            return jsonify({"status": "error", "message": "Unsupported file type"}), 400

        print("Extracted text length:", len(text))

        # =========================
        # 🔥 AI PROMPT (STRUCTURED)
        # =========================
        prompt = f"""
            You are an expert resume parser.

            Extract structured data from the resume text below.

            ⚠️ STRICT RULES:
            - Return ONLY valid JSON
            - No explanation text
            - Dates must be YYYY-MM
            - Use "" or [] instead of null

            RETURN THIS EXACT STRUCTURE:

            {{
            "personal_info": {{
                "fullName": "",
                "email": "",
                "phone": "",
                "location": ""
            }},
            "skills": [],
            "experience": [
                {{
                "role": "",
                "company": "",
                "startDate": "",
                "endDate": "",
                "current": false,
                "description": []
                }}
            ],
            "education": [
                {{
                "degree": "",
                "field": "",
                "college": "",
                "passingDate": "",
                "gpa": ""
                }}
            ],
            "projects": [
                {{
                "title": "",
                "description": []
                }}
            ],
            "professional_summary": ""
            }}

            Resume Text:
            {text}
            """

        # =========================
        # CALL GEMINI
        # =========================
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # =========================
        # CLEAN JSON RESPONSE
        # =========================
        try:
            parsed_json = json.loads(raw_text)
        except json.JSONDecodeError:
            json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if json_match:
                parsed_json = json.loads(json_match.group())
            else:
                raise ValueError("Invalid JSON from AI")

        # =========================
        # SAFE DEFAULT STRUCTURE
        # =========================
        parsed_json.setdefault("personal_info", {})
        parsed_json.setdefault("skills", [])
        parsed_json.setdefault("experience", [])
        parsed_json.setdefault("education", [])
        parsed_json.setdefault("projects", [])
        parsed_json.setdefault("professional_summary", "")

        return jsonify({
            "status": "success",
            "parsed_data": parsed_json
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500