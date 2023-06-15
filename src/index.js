const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;


// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'movierating'
});


// Middleware to parse JSON request bodies
app.use(express.json());



// GET /api/v1/longest-duration-movies
app.get('/api/v1/longest-duration-movies', (req, res) => {
    const sql = 'SELECT tconst, primaryTitle, runtimeMinutes, genres FROM movies ORDER BY runtimeMinutes DESC LIMIT 10';

    pool.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});


// POST /api/v1/new-movie
app.post('/api/v1/new-movie', (req, res) => {
    const { tconst, primaryTitle, runtimeMinutes, genres } = req.body;
    const sql = 'INSERT INTO movies (tconst, primaryTitle, runtimeMinutes, genres) VALUES (?, ?, ?, ?)';
    const values = [tconst, primaryTitle, runtimeMinutes, genres];

    pool.query(sql, values, (error) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message: 'success' });
        }
    });
});

// GET /api/v1/top-rated-movies
app.get('/api/v1/top-rated-movies', (req, res) => {
    const sql = 'SELECT m.tconst, m.primaryTitle, m.genres, r.averageRating FROM movies AS m JOIN ratings AS r ON m.tconst = r.tconst WHERE r.averageRating > 6.0 ORDER BY r.averageRating';

    pool.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// GET /api/v1/genre-movies-with-subtotals
app.get('/api/v1/genre-movies-with-subtotals', (req, res) => {
    const sql = ' SELECT mv.genres , mv.primarytitle , SUM(rt.numVotes) as numVotes FROM movies mv , ratings rt WHERE mv.tconst = rt.tconst GROUP BY mv.genres, mv.primarytitle WITH ROLLUP ';

    pool.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// POST /api/v1/update-runtime-minutes
app.post('/api/v1/update-runtime-minutes', (req, res) => {
    const sql = `UPDATE movies
               SET runtimeMinutes = CASE
                 WHEN genres = 'Documentary' THEN runtimeMinutes + 15
                 WHEN genres = 'Animation' THEN runtimeMinutes + 30
                 ELSE runtimeMinutes + 45
               END`;

    pool.query(sql, (error) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message: 'success' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
