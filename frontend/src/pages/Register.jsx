import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Registered successfully");
        navigate("/");
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
        <h3 className="text-center mb-3">📝 Register</h3>

        <input className="form-control mb-3"
          placeholder="Username"
          onChange={e=>setUsername(e.target.value)} />

        <input type="password" className="form-control mb-3"
          placeholder="Password"
          onChange={e=>setPassword(e.target.value)} />

        <button className="btn-book" onClick={register}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;