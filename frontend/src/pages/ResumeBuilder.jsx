import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";
import PersonalInfo from "../components/resume/PersonalInfo";
import ProfessionalSummary from "../components/resume/ProfessionalSummary";
import ProfessionalExperience from "../components/resume/ProfessionalExperience";
import Education from "../components/resume/Education";
import Projects from "../components/resume/Projects";
import Skills from "../components/resume/Skills";
import ResumePreview from "../components/resume/ResumePreview";
import "../styles/ResumeForm.css";
import "../styles/ResumePreview.css";

function ResumeBuilder() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [activePanel, setActivePanel] = useState(null);
  const [accent, setAccent] = useState("blue");
  const [template, setTemplate] = useState("classic");
  const [showShare, setShowShare] = useState(false);
  const mode = location.state?.mode || "manual";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    profession: "",
    linkedin: "",
    website: "",
    summary: "",
    experiences: [],
    education: [],
    projects: [],
    skills: [],
  });

  /* =========================
     🔹 FETCH RESUME ON EDIT
     ========================= */
  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .single();

      if (error || !data) return;

      setFormData({
        fullName: data.personal_info?.fullName || "",
        email: data.personal_info?.email || "",
        phone: data.personal_info?.phone || "",
        location: data.personal_info?.location || "",
        profession: data.personal_info?.profession || "",
        linkedin: data.personal_info?.linkedin || "",
        website: data.personal_info?.website || "",
        summary: data.professional_summary || "",
        experiences: data.experience || [],
        education: data.education || [],
        projects: data.projects || [],
        skills: data.skills || [],
      });
    };

    fetchResume();
  }, [resumeId]);

  const parseExperience = (item) => {
    if (typeof item !== "string") return item;

    const lines = item.split("\n").map(line => line.trim()).filter(Boolean);
    const header = lines[0] || "";
    const body = lines.slice(1);

    // "Software Engineer | Morningstar Jun 2025 – Present" or
    // "SOFTWARE ENGINEER - Morningstar Jun 2025 – present"
    const [titlePart, restPart] = header.split(/[-|]/).map(s => s.trim());
    const [company, ...dateParts] = (restPart || "").split(/(?<=\w)\s+(?=\d)|\s+–\s+/); // flexible split
    const dateStr = dateParts.length ? dateParts.join(" ").trim() : "";

    return {
      jobTitle: titlePart || "Job Title",
      companyName: company || "Company Name",
      duration: dateStr,
      description: body,
    };
  };

  const parseGenericList = (arr, fallbackKey = "text") => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (typeof item === "string") return { [fallbackKey]: item };
      return item;
    });
  };

  useEffect(() => {
    if (mode !== "upload") return;  // SAFETY CHECK
    if (!location.state?.parsedData) return;

    const data = location.state.parsedData;

    console.log("UPLOAD MODE DATA:", data);

    setFormData((prev) => ({
      ...prev,

      fullName: data.personal_info?.fullName || "",
      email: data.personal_info?.email || "",
      phone: data.personal_info?.phone || "",
      location: data.personal_info?.location || "",

      skills: data.skills || [],

      // NEW CLEAN PARSER
      experiences: data.experience?.map((exp) => {
        const clean = exp.replace(/\s+/g, " ").trim();

        const lines = clean
          .split(/[\.\•]/)
          .map(l => l.trim())
          .filter(Boolean);

        const header = lines[0] || "";

        let role = "";
        let company = "";

        const parts = header.split("-");

        if (parts.length >= 2) {
          role = parts[0].trim();
          company = parts[1].trim();
        } else {
          role = header;
        }

        return {
          role: role,
          company: company,
          startDate: "",
          endDate: "",
          current: false,
          description: lines.slice(1)
        };
      }) || [],

      education: data.education?.map((edu) => ({
        degree: edu.degree || "",
        field: edu.field || "",
        college: edu.college || "",
        passingDate: edu.passingDate || "",
        gpa: edu.gpa || ""
      })) || [],

      projects: data.projects?.map((proj) => ({
        title: proj,
        description: ""
      })) || []

    }));

  }, [location.state, mode]);

  /* =========================
     🔹 SAVE (CREATE / UPDATE)
     ========================= */
  const handleSaveResume = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      alert("User not logged in");
      return;
    }

    const payload = {
      user_id: auth.user.id,
      personal_info: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        profession: formData.profession,
        linkedin: formData.linkedin,
        website: formData.website,
      },
      professional_summary: formData.summary,
      experience: formData.experiences,
      education: formData.education,
      projects: formData.projects,
      skills: formData.skills,
      updated_at: new Date(),
    };

    let result;
    if (resumeId) {
      result = await supabase
        .from("resumes")
        .update(payload)
        .eq("id", resumeId);
    } else {
      result = await supabase.from("resumes").insert(payload);
    }

    if (result.error) {
      alert("Failed to save resume");
      return;
    }

    alert("Resume saved successfully!");
    navigate("/dashboard");
  };

  const handleDownload = () => {
    window.print();
  };
    
  return (
    <div className="resume-builder-page">
      {/* PROGRESS BAR */}
      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      <Link to="/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="resume-builder-layout">
        {/* LEFT FORM */}
        <div className="resume-form">
          {currentStep === 1 && (
            <PersonalInfo
              formData={formData}
              setFormData={setFormData}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              accent={accent}
              setAccent={setAccent}
              setCurrentStep={setCurrentStep}
              onSave={handleSaveResume}
            />
          )}

          {currentStep === 2 && (
            <Skills
              formData={formData}
              setFormData={setFormData}
              setCurrentStep={setCurrentStep}
              onSave={handleSaveResume}
            />
          )}

          {currentStep === 3 && (
            <ProfessionalExperience
              formData={formData}
              setFormData={setFormData}
              setCurrentStep={setCurrentStep}
              onSave={handleSaveResume}
            />
          )}

          {currentStep === 4 && (
            <Education
              formData={formData}
              setFormData={setFormData}
              setCurrentStep={setCurrentStep}
              onSave={handleSaveResume}
            />
          )}

          {currentStep === 5 && (
            <Projects
              formData={formData}
              setFormData={setFormData}
              setCurrentStep={setCurrentStep}
              onSave={handleSaveResume}
            />
          )}

          {currentStep === 6 && (
            <ProfessionalSummary
              formData={formData}
              setFormData={setFormData}
              setCurrentStep={setCurrentStep}
              onSave={handleSaveResume}
            />
          )}
        </div>

        {/* RIGHT PREVIEW */}
        <div className="resume-preview-wrapper">
          <div className="resume-preview-actions">
            <button className="download-btn" onClick={handleDownload}>
              ⬇️ Download
            </button>
          </div>

          <div className="resume-preview">
            <div id="resume-preview">
              <ResumePreview
                formData={formData}
                template={template}
                accent={accent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
