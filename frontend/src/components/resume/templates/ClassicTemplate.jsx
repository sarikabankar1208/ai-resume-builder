import { formatBulletPoints } from "../../../utils/formatBullets"; // ✅ ADD THIS IMPORT

//Helper to format YYYY-MM → Mon YYYY
const formatMonthYear = (value) => {
  if (!value) return "";

  const [year, month] = value.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
};

function ClassicTemplate({ formData, accent }) {
  return (
    <div className={`resume-preview-inner ${accent}`}>
      {/* HEADER */}
      <h1 className="preview-name">
        {formData.fullName || "Your Name"}
      </h1>
      <h3 className="preview-profession">
        {formData.profession || "Professional"}
      </h3>

      <div className="preview-contact">
        {formData.email && <span>✉ {formData.email}</span>}
        {formData.phone && <span>📞 {formData.phone}</span>}
        {formData.location && <span>📍 {formData.location}</span>}
        {formData.linkedin && <span>🔗 {formData.linkedin}</span>}
      </div>

      <hr />

      {/* PROFESSIONAL SUMMARY */}
      {formData.summary && (
        <div className="preview-section">
          <h3 className="preview-section-title">
            PROFESSIONAL SUMMARY
          </h3>
          <p className="preview-section-text">
            {formData.summary}
          </p>
        </div>
      )}

      {/* ✅ PROFESSIONAL EXPERIENCE - UPDATED WITH BULLETS */}
      {formData.experiences?.length > 0 && (
        <div className="preview-section">
          <h3 className="preview-section-title">
            PROFESSIONAL EXPERIENCE
          </h3>

          {formData.experiences.map((exp, index) => (
            <div key={index} className="preview-experience">
              {/* Job Title & Duration */}
              <div className="preview-exp-header">
                <strong>{exp.role || "Job Title"}</strong>
                <span className="preview-exp-dates">
                  {formatMonthYear(exp.startDate)} –{" "}
                  {exp.current ? "Present" : formatMonthYear(exp.endDate)}
                </span>
              </div>

              {/* Company Name */}
              <div className="preview-exp-company">
                {exp.company || "Company Name"}
              </div>

              {/* ✅ DESCRIPTION AS BULLET POINTS */}
              {exp.description && (
                <ul className="preview-exp-bullets">
                  {formatBulletPoints(exp.description).map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION */}
      {formData.education?.length > 0 && (
        <div className="preview-section">
          <h3 className="preview-section-title">EDUCATION</h3>

          {formData.education.map((edu, index) => (
            <div key={index} className="preview-education">
              <div className="preview-edu-header">
                <strong>{edu.degree} in {edu.field}</strong>
                <span>{formatMonthYear(edu.passingDate)}</span>
              </div>
              <div className="preview-edu-college">{edu.college}</div>
              {edu.gpa && <div className="preview-edu-gpa">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {/* PROJECTS */}
      {formData.projects?.length > 0 && (
        <div className="preview-section">
          <h3 className="preview-section-title">PROJECTS</h3>

          {formData.projects.map((project, index) => (
            <div key={index} className="preview-project">
              <strong className="preview-project-title">
                {project.title}
              </strong>
              <p className="preview-project-desc">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SKILLS */}
      {formData.skills?.length > 0 && (
        <div className="preview-section">
          <h3 className="preview-section-title">CORE SKILLS</h3>

          <div className="preview-skills">
            {formData.skills.map((skill, index) => (
              <span key={index} className="preview-skill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassicTemplate;