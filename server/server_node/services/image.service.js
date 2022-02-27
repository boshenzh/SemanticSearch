const imageService = require('../services/image.service')
const fs = require('fs');

module.exports = {
    getContent,
    postImage,
};

let image_list = [];


let dgram = require('dgram');
let PORT = 12000;
let HOST = '127.0.0.1';
let client = dgram.createSocket('udp4');

client.on("message", function (message, remote) {
    console.log(message.toString());
    let data = message.toString().split(":");
    let image_content = {
        id: data[0],
        content: data[1]
    };

    image_list.push(image_content);
});

async function postImage(req)
{
    let image_id = req.hasOwnProperty("id") ? req.id : -1;
    let image_base64 = req.hasOwnProperty("img") ? req.img : null;

    if (image_id === -1 || image_base64 === null)
        return {ret: "invalid post"};

    let img_buf = Buffer.from(image_base64, 'base64');
    fs.writeFileSync("/home/hengj1231/img/" + image_id, img_buf);

    let message = "/home/hengj1231/img/" + image_id

    client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
        if (err) throw err;
    });

    return {ret: "Success"};
}

async function getContent(req)
{
    let image_ids = req.hasOwnProperty("ids") ? req.ids : null;

    if (image_ids === null)
        return {ret: "invalid get"};

    if (!image_ids.length)
	    return {ret: "empty get"};

    let contents = []


    for(let i = 0; i < image_ids.length; i++)
    {
        let image_content = image_list.find(value => value.id === image_ids[i]);
        if (!image_content) {
            return {ret: image_ids[i].toString() +  " is not processed", result: []}
        }
        contents.push(image_content)
    }

    for(let i = 0; i < image_ids.length; i++)
    {
        image_list.splice(image_list.indexOf(image_list.find(value => value.id === image_ids[i])), 1);
    }

    return {ret: "Success", result: contents};
}
