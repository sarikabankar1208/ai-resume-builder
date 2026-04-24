import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    // Step 1: Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // Handle auth error
    if (error) {
      if (error.message.includes("already registered")) {
        setMessage("User already exists. Please login.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    const user = data.user;

    // If email confirmation is ON
    if (!user) {
      setMessage("Check your email to confirm registration.");
      return;
    }

    // Step 2: Insert or Update profile (FIXED using UPSERT)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        [
          {
            id: user.id,
            name: name,
            email: user.email,
            role: "user",
          },
        ],
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Profile Error:", profileError.message);
      setMessage("Profile setup failed. Try again.");
      return;
    }

    // Success
    setMessage("Registration successful!");

    // Reset form
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Create Account</h2>
        <p>Start building your professional resume</p>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Create Account</button>

        </form>

        {message && <p className="info">{message}</p>}

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;