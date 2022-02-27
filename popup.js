let srcList;
let r;
let idList;
let getContentList;
let intervalT;
let intervalV;
let searchedImg = new Array();
let videoStatus;
//suppose video time found is 3s,790s,5h3s
let videoStamp;
let ytVideoUrl;
var href = "";
var currentSearchId = 0;
var totalSearchnum = 0;
let currentTab = (await chrome.tabs.query({active: true, currentWindow: true}))[0];
document.getElementById('search-format').onchange = function() {
  videoPlatformCheck();
}

var nextButton = document.getElementById("next");
nextButton.addEventListener("click", nextEntry);
var prevButton = document.getElementById("prev");
prevButton.addEventListener("click", prevEntry);
totalSearchnum
function nextEntry() {
    if (currentSearchId < totalSearchnum) {
        currentSearchId += 1;
    }

    const displayc = currentSearchId;
    document.getElementById("entry").innerHTML = displayc + "/" + totalSearchnum;


}
function prevEntry() {
    if (currentSearchId > 0) {
        currentSearchId -= 1;
    }
    const displayc = currentSearchId+1;

    if(totalSearchnum !=0){
        document.getElementById("entry").innerHTML = displayc + "/" + totalSearchnum;

    }
}
chrome.tabs.query({ active: true, currentWindow: true },  (tabArray) =>{
    const url = tabArray[0].url;
    const vUrl = url;
    href = getLocation(url).pathname + getLocation(url).search;
    const hostname = getLocation(url).hostname; // we're interested in host related data
    if(hostname == "www.youtube.com"){
        console.log("url: "+vUrl);
        postVideoToServer(vUrl);
    }
    document.getElementById("link").textContent = hostname;
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    let message = { start: true };
    chrome.tabs.sendMessage(tab.id, message, (res) => {
      console.log(res)
        if(res[1] == null){
          inject()
        }
        srcList = Array.from(new Set(res[0]));
        idList = new Array();
        //const imgList = srcList.map((src) => `<img src="${src}" />`).join('');
        for(let i =0;i<srcList.length;i++){
            imageURL(srcList[i], i, "png");
        }
        intervalT=setInterval(getContentListFromServer,1000);

        //document.getElementById('app').innerHTML = imgList;
    });
});


function videoPlatformCheck(){
  console.log("here");
  console.log($('#search-format').val());

    //get hostname information
    const url = currentTab.url;
    href = getLocation(url).pathname + getLocation(url).search;
    const hostname = getLocation(url).hostname; // we're interested in host related data
    console.log(hostname);

  if($('#search-format').val() =="video"){
    if (hostname == "www.youtube.com"){
        document.getElementById("search").style.pointerEvents = "auto";
      $("#search-for").prop('disabled', false);
    //   $("#search").toggleClass("disabled");
      $("#error").text("");
      console.log("yes");

    }
    else{
      $("#search-for").prop('disabled', true);
      //$("#search").toggleClass("disabled");
     // var icon = document.getElementById("search");
      //icon.disabled = true;
        document.getElementById("search").style.pointerEvents = "none";
      $("#error").text("this function is only available for Youtube now");
      console.log("no");

    }

  }
  else{
    $("#search-for").prop('disabled', false);
    //   $("#search").prop('disabled', false);
      //var icon = document.getElementById("search");
      //icon.disabled = false;
      document.getElementById("search").style.pointerEvents = "auto";
      $("#error").text("");
      console.log("yes");
  }

}

$('#search').on('click', async () => {
    var list = document.getElementById('link-list');
    list.innerHTML = "";
    var searchfor = $('#search-for').val();
    console.log("searchfor: " + searchfor);
    var format = $('#search-format').val();
    console.log("in format: " + format);

    if (format == "plaintext") {
        //searchText(searchfor);
    } else if (format == "image") {
        const textList = await search(searchfor);
        //console.log(textList);
        searchImage(textList, searchedImg);
        totalSearchnum = searchedImg.length;
    } else if (format == "video") {
        if(!videoStatus.includes("Done")){
            $("#search-for").prop('disabled', true);
            document.getElementById("search").style.pointerEvents = "none";
        }
        else{
            $("#search-for").prop('disabled', false);
            document.getElementById("search").style.pointerEvents = "auto";
            const textList = await search(searchfor);
            const url = currentTab.url;
            await searchedVideoDuration(url, textList);
            totalSearchnum = videoStamp.length;
            console.log("vOnclick: "+videoStamp.length);
            if (videoStamp.length == 0) {
                console.log("should load");
                //document.getElementById("searchbox").classList.add('loading');
                console.log(document.getElementById("search-box").className);
                document.getElementById("search-box").className =
                    "ui left icon input loading";

                // $("#search-for").prop('loading', true);
                // $("#search").prop('disabled', true);
            }else {
                document.getElementById("search-box").className = "ui icon input";

                for (var j = 0; j < videoStamp.length; j++) {
                    var item = document.createElement("div");
                    item.class = "item";
                    list = document.getElementById("link-list");
                    list.appendChild(item);
                    var content = document.createElement("div");
                    content.class = "content";
                    item.appendChild(content);

                    var aTag = document.createElement("a");
                    console.log(videoStamp[j]);

                    aTag.innerText = convertTimeFormat(videoStamp[j]);
                    aTag.id = videoStamp[j];
                    // alert(aTag.id);

                    const onClick = (event) => {
                        console.log(event.target.id);
                        chrome.tabs.sendMessage(currentTab.id, {time: event.target.id});
                    };
                    aTag.addEventListener("click", onClick);

                    // window.addEventListener('click', onClick);

                    // aTag.onclick = timeStampClicked(aTag.id)
                    // function(aid = aTag.id) {
                    //   // put your click handling code here
                    //   // return(false) if you don't want default click behavior for the link

                    // }
                    content.appendChild(aTag);
                }
            }
        }
    }
});

function imageURL(url, filename, fileType) {
    getBase64(url, filename, fileType, (_baseUrl) => {
    });
}

function getBase64(url, filename, fileType, callback) {
    var image = new Image(),
        dataURL = '';
    image.src = url;
    image.crossOrigin="*";
    image.onload = function () {
        var canvas = document.createElement("canvas"),
            width = image.width,
            height = image.height;
        canvas.width = 224;
        canvas.height = 224;
        canvas.getContext("2d").drawImage(image, 0, 0, 224, 224);
        dataURL = canvas.toDataURL('image/' + fileType);
        if (width < 64 || height < 64) {
            console.log("pic too small");
        }
        else {
            //console.log("id: " + filename + "; " + dataURL.split(',')[1]);
            const rnID = filename + "rn" + Math.random() * Number.MAX_VALUE;
            idList[idList.length] = rnID;
            $.ajax({
                type: "POST",
                url: "http://34.86.216.171/image/post",
                data: {"id": rnID, "img":dataURL.split(',')[1]},
                success: function(data){
                    console.log("success post");
                }
            });
        }
        callback ? callback(dataURL) : null;
    };
}
function getContentListFromServer(){
    $.ajax({
        type: "POST",
        url: "http://34.86.216.171/image/get",
        data: {"ids": idList},
        success: function(data){
            console.log(data);
            //const obj = JSON.parse(data);
            const result = data.result;
            console.log(result);
            if(result.length != 0){
                getContentList = result;
                clearInterval(intervalT);
                console.log("success get");
            }
            else{
                //clearInterval(intervalT);
                console.log("waiting...")
            }
        }
    });
}
function postVideoToServer(videoUrl){
    $.ajax({
        type: "POST",
        url: "http://34.86.216.171/video/post",
        data: {"url": videoUrl},
        success: function(data){
            ytVideoUrl = videoUrl;
            console.log("success post video");
            intervalV=setInterval(getDurationListFromServer,1000);
        }
    });
}
function getDurationListFromServer(){
    $.ajax({
        type: "POST",
        url: "http://34.86.216.171/video/get",
        data: {"url": ytVideoUrl},
        success: function(data){
            console.log(data);
            //const obj = JSON.parse(data);
            const status = data.status;
            console.log(status);

            if(status == "Done"){
                clearInterval(intervalV);
                videoStatus = "Done";
                console.log("Done");
            }
            else if (status.includes("Error")){
                clearInterval(intervalV);
                videoStatus = "Something Error Happened";
                console.log("Error");
            }
            else{
                videoStatus = "Processing Video...";
                console.log("Processing");
            }
        }
    });
}
async function searchedVideoDuration(videoUrl, keywords){
    new Promise(resolve =>{
        $.ajax({
            type: "POST",
            url: "http://34.86.216.171/video/search",
            data: {"url": videoUrl, "keywords": keywords},
            success: function(data){
                const times = data.times;
                videoStamp = times;
                console.log("success get keywords");
                console.log("searchVideo: "+videoStamp.length);
                resolve()

            }
        });
    })

}
var getLocation = function (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};
function timeStampClicked(){
    console.log("clicked");
    var text;

    // chrome.tabs.query({active:true,currentWindow:true},()=>inject())
    chrome.tabs.sendMessage(currentTab.id,{time:text});
    // console.log(aid);

}
function inject(){
    chrome.scripting.executeScript(
        {
            target:{tabId:currentTab.id},
            files:["video.js", "inject.js"]
        }
    )

}

function convertTimeFormat(seconds){
    var date = new Date(null);
    date.setSeconds(seconds); // specify value for SECONDS here
    var result = date.toISOString().substr(11, 8);
    return result;
}

function searchImage(text, imgResults) {
    for (let i = 0; i < imgResults.length; i++){
        const content = imgResults[i].content;
        const id = imgResults[i].id.split("rn")[0];
        for(let j = 0; j< text.length;j++){
            if(content.includes(text[j])){
                console.log("id: " + id);
                searchedImg[searchedImg.length] = id;
            }
        }
    }
}

const token = {
    "method": "GET",
    "headers": {
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        "x-rapidapi-key": "c2704e88abmshc38f6f7d141ce05p1ee4cfjsn103a6e176ef9"
    }
}

const methods = ["synonyms"]

let getSynonyms = async function (str, method) {
    return new Promise((resolve) => {
        const http = new XMLHttpRequest();
        http.addEventListener("readystatechange", function () {

            if (this.readyState == this.DONE) {
                let json = JSON.parse(this.responseText)
                resolve(json[method])
            }
        })
        http.open("GET", "https://wordsapiv1.p.rapidapi.com/words/" + str + "/" + method)
        http.setRequestHeader("x-rapidapi-host", "wordsapiv1.p.rapidapi.com");
        http.setRequestHeader("x-rapidapi-key", "c2704e88abmshc38f6f7d141ce05p1ee4cfjsn103a6e176ef9")
        http.send()
    })
}


async function search(str) {
    let res = []
    for (let i = 0; i < methods.length; i++) {
        res = res.concat(await getSynonyms(str, methods[i]))
    }
    res.push(str);
    return res
}
