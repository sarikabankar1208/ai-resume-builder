import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams } from "react-router-dom";

function Skills({ formData, setFormData, setCurrentStep }) {
  const [skillInput, setSkillInput] = useState("");
  const skills = formData.skills || [];

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState(""); // success | error

  // Get resumeId from URL
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  /* ---------------- ADD SKILL ---------------- */
  const addSkill = () => {
    if (!skillInput.trim()) return;

    if (!skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...skills, skillInput.trim()],
      });
    }

    setSkillInput("");
  };

  /* ---------------- REMOVE SKILL ---------------- */
  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: skills.filter((s) => s !== skillToRemove),
    });
  };

  /* ---------------- SAVE SKILLS ---------------- */
  const saveSkills = async () => {
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
          skills: skills,
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

  return (
    <>
      {/* ---------- TOP BAR ---------- */}
      <div className="form-toolbar">
        <div className="toolbar-spacer" />

        <button className="next-btn" onClick={() => setCurrentStep(1)}>
          ← Previous
        </button>

        <button className="next-btn" onClick={() => setCurrentStep(3)}>
          → Next
        </button>
      </div>

      {/* ---------- HEADER ---------- */}
      <h2 style={{ textAlign: "left", fontSize:"25px" }}>Skills</h2>
      <p className="form-subtitle">
        Add your technical and soft skills
      </p>

      {/* ---------- INPUT ---------- */}
      <div className="skills-input-row">
        <input
          type="text"
          placeholder="Enter a skill (e.g., JavaScript, Project Management)"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
        />

        <button
          className="add-skill-btn"
          onClick={addSkill}
          disabled={!skillInput.trim()}
        >
          + Add
        </button>
      </div>

      {/* ---------- EMPTY STATE ---------- */}
      {skills.length === 0 && (
        <div className="skills-empty">
          <div className="skills-empty-icon">✨</div>
          <p className="skills-empty-title">No skills added yet.</p>
          <p className="skills-empty-sub">
            Add your technical and soft skills above.
          </p>
        </div>
      )}

      {/* ---------- SKILL TAGS ---------- */}
      {skills.length > 0 && (
        <div className="skills-tags">
          {skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
              <button
                className="btn-x"
                onClick={() => removeSkill(skill)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ---------- TIP ---------- */}
      <div className="tip-text-below">
        <strong>Tip:</strong> Add 8–12 relevant skills. Include both technical
        skills (programming languages, tools) and soft skills (leadership,
        communication).
      </div>

      {/* ---------- SAVE ---------- */}
      <button className="save-btn" onClick={saveSkills}>
        Save Changes
      </button>

      {/* ---------- TOAST ---------- */}
      {showToast && (
        <div className={`toast ${toastType}`}>
          {toastType === "success"
            ? "✅ Skills saved successfully"
            : "❌ Failed to save skills"}
        </div>
      )}
    </>
  );
}

export default Skills;
