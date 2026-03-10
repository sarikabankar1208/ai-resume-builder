"""
Main application entry point for the backend server.
"""
# from dotenv import load_dotenv
# load_dotenv()

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from flask_cors import cross_origin
import uuid

# Import AI-related routes
from routes.ai_routes import ai_bp

app = Flask(__name__)
#CORS(
#   app,
#   resources={r"/*": {"origins": 
#                      ["http://localhost:5173", 
#                       "http://127.0.0.1:5173", 
#                        "https://ai-resume-builder-sable-beta.vercel.app"]}},
#   supports_credentials=True
#)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://ai-resume-builder-sable-beta.vercel.app",
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "https://ai-resume-builder-1it0j9tgq-sarika-ravindra-bankars-projects.vercel.app",
            "*"  # Allow all origins (less secure but works)
        ],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

app.register_blueprint(ai_bp, url_prefix="/api")

# 🔹 TEMP STORAGE (until Supabase)
resumes_store = []

@app.route("/")
def home():
    return jsonify({"message": "Backend running"})

# 🔹 GET all resumes (Dashboard)
@app.route("/api/resumes", methods=["GET"])
def get_resumes():
    return jsonify(resumes_store)

# 🔹 GET resume by ID (Edit)
@app.route("/api/resumes/<resume_id>", methods=["GET"])
def get_resume_by_id(resume_id):
    resume = next((r for r in resumes_store if r["id"] == resume_id), None)
    if not resume:
        return jsonify({"error": "Resume not found"}), 404
    return jsonify(resume)

# 🔹 CREATE resume (LEFT Save)
@app.route("/api/resumes", methods=["POST"])
def create_resume():
    data = request.json

    resume = {
        "id": str(uuid.uuid4()),
        "personal_info": data.get("personal_info", {}),
        "professional_summary": data.get("professional_summary", ""),
        "experience": data.get("experience", []),
        "education": data.get("education", []),
        "projects": data.get("projects", []),
        "skills": data.get("skills", []),
        "updated_at": datetime.utcnow().isoformat()
    }

    resumes_store.append(resume)
    print("Created resume:", resume["id"])

    return jsonify(resume), 201

# 🔹 UPDATE resume (LEFT Save on Edit)
@app.route("/api/resumes/<resume_id>", methods=["PUT"])
def update_resume(resume_id):
    data = request.json
    resume = next((r for r in resumes_store if r["id"] == resume_id), None)

    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    resume["personal_info"] = data.get("personal_info", {})
    resume["professional_summary"] = data.get("professional_summary", "")
    resume["experience"] = data.get("experience", [])
    resume["education"] = data.get("education", [])
    resume["projects"] = data.get("projects", [])
    resume["skills"] = data.get("skills", [])
    resume["updated_at"] = datetime.utcnow().isoformat()

    print("Updated resume:", resume_id)
    return jsonify({"success": True}), 200

# 🔹 DELETE resume
@app.route("/api/resumes/<resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    global resumes_store
    resumes_store = [r for r in resumes_store if r["id"] != resume_id]
    print("Deleted resume:", resume_id)
    return jsonify({"success": True}), 200




