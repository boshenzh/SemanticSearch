// $.getScript('//www.youtube.com/iframe_api');
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message["time"] == null){
    return
  }
    console.log(message.time);
    // message.searchText is the text that was captured in the popup    
    // Search/Highlight code goes here
    var ytplayer = document.getElementsByTagName("video")[0];
    ytplayer.currentTime = message.time;

  });
  