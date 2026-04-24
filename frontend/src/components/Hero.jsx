import "../styles/Hero.css";
import homepage from "../images/home_page.jpeg";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <div
      className="hero-section"
      style={{ backgroundImage: `url(${homepage})` }}
    >
      <div className="overlay">
        <h1>Create Professional AI-Powered Resumes</h1>

        <p>
          Build ATS-friendly resumes with AI assistance, real-time preview,
          and smart suggestions.
        </p>

        <div className="hero-buttons">
          <button onClick={() => navigate("/register")}>
            Build My Resume
          </button>

          <button className="secondary-btn" onClick={() => navigate("/register")}>
            Import Resume
          </button>
        </div>

        <div className="hero-features">
          <span>✔ AI Assistance</span>
          <span>✔ ATS Friendly</span>
          <span>✔ Real-time Preview</span>
        </div>
      </div>
    </div>
  );
}

export default Hero;