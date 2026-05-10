const express = require('express');
const app = express();
const Project = require('./public/js/Project');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

mongoose.connect('mongodb://127.0.0.1:27017/hauntedNotes')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'haunted-secret-key',
    resave: false,
    saveUninitialized: false
}));


function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

app.get('/register', (req, res) => {
    res.render('register', { error: null, success: null });
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.render('register', {
                error: 'This email is already registered. Please login instead.',
                success: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.render('login', {
            error: null,
            success: 'Account created successfully! Please login.'
        });

    } catch (error) {
        console.log(error);
        res.render('register', {
            error: 'Something went wrong. Please try again.',
            success: null
        });
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null, success: null });
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', {
                error: 'No account found with this email.',
                success: null
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', {
                error: 'Incorrect password. Please try again.',
                success: null
            });
        }

        req.session.userId = user._id;
        res.redirect('/');

    } catch (error) {
        console.log(error);
        res.render('login', {
            error: 'Something went wrong. Please try again.',
            success: null
        });
    }
});

app.get('/logout', (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send('Error logging out');
        }

        res.redirect('/login');
    });

});

// Forgot password routes
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {
        error: null,
        success: null
    });
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.render('forgot-password', {
                error: 'No account found with this email.',
                success: null
            });
        }

        const token = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'alanoudalyahya2004@gmail.com',
                pass: 'ruqd qbem ffcs gzqh'
            }
        });

        await transporter.sendMail({
            from: 'alanoudalyahya2004@gmail.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 15 minutes.</p>
            `
        });

        res.render('forgot-password', {
            error: null,
            success: 'Password reset link has been sent to your email.'
        });

    } catch (error) {
        console.log(error);
        res.render('forgot-password', {
            error: 'Something went wrong. Please try again.',
            success: null
        });
    }
});

app.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.send('Invalid or expired reset link.');
        }

        res.render('reset-password', {
            token: req.params.token,
            error: null
        });

    } catch (error) {
        console.log(error);
        res.send('Something went wrong.');
    }
});

app.post('/reset-password/:token', async (req, res) => {
    try {
        const { newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.send('Invalid or expired reset link.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.render('login', {
            error: null,
            success: 'Password updated successfully! Please login.'
        });

    } catch (error) {
        console.log(error);
        res.render('reset-password', {
            token: req.params.token,
            error: 'Something went wrong. Please try again.'
        });
    }
});

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

app.get('/', isAuthenticated, (req, res) => {
    res.render('home', { projects: projects });
});

app.get('/project/:id', isAuthenticated, (req, res) => {
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