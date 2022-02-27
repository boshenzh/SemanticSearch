
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
    return res
}
console.log("123")

console.log(await search("dog"))

