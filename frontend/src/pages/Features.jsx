import "../styles/Features.css";

function Features() {
  return (
    <div className="features">

      {/* Hero Section */}
      <div className="features-hero">
        <h1>Our Features</h1>
        <p>
          Explore the powerful features of our AI Resume Builder that make resume creation easy and effective.
        </p>
      </div>

      {/* Features Grid */}
      <div className="features-container">

        <div className="feature-card">
          <h2>🤖 AI Content Generation</h2>
          <p>
            Generate professional summaries and job descriptions using AI assistance.
          </p>
        </div>

        <div className="feature-card">
          <h2>⚡ Real-Time Preview</h2>
          <p>
            See instant updates in your resume as you enter or edit your information.
          </p>
        </div>

        <div className="feature-card">
          <h2>📝 Easy Editing</h2>
          <p>
            Modify your resume anytime with a simple and user-friendly interface.
          </p>
        </div>

        <div className="feature-card">
          <h2>☁️ Cloud Storage</h2>
          <p>
            Securely save your resumes and access them anytime from anywhere.
          </p>
        </div>

        <div className="feature-card">
          <h2>📄 Multiple Sections</h2>
          <p>
            Add personal details, education, skills, experience, and projects easily.
          </p>
        </div>

        <div className="feature-card">
          <h2>⬇️ PDF Download</h2>
          <p>
            Download your final resume in a professional PDF format.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Features;