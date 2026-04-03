import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://postgres:1234@localhost:5432/movie_db"

def get_db():
    return psycopg2.connect(DATABASE_URL)

# Create tables
def init_db():
    conn = get_db()
    cur = conn.cursor()

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
        seats INT
    );
    """)

    conn.commit()
    cur.close()
    conn.close()

init_db()

# GET Movies
@app.route('/movies', methods=['GET'])
def get_movies():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM movies")
    data = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{"id":m[0],"title":m[1],"price":m[2]} for m in data])

# ADD Movie
@app.route('/movies', methods=['POST'])
def add_movie():
    data = request.json
    conn = get_db()
    cur = conn.cursor()

    cur.execute("INSERT INTO movies (title,price) VALUES (%s,%s)",
                (data['title'], data['price']))
    conn.commit()

    cur.close()
    conn.close()
    return jsonify({"message":"Movie added"})

# BOOK Ticket
@app.route('/book', methods=['POST'])
def book():
    data = request.json
    conn = get_db()
    cur = conn.cursor()

    cur.execute("INSERT INTO bookings (movie_id,seats) VALUES (%s,%s)",
                (data['movie_id'], data['seats']))
    conn.commit()

    cur.close()
    conn.close()
    return jsonify({"message":"Booked successfully"})

if __name__ == "__main__":
    app.run(debug=True)