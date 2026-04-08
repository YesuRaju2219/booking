import os
import psycopg2
import jwt
import datetime
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

SECRET_KEY = "secret123"
DATABASE_URL = os.getenv("DATABASE_URL") or "your_postgresql_url_here"

# ---------------- DATABASE ----------------
def get_db():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title TEXT,
        price INT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        movie_id INT,
        seats INT,
        user_id INT
    );
    """)

    conn.commit()
    cur.close()
    conn.close()

init_db()

# ---------------- AUTH ----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 403

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except:
            return jsonify({"error": "Invalid token"}), 403

        return f(data, *args, **kwargs)

    return decorated

# ---------------- REGISTER ----------------
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    username = data['username']
    password = data['password']

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')

    # 🔥 AUTO ADMIN
    if username == "admin" and password == "Veera":
        role = "admin"
    else:
        role = "user"

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    if cur.fetchone():
        return jsonify({"error": "User already exists"}), 400

    cur.execute(
        "INSERT INTO users (username, password, role) VALUES (%s,%s,%s)",
        (username, hashed, role)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": f"Registered as {role}"})

# ---------------- LOGIN ----------------
@app.route('/login', methods=['POST'])
def login():
    data = request.json

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username=%s", (data['username'],))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if user and bcrypt.check_password_hash(user[2], data['password']):

        token = jwt.encode({
            "user_id": user[0],
            "role": user[3],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "token": token,
            "role": user[3]
        })

    return jsonify({"error": "Invalid credentials"}), 401

# ---------------- MOVIES ----------------
@app.route('/movies', methods=['GET'])
def get_movies():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM movies")
    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify([
        {"id": m[0], "title": m[1], "price": m[2]}
        for m in data
    ])

# 🔒 ADMIN ONLY
@app.route('/movies', methods=['POST'])
@token_required
def add_movie(user):
    if user['role'] != 'admin':
        return jsonify({"error": "Access denied"}), 403

    data = request.json

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO movies (title, price) VALUES (%s,%s)",
        (data['title'], data['price'])
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Movie added"})

# 🔒 ADMIN ONLY
@app.route('/movies/<int:id>', methods=['DELETE'])
@token_required
def delete_movie(user, id):
    if user['role'] != 'admin':
        return jsonify({"error": "Access denied"}), 403

    conn = get_db()
    cur = conn.cursor()

    cur.execute("DELETE FROM movies WHERE id=%s", (id,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Movie deleted"})

# ---------------- BOOKINGS ----------------
@app.route('/book', methods=['POST'])
@token_required
def book(user):
    data = request.json

    conn = get_db()
    cur = conn.cursor()

    # ❌ prevent duplicate seat booking
    cur.execute("""
    SELECT * FROM bookings WHERE movie_id=%s AND seats=%s
    """, (data['movie_id'], data['seats']))

    if cur.fetchone():
        return jsonify({"error": "Seat already booked"}), 400

    cur.execute(
        "INSERT INTO bookings (movie_id, seats, user_id) VALUES (%s,%s,%s)",
        (data['movie_id'], data['seats'], user['user_id'])
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Booked successfully"})

# 🔥 NEW: GET BOOKED SEATS (FIX FOR YOUR ERROR)
@app.route('/seats/<int:movie_id>', methods=['GET'])
def get_seats(movie_id):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    SELECT seats FROM bookings WHERE movie_id=%s
    """, (movie_id,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify([s[0] for s in data])

# 🔒 USER BOOKINGS ONLY
@app.route('/bookings', methods=['GET'])
@token_required
def get_bookings(user):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    SELECT bookings.id, movies.title, bookings.seats
    FROM bookings
    JOIN movies ON bookings.movie_id = movies.id
    WHERE bookings.user_id=%s
    """, (user['user_id'],))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify([
        {"id": b[0], "title": b[1], "seats": b[2]}
        for b in data
    ])

@app.route('/book/<int:id>', methods=['DELETE'])
@token_required
def delete_booking(user, id):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM bookings WHERE id=%s AND user_id=%s",
        (id, user['user_id'])
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Booking deleted"})

# ---------------- ROOT ----------------
@app.route("/")
def home():
    return "Backend running..."

if __name__ == "__main__":
    app.run(debug=True)