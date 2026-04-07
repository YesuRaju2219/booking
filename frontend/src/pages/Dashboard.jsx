import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://booking-3yz8.onrender.com";

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
    fetchMovies();
    fetchBookings();
  }, []);

  // ---------------- FETCH MOVIES ----------------
  const fetchMovies = () => {
    fetch(`${API}/movies`)
      .then(res => res.json())
      .then(setMovies);
  };

  // ---------------- FETCH BOOKINGS ----------------
  const fetchBookings = () => {
    fetch(`${API}/bookings`, {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(setBookings);
  };

  // ---------------- FETCH SEATS ----------------
  const fetchSeats = (movieId) => {
    fetch(`${API}/seats/${movieId}`)
      .then(res => res.json())
      .then(setBookedSeats);
  };

  // ---------------- SELECT MOVIE ----------------
  const openSeats = (movie) => {
    setSelectedMovie(movie);
    fetchSeats(movie.id);
  };

  // ---------------- BOOK ----------------
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
    }).then(res => res.json())
      .then(data => {
        if (data.error) alert(data.error);
        else {
          alert("Booked!");
          fetchSeats(selectedMovie.id);
          fetchBookings();
        }
      });
  };

  // ---------------- DELETE BOOKING ----------------
  const deleteBooking = (id) => {
    fetch(`${API}/book/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    }).then(fetchBookings);
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ---------------- SEAT GRID ----------------
  const seats = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h2>🎬 Movie Booking</h2>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>

      {/* MOVIES */}
      <div className="row">
        {movies.map(m => (
          <div className="col-md-4 mb-3" key={m.id}>
            <div className="card shadow p-3">

              <h5>{m.title}</h5>
              <p>₹{m.price}</p>

              <button
                className="btn btn-primary"
                onClick={() => openSeats(m)}
              >
                Select Seats
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* SEAT SELECTION */}
      {selectedMovie && (
        <div className="card p-3 mt-4">
          <h4>{selectedMovie.title} - Select Seat</h4>

          <div className="d-flex flex-wrap">
            {seats.map(s => {
              const isBooked = bookedSeats.includes(s);
              const isSelected = selectedSeat === s;

              return (
                <button
                  key={s}
                  disabled={isBooked}
                  className={`btn m-1 ${
                    isBooked
                      ? "btn-secondary"
                      : isSelected
                      ? "btn-success"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setSelectedSeat(s)}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-success mt-3"
            onClick={bookSeat}
          >
            Confirm Booking
          </button>
        </div>
      )}

      {/* BOOKINGS */}
      <h4 className="mt-4">My Bookings</h4>

      <ul className="list-group">
        {bookings.map(b => (
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