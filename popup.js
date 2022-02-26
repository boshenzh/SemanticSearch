//suppose video time found is 3s,790s,5h3s
 const videoStamp = [5,86,3000,12312];

 
var href = "";
let currentTab = (await chrome.tabs.query({active: true, currentWindow: true}))[0];
inject();
// <a class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false" href="/watch?v=Ehoe35hTbuY&amp;t=0s" dir="auto">0:00</a>
chrome.tabs.query({ active: true, currentWindow: true },  (tabArray) =>{
  const url = tabArray[0].url;
  href = getLocation(url).pathname + getLocation(url).search;
  const hostname = getLocation(url).hostname; // we're interested in host related data
  document.getElementById("link").textContent = hostname;

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

function timeStampClicked(){
  console.log("clicked");
  var text;

  // chrome.tabs.query({active:true,currentWindow:true},()=>inject())
  chrome.tabs.sendMessage(currentTab.id,{time:text});
  // console.log(aid);

}
var getLocation = function (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

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
// function searchText(search){
//     if(search){
//       chrome.tabs.query({active:true,currentWindow:true},function(tabs){
//         // chrome.tabs.executeScript(tabs[0].id,{file:search.js});
//         chrome.scripting.executeScript(
//             {
//                 target: {tabId: tabs[0].id, allFrames: true},
//                 files: ['search.js'],
//               },
//               ()=>{console.log("1")}
//         )
//         chrome.tabs.sendMessage(tabs[0].id,{method:'search',searchText:search});
//       });
//     }
//   }

  
  