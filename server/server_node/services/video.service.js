const videoService = require('../services/video.service')
const videoController = require("../controllers/video.controller");

module.exports = {
    processVideo,
    getStatus,
    search,
};

let video_list = [];

let dgram = require('dgram');
let PORT = 14000;
let HOST = '127.0.0.1';
let client = dgram.createSocket('udp4');

client.on("message", function (message, remote) {
    console.log(message.toString());
    let data = message.toString().split(",");
    let video_content = video_list.find(value => value.id === data[0]);
    if(video_content)
    {
        video_content.status = data[1];
    }
    else
    {
        video_list.push({id: data[0], status: data[1]});
    }
});

function YouTubeGetID(url){
    url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
}

async function processVideo(req)
{
    let url = req.hasOwnProperty("url") ? req.url : null;

    if (url === null)
        return {ret: "invalid post"};

    let sID = YouTubeGetID(url);

    if (sID.length <= 0)
        return {ret: "invalid post"};

    let video_content = video_list.find(value => value.id === sID);
    if (!video_content)
    {
        video_list.push({id: sID, status: "Processing"})
        let message = sID
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
        });
    }

    return {ret: "Success"};
}

async function getStatus(req)
{
    let url = req.hasOwnProperty("url") ? req.url : null;

    if (url === null)
        return {ret: "invalid post"};

    let sID = YouTubeGetID(url);

    if (sID.length <= 0)
        return {ret: "invalid post"};

    let video_content = video_list.find(value => value.id === sID);
    console.log(video_list)
    if (video_content)
    {
        return {ret: "Success", status: video_content.status}
    }
    else
    {
        return {ret: "Success", status: "Not processed"}
    }
}

async function search(req)
{
    let url = req.hasOwnProperty("url") ? req.url : null;
    let keywords = req.hasOwnProperty("keywords") ? req.keywords : null;

    if (url === null || keywords == null || keywords.length <= 0)
        return {ret: "invalid post", times: []};

    let sID = YouTubeGetID(url);

    if (sID.length <= 0)
        return {ret: "invalid post", times: []};

    let video_content = video_list.find(value => value.id === sID);
    if (!video_content || video_content.status !== "Done")
    {
        return {ret: "Failed. Check status.", times: []}
    }

    let json = require("/home/hengj1231/video/" + sID + "_contents.json").j;

    if (keywords.includes("person") || keywords.includes("people") || keywords.includes("human"))
    {
        if (!keywords.includes("man"))
            keywords.push("man")
        if (!keywords.includes("woman"))
            keywords.push("woman")
    }

    let time_list = []
    let records = []
    for(let i = 0; i < json.length; i++)
    {
        let find_flag = false;
        for (let j = 0; j < keywords.length; j++)
        {
            if (json[i].c.toLowerCase().includes(keywords[j].toLowerCase())) {
                find_flag = true;
                break;
            }
        }
        if (find_flag)
            records.push(json[i]);    
    }

    for(let i = 0; i < records.length; i++)
    {
	find_prev = false;
	find_next = false;
	
	if (records.find(value => value.s >= (records[i].s - 4) && value.s < records[i].s))
	    find_prev = true;
	if (records.find(value => value.s <= (records[i].s + 4) && value.s > records[i].s))
	    find_next = true;
	if ((find_next == false && find_prev == true) || (find_next == true && find_prev == false))
	    time_list.push(records[i].s);
    }

    return {ret: "Success", times: time_list};
}
