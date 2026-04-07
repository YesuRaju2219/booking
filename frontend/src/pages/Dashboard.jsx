import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://booking-3yz8.onrender.com";

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const [role, setRole] = useState("");

  const navigate = useNavigate();

  // 🔥 Load role + token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    console.log("ROLE:", storedRole); // debug

    if (!token) {
      navigate("/");
    } else {
      setRole(storedRole);
      fetchMovies();
      fetchBookings();
    }
  }, []);

  // ---------------- FETCH MOVIES ----------------
  const fetchMovies = () => {
    fetch(`${API}/movies`)
      .then(res => res.json())
      .then(setMovies)
      .catch(err => console.error(err));
  };

  // ---------------- FETCH BOOKINGS ----------------
  const fetchBookings = () => {
    const token = localStorage.getItem("token");

    fetch(`${API}/bookings`, {
      headers: { Authorization: token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setBookings)
      .catch(() => {
        alert("Session expired");
        localStorage.clear();
        navigate("/");
      });
  };

  // ---------------- FETCH SEATS ----------------
  const fetchSeats = (movieId) => {
    fetch(`${API}/seats/${movieId}`)
      .then(res => res.json())
      .then(setBookedSeats);
  };

  // ---------------- OPEN SEATS ----------------
  const openSeats = (movie) => {
    setSelectedMovie(movie);
    fetchSeats(movie.id);
  };

  // ---------------- ADD MOVIE ----------------
  const addMovie = () => {
    const token = localStorage.getItem("token");

    fetch(`${API}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ title, price })
    })
      .then(() => {
        fetchMovies();
        setTitle("");
        setPrice("");
      });
  };

  // ---------------- DELETE MOVIE ----------------
  const deleteMovie = (id) => {
    const token = localStorage.getItem("token");

    fetch(`${API}/movies/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    }).then(fetchMovies);
  };

  // ---------------- BOOK SEAT ----------------
  const bookSeat = () => {
    const token = localStorage.getItem("token");

    if (!selectedSeat) {
      alert("Select a seat");
      return;
    }

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
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert("Booked!");
          fetchSeats(selectedMovie.id);
          fetchBookings();
        }
      });
  };

  // ---------------- DELETE BOOKING ----------------
  const deleteBooking = (id) => {
    const token = localStorage.getItem("token");

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

  // ---------------- SEATS ----------------
  const seats = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h2>🎬 Movie Booking</h2>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>

      {/* 🔥 ADMIN PANEL */}
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

      {/* MOVIES */}
      <div className="row">
        {movies.map((m) => (
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

              {/* 🔥 ADMIN DELETE BUTTON */}
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

      {/* SEAT SELECTION */}
      {selectedMovie && (
        <div className="card p-3 mt-4">
          <h4>{selectedMovie.title} - Select Seat</h4>

          <div className="d-flex flex-wrap">
            {seats.map((s) => {
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