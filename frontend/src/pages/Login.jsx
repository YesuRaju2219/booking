import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const API = "https://booking-3yz8.onrender.com";

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
        toast.success("Login success 🚀");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    });
  };

  return (
    <div className="dark d-flex justify-content-center align-items-center" style={{height:"100vh"}}>

      <div style={{
        width:"350px",
        padding:"25px",
        borderRadius:"16px",
        background:"rgba(255,255,255,0.05)"
      }}>
        <h3 className="text-center mb-3">🎬 Login</h3>

        <input className="form-control mb-3"
          placeholder="Username"
          onChange={e=>setUsername(e.target.value)} />

        <input type="password" className="form-control mb-3"
          placeholder="Password"
          onChange={e=>setPassword(e.target.value)} />

        <button className="btn-book" onClick={login}>
          Login
        </button>

        <p className="mt-3 text-center">
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;