import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "https://booking-3yz8.onrender.com";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const navigate = useNavigate();

  const register = () => {
    fetch(`${API}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password, role })
    }).then(() => {
      alert("Registered!");
      navigate("/");
    });
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{maxWidth: "400px"}}>
        <h3 className="text-center">Register</h3>

        <input className="form-control mb-2"
          placeholder="Username"
          onChange={e=>setUsername(e.target.value)} />

        <input type="password" className="form-control mb-2"
          placeholder="Password"
          onChange={e=>setPassword(e.target.value)} />

        <select className="form-control mb-2"
          onChange={e=>setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button className="btn btn-success w-100" onClick={register}>
          Register
        </button>

        <p className="mt-2 text-center">
          Already have account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;