import { supabase } from "../supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const updatePassword = async () => {

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert("Error updating password");
    } else {
      alert("Password updated successfully!");
      //Redirect to login page
      navigate("/login")
    }
  };


  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter your new password below</p>

        <div className="input-group">
          <input
            type="password"
            placeholder="Enter new password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Confirm password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button onClick={updatePassword} className="reset-btn">
          Update Password
        </button>
      </div>
    </div>
    
  );
};

export default ResetPassword;