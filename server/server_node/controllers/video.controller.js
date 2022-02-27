const videoService = require('../services/video.service')

module.exports = {
    processVideo,
    getStatus,
    search,
};


function processVideo(req, res, next) {
    console.log("processVideo: " + JSON.stringify(req.body))
    videoService.processVideo(req.body)
        .then(value => res.json(value))
        .catch(err => next(err));
}

function getStatus(req, res, next) {
    console.log("getStatus: " + JSON.stringify(req.body))
    videoService.getStatus(req.body)
        .then(value => res.json(value))
        .catch(err => next(err));
}

function search(req, res, next) {
    console.log("search: " + JSON.stringify(req.body))
    videoService.search(req.body)
        .then(value => res.json(value))
        .catch(err => next(err));
}
