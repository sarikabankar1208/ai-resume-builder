from flask import Blueprint, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

# Create Blueprint
ai_bp = Blueprint("ai_bp", __name__)
CORS(ai_bp)

# Configure Gemini
genai.configure(api_key=os.getenv("gemini_resume_builder_api_key"))

# Load only the required model
model = genai.GenerativeModel("gemini-2.5-flash")


@ai_bp.route("/generate-summary", methods=["POST", "OPTIONS"])
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

# Add this new route to your existing ai_routes.py

@ai_bp.route("/enhance-job-description", methods=["POST", "OPTIONS"])
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