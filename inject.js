//import findAndReplaceDOMText from 'findandreplacedomtext';

console.log("hi")
let injection = document.createElement("div")
  injection.id = "SSearch-already-injected"
  document.body.appendChild(injection)
function getAllElement(){
    res = [];
    let body = document.body;
    for (let i = 0; i < body.childNodes.length; i++){
        let child = body.children[i];
        if(child != null && child.tagName.toLocaleLowerCase() != "style" && child.tagName.toLocaleLowerCase() != "script"){
            res.push(child)
        }
    }
    return res
}

function clearHighlight(){
    let blocks = document.getElementsByClassName("SSearch-highlight");
    for(let i = 0; i < blocks.length; i++){
        blocks[i].replaceWith(blocks[i].innerText);
    }
}

function highlight(strs){
    let elements = getAllElement();
    for(let i =0; i < elements.length; i++){
        searchR(elements[i], strs)
    }
}

function searchR(element, strs){
    if(element == null || element.tagName.toLocaleLowerCase() == "style" || element.tagName.toLocaleLowerCase() == "script"){
        return
    }
    if(element.childNodes.length == 0){
        console.log(element)
        findAndReplace(element, strs);
        return
    }
    for (var i = 0; i < element.childNodes.length; i++){
        searchR(element.children[i])
    }

}


function findAndReplace(elem, strs){
    console.log(elem)
    if(elem.innerText == ""){
        return;
    }
    for(let i = 0; i < strs.length; i++){
         if(elem.innerText.includes(strs[i])){
             replace(elem, strs[i])
         }
    }
}
chrome.runtime.onMessage.addListener((msg)=> highlight(msg))




