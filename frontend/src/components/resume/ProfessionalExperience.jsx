import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams } from "react-router-dom";
import { enhanceJobDescription } from "../../services/aiSummaryService"; // ✅ ADD THIS IMPORT

function ProfessionalExperience({
  formData,
  setFormData,
  setCurrentStep,
}) {
  const experiences = formData.experiences || [];

  // ✅ Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState(""); // success | error
  const [toastMessage, setToastMessage] = useState(""); // ✅ ADD THIS

  // ✅ AI Loading state
  const [aiLoading, setAiLoading] = useState(false); // ✅ ADD THIS
  const [enhancingIndex, setEnhancingIndex] = useState(null); // ✅ ADD THIS

  // ✅ Get resumeId ONCE (correct hook usage)
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [
        ...experiences,
        {
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;

    if (field === "current" && value === true) {
      updated[index].endDate = "";
    }

    setFormData({ ...formData, experiences: updated });
  };

  const deleteExperience = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    setFormData({ ...formData, experiences: updated });
  };

  // ✅ SAVE TO DATABASE (FIXED)
  const saveExperience = async () => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user || !resumeId) {
        setToastType("error");
        setToastMessage("❌ Failed to save experience");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        return;
      }

      const { error } = await supabase
        .from("resumes")
        .update({
          experience: formData.experiences, // ✅ CORRECT COLUMN
          updated_at: new Date(),
        })
        .eq("id", resumeId);

      if (error) {
        setToastType("error");
        setToastMessage("❌ Failed to save experience");
      } else {
        setToastType("success");
        setToastMessage("✅ Experience saved successfully");
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (err) {
      console.error(err);
      setToastType("error");
      setToastMessage("❌ Failed to save experience");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // ✅ NEW: ENHANCE JOB DESCRIPTION WITH AI
  const handleEnhanceDescription = async (index) => {
    try {
      setAiLoading(true);
      setEnhancingIndex(index);

      const exp = experiences[index];

      // Validate required fields
      if (!exp.role || !exp.company) {
        setToastMessage("⚠️ Please fill in Job Title and Company Name first");
        setToastType("error");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setAiLoading(false);
        setEnhancingIndex(null);
        return;
      }

      // Build payload - map field names correctly
      const payload = {
        companyName: exp.company,
        jobTitle: exp.role,
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        isCurrent: exp.current || false,
        jobDescription: exp.description || ""
      };

      console.log("🤖 Enhancing job description:", payload);

      const result = await enhanceJobDescription(payload);

      if (!result || result.status !== "success") {
        throw new Error("Enhancement failed");
      }

      // ✅ Update the description with enhanced version
      const updatedExperiences = [...experiences];
      updatedExperiences[index].description = result.enhanced_description;

      setFormData({
        ...formData,
        experiences: updatedExperiences
      });

      setToastMessage("✨ Job description enhanced successfully!");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error("Enhancement error:", error);
      setToastMessage("❌ Failed to enhance description");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setAiLoading(false);
      setEnhancingIndex(null);
    }
  };

  return (
    <>
      {/* ---------- TOP BAR ---------- */}
      <div className="form-toolbar">
        <div className="toolbar-spacer" />

        <button className="next-btn" onClick={() => setCurrentStep(2)}>
          ← Previous
        </button>
        <button className="next-btn" onClick={() => setCurrentStep(4)}>
          → Next
        </button>
      </div>

      {/* ---------- HEADER ---------- */}
      <div className="experience-header">
        <div>
          <h2>Professional Experience</h2>
          <p className="tip-text">Add your job experience</p>
        </div>

        <button className="add-exp-btn" onClick={addExperience}>
          + Add Experience
        </button>
      </div>

      {/* ---------- EXPERIENCE FORMS ---------- */}
      {experiences.map((exp, index) => (
        <div key={index} className="experience-card">
          <div className="experience-card-header">
            <h4>Experience {index + 1}</h4>

            <button
              className="delete-exp-btn"
              onClick={() => deleteExperience(index)}
              title="Delete Experience"
            >
              🗑️
            </button>
          </div>

          <div className="experience-grid">
            <input
              className="input-text"
              placeholder="Company Name"
              value={exp.company}
              onChange={(e) =>
                updateExperience(index, "company", e.target.value)
              }
            />

            <input
              className="input-text"
              placeholder="Job Title"
              value={exp.role}
              onChange={(e) =>
                updateExperience(index, "role", e.target.value)
              }
            />

            <input
              className="input-text"
              type="month"
              value={exp.startDate}
              onChange={(e) =>
                updateExperience(index, "startDate", e.target.value)
              }
            />

            <input
              className="input-text"
              type="month"
              disabled={exp.current}
              placeholder="End Date"
              value={exp.endDate}
              onChange={(e) =>
                updateExperience(index, "endDate", e.target.value)
              }
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) =>
                updateExperience(index, "current", e.target.checked)
              }
            />
            Currently working here
          </label>

          <textarea
            className="experience-card textarea"
            placeholder="Job description"
            value={exp.description}
            onChange={(e) =>
              updateExperience(index, "description", e.target.value)
            }
          />

          {/* ✅ NEW: Enhance Button */}
          <button
            onClick={() => handleEnhanceDescription(index)}
            disabled={aiLoading}
            className="enhance-btn"
            style={{
              backgroundColor: "#6366f1",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: aiLoading ? "not-allowed" : "pointer",
              opacity: aiLoading && enhancingIndex !== index ? 0.5 : 1,
              marginTop: "10px",
              marginRight: "10px",
              fontWeight: "500",
              fontSize: "14px",
              transition: "all 0.3s ease"
            }}
            title="Use AI to enhance your job description"
          >
            {enhancingIndex === index && aiLoading ? "✨ Enhancing..." : "✨ Enhance with AI"}
          </button>
        </div>
      ))}

      <button className="save-btn" onClick={saveExperience}>
        Save Changes
      </button>

      {/* ✅ TOAST */}
      {showToast && (
        <div className={`toast ${toastType}`}>
          {toastMessage}
        </div>
      )}
    </>
  );
}

export default ProfessionalExperience;