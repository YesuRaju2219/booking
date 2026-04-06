import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://booking-3yz8.onrender.com";

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
    fetchMovies();
    fetchBookings();
  }, []);

  const fetchMovies = () => {
    fetch(`${API}/movies`).then(res => res.json()).then(setMovies);
  };

  const fetchBookings = () => {
    fetch(`${API}/bookings`).then(res => res.json()).then(setBookings);
  };

  const addMovie = () => {
    fetch(`${API}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ title, price })
    }).then(fetchMovies);
  };

  const book = (id) => {
    fetch(`${API}/book`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ movie_id:id, seats:1 })
    }).then(fetchBookings);
  };

  const deleteBooking = (id) => {
    fetch(`${API}/book/${id}`, {
      method:"DELETE"
    }).then(fetchBookings);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between">
        <h2>Dashboard</h2>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>

      {role === "admin" && (
        <div className="card p-3 mb-3">
          <h4>Add Movie</h4>
          <input className="form-control mb-2"
            placeholder="Movie"
            onChange={e=>setTitle(e.target.value)} />

          <input className="form-control mb-2"
            placeholder="Price"
            onChange={e=>setPrice(e.target.value)} />

          <button className="btn btn-primary" onClick={addMovie}>
            Add Movie
          </button>
        </div>
      )}

      <h4>Movies</h4>
      <div className="row">
        {movies.map(m => (
          <div className="col-md-4 mb-3" key={m.id}>
            <div className="card p-3">
              <h5>{m.title}</h5>
              <p>₹{m.price}</p>
              <button className="btn btn-success"
                onClick={()=>book(m.id)}>
                Book
              </button>
            </div>
          </div>
        ))}
      </div>

      <h4>Bookings</h4>
      <ul className="list-group">
        {bookings.map(b => (
          <li key={b.id}
            className="list-group-item d-flex justify-content-between">
            {b.title} - {b.seats}

            <button className="btn btn-danger btn-sm"
              onClick={()=>deleteBooking(b.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default Dashboard;