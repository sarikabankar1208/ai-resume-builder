import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const user = data.user;

    // Fetch role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setErrorMsg("Failed to fetch user role");
      return;
    }

    // Store
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("role", profile.role);

    // Redirect
    if (profile.role === "admin") {
      navigate("/adminDashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Welcome Back</h2>
        <p>Login to continue building your resume</p>

        {errorMsg && <p className="error">{errorMsg}</p>}

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email Address"
            value={email}                      // controlled
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}                  // controlled
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <p 
            style={{ cursor: "pointer", color: "#07070f", fontSize: "14px" }}
            onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </p>

          <button type="submit">Login</button>

        </form>

        <p className="switch-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;