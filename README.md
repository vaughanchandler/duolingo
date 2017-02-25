# Duolingo user scripts and bookmarklets

**Duolingo Stats**

* Shows you a progress chart for the last 7 days on all profiles.
* Shows you other people's trees on their profile (after you click on "Show the tree").
* Only shows stats for the language the person is currently learning.
* [Install userscript](https://github.com/vaughanchandler/duolingo/raw/master/duolingo-stats.user.js).

**Duolingo Incubator Stats**

* Shows you the completion for phase 1 languages as percentages, rounded to 1 decimal place.
* [Install userscript](https://github.com/vaughanchandler/duolingo/raw/master/duolingo-incubator-stats.user.js)

**Duolingo Review**

* Deprecated - Duolingo provides this functionality now.

**Duolingo Weekly Progress**

* Deprecated - use Duolingo Stats instead.
* Don't use both at the same time - uninstall Duolingo Weekly Progress first.

## User scripts

### Installing

1. If haven't already, install the appropriate extension for your browser (restarting your browser afterwards if necessary):
 * Chrome: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
 * Chromium: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
 * Firefox: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
 * Safari: [JavaScript Blocker](http://javascript-blocker.toggleable.com/)
1. Click on the user script installation link under the user script's description above.
1. Confirm the installation when prompted.

### Uninstalling

1. Follow the uninstall steps for the browser/extension you're using:
 * Chrome: [Tampermonkey](http://tampermonkey.net/faq.php?ext=dhdg#Q101)
 * Chromium: [Tampermonkey](http://tampermonkey.net/faq.php?ext=dhdg#Q101)
 * Firefox: [Greasemonkey](http://wiki.greasespot.net/Greasemonkey_Manual:Script_Management)
 * Safari: [JavaScript Blocker](http://javascript-blocker.toggleable.com/)

## Bookmarklets

### Installing

1. Click on the installation link under the user script's description above.
1. Follow the bookmarklet instructions on that page.

### Uninstalling

1. Delete the bookmarklet as you would delete any other bookmark.

## Duolingo Stats

### Planned features:

* Show all certificates a person has earned, including the score for each certificate and the date/time test was taken.
* Show the amount of points a person has in each language.
* Show a person's all-time ranking among their followers.

### Known bugs / limitations:

* Progress charts and trees are only shown for the language the person is currently learning.
* Trees don't show divisions between sections or bonus skills.
* The text for showing/hiding the tree is still only in English (translations welcome - see below).

### Localisation

Feel free to submit a pull request or issue to add/update translated text in your language for the following strings:

* **Days of the week**: A 1 or 2 letter abbreviation for each day of the week, eg *Mo, Tu, We, Th, Fr, Sa, Su*.
* **Loading message**: "*Loading progress for %lookupname%...*"
* **No progess message**: "*No progress for this week.*"
* **Progress heading**: "*Progess*"
* **Link text for showing the tree**: "*Show The Tree*"
* **Link text for showing the tree**: "*Hide The Tree*"
