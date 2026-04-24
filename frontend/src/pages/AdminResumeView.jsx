import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResumeById } from "../services/adminService";
import ClassicTemplate from "../components/resume/templates/ClassicTemplate";
import html2pdf from "html2pdf.js";
import "../styles/AdminResumeView.css";
import { Link } from "react-router-dom";


const AdminResumeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const data = await getResumeById(id);

        // ✅ MAP DB → TEMPLATE FORMAT
        const mapped = {
          fullName: data?.personal_info?.fullName || data?.fullName || "",
          profession: data?.profession || "",
          email: data?.personal_info?.email || data?.email || "",
          phone: data?.personal_info?.phone || data?.phone || "",
          location: data?.personal_info?.location || "",
          linkedin: data?.personal_info?.linkedin || "",
          summary: data?.summary || "",

          experiences: Array.isArray(data?.experience)
            ? data.experience.map((exp) => ({
                role: exp.role || "",
                company: exp.company || "",
                startDate: exp.startDate || "",
                endDate: exp.endDate || "",
                current: exp.current || false,
                description: exp.description || "",
              }))
            : [],

          education: Array.isArray(data?.education) ? data.education : [],
          projects: Array.isArray(data?.projects) ? data.projects : [],
          skills: Array.isArray(data?.skills) ? data.skills : [],
        };

        setFormData(mapped);

      } catch (err) {
        console.error(err);
      }
    };

    fetchResume();
  }, [id]);

  // 🔴 DELETE FUNCTION
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this resume?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/resume/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Delete failed");

      alert("Resume deleted");

      // 👉 Go back to admin dashboard
      navigate("/admin");

    } catch (err) {
      console.error(err);
      alert("Error deleting resume");
    }
  };

  /* DOWNLOAD */
  const handleDownload = () => {
    const element = document.getElementById("resume-preview");

    if (!element) {
      alert("Resume not ready");
      return;
    }

    const options = {
      margin: 0.5,
      filename: "resume.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(options).from(element).save();
  };

  if (!formData) return <h2 style={{ padding: "20px" }}>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}> 
        <Link to="/adminDashboard" className="back-link">
          ← Back to Dashboard
        </Link>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px", gap: "12px", }}>
        {/* DOWNLOAD BUTTON */}
        <button
          onClick={handleDownload}
          class="download-btn"
        >
          ⬇️ Download
        </button>

        <button
          onClick={handleDelete}
          class="delete-btn"
        >
          🗑️ Delete
        </button>
      </div>

      {/* RESUME PREVIEW */}
      <div style={{
        width: "100%",
        maxWidth: "800px", 
        backgroundColor: "white",
        padding: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        alignContent: "center",
        margin: "0 auto" 
      }}>
        <div id="resume-preview">
          <ClassicTemplate formData={formData} accent="blue" />
        </div>
      </div>
    </div>
  );
};

export default AdminResumeView;