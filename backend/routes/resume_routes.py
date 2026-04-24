@resume_bp.route('/admin/resume/<id>', methods=['DELETE'])
def delete_resume(id):
    try:
        from services.resume_service import delete_resume_service
        
        result = delete_resume_service(id)
        return {"message": "Resume deleted"}, 200

    except Exception as e:
        return {"error": str(e)}, 500