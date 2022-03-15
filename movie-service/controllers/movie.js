const {MovieModel} = require("../models/movie");
const axios = require("axios");
const create = async (req, res) => {
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
}

const get = async (req, res) => {
    const user = req.user;
    const movies = await MovieModel.find({userId: user.userId}).exec()
    return res.status(200).json({ success: true, movies: movies });
}

module.exports = {
    create,
    get
}
