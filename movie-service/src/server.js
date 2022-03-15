const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require("axios");
const { MovieModel } = require('../models/movie');
const Movie = require("../models/movie");

// get config vars
dotenv.config();


const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env var. Set it and restart the server");
}

const app = express();

app.use(bodyParser.json());

if (process.env.MONGO_HOST === "mongo-db") {
  mongoose.connect(`mongodb://${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    user: `${process.env.MONGO_DATABASE_USERNAME}`,
    pass: `${process.env.MONGO_DATABASE_PASSWORD}`
  });
} else {
  mongoose.connect(`mongodb://127.0.0.1/${process.env.MONGO_DB}`, {
    useNewUrlParser: true
  });
}

const mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, 'connection error:'));
mongodb.once('open', function () {
  console.log('mongoDb Connection has been established successfully.')
  console.log('mongoDb Host', process.env.MONGO_HOST)
  console.log('mongoDb db', process.env.MONGO_DB)
});


const  authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, JWT_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

app.post('/movies', authenticateToken, async (req, res) => {
  const user = req.user;
  let title = req.body.title
  if (!title) {
    return res.status(401).json({ error: "Title is required" });
  }

  const today = new Date().toISOString();
  const oneMonthAgo = new Date()
  const m = oneMonthAgo.getMonth()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  if (oneMonthAgo.getMonth() === m) oneMonthAgo.setDate(0);
  oneMonthAgo.setHours(0, 0, 0, 0);

  let eligibleToCreate = false
  if (user.role === 'basic') {
    const movieCount = await MovieModel.find({userId: user.userId, createdAt: {$gte: oneMonthAgo.toISOString(), $lte: today}}).exec()
    if (movieCount.length < 5) {
      eligibleToCreate = true
    }
  } else {
    eligibleToCreate = true
  }
  if (eligibleToCreate) {
    title = encodeURIComponent(title).replace(/%20/g, "+")
    const {data} = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${title}`)

    if (data) {
      const movie = {
        title: data.Title,
        released: data.Released,
        genre: data.Genre,
        director: data.Director,
        userId: user.userId
      }

      const alreadyExists = await MovieModel.find(movie).exec();
      if (alreadyExists.length > 0) {
        return res.status(200).json({ success: false, message: "Movie already exists" });
      }
      await MovieModel.create(movie);
      return res.status(200).json({ success: true, message: "Movie is saved" });
    }
    return res.status(200).json({ success: false, message: "Movie not found" });
  }
  return res.status(200).json({ success: false, message: "You are not allowed to save new movies due to limit" });
});

app.get('/movies', authenticateToken, async (req, res) => {
  const user = req.user;
  const movies = await MovieModel.find({userId: user.userId}).exec()
  return res.status(200).json({ success: true, movies: movies });
});

app.listen(PORT, () => {
  console.log(`movie svc running at port ${PORT}`);
});
