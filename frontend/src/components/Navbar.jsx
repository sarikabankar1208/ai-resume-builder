import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

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
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">AI Powered Resume Builder</h1>

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
