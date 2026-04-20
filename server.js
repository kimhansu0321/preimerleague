const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to get all nations
app.get('/api/nations', (req, res) => {
    db.all(`SELECT * FROM nations ORDER BY name ASC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ nations: rows });
    });
});

// API Endpoint to get all players or search by nation/name
app.get('/api/players', (req, res) => {
    const { nation_id, search } = req.query;
    let query = `
        SELECT p.*, n.name as nation_name, n.code as nation_code
        FROM players p 
        JOIN nations n ON p.nation_id = n.id
        WHERE 1=1
    `;
    const params = [];

    if (nation_id) {
        query += ` AND p.nation_id = ?`;
        params.push(nation_id);
    }
    if (search) {
        query += ` AND p.name LIKE ?`;
        params.push(`%${search}%`);
    }

    query += ` ORDER BY p.appearances DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ players: rows });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running gracefully on http://localhost:${PORT}`);
});
