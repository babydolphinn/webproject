const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Project = require('./public/js/Project');
const ProjectModel = require('./models/Project');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect('mongodb+srv://laraaleidan04_db_user:Qvc2JhmEIuHMGlM0@cluster0.pk60mbd.mongodb.net/webproject')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get('/', async (req, res) => {
    const projectsData = await ProjectModel.find();
    const projects = projectsData.map(item => new Project(item));
    res.render('home', { projects });
});

app.get('/project/:id', async (req, res) => {
    const projectData = await ProjectModel.findById(req.params.id);
    if (projectData) {
        const project = new Project(projectData);
        res.render('details', { project });
    } else {
        res.status(404).send('Project not found');
    }
});

// Show Add Project page
app.get('/add', (req, res) => {
    res.render('add-project');
});

// Save new project to MongoDB
app.post('/add', async (req, res) => {
    const { title, category, shortDescription, fullDescription, experience } = req.body;
    const newProject = new ProjectModel({ title, category, shortDescription, fullDescription, experience });
    await newProject.save();
    res.redirect('/');
});

// Show Edit page
app.get('/project/:id/edit', async (req, res) => {
    const projectData = await ProjectModel.findById(req.params.id);
    const project = new Project(projectData);
    res.render('edit-project', { project });
});

// Update project in MongoDB
app.post('/project/:id/edit', async (req, res) => {
    const { title, category, shortDescription, fullDescription, experience } = req.body;
    await ProjectModel.findByIdAndUpdate(req.params.id, { title, category, shortDescription, fullDescription, experience });
    res.redirect('/project/' + req.params.id);
});

// Delete project
app.post('/project/:id/delete', async (req, res) => {
    await ProjectModel.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});