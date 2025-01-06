const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost', // WAMP server host
    user: 'root',      // Your MySQL username
    password: '',       // Your MySQL password
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');

    // Create the database if it doesn't exist
    db.query('CREATE DATABASE IF NOT EXISTS loginDB', (err, result) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database is ready or already exists.');
        
        // Switch to the newly created or existing database
        db.changeUser({database: 'loginDB'}, (err) => {
            if (err) {
                console.error('Error selecting database:', err);
                return;
            }

            // Create the table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    phone VARCHAR(15),
                    password VARCHAR(100)
                )
            `;
            db.query(createTableQuery, (err, result) => {
                if (err) {
                    console.error('Error creating table:', err);
                    return;
                }
                console.log('Table is ready or already exists.');
            });
        });
    });
});

// Routes
app.post('/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, phone, password], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else {
            res.status(200).send('User registered successfully');
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
        } else if (results.length > 0) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
