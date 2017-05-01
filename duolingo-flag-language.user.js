// ==UserScript==
// @name         Duolingo Flag Language
// @namespace    http://code-poet.net
// @version      1.0.0
// @description  Shows language names when hovering the mouse over flags on Duolingo
// @match        http://www.duolingo.com/*
// @match        https://www.duolingo.com/*
// @copyright    2017, Vaughan Chandler, MIT License
// ==/UserScript==


function inject(f) { //Inject the script into the document
    var script;
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('name', 'lesson_review');
    script.textContent = '(' + f.toString() + ')(jQuery)';
    document.head.appendChild(script);
}
inject(f);

function f($) {

    // Get a list of language names from Duolingo.
    var names = window.duo.language_names_ui;

    // Determine the user's language (default to English if language doesn't seem to be supported).
    var src_lang = 'en';
    if ((m = $('body').attr('class').match(/global-(\w+)/)) && names[m[1]]) {
        src_lang = m[1];
    }

    // Add a listener that updates the flag element's title attribute on mouseover.
    $(document).on('mouseover', '.flag:not([title])', function(e) {
        if ((m = $(e.target).attr('class').match(/\bflag-([a-z][a-z])\b/)) && names[src_lang][m[1]]) {
            $(e.target).attr('title', names[src_lang][m[1]]);
        }
    });

}
