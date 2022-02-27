const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');

router.post('/get', imageController.getContent);
router.post('/post', imageController.postImage);

module.exports = router;
