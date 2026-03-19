from flask import Flask, render_template, request, jsonify
import mysql.connector
from db_config import DB_CONFIG

app = Flask(__name__)

# Database connection function
def get_db_connection():
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn, conn.cursor()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

# User authentication API
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn, cursor = get_db_connection()
    try:
        cursor.execute("SELECT id, name FROM users WHERE username = %s AND password = %s", 
                       (username, password))
        user = cursor.fetchone()
        if user:
            return jsonify({
                'success': True,
                'user_id': user[0],
                'name': user[1]
            })
        else:
            return jsonify({'success': False})
    finally:
        cursor.close()
        conn.close()

# Save feedback API
@app.route('/api/save_feedback', methods=['POST'])
def save_feedback():
    data = request.json
    user_id = data.get('user_id')
    mood = data.get('mood')
    feeling_after = data.get('feeling_after')
    worthwhile = data.get('worthwhile')
    general_feedback = data.get('general_feedback')
    
    conn, cursor = get_db_connection()
    try:
        cursor.execute("""
            INSERT INTO feedback 
            (user_id, mood, feeling_after, worthwhile, general_feedback, created_at) 
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (user_id, mood, feeling_after, worthwhile, general_feedback))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)