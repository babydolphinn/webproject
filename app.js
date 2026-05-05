const express = require('express');
const app = express();

// Set the engine so Express knows we are using EJS
app.set('view engine', 'ejs');

// ROUTE 1: The Home Page[cite: 2]
app.get('/', (req, res) => {
    res.render('home'); // This looks for views/home.ejs
});

// ROUTE 2: The Details Page[cite: 2]
app.get('/details', (req, res) => {
    res.render('details'); // This looks for views/details.ejs
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Smoothie is ready! Go to http://localhost:${PORT}`);
});