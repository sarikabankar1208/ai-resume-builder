from functools import wraps
import os
from flask import request, jsonify
from flask.cli import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = request.headers.get("user_id")

        if not user_id:
            return jsonify({"message": "User ID missing"}), 401

        user = supabase.table("profiles").select("role").eq("id", user_id).execute()

        if not user.data or user.data[0]["role"] != "admin":
            return jsonify({"message": "Admin access required"}), 403

        return f(*args, **kwargs)

    return wrapper