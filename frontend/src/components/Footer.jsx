import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/features">Features</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/feedback">Feedback</Link>
        </div>

        <p className="footer-text">
          © 2026 AI Resume Builder. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;