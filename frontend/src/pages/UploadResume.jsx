import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/UploadResume.css";

function UploadResume() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [template, setTemplate] = useState("classic");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleStartEditing = async () => {
    if (!file) {
      alert("Please upload a resume file");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      alert("Please log in first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/api/parse_resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message);
      }

      // USE BACKEND DATA DIRECTLY (NO PARSING)
      const parsedResume = result.parsed_data;

      // SAFETY DEFAULTS
      parsedResume.personal_info = parsedResume.personal_info || {};
      parsedResume.experience = parsedResume.experience || [];
      parsedResume.skills = parsedResume.skills || [];
      parsedResume.education = parsedResume.education || [];
      parsedResume.projects = parsedResume.projects || [];

      // SAVE TO DB
      const { data: savedResume, error } = await supabase
        .from("resumes")
        .insert({
          user_id: auth.user.id,
          resume_title:
            parsedResume.personal_info.fullName || "Uploaded Resume",
          personal_info: parsedResume.personal_info,
          professional_summary: parsedResume.professional_summary || "",
          experience: parsedResume.experience,
          education: parsedResume.education,
          projects: parsedResume.projects,
          skills: parsedResume.skills,
          updated_at: new Date(),
        })
        .select()
        .single();

      if (error || !savedResume?.id) {
        // fallback
        navigate("/resume-builder", {
          state: { parsedData: parsedResume, template },
        });
        return;
      }

      // OPEN IN BUILDER
      navigate(`/resume-builder?resumeId=${savedResume.id}`, {
        state: { template },
      });

    } catch (error) {
      console.error(error);
      alert("Upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload Existing Resume</h2>

      <div className="upload-actions">
        <div className="upload-card">
          
          <p style={{ marginBottom: "15px" }}>
            Upload Resume (PDF or DOCX)
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />

          <button
            className="upload-btn"
            onClick={handleStartEditing}
            disabled={loading}
          >
            {loading ? "Processing..." : "Start Editing"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default UploadResume;