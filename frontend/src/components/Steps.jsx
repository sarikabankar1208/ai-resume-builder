import "../styles/Steps.css";

function Steps() {
  return (
    <div className="steps-section">
      <h2>Build Your Resume in 3 Easy Steps</h2>

      <div className="steps-container">
        <div className="step">
          <h3>1. Enter Details</h3>
          <p>Add your personal, education and experience details.</p>
        </div>

        <div className="step">
          <h3>2. Enhance with AI</h3>
          <p>Generate professional summaries using AI.</p>
        </div>

        <div className="step">
          <h3>3. Download Resume</h3>
          <p>Preview and download your ATS-friendly resume.</p>
        </div>
      </div>
    </div>
  );
}

export default Steps;