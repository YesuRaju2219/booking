import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://booking-3yz8.onrender.com";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const register = () => {
    fetch(`${API}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      navigate("/");
    });
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{maxWidth:"400px"}}>
        <h3 className="text-center">Register</h3>

        <input className="form-control mb-2"
          placeholder="Username"
          onChange={e=>setUsername(e.target.value)} />

        <input type="password" className="form-control mb-2"
          placeholder="Password"
          onChange={e=>setPassword(e.target.value)} />

        <button className="btn btn-primary w-100" onClick={register}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;