import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Feedback1.css";


function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setFeedbacks(data);
    }
    console.log("DATA:", data);
    console.log("ERROR:", error);
  };

  return (
    <div className="feedback-section">
      <h2>What Our Users Say</h2>

      <div className="feedback-container">
        {feedbacks.slice(0, visibleCount).map((item) => (
          <div className="feedback-card" key={item.id}>
            {"⭐".repeat(item.rating || 0)}
            <p>"{item.message}"</p>
            <h4> {item.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feedback;