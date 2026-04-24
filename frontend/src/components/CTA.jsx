import "../styles/CTA.css";
import { useNavigate } from "react-router-dom";

function CTA() {
  const navigate = useNavigate();

  return (
    <div className="cta-section">
      <h2>Create Your Resume Now</h2>
      <p>Start building your professional resume with AI.</p>

      <button onClick={() => navigate("/register")}>
        Build My Resume
      </button>
    </div>
  );
}

export default CTA;