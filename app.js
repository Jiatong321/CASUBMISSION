    const express = require('express');
    const mysql = require('mysql2');
    const multer = require('multer');
    const path = require('path');
    const app = express();

    // Create MySQL connection
    const connection = mysql.createConnection({
        //host: 'localhost',
        //user: 'root',
        //password: '',
        //database: 'watchlist',
        //port: 3316

        host: 'mysql-jiatong.alwaysdata.net',
        user: 'jiatong',
        password: 'SJT@T0508309A',
        database: 'jiatong_123',
        
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL database');
    });

    // Set up view engine to use EJS
    app.set('view engine', 'ejs');

    // Enable serving static files from 'public' directory
    app.use(express.static('public'));

    // Enable form processing with URL-encoded data
    app.use(express.urlencoded({ extended: false }));

    // Configure multer for file uploads
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/files'); // Directory to save files
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname); // Use the original filename
        }
    });

    const upload = multer({ storage: storage });

    // Route to display all listings
    app.get('/', (req, res) => {
        const sql = 'SELECT * FROM listings';
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error retrieving listings');
            }
            res.render('index', { listings: results });
        });
    });

    // Route to display a specific listing by ID
    app.get('/listing/:id', (req, res) => {
        const listingId = req.params.id;
        const sql = 'SELECT * FROM listings WHERE id = ?';
        connection.query(sql, [listingId], (error, results) => {
            if (error) {
                console.error('Database Query Error:', error.message);
                return res.status(500).send('Error retrieving listing by ID');
            }
            if (results.length > 0) {
                res.render('listing', { listing: results[0] });
            } else {
                res.status(404).send('Listing not found');
            }
        });
    });

    // Route to render the 'add' listing form
    app.get('/add', (req, res) => {
        res.render('add');
    });

    // Route to handle the submission of the 'add' listing form
    app.post('/add', upload.single('file'), (req, res) => {
        const { name, price, brand, watchcon, description } = req.body;
        let file;
        if (req.file) {
            file = req.file.filename;
        } else {
            file = null;
        }

        const sql = 'INSERT INTO listings (name, price, file, brand, watchcon, description) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [name, price, file, brand, watchcon, description], (error, results) => {
            if (error) {
                console.error('Error adding listing:', error);
                res.status(500).send('Error adding listing');
            } else {
                res.redirect('/');
            }
        });
    });

    // Route to render the 'edit' listing form
    app.get('/edit/:id', (req, res) => {
        const listingId = req.params.id;
        const sql = 'SELECT * FROM listings WHERE id = ?';
        connection.query(sql, [listingId], (err, results) => {
            if (err) {
                console.error('Database query error:', err.message);
                return res.status(500).send('Error retrieving listing by ID');
            }
            if (results.length > 0) {
                res.render('edit', { listing: results[0] });
            } else {
                res.status(404).send('Listing not found');
            }
        });
    });

    // Route to handle the submission of the 'edit' listing form
    app.post('/edit/:id', upload.single('file'), (req, res) => {
        const listingId = req.params.id;
        const { name, price, brand, watchcon, description } = req.body;
        let file = req.body.currentFile;
        if (req.file) {
            file = req.file.filename;
        }

        const sql = 'UPDATE listings SET name = ?, price = ?, file = ?, brand = ?, watchcon = ?, description = ? WHERE id = ?';
        connection.query(sql, [name, price, file, brand, watchcon, description, listingId], (err, results) => {
            if (err) {
                console.error('Error updating listing:', err);
                res.status(500).send('Error updating listing');
            } else {
                res.redirect('/');
            }
        });
    });

    // Route to delete a listing by ID
    app.get('/delete/:id', (req, res) => {
        const listingId = req.params.id;
        const sql = 'DELETE FROM listings WHERE id = ?';
        connection.query(sql, [listingId], (err, results) => {
            if (err) {
                console.error('Error deleting listing:', err);
                res.status(500).send('Error deleting listing');
            } else {
                res.redirect('/');
            }
        });
    });

    // Start the server on the specified port
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
