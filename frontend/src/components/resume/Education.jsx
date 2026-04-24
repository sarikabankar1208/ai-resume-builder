import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams } from "react-router-dom";
function Education({ formData, setFormData, setCurrentStep }) {
  const educationList = formData.education || [];

  // ✅ Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState(""); // success | error

  // ✅ get resumeId ONCE
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  // ➕ Add new education
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...educationList,
        {
          college: "",
          degree: "",
          field: "",
          passingDate: "",
          gpa: "",
        },
      ],
    });
  };

  // ❌ Delete education
  const deleteEducation = (index) => {
    const updatedList = educationList.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      education: updatedList,
    });
  };

  // ✏️ Update education field
  const updateEducation = (index, field, value) => {
    const updatedList = [...educationList];
    updatedList[index][field] = value;

    setFormData({
      ...formData,
      education: updatedList,
    });
  };

  // ✅ SAVE EDUCATION TO DATABASE (FIXED)
  const saveEducation = async () => {
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
          education: educationList,
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

        <button
          className="next-btn"
          onClick={() => setCurrentStep(3)}
        >
          ← Previous
        </button>

        <button
          className="next-btn"
          onClick={() => setCurrentStep(5)}
        >
          → Next
        </button>
      </div>

      {/* ---------- HEADER ---------- */}
      <div className="experience-header">
        <div>
          <h2 style={{textAlign:"left", fontSize:"25px"}}>Education </h2>
          <p className="tip-text">Add your education details</p>
        </div>

        <button
          className="add-exp-btn"
          onClick={addEducation}
        >
          + Add Education
        </button>
      </div>

      {/* ---------- EDUCATION LIST ---------- */}
      {educationList.map((edu, index) => (
        <div key={index} className="experience-card">
          <div className="experience-card-header">
            <strong>Education {index + 1}</strong>

            <button
              className="delete-exp-btn"
              onClick={() => deleteEducation(index)}
            >
              🗑️
            </button>
          </div>

          <div className="form-group">
            <input
              className="input-text"
              placeholder="College / University"
              value={edu.college}
              onChange={(e) =>
                updateEducation(index, "college", e.target.value)
              }
            />

            <input
              className="input-text"
              placeholder="Degree (e.g. BCA)"
              value={edu.degree}
              onChange={(e) =>
                updateEducation(index, "degree", e.target.value)
              }
            />

            <input
              className="input-text"
              placeholder="Field of Study"
              value={edu.field}
              onChange={(e) =>
                updateEducation(index, "field", e.target.value)
              }
            />

            <input
              className="input-text"
              type="month"
              value={edu.passingDate}
              onChange={(e) =>
                updateEducation(index, "passingDate", e.target.value)
              }
            />

            <input
              className="input-text"
              placeholder="GPA / Percentage"
              value={edu.gpa}
              onChange={(e) =>
                updateEducation(index, "gpa", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      {/* ---------- EMPTY STATE ---------- */}
      {educationList.length === 0 && (
        <div className="experience-empty">

          <div className="experience-icon">🎓</div>

          <p className="empty-title">No education added yet.</p>

          <p className="empty-sub">
            Click "Add Education" to get started.
          </p>
          
        </div>
      )}

      {/* ---------- SAVE ---------- */}
      <button className="save-btn" onClick={saveEducation}>
        Save Changes
      </button>

      {/* ✅ TOAST */}
      {showToast && (
        <div className={`toast ${toastType}`}>
          {toastType === "success"
            ? "✅ Education saved successfully"
            : "❌ Failed to save education"}
        </div>
      )}
    </>
  );
}

export default Education;

