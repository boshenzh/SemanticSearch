//import findAndReplaceDOMText from 'findandreplacedomtext';

console.log("hi")
let injection = document.createElement("div")
  injection.id = "SSearch-already-injected"
  document.body.appendChild(injection)
function getAllElement(){
    res = [];
    let body = document.body;
    for (let i = 0; i < body.children.length; i++){
        let child = body.children[i];
        if(child != null && child.tagName.toLocaleLowerCase() != "style" && child.tagName.toLocaleLowerCase() != "script"){
            res.push(child)
        }
    }
    //console.log(res)
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
    if(element == null || element.tagName.toLocaleLowerCase() == "style" || 
        element.tagName.toLocaleLowerCase() == "script" ||
        element.tagName.toLocaleLowerCase() == "noscript"){
        return
    }
    if(element.children.length == 0 || element.children == null){
        //console.log(element)
        findAndReplace(element, strs);
        return
    }
    for (var i = 0; i < element.children.length; i++){
        searchR(element.children[i], strs)
    }
    //findAndReplace(element, strs)

}


function findAndReplace(elem, strs){
    if(elem.innerText == null || elem.innerText == ""){
        return;
    }
    for (let i = 0; i < strs.length; i++){
        //elem.innerText.replace(strs[i], '<mark class="SSearch-highlight">' + strs[i]+'</mark>')
        let splited = elem.innerText.split(strs[i])
        
        if(splited.length >1){
            elem.innerText = "";
            elem.append(splited[0])
            for (let u = 1; u < splited.length; u++){
                elem.append(highLightFactory(strs[i]))
                elem.append(splited[u])
            }
        }
    }
    //console.log(elem.innerText)

    //console.log(elem)
    // let words = elem.childNodes;
    // //console.log(words)
    // for(let u = 0; u < words.length; u++){
    //     for(let i = 0; i < strs.length; i++){
    //         console.log(words[u])
    //          if(words[u].toString().includes(strs[i])){
    //              //replace(elem, strs[i])
    //          }
    //     }
    // }
    
}

function highLightFactory(str){
    let res = document.createElement("mark")
    res.innerText = str
    res.className = "SSearch-highlight"
    return res
}
chrome.runtime.onMessage.addListener((msg)=> highlight(["JS"]))




