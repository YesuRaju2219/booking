import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "https://booking-3yz8.onrender.com";

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    fetch(`${API}/movies`)
      .then(res => res.json())
      .then(data => {
        setMovies(data);
        setLoading(false);
      });
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
    }).then(() => {
      toast.success("Movie added 🎬");
      fetchMovies();
    });
  };

  const deleteMovie = (id) => {
    fetch(`${API}/movies/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    }).then(() => {
      toast.success("Movie deleted ❌");
      fetchMovies();
    });
  };

  const bookSeat = () => {
    if (!selectedSeat) {
      toast.error("Select a seat first");
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
      .then(() => {
        toast.success(`Seat ${selectedSeat} booked 🎉`);
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
    <div className={darkMode ? "dark" : "light"}>

      {/* NAVBAR */}
      <div className="navbar px-3">
        <h4>🎬 Movie Booking</h4>

        <div className="d-flex gap-2">
          <button
            className="btn btn-light"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container py-5" style={{ maxWidth: "1200px" }}>

        {/* ADMIN */}
        {role === "admin" && (
          <div className="mb-4">
            <input
              className="form-control mb-2"
              placeholder="Movie name"
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="form-control mb-2"
              placeholder="Price"
              onChange={(e) => setPrice(e.target.value)}
            />
            <button className="btn btn-primary" onClick={addMovie}>
              Add Movie
            </button>
          </div>
        )}

        {/* SEARCH */}
        <input
          className="form-control mb-4"
          placeholder="Search movies..."
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LOADER */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <div className="row g-4">
            {movies
              .filter(m =>
                m.title.toLowerCase().includes(search.toLowerCase())
              )
              .map(m => (
                <div className="col-lg-4 col-md-6" key={m.id}>
                  <div className="movie-card h-100">

                    <h5 className="mb-2">{m.title}</h5>
                    <p className="mb-2">₹{m.price}</p>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span>⭐ {ratings[m.id] || 0}</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        className="w-100"
                        onChange={(e) =>
                          setRatings({
                            ...ratings,
                            [m.id]: e.target.value
                          })
                        }
                      />
                    </div>

                    <button
                      className="btn-book mt-auto"
                      onClick={() => {
                        setSelectedMovie(m);
                        fetchSeats(m.id);
                      }}
                    >
                      Book Ticket
                    </button>

                    {role === "admin" && (
                      <button
                        className="btn btn-danger mt-2 w-100"
                        onClick={() => deleteMovie(m.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* SEATS */}
        {selectedMovie && (
          <div className="mt-4">
            <h5>{selectedMovie.title}</h5>

            <div className="mb-2">
              ⬜ Available | 🟩 Selected | 🟥 Booked
            </div>

            <div className="d-flex flex-wrap">
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
        <h4 className="mt-5">🎟️ My Bookings</h4>

        {bookings.map(b => (
          <div className="booking-card" key={b.id}>
            <span>{b.title}</span>
            <span>Seat {b.seats}</span>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Dashboard;