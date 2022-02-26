let srcList;
let r;
let idList;
let getContentList;
let intervalT;
let searchedImg;
//suppose video time found is 3s,790s,5h3s
const videoStamp = [5,86,3000,12312];
var href = "";
let currentTab = (await chrome.tabs.query({active: true, currentWindow: true}))[0];
inject();

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const url = tab[0].url;
    href = getLocation(url).pathname + getLocation(url).search;
    const hostname = getLocation(url).hostname; // we're interested in host related data
    document.getElementById("link").textContent = hostname;
    let message = { start: true };
    chrome.tabs.sendMessage(tab.id, message, (res) => {
        srcList = Array.from(new Set(res));
        idList = new Array();
        searchedImg = new Array();
        const imgList = srcList.map((src) => `<img src="${src}" />`).join('');
        for(let i =0;i<srcList.length;i++){
            imageURL(srcList[i], i, "png");
        }
        intervalT=setInterval(getContentListFromServer,1000);

        //document.getElementById('app').innerHTML = imgList;
    });
});

$('#search').on('click', () => {
    var list = document.getElementById('link-list');
    list.innerHTML = "";
    var searchfor = $('#search-for').val();
    console.log("searchfor: " + searchfor);
    var format = $('#search-format').val();
    console.log("in format: " + format);
    if (format == "plaintext") {
        //searchText(searchfor);
    }
    else if(format =="image"){

    }
    else if(format == "video"){


        for(var j = 0; j<videoStamp.length;j++){
            var item = document.createElement( 'div' );
            item.class = "item";
            list = document.getElementById('link-list');
            list.appendChild(item);
            var content = document.createElement( 'div' );
            content.class = "content";
            item.appendChild(content);

            var aTag = document.createElement('a');
            console.log(videoStamp[j]);

            aTag.innerText = convertTimeFormat(videoStamp[j]);
            aTag.id = videoStamp[j];
            // alert(aTag.id);

            const onClick = (event) => {
                console.log(event.target.id);
                chrome.tabs.sendMessage(currentTab.id,{time:event.target.id});

            }
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
        if (width < 128 || height < 128) {
            console.log("too small");
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
            files:["video.js"]
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
            if(content.contains(text[j])){
                searchedImg[searchedImg.length] = id;
            }
        }
    }
}
