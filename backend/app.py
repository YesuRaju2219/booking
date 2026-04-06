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
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db():
    return psycopg2.connect(DATABASE_URL)

# ---------------- INIT DB ----------------
def init_db():
    conn = get_db()
    cur = conn.cursor()

    # USERS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT,
        password TEXT,
        role TEXT
    );
    """)

    # MOVIES TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title TEXT,
        price INT
    );
    """)

    # BOOKINGS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        movie_id INT,
        seats INT,
        user_id INT
    );
    """)

    # 🔥 IMPORTANT: Add column if not exists (fix your error)
    cur.execute("""
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS user_id INT;
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
    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO users (username, password, role) VALUES (%s,%s,%s)",
        (data['username'], hashed, data['role'])
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "User registered"})

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

        return jsonify({"token": token, "role": user[3]})

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

# ADD MOVIE (ADMIN)
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

# DELETE MOVIE (ADMIN)
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
# BOOK TICKET
@app.route('/book', methods=['POST'])
@token_required
def book(user):
    data = request.json

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO bookings (movie_id, seats, user_id) VALUES (%s,%s,%s)",
        (data['movie_id'], data['seats'], user['user_id'])
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Booked successfully"})

# GET USER BOOKINGS ONLY
@app.route('/bookings', methods=['GET'])
@token_required
def get_bookings(user):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    SELECT bookings.id, movies.title, bookings.seats
    FROM bookings
    JOIN movies ON bookings.movie_id = movies.id
    WHERE bookings.user_id = %s
    """, (user['user_id'],))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify([
        {"id": b[0], "title": b[1], "seats": b[2]}
        for b in data
    ])

# DELETE BOOKING (USER ONLY)
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

    return jsonify({"message": "Deleted"})

# TEST ROUTE
@app.route("/")
def home():
    return "Backend Running"