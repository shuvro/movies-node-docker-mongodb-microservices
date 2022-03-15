const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

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

module.exports = {
    mongodb
}
