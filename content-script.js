chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { start } = request;

    if (start) {
        const images = document.getElementsByTagName('img');
        const imgSrcList = Array.from(images).map((img) => img.src);
        const ytPlayer = document.getElementsByClassName('video')[0];
        const variable = [ytPlayer, imgSrcList];
        sendResponse(variable);
    }
});