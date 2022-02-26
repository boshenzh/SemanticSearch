
//TODO: encrypt this
const token = {
    "method": "GET",
    "headers": {
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        "x-rapidapi-key": "c2704e88abmshc38f6f7d141ce05p1ee4cfjsn103a6e176ef9"
    }
}

const methods = ["SimilarTo", "typeOf", "synonyms"]

let getSynonyms = async function (str, method) {
    return new Promise((resolve) =>{
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

let res = []
for(let i = 0; i < methods.length; i++){
    res = res.concat( await getSynonyms("bloody", methods[i]))
}
console.log(res)

