const express = require('express');
const app = express();

app.set('view engine', 'ejs');

// MOCK DATA: This mimics what will eventually come from MongoDB
const fakeProjects = [
    {
        _id: "1",
        title: "AI Chatbot for CCIS",
        category: "Artificial Intelligence",
        shortDescription: "A smart bot to help students find classrooms.",
        fullDescription: "This project uses Python and NLP to create a localized chatbot...",
        experience: "Focus on data cleaning early on!"
    },
    {
        _id: "2",
        title: "E-Commerce for Local Dates",
        category: "Web Development",
        shortDescription: "A platform for Saudi farmers to sell dates.",
        fullDescription: "Built with Node.js and Express to support local agriculture...",
        experience: "Bootstrap makes the UI much faster to build."
    }
];

// ROUTE 1: Home Page - Sending the fakeProjects to the template
app.get('/', (req, res) => {
    res.render('home', { projects: fakeProjects });
});

// ROUTE 2: Details Page - Sending just one project to the template
app.get('/details', (req, res) => {
    // For now, we just show the first project to test the layout
    res.render('details', { project: fakeProjects[0] });
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});