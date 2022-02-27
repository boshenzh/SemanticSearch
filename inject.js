
console.log("hi")
let injection = document.createElement("div")
  injection.id = "SSearch-already-injected"
  document.body.appendChild(injection)

var counter = 0;
var current = 0;
var results = [];
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
    while(blocks.length > 0){
        blocks[0].replaceWith(blocks[0].innerText);
    }
    counter = 0;
}

async function highlight(strs, sendResponse){
    if(strs == null){
        return
    }
    if(strs == ""){
        clearHighlight()
        return
    }
    strs = await search(strs)
    let len = strs.length
    for(let i = 0; i < len; i++){
        let str = strs[i]
        strs.push(str[0].toUpperCase()+str.slice(1))
    }
    clearHighlight()
    let elements = getAllElement();
    for(let i =0; i < elements.length; i++){
        searchR(elements[i], strs)
    }
    results = document.getElementsByClassName("SSearch-highlight")
    console.log(total)
    current = 0;
    if(results.length > 0){
       results[0].classList.add("SSearch-highlight-current")
       window.scrollTo(0, results[0].offsetTop - 300)
    }
    sendResponse([document.getElementsByClassName("SSearch-highlight").length])
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
    //console.log(elem)
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
    res.id = "SSearch-highlight-" + counter
    counter++;
    return res
}

function next(){
    console.log(current)
    results[current].classList.remove("SSearch-highlight-current")
    if (current == results.length -1){
        current = -1
    }
    current++;
    results[current].classList.add("SSearch-highlight-current")
    window.scrollTo(0, results[current].offsetTop - 300)
}

function prev(){
    console.log(current)
    results[current].classList.remove("SSearch-highlight-current")
    if (current == 0){
        current = results.length
    }
    current--;
    results[current].classList.add("SSearch-highlight-current")
    window.scrollTo(0, results[current].offsetTop - 300)
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
    if(request["search-for"]){
        highlight(request["search-for"], sendResponse)
    }
    else if(request["jump"] == "prev"){
        prev();
    }
    else if(request["jump"] == "next"){
        next();
    }
    

})







//TODO: encrypt this
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
    res.push(str)
    return res
}

