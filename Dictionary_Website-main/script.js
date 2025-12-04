//console.log("connected")

let loading_animation = document.getElementById('loading_animation');

$(window).on('load', function () {
    $('#loading_animation').hide();
})
displayRecentWord();
displaybookmarkedWord();
displayquote();
/**********FETCH API************/

// API for QUOTE
let quote = document.getElementById('quote');
let author = document.getElementById('author');
async function displayquote() {
    let quote_num = Math.floor(Math.random() * 1643)
    const response = await fetch("https://type.fit/api/quotes")
    const data = await response.json();
    if (response.ok) {
        // Update DOM elements
        quote.innerHTML = `"${data[quote_num].text}"`
        author.innerHTML = `~${data[quote_num].author} `
    }
    else {
        fetch("http://api.quotable.io/random")
            .then(res => res.json())// to convert into json format
            .then(data => {
                quote.innerHTML = `"${data.content}"`
                author.innerHTML = `~${data.author} `
            })

    }
}

/**RESIZING INPUT TEXTAREA (Placeholder comment removed) */


let search_word = document.getElementById('search_word');
let card_title = document.getElementById('card_title');
let word_meaning = document.getElementById('word_meaning');
let word_example = document.getElementById('word_example');
let word_pronounciation = document.getElementById('word_pronounciation');
let word_audio_source = document.getElementById('word_audio_source');
let word_audio = document.getElementById('word_audio');
let audio_btn = document.getElementById('audio_btn');
let search_btn = document.getElementById('search_btn');
let bookmark_btn = document.getElementById('bookmark_btn');
let offcanvasRight = document.getElementById('offcanvasRight');
let word_history_section = document.getElementById('word_history_section');

let word_result_div = document.getElementById('word_result_div');

search_btn.addEventListener('click', async function () {
    bookmark_icon.getElementsByTagName("i")[0].className = "bi bi-bookmark";
    let show_result = document.getElementById('show_result');
    show_result.style.display = "none";
    
    // 1. Input Validation
    if (search_word.value.trim() == "") {
        show_result.style.display = "none";
        var toastLiveExample = document.getElementById('liveToast')
        var toast = new bootstrap.Toast(toastLiveExample);
        toast.show()
        return; // Stop execution if input is empty
    }

    // 2. Start Loading Animation
    word_history_section.style.display = "none";
    loading_animation.style.display = "block";

    // 3. API Call
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${search_word.value.trim()}`);
    const data = await response.json();

    // 4. End Loading Animation (Wait for fetch to complete before hiding)
    loading_animation.style.display = "none";
    word_history_section.style.display = "block";
    show_result.style.display = "block";

    // 5. Handle Response
    if (response.ok) {
        audio_btn.style.display = "block";
        bookmark_icon.style.display = "block";

        card_title.innerHTML = `${data[0].word}`
        word_meaning.innerHTML = `<br>  <b><i>Meaning: </i></b>  ${data[0].meanings[0].definitions[0].definition} `
        
        // Handle example potentially being undefined
        let exampleText = data[0].meanings[0].definitions[0].example || 'No example available.';
        word_example.innerHTML = `<b><i>Example: </i></b>   ${exampleText} `;
        
        // Ensure phonetics audio/text exists before accessing
        let phoneticText = data[0].phonetics.find(p => p.text)?.text || 'N/A';
        let audioSrc = data[0].phonetics.find(p => p.audio)?.audio || '';

        word_audio_source.src = audioSrc;
        word_pronounciation.innerHTML = `<b><i>Pronounciation:</i></b>  ${phoneticText}  `;
        
        // 6. Update Recent Search History (Only on successful search)
        let recently_searched = localStorage.getItem("recently_searched");
        let recentWord = recently_searched == null ? [] : JSON.parse(recently_searched);

        let recentObj = {
            title: data[0].word,
            meaning: data[0].meanings[0].definitions[0].definition,
        }

        if (search_word.value.trim() != "") {
            recentWord.push(recentObj);
            localStorage.setItem("recently_searched", JSON.stringify(recentWord));
            displayRecentWord();
        }

    }
    else {
        // Handle Error from API
        card_title.innerHTML = `${data.title}` || "Error";
        word_meaning.innerHTML = `${data.message}` || "Could not fetch meaning.";
        word_example.innerHTML = `${data.resolution}` || "Please check your spelling and try again.";
        word_pronounciation.innerHTML = "";
        audio_btn.style.display = "none";
        bookmark_icon.style.display = "none";
    }

})
reset_btn.addEventListener('click', function () {
    search_word.value = "";
    show_result.style.display = "none";
})

// REMOVED: The separate async function fetchWord() is now removed as its logic is integrated into search_btn.addEventListener

//word_audio
audio_btn.addEventListener('click', function (e) {
    e.preventDefault();
    audio_btn.getElementsByTagName("i")[0].className = "bi bi-volume-down-fill";
    word_audio.load(); //call this to just preload the audio without playing
    word_audio.play();
    word_audio.addEventListener('ended', function () {

        audio_btn.getElementsByTagName("i")[0].className = "bi bi-volume-down";
        console.log(audio_btn.getElementsByTagName("i")[0].className)


    })


})
//Recently searched
function displayRecentWord() {
    // console.log('displayRecentWord() called ');
    let recently_searched = localStorage.getItem("recently_searched");
    if (recently_searched == null) {
        // console.log("recentWord was null")
        recentWord = [];
    } else {
        recentWord = JSON.parse(recently_searched);
        // console.log("recentWord was not null")
    }
    let html = "";
    recentWord.forEach(function (element, index) {
        // console.log("entered recentWord loop  fnc")
        html += `<div class="recent_word my-2 mx-2 card" style="width: 20rem;">
        <div class="card-body">
           <button id ="recent_popover" type="button" class="btn " data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-placement="bottom" title="${element.title}"
            data-bs-content="${element.meaning}"> <h5 class="card-title">${element.title}</h5>
        </button>
            </div>
    </div>`;
        deleteRecentSearch(index);
        //console.log(html);
    });
    let recently_searched_element = document.getElementById('recently_searched')
    let recent_search_title = document.getElementById("recent_search_title");
    if (recentWord.length != 0) {
        recent_search_title.style.display = "block"
        recently_searched_element.innerHTML = html;
    }

}
function deleteRecentSearch(index) {
    //console.log(`index ${index} given`)
    let recently_searched = localStorage.getItem("recently_searched");
    if (recently_searched == null) {

        recentWord = [];
    } else {
        recentWord = JSON.parse(recently_searched);
    }
    if (index == 4) {
        //console.log(`index ${index} therefore entered splice function part;expected index =4`)
        recentWord.splice(0, 1);
        //index = 0;
        localStorage.setItem("recently_searched", JSON.stringify(recentWord));
        displayRecentWord();

    }
    // console.log(`index:${index} before leaving  delete fnc`)
}
//bookmark
let bookmark_icon = document.getElementById('bookmark_icon')
bookmark_icon.addEventListener('click', function () {

    let bookmark_icon_class = bookmark_icon.getElementsByTagName("i")[0].className
    /***local storage for bookmarked words  */
    let bookmarked_words = localStorage.getItem("bookmarked_words");
    if (bookmarked_words == null) {
        bookmarkedObj = [];
    } else {
        bookmarkedObj = JSON.parse(bookmarked_words);

    }
    if (bookmark_icon_class == "bi bi-bookmark") {

        bookmark_icon.getElementsByTagName("i")[0].className = "bi bi-bookmark-check-fill";
        // to be reviewed such that if class name == icon fil then
        let bookmark_parent = this.parentElement;

        bookmarkedObj.push(bookmark_parent.getElementsByTagName("h5")[0].innerHTML);// to be changed to 
        localStorage.setItem("bookmarked_words", JSON.stringify(bookmarkedObj));
        displaybookmarkedWord();

    }
    else {
        bookmark_icon.getElementsByTagName("i")[0].className = "bi bi-bookmark";
        bookmarkedObj

    }





})
function displaybookmarkedWord() {
    let bookmarked_words = localStorage.getItem("bookmarked_words");
    if (bookmarked_words == null) {
        bookmarkedObj = [];
    } else {
        bookmarkedObj = JSON.parse(bookmarked_words);

    }
    let html = "";
    bookmarkedObj.forEach(function (element, index) {
        // console.log("entered recentWord loop  fnc")
        html += `<li id=${index}><h4>${element}<button id=${index} type="button" class="btn-close text-reset"
        aria-label="Close" onclick="delete_bookmarkWord(this.id)"></button></h4></li><br>`;
        console.log(`index :${index} passed to delete function`)
    });
    let bookmarked_words_element = document.getElementById('bookmarked_words_element')
    if (bookmarkedObj.length != 0) {

        bookmarked_words_element.innerHTML = html;

    }
    else {
        bookmarked_words_element.innerHTML = `<h5>No words bookmarked !!</h5>`
    }
}
function delete_bookmarkWord(index) {
    let bookmarked_words = localStorage.getItem("bookmarked_words");
    if (bookmarked_words == null) {
        bookmarkedObj = [];
    } else {
        bookmarkedObj = JSON.parse(bookmarked_words);

    }
    console.log(`index :${index} received inside delete function`)
    bookmarkedObj.splice(index, 1);
    console.log(`index :${index} deleted`)
    localStorage.setItem("bookmarked_words", JSON.stringify(bookmarkedObj));
    displaybookmarkedWord();
}


/// popovser section for arecent searches 
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
})

/**
 * Back to top button
 */

//Get the button
let mybutton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
    scrollFunction();
};

function scrollFunction() {
    if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
    ) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}
// When the user clicks on the button, scroll to the top of the document
mybutton.addEventListener("click", backToTop);

function backToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}