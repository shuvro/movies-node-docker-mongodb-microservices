const express = require("express");
const router = express.Router();
const moviesController = require('../controllers/movie');
const {authenticateToken} = require("../middleware/auth");

router.get('/', authenticateToken, moviesController.get);
router.post('/', authenticateToken, moviesController.create);

module.exports = router;
