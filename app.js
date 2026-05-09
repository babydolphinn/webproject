const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Import your Models (Student 3 & 1) and your Class (Student 2)
const Project = require('./public/js/Project'); // Your ES6 Class
const ProjectModel = require('./models/project'); // MongoDB Schema
const User = require('./models/User'); 

// --- Database Connection ---
//mongoose.connect('mongodb://127.0.0.1:27017/webproject')
mongoose.connect('mongodb+srv://laraaleidan04_db_user:Qvc2JhmEIuHMGlM0@cluster0.pk60mbd.mongodb.net/webproject')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));
    


// --- Middleware ---
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 

app.use(session({
    secret: 'haunted-secret-key',
    resave: false,
    saveUninitialized: false
}));

// --- Auth Guard (Student 1) ---
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// --- Auth Routes (Student 1) ---
app.get('/register', (req, res) => res.render('register', { error: null, success: null }));

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.render('register', { error: 'Email already exists', success: null });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.render('login', { error: null, success: 'Account created! Please login.' });
    } catch (error) { 
        res.render('register', { error: 'Registration failed. Try again.', success: null }); 
    }
});

app.get('/login', (req, res) => res.render('login', { error: null, success: null }));

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            return res.redirect('/');
        }
        res.render('login', { error: 'Invalid email or password', success: null });
    } catch (err) {
        res.render('login', { error: 'Server error', success: null });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// --- Project Display Routes (Student 2) ---
app.get('/', isAuthenticated, async (req, res) => {
    try {
        const projectsData = await ProjectModel.find();
        // Convert plain database objects into your ES6 Class instances
        const projects = projectsData.map(item => new Project(item)); 
        res.render('home', { projects });
    } catch (err) {
        res.status(500).send("Error fetching projects");
    }
});

app.get('/project/:id', isAuthenticated, async (req, res) => {
    try {
        const projectData = await ProjectModel.findById(req.params.id);
        if (projectData) {
            const project = new Project(projectData); 
            res.render('details', { project });
        } else {
            res.status(404).send('Project not found');
        }
    } catch (err) { 
        res.status(500).send('Invalid Project ID'); 
    }
});

// --- CRUD Routes (Student 3) ---
app.get('/add', isAuthenticated, (req, res) => res.render('add-project'));

app.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { title, category, shortDescription, fullDescription, experience } = req.body;
        const newProject = new ProjectModel({ title, category, shortDescription, fullDescription, experience });
        await newProject.save(); 
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error adding project");
    }
});

app.get('/project/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const projectData = await ProjectModel.findById(req.params.id);
        res.render('edit-project', { project: new Project(projectData) });
    } catch (err) {
        res.status(404).send("Project not found");
    }
});

app.post('/project/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const { title, category, shortDescription, fullDescription, experience } = req.body;
        await ProjectModel.findByIdAndUpdate(req.params.id, { title, category, shortDescription, fullDescription, experience });
        res.redirect('/project/' + req.params.id);
    } catch (err) {
        res.status(500).send("Error updating project");
    }
});

app.post('/project/:id/delete', isAuthenticated, async (req, res) => {
    try {
        await ProjectModel.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error deleting project");
    }
});

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));