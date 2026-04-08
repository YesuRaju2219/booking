import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const API = "https://booking-3yz8.onrender.com";

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
    fetchMovies();
    fetchBookings();
  }, []);

  const fetchMovies = () => {
    fetch(`${API}/movies`)
      .then(res => res.json())
      .then(setMovies);
  };

  const fetchBookings = () => {
    fetch(`${API}/bookings`, {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(setBookings);
  };

  const fetchSeats = (id) => {
    fetch(`${API}/seats/${id}`)
      .then(res => res.json())
      .then(setBookedSeats);
  };

  const addMovie = () => {
    fetch(`${API}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ title, price })
    }).then(fetchMovies);
  };

  const deleteMovie = (id) => {
    fetch(`${API}/movies/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    }).then(fetchMovies);
  };

  const bookSeat = () => {
    fetch(`${API}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        movie_id: selectedMovie.id,
        seats: selectedSeat
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Booking Successful 🎉");
        fetchSeats(selectedMovie.id);
        fetchBookings();
      });
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const seats = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div>

      {/* NAVBAR */}
      <nav className="navbar p-3">
        <div className="container d-flex justify-content-between">
          <h4 className="navbar-brand">🎬 BookMyShow Clone</h4>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container mt-4">

        {/* ADMIN PANEL */}
        {role === "admin" && (
          <div className="card p-3 mb-4">
            <h5>Add Movie</h5>
            <input className="form-control mb-2"
              placeholder="Movie Name"
              onChange={e => setTitle(e.target.value)} />

            <input className="form-control mb-2"
              placeholder="Price"
              onChange={e => setPrice(e.target.value)} />

            <button className="btn btn-primary" onClick={addMovie}>
              Add Movie
            </button>
          </div>
        )}

        {/* MOVIES */}
        <h4 className="mb-3">Now Showing</h4>

        <div className="row">
          {movies.map(m => (
            <div className="col-md-4 mb-4" key={m.id}>
              <div className="card p-3 shadow-sm">

                <h5>{m.title}</h5>
                <p className="text-muted">₹{m.price}</p>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedMovie(m);
                    fetchSeats(m.id);
                  }}
                >
                  Book Tickets
                </button>

                {role === "admin" && (
                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => deleteMovie(m.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SEAT UI */}
        {selectedMovie && (
          <div className="card p-4 mt-4">
            <h5>{selectedMovie.title} - Select Seat</h5>

            <div className="d-flex flex-wrap mt-3">
              {seats.map(s => {
                const isBooked = bookedSeats.includes(s);

                return (
                  <button
                    key={s}
                    disabled={isBooked}
                    className={`seat ${
                      isBooked
                        ? "booked"
                        : selectedSeat === s
                        ? "selected"
                        : "available"
                    }`}
                    onClick={() => setSelectedSeat(s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <button className="btn btn-success mt-3" onClick={bookSeat}>
              Confirm Booking
            </button>
          </div>
        )}

        {/* BOOKINGS */}
        <h4 className="mt-5">My Bookings</h4>

        <ul className="list-group">
          {bookings.map(b => (
            <li className="list-group-item d-flex justify-content-between" key={b.id}>
              {b.title} - Seat {b.seats}
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}

export default Dashboard;