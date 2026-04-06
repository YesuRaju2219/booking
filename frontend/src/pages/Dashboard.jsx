import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://your-backend.onrender.com"; // 🔴 replace with your backend URL

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const navigate = useNavigate();

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchMovies();
      fetchBookings();
    }
  }, []);

  const fetchMovies = () => {
    fetch(`${API}/movies`)
      .then(res => res.json())
      .then(setMovies);
  };

  const fetchBookings = () => {
    fetch(`${API}/bookings`, {
      headers: {
        "Authorization": token
      }
    })
      .then(res => res.json())
      .then(setBookings);
  };

  // ---------------- ADD MOVIE (ADMIN) ----------------
  const addMovie = () => {
    fetch(`${API}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ title, price })
    }).then(() => {
      fetchMovies();
      setTitle("");
      setPrice("");
    });
  };

  // ---------------- DELETE MOVIE (ADMIN) ----------------
  const deleteMovie = (id) => {
    if (!window.confirm("Delete this movie?")) return;

    fetch(`${API}/movies/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    }).then(fetchMovies);
  };

  // ---------------- BOOK TICKET ----------------
  const book = (id) => {
    if (!selectedSeat) {
      alert("Select a seat first");
      return;
    }

    fetch(`${API}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        movie_id: id,
        seats: selectedSeat
      })
    }).then(() => {
      alert("Booked!");
      fetchBookings();
    });
  };

  // ---------------- DELETE BOOKING ----------------
  const deleteBooking = (id) => {
    fetch(`${API}/book/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    }).then(fetchBookings);
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ---------------- SEATS ----------------
  const seats = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h2>🎬 Dashboard</h2>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Admin Panel */}
      {role === "admin" && (
        <div className="card p-3 mb-4">
          <h4>Admin Panel</h4>

          <input
            className="form-control mb-2"
            placeholder="Movie Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="form-control mb-2"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <button className="btn btn-primary" onClick={addMovie}>
            Add Movie
          </button>
        </div>
      )}

      {/* Movies */}
      <h4>Movies</h4>

      <div className="row">
        {movies.map((m) => (
          <div className="col-md-4 mb-3" key={m.id}>
            <div className="card p-3">

              <h5>{m.title}</h5>
              <p>₹{m.price}</p>

              {/* Seat Selection */}
              <div className="mb-2">
                {seats.map((s) => (
                  <button
                    key={s}
                    className="btn btn-outline-primary m-1"
                    onClick={() => setSelectedSeat(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Book Button */}
              <button
                className="btn btn-success"
                onClick={() => book(m.id)}
              >
                Book Ticket
              </button>

              {/* Delete Movie (Admin Only) */}
              {role === "admin" && (
                <button
                  className="btn btn-danger mt-2"
                  onClick={() => deleteMovie(m.id)}
                >
                  Delete Movie
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Bookings */}
      <h4 className="mt-4">My Bookings</h4>

      <ul className="list-group">
        {bookings.map((b) => (
          <li
            key={b.id}
            className="list-group-item d-flex justify-content-between"
          >
            {b.title} - Seat {b.seats}

            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteBooking(b.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default Dashboard;