import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import CreateResumeModal from "../components/CreateResumeModal";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);
  

  const fetchResumes = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    const { data } = await supabase
      .from("resumes")
      .select("id, resume_title, personal_info, updated_at")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false });

    setResumes(data || []);
  };

  /* 🔹 CREATE RESUME (MODAL FLOW) */
  const handleCreate = async (resumeTitle) => {
    setShowModal(false);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: auth.user.id,
        resume_title: resumeTitle,
        personal_info: {},
        updated_at: new Date()
      })
      .select()
      .single();
    if (error) {
    console.error("Create resume error:", error);
    alert("Failed to create resume");
    return;
    }
  

    navigate(`/resume-builder?resumeId=${data.id}`);
  };

  /* DELETE RESUME */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;  
    const { data: auth } = await supabase.auth.getUser();  
    if (!auth?.user) return;  
    await supabase  
      .from("resumes")  
      .delete()  
      .eq("id", id)  
      .eq("user_id", auth.user.id);  
    setResumes((prev) => prev.filter((r) => r.id !== id)); 
  };


  /* 🔹 EDIT RESUME */
  const handleEdit = (id) => {
    navigate(`/resume-builder?resumeId=${id}`);
  };

  return (
    <div className="dashboard-container">
      <p className="dashboard-title">
        You can now build and optimize your resume
      </p>
    
    {/* ACTION CARDS */} 
    <div className="dashboard-actions">

      {/* CREATE NEW RESUME */}
      <div className="dashboard-card" onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
        <span>+</span>
        <p>Create New Resume</p>
      </div>

      {/* UPLOAD EXISTING RESUME */}
      <div className="dashboard-card" onClick={() => navigate("/upload-resume")} style={{ cursor: "pointer" }}>
        <span>📤</span>
        <p>Upload Resume</p>
      </div>

    </div>

      

      {/* RESUME LIST */}
      <div className="resume-list">
        {resumes.map((resume) => (
          <div key={resume.id} className="resume-card-ui">
            <div className="resume-card-actions">
              <button onClick={() => handleDelete(resume.id)}>🗑</button>
              <button onClick={() => handleEdit(resume.id)}>✏️</button>
            </div>

            <div className="resume-icon">📄</div>

            <p className="resume-title">
              {resume.resume_title || "Untitled Resume"}
            </p>

            <p className="resume-date">
              Updated {new Date(resume.updated_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* CREATE RESUME MODAL */}
      {showModal && (
        <CreateResumeModal
          onCancel={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default Dashboard;

