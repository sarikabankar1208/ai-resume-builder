import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/Feedback.css";

function Feedback() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [rating, setRating] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // 🔐 Check session (REAL AUTH)
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        alert("Please login first");
        navigate("/login");
      } else {
        setUserId(data.user.id);
      }
    };

    checkUser();
  }, [navigate]);

  // ✅ Fetch user data only if logged in
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

  // 📩 Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please login again");
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("feedback").insert([
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        rating: rating,
        user_id: userId, // ✅ link with user
      },
    ]);

    if (error) {
      alert("Error submitting feedback");
      console.error(error);
    } else {
      alert("Feedback submitted successfully!");
      setFormData({ ...formData, message: "" });
      setRating(0);
    }
  };

  return (
    <div className="feedback">
      <div className="feedback-hero">
        <h1>Feedback</h1>
        <p>Share your experience with our AI Resume Builder</p>
      </div>

      <div className="feedback-container">
        <form className="feedback-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name</label>
            <input type="text" value={formData.name} disabled />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} disabled />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <div className="stars">
              {[1,2,3,4,5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? "star active" : "star"}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Feedback</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Submit Feedback</button>

        </form>
      </div>
    </div>
  );
}

export default Feedback;