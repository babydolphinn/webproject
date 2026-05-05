const express = require('express');
const app = express();
const Project = require('./public/js/Project'); // Import your class

app.set('view engine', 'ejs');

const rawData = [
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

// Convert raw data into "Project" objects using your Class
const projects = rawData.map(item => new Project(item));

app.get('/', (req, res) => {
    res.render('home', { projects: projects });
});

app.get('/project/:id', (req, res) => {
    const projectId = req.params.id; // This gets the "1" or "2" from the URL
    const selectedProject = projects.find(p => p._id === projectId);
    
    if (selectedProject) {
        res.render('details', { project: selectedProject });
    } else {
        res.status(404).send('Project not found');
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});