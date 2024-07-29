const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mywebapp');


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

// Define item schema
const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    comments: [String]
});

const Item = mongoose.model('Item', itemSchema);

// Define user schema for admin
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.send('Logged in');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.send('User registered');
});

app.post('/items', async (req, res) => {
    if (!req.session.user) return res.status(401).send('Unauthorized');
    const { name, description } = req.body;
    const item = new Item({ name, description, comments: [] });
    await item.save();
    res.send('Item created');
});

app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

app.get('/items/:id', async (req, res) => {
    const item = await Item.findById(req.params.id);
    res.json(item);
});

app.put('/items/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).send('Unauthorized');
    const { name, description } = req.body;
    await Item.findByIdAndUpdate(req.params.id, { name, description });
    res.send('Item updated');
});

app.delete('/items/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).send('Unauthorized');
    await Item.findByIdAndDelete(req.params.id);
    res.send('Item deleted');
});

app.post('/items/:id/comments', async (req, res) => {
    const { comment } = req.body;
    await Item.findByIdAndUpdate(req.params.id, { $push: { comments: comment } });
    res.send('Comment added');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Serve static files
app.use(express.static('public'));

