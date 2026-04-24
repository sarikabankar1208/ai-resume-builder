import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

function AdminUsers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/api/admin/all-data");

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await res.json();

      console.log("API:", result);

      // SAFE CHECK
      const profiles = (result.profiles || []).filter(
        (user) => user.role === "user"
      );
      const resumes = result.resumes || [];

      // MAP USERS + THEIR RESUMES
      const mapped = profiles.map((user) => {
        const userResumes = resumes.filter(
          (res) => res.user_id === user.id
        );  

        // get name directly from profile
        const name = user.name || "N/A";

        return {
          id: user.id,
          name: name,
          email: user.email,
          created_at: user.created_at,
          role: user.role,
          resumes: userResumes || [],
        };
      });

      console.log("Mapped Data:", mapped);

      setData(mapped);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/user/${userId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Delete failed");

      alert("User deleted");

      // 🔥 instant UI update
      setData(prev => prev.filter(user => user.id !== userId));

    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  };

  const handleView = (id) => {
    navigate(`/admin/resume/${id}`);
  };

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseProfile = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const getUserStatus = (date) => {
    if (!date) return "Inactive";

    const lastModified = new Date(date);
    const now = new Date();

    const diffDays = (now - lastModified) / (1000 * 60 * 60 * 24);

    return diffDays > 180 ? "Inactive" : "Active";
  };

  const getLastModified = (resumes) => {
    if (!resumes || resumes.length === 0) return null;

    const dates = resumes.map((r) => new Date(r.updated_at || r.created_at));
    return new Date(Math.max(...dates));
  };

  const filteredData = data.filter((user) => {
    const term = searchTerm.toLowerCase();

    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  // 🔷 UI STATES
  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Admin Dashboard</h2>

      <input
        type="text"
        placeholder="🔍 Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />
      
      <div style={{ maxHeight: "500px", overflowY: "auto" }}>
        <table className="admin-table" border="1" cellPadding="10" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Resumes</th>
              <th>Actions</th>
              <th>User Profile</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(filteredData) && filteredData.length > 0 ? (
              filteredData.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>

                  <td>
                    {Array.isArray(user.resumes) &&
                    user.resumes.length > 0 ? (
                      user.resumes.map((res) => (                       
                          <button
                            className="view-btn"
                            style={{ marginRight: "5px" }}
                            onClick={() => handleView(res.id)}
                          >
                            {res.resume_title || "Untitled Resume"}
                          </button>
                      ))
                    ) : (
                      "No resumes"
                    )}
                  </td>

                  <td>

                    <button
                      className = "delete-btn1"
                      style={{ marginRight: "5px" }}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete User
                    </button>

                  </td>

                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleOpenProfile(user)}
                    >
                      User Profile
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">

            {/* HEADER */}
            <div className="modal-header">
              <h2><span className="user-icon">👤</span> User Profile</h2>
              <button className="close-btn" onClick={handleCloseProfile}>✖</button>
            </div>

            {/* BODY */}
            <div className="modal-body">

              <div className="profile-row">
                <span>🆔</span>
                <p><strong>User ID:</strong> {selectedUser.id}</p>
              </div>

              <div className="profile-row">
                <span>📧</span>
                <p><strong>Email:</strong> {selectedUser.email}</p>
              </div>

              <div className="profile-row">
                <span>📄</span>
                <p><strong>Resume Count:</strong> {selectedUser.resumes.length}</p>
              </div>

              <div className="profile-row">
                <span>📅</span>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedUser.created_at).toLocaleString()}
                </p>
              </div>

              <div className="profile-row">
                <span>⏳</span>
                <p>
                  <strong>Last Modified:</strong>{" "}
                  {getLastModified(selectedUser.resumes)?.toLocaleString() || "N/A"}
                </p>
              </div>

              <div className="profile-row">
                <span>⚡</span>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      getUserStatus(getLastModified(selectedUser.resumes)) === "Active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {getUserStatus(getLastModified(selectedUser.resumes))}
                  </span>
                </p>
              </div>

            </div>

          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AdminUsers;