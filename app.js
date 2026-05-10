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
const dbURI = "mongodb://sooonasama_db_user:Nnt9DhZFZwtL6QyB@ac-x743tci-shard-00-00.j1fktck.mongodb.net:27017,ac-x743tci-shard-00-01.j1fktck.mongodb.net:27017,ac-x743tci-shard-00-02.j1fktck.mongodb.net:27017/webproject?ssl=true&replicaSet=atlas-gxj21u-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(dbURI)
  .then(() => {
    console.log('✅ ATLAS STATUS: Successfully Connected via Mongoose');
  })
  .catch(err => {
    console.log('❌ ATLAS STATUS: Connection Failed');
    console.error("Error Detail:", err.message);
  });

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

// --- FORGOT PASSWORD ROUTES (Merged from Student 2) ---
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { error: null, success: null });
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('forgot-password', { error: 'No account found with this email.', success: null });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'alanoudalyahya2004@gmail.com',
                pass: 'ruqd qbem ffcs gzqh'
            }
        });

        const resetLink = `http://localhost:3000/reset-password/${token}`;
        await transporter.sendMail({
            from: 'alanoudalyahya2004@gmail.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `<h2>Password Reset</h2><p>Click the link below:</p><a href="${resetLink}">${resetLink}</a>`
        });

        res.render('forgot-password', { error: null, success: 'Reset link sent to your email.' });
    } catch (error) {
        res.render('forgot-password', { error: 'Something went wrong.', success: null });
    }
});

app.get('/reset-password/:token', async (req, res) => {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.send('Invalid or expired reset link.');
    res.render('reset-password', { token: req.params.token, error: null });
});

app.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.send('Invalid or expired reset link.');

        user.password = await bcrypt.hash(req.body.newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.render('login', { error: null, success: 'Password updated successfully!' });
    } catch (error) {
        res.render('reset-password', { token: req.params.token, error: 'Error updating password.' });
    }
});

// --- Project Display Routes (Student 2) ---
app.get('/', isAuthenticated, async (req, res) => {
    try {
        // Restore Search logic while keeping database fetch
        const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
        const projectsData = await ProjectModel.find();
        
        let projects = projectsData.map(item => new Project(item)); 

        if (searchQuery) {
            projects = projects.filter(p => 
                p.title.toLowerCase().includes(searchQuery) || 
                p.category.toLowerCase().includes(searchQuery)
            );
        }

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