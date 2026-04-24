import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
   
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo / Title */}
      <h1 className="navbar-title">AI Resume Builder</h1>

      {/* Navigation Links */}
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          About
        </NavLink>

        <NavLink
          to="/features"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Features
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Contact
        </NavLink>

        <NavLink
          to="/feedback"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Feedback
        </NavLink>

        {/* Dashboard (only if logged in) */}
        {user && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item active highlight" : "nav-item highlight"
            }
          >
            Dashboard
          </NavLink>
        )}
      </div>

      {/* Auth Buttons */}
      <div className="auth-buttons">
        {!user ? (
          <>
            <Link to="/login" className="auth-btn">
              Login
            </Link>
            <Link to="/register" className="auth-btn outline">
              Register
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="auth-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;