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
      <div className="navbar">
        <h4>🎬 Movie Booking</h4>

        <div>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button className="btn btn-danger ms-2" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container mt-4">

        {/* ADMIN */}
        {role === "admin" && (
          <div className="mb-4">
            <input
              className="search-box"
              placeholder="Movie name"
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="search-box"
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
          className="search-box"
          placeholder="Search movies..."
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* MOVIES */}
        <div className="row">
          {movies
            .filter(m =>
              m.title.toLowerCase().includes(search.toLowerCase())
            )
            .map(m => (
              <div className="col-md-3 mb-4" key={m.id}>
                <div className="movie-card">

                  <h5>{m.title}</h5>
                  <p>₹{m.price}</p>

                  {/* RATING */}
                  ⭐ {ratings[m.id] || 0}
                  <input
                    type="range"
                    min="1"
                    max="5"
                    onChange={(e) =>
                      setRatings({ ...ratings, [m.id]: e.target.value })
                    }
                  />

                  <button
                    className="btn-book mt-2"
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

        {/* SEATS */}
        {selectedMovie && (
          <div>
            <h5>{selectedMovie.title}</h5>

            <div>
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
        <h4 className="mt-5">My Bookings</h4>

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