import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/Contact.css";

function Contact() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // 🔐 Check session (REAL AUTH CHECK)
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        alert("Please login first");
        navigate("/login");
      } else {
        setUserId(data.user.id); // ✅ real authenticated user
      }
    };

    checkUser();
  }, [navigate]);

  // ✅ Fetch user details ONLY if session exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setFormData({
          name: data.name,
          email: data.email,
          message: "",
        });
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📩 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please login again");
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("contact").insert([
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        user_id: userId, // ✅ secure UUID
      },
    ]);

    if (error) {
      alert("Error submitting form");
      console.error(error);
    } else {
      alert("Message sent successfully!");
      setFormData({ ...formData, message: "" });
    }
  };

  return (
    <div className="contact">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>We would love to hear from you</p>
      </div>

      <div className="contact-container">
        <form className="contact-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name</label>
            <input type="text" value={formData.name} disabled />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} disabled />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Send Message
          </button>

        </form>
      </div>
    </div>
  );
}

export default Contact;