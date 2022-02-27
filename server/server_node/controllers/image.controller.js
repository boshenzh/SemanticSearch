const imageService = require('../services/image.service')

module.exports = {
    getContent,
    postImage,
};

function getContent(req, res, next) {
    console.log("get: " + JSON.stringify(req.body))
    imageService.getContent(req.body)
        .then(value => res.json(value))
        .catch(err => next(err));
}

function postImage(req, res, next) {
    imageService.postImage(req.body)
        .then(value => res.json(value))
        .catch(err => next(err));
}
