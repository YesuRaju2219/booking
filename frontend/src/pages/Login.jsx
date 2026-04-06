import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "https://booking-3yz8.onrender.com/";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = () => {
    fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        navigate("/dashboard");
      } else {
        alert("Invalid credentials");
      }
    });
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{maxWidth: "400px"}}>
        <h3 className="text-center">Login</h3>

        <input className="form-control mb-2"
          placeholder="Username"
          onChange={e=>setUsername(e.target.value)} />

        <input type="password" className="form-control mb-2"
          placeholder="Password"
          onChange={e=>setPassword(e.target.value)} />

        <button className="btn btn-primary w-100" onClick={login}>
          Login
        </button>

        <p className="mt-2 text-center">
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;