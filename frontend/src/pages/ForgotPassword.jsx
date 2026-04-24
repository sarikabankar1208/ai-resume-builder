import { useState } from "react";
import { supabase } from "../supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) {
      console.error("Error:", error.message);
      alert("Error sending reset email");
    } else {
      alert("Reset password email sent successfully!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={() => handleResetPassword(email)}>
            Send Reset Link
          </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;