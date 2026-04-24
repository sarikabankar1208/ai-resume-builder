import "../styles/About.css";

function About() {
  return (
    <div className="about">

      {/* Hero Section */}
      <div className="about-hero">
        <h1>About AI Resume Builder</h1>
        <p>
          A smart solution designed to help students and job seekers create
          professional resumes easily using Artificial Intelligence.
        </p>
      </div>

      {/* Content Section */}
      <div className="about-content">

        <div className="about-card">
          <h2>Who We Are</h2>
          <p>
            The AI Powered Resume Builder is developed to simplify the resume
            creation process for students and freshers. Many users find it
            difficult to design resumes that meet industry standards.
          </p>
        </div>

        <div className="about-card">
          <h2>What We Do</h2>
          <p>
            Our system provides a structured and guided approach to create
            resumes. With AI assistance, users can generate professional
            summaries and job descriptions instantly.
          </p>
        </div>

        <div className="about-card">
          <h2>Key Features</h2>
          <ul>
            <li>AI-powered content generation</li>
            <li>Real-time resume preview</li>
            <li>Easy editing and updates</li>
            <li>Secure cloud storage</li>
            <li>Download resumes in PDF format</li>
          </ul>
        </div>

        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make resume building simple, fast, and effective
            so that users can create industry-ready resumes and improve their
            job opportunities.
          </p>
        </div>

      </div>

    </div>
  );
}

export default About;