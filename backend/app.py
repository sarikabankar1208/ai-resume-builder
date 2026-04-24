"""
Main application entry point for the backend server.
"""

import json

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import uuid
import os

from dotenv import load_dotenv
from supabase import create_client

# Import AI-related routes

from routes.ai_routes import ai_bp

# Load environment variables

# 🔥 force load .env from same folder
load_dotenv(dotenv_path=".env")



#load_dotenv()

#Supabase Connection (values loaded from .env)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)  # allow all origins

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
            "*"  # Allow all origins (less secure but works)
        ],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

app.register_blueprint(ai_bp, url_prefix="/api")

@app.route("/")
def home():
    return jsonify({"message": "Backend running"})

# 🔹 GET all resumes (Dashboard)

@app.route("/api/resumes", methods=["GET"])
def get_resumes():
    response = supabase.table("resumes").select("*").execute()
    return jsonify(response.data)

# 🔹 GET resume by ID (Edit)

@app.route('/api/admin/resume/<id>', methods=['GET'])
def get_resume_by_id(id):
    try:
        from services.resume_service import get_resume_by_id_service
        
        resume = get_resume_by_id_service(id)
        
        if not resume:
            return {"error": "Resume not found"}, 404
        
        return resume, 200

    except Exception as e:
        return {"error": str(e)}, 500
    

# 🔹 CREATE resume

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
    supabase.table("resumes").insert(resume).execute()

    print("Created resume:", resume["id"])
    return jsonify(resume), 201

# 🔹 UPDATE resume

@app.route("/api/resumes/<resume_id>", methods=["PUT"])
def update_resume(resume_id):
    data = request.json
    update_data = { 
        "personal_info": data.get("personal_info", {}), 
        "professional_summary": data.get("professional_summary", ""), 
        "experience": data.get("experience", []), 
        "education": data.get("education", []), 
        "projects": data.get("projects", []), 
        "skills": data.get("skills", []), 
        "updated_at": datetime.utcnow().isoformat() 
    } 
    supabase.table("resumes").update(update_data).eq("id", resume_id).execute() 
    print("Updated resume:", resume_id) 
    return jsonify({"success": True}), 200

# 🔹 DELETE resume

@app.route("/api/resumes/<resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    supabase.table("resumes").delete().eq("id", resume_id).execute()
    print("Deleted resume:", resume_id)
    return jsonify({"success": True}), 200


# admin panel section

'''@app.route("/api/admin/all-data", methods=["GET"])
def admin_all_data():
    try:
        # Fetch data from Supabase
        profiles_res = supabase.table("profiles").select("id,email,created_at").execute()
        resumes_res = supabase.table("resumes").select(
            "id,user_id,resume_title,updated_at,personal_info"
        ).execute()

        profiles = profiles_res.data or []
        resumes = resumes_res.data or []

        result = []

        for user in profiles:
            # Match resumes with user
            user_resumes = [
                r for r in resumes if r.get("user_id") == user.get("id")
            ]

            # Extract name from personal_info
            name = ""

            if user_resumes:
                first = user_resumes[0]
                personal_info = first.get("personal_info")

                # CASE 1: If stored as STRING
                if isinstance(personal_info, str):
                    try:
                        personal_info = json.loads(personal_info)
                    except:
                        personal_info = {}

                # CASE 2: If already OBJECT
                if isinstance(personal_info, dict):
                    name = personal_info.get("fullName", "")  

            # 🔹 Final structure
            result.append({
                "user_id": user.get("id"),
                "name": name,
                "email": user.get("email"),
                "created_at": user.get("created_at"),
                "resumes": user_resumes
            })

        return jsonify(result)

    except Exception as e:
        print("ADMIN ERROR:", str(e))
        return jsonify({"error": str(e)}), 500'''

@app.route("/api/admin/all-data", methods=["GET"])
def admin_all_data():
    try:
        print("\n========== ADMIN API CALLED ==========")

        # Fetch from Supabase
        profiles_res = supabase.table("profiles").select("*").execute()
        resumes_res = supabase.table("resumes").select("*").execute()

        print("RAW profiles_res:", profiles_res)
        print("RAW resumes_res:", resumes_res)

        # Extract data safely
        profiles = profiles_res.data or []
        resumes = resumes_res.data or []

        print("PROFILES LENGTH:", len(profiles))
        print("RESUMES LENGTH:", len(resumes))

        print("PROFILES DATA:", profiles)
        print("RESUMES DATA:", resumes)

        # Loop check
        print("\n========== LOOP DEBUG ==========")

        for user in profiles:
            print("USER:", user.get("id"))

            user_resumes = [
                r for r in resumes if r.get("user_id") == user.get("id")
            ]

            print("📄 MATCHED RESUMES:", user_resumes)

        print("\n========== RESPONSE SENT ==========")

        return jsonify({
            "profiles": profiles,
            "resumes": resumes
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/admin/resume/<resume_id>", methods=["GET"])
def admin_get_resume(resume_id):
    response = supabase.table("resumes").select("*").eq("id", resume_id).execute()

    if not response.data:
        return jsonify({"error": "Resume not found"}), 404

    return jsonify(response.data[0])


@app.route("/api/admin/resume/<resume_id>", methods=["DELETE"])
def admin_delete_resume(resume_id):
    supabase.table("resumes").delete().eq("id", resume_id).execute()
    return jsonify({"success": True}), 200


@app.route("/api/admin/user/<user_id>", methods=["DELETE"])
def admin_delete_user(user_id):
    try:
        print("Deleting user:", user_id)

        # delete resumes first
        res1 = supabase.table("resumes").delete().eq("user_id", user_id).execute()
        print("Deleted resumes:", res1.data)

        # delete profile
        res2 = supabase.table("profiles").delete().eq("id", user_id).execute()
        print("Deleted user:", res2.data)

        

        res1 = supabase.table("resumes").delete().eq("user_id", user_id).execute()
        print("🟡 Resume delete response:", res1.data)

        res2 = supabase.table("profiles").delete().eq("id", user_id).execute()
        print("🟢 Profile delete response:", res2.data)

        return jsonify({"success": True})

    except Exception as e:
        print("DELETE ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
   app.run(debug=True)