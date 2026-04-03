import { useEffect, useState } from "react";

const API = "https://booking-3yz8.onrender.com"; // change after deployment

function App() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState({});

  const fetchMovies = () => {
    fetch(`${API}/movies`)
      .then(res => res.json())
      .then(setMovies);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const addMovie = () => {
    fetch(`${API}/movies`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({title, price})
    }).then(fetchMovies);
  };

  const book = (id) => {
    fetch(`${API}/book`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        movie_id:id,
        seats: seats[id] || 1
      })
    }).then(()=>alert("Booked!"));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">🎬 Movie Booking</h2>

      <div className="card p-3 mb-3">
        <input className="form-control mb-2" placeholder="Movie Name"
          onChange={e=>setTitle(e.target.value)} />
        <input className="form-control mb-2" placeholder="Price"
          onChange={e=>setPrice(e.target.value)} />
        <button className="btn btn-primary" onClick={addMovie}>Add Movie</button>
      </div>

      <div className="row">
        {movies.map(m=>(
          <div className="col-md-4 mb-3" key={m.id}>
            <div className="card p-3">
              <h5>{m.title}</h5>
              <p>₹{m.price}</p>

              <input type="number" className="form-control mb-2"
                placeholder="Seats"
                onChange={e=>setSeats({...seats,[m.id]:e.target.value})} />

              <button className="btn btn-success"
                onClick={()=>book(m.id)}>Book Ticket</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;