const mongoose = require('mongoose');
const movieSchema = new mongoose.Schema({
    title: String,
    released: String,
    genre: String,
    director: String,
    userId: Number
}, {timestamps: true});

const MovieModel = mongoose.model('Movie', movieSchema)

module.exports = {
    MovieModel
}
