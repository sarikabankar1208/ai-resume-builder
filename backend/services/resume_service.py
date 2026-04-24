from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

print("URL:", os.getenv("SUPABASE_URL"))
print("KEY:", os.getenv("SUPABASE_SERVICE_KEY"))

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_resume_by_id_service(id):
    response = supabase.table("resumes").select("*").eq("id", id).execute()
    
    if response.data:
        return response.data[0]
    return None

def delete_resume_service(id):
    response = supabase.table("resumes").delete().eq("id", id).execute()
    if not response.data:
        return None

    return response

    
    