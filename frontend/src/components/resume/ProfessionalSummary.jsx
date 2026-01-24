import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { generateSummary } from "../../services/aiSummaryService";
import { useSearchParams } from "react-router-dom";

function ProfessionalSummary({ formData, setFormData, setCurrentStep }) {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ✅ GET resumeId (LOGIC FIX)
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  /* ---------------- SAVE TO DATABASE ---------------- */
  const saveProfessionalSummary = async () => {
    try {
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError || !data.user || !resumeId) {
        setToastType("error");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        return;
      }

      const { error } = await supabase
        .from("resumes")
        .update({
          professional_summary: formData.summary,
          updated_at: new Date(),
        })
        .eq("id", resumeId);

      setToastType(error ? "error" : "success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (err) {
      console.error(err);
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  /* ---------------- AI GENERATE ---------------- */
    const handleAIGenerate = async () => {
    try {
      setAiLoading(true);

      const years = Number(formData.experience) || 0;

      const skills = [
        ...(formData.backendSkills || []),
        ...(formData.frontendSkills || []),
        ...(formData.cloudSkills || []),
        ...(formData.databaseSkills || []),
        ...(formData.skills || []),  // ✅ ADD THIS if you have a generic skills field
        ...(formData.otherSkills || [])  // ✅ ADD THIS if exists
      ];

      console.log("🛠️ All skills being sent:", skills);  // Debug


      const experienceLevel =
        years < 1 ? "Entry-level" :
        years < 3 ? "Junior" :
        years < 6 ? "Mid-level" :
        "Senior";

      const payload = {
        years,
        experienceLevel,
        skills,  // Now includes all skills
        jobTitle: formData.profession || "",  // ✅ CHANGE: jobTitle → profession
        roughSummary: formData.summary?.trim() || ""
      };

       console.log("🔍 Payload being sent to AI:", payload);

      const result = await generateSummary(payload);

      if (!result || result.status !== "success") {
        alert("AI generation failed");
        return;
      }

      setFormData({
        ...formData,
        summary: result.optimized_resume
      });

      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error(error);
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      {/* ---------- TOP BAR ---------- */}
      <div className="form-toolbar">
        <div className="toolbar-spacer" />
        <button className="next-btn" onClick={() => setCurrentStep(5)}>
          ← Previous
        </button>
        <button className="next-btn" disabled>
          → Next
        </button>
      </div>

      {/* ---------- HEADER ---------- */}
      <div className="summary-header">
        <div>
          <h2>Professional Summary</h2>
          <p className="tip-text">Add summary for your resume here</p>
        </div>

        <button
          className="ai-btn"
          onClick={handleAIGenerate}
          disabled={aiLoading}
        >
          {aiLoading ? "Generating..." : "✨ Generate from AI"}
        </button>
      </div>

      {/* ---------- TEXTAREA ---------- */}
      <textarea
        className="summary-textarea"
        value={formData.summary}
        placeholder="Write a professional summary or generate it using AI"
        onChange={(e) =>
          setFormData({ ...formData, summary: e.target.value })
        }
      />

      {/* ---------- TIP ---------- */}
      <div className="tip-text-below">
        <strong>Tip:</strong> Keep it concise (3-4 sentences) and focus on your most relevant achievements and skills.
      </div>

      {/* ---------- SAVE ---------- */}
      <button className="save-btn" onClick={saveProfessionalSummary}>
        Save Changes
      </button>

      {/* ---------- TOAST ---------- */}
      {showToast && (
        <div className={`toast ${toastType}`}>
          {toastType === "success"
            ? "✅ Professional summary saved successfully"
            : "❌ Failed to save professional summary"}
        </div>
      )}
    </>
  );
}

export default ProfessionalSummary;