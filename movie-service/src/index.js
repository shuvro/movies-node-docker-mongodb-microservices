const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const {create, get} = require("../controllers/movie");
const {authenticateToken} = require("../middleware/auth");
const movieRoutes = require('../routes/movies')

// get config vars
dotenv.config();

if (process.env.NODE_ENV !== 'test') {
    require('../config/db')
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET env var. Set it and restart the server");
}

const app = express();

app.use(bodyParser.json());

// health check
app.get('/', (req, res) => {
    res.json({ status: true })
});

app.use('/movies', movieRoutes)

module.exports = app
