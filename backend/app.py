"""
Main application entry point for the backend server.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import uuid
import os

# Import AI-related routes
from routes.ai_routes import ai_bp

app = Flask(__name__)

# ✅ FIXED: Correct CORS configuration with CORRECT Vercel URL
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://ai-resume-builder-ic8r594fs-sarika-ravindra-bankars-projects.vercel.app",  # ✅ CORRECT URL
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://localhost:3000",
            "*"  # Allow all (fallback)
        ],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Register blueprints
app.register_blueprint(ai_bp, url_prefix="/api")

# 🔹 TEMP STORAGE (until Supabase integration)
resumes_store = []

# ✅ ERROR HANDLER
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

# 🔹 HOME ROUTE
@app.route("/")
def home():
    return jsonify({
        "message": "AI Resume Builder Backend",
        "version": "1.0.0",
        "status": "running"
    }), 200

# 🔹 HEALTH CHECK
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }), 200

# 🔹 GET ALL RESUMES (Dashboard)
@app.route("/api/resumes", methods=["GET"])
def get_resumes():
    try:
        return jsonify({
            "status": "success",
            "data": resumes_store,
            "count": len(resumes_store)
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# 🔹 GET RESUME BY ID (Edit)
@app.route("/api/resumes/<resume_id>", methods=["GET"])
def get_resume_by_id(resume_id):
    try:
        resume = next((r for r in resumes_store if r["id"] == resume_id), None)
        if not resume:
            return jsonify({
                "status": "error",
                "message": "Resume not found"
            }), 404
        
        return jsonify({
            "status": "success",
            "data": resume
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# 🔹 CREATE RESUME
@app.route("/api/resumes", methods=["POST"])
def create_resume():
    try:
        data = request.json
        
        # ✅ Validation
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        resume = {
            "id": str(uuid.uuid4()),
            "personal_info": data.get("personal_info", {}),
            "professional_summary": data.get("professional_summary", ""),
            "experience": data.get("experience", []),
            "education": data.get("education", []),
            "projects": data.get("projects", []),
            "skills": data.get("skills", []),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        resumes_store.append(resume)
        print(f"✅ Created resume: {resume['id']}")

        return jsonify({
            "status": "success",
            "data": resume
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating resume: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# 🔹 UPDATE RESUME
@app.route("/api/resumes/<resume_id>", methods=["PUT"])
def update_resume(resume_id):
    try:
        data = request.json
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        resume = next((r for r in resumes_store if r["id"] == resume_id), None)

        if not resume:
            return jsonify({
                "status": "error",
                "message": "Resume not found"
            }), 404

        # Update fields
        resume["personal_info"] = data.get("personal_info", resume.get("personal_info", {}))
        resume["professional_summary"] = data.get("professional_summary", resume.get("professional_summary", ""))
        resume["experience"] = data.get("experience", resume.get("experience", []))
        resume["education"] = data.get("education", resume.get("education", []))
        resume["projects"] = data.get("projects", resume.get("projects", []))
        resume["skills"] = data.get("skills", resume.get("skills", []))
        resume["updated_at"] = datetime.utcnow().isoformat()

        print(f"✅ Updated resume: {resume_id}")
        
        return jsonify({
            "status": "success",
            "data": resume
        }), 200

    except Exception as e:
        print(f"❌ Error updating resume: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# 🔹 DELETE RESUME
@app.route("/api/resumes/<resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    try:
        global resumes_store
        
        resume = next((r for r in resumes_store if r["id"] == resume_id), None)
        if not resume:
            return jsonify({
                "status": "error",
                "message": "Resume not found"
            }), 404

        resumes_store = [r for r in resumes_store if r["id"] != resume_id]
        print(f"✅ Deleted resume: {resume_id}")
        
        return jsonify({
            "status": "success",
            "message": "Resume deleted successfully"
        }), 200

    except Exception as e:
        print(f"❌ Error deleting resume: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# ✅ HANDLE PREFLIGHT REQUESTS
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )