const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');

router.post('/post', videoController.processVideo);
router.post('/get', videoController.getStatus);
router.post('/search', videoController.search);

module.exports = router;
