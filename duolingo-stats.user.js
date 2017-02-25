// ==UserScript==
// @name         Duolingo Stats
// @namespace    http://code-poet.net
// @version      0.01
// @description  Shows stats on Duolingo
// @match        http://www.duolingo.com/*
// @match        https://www.duolingo.com/*
// @copyright    2014, Vaughan Chandler, MIT License
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
    
    var
        username,	// The username for the logged in user.
        lookupname,	// The username for the showing being looked up.
        dwp,		// The element that shows the progress chart.
        language,	// The language to display output in (localization).
    	cachedTree;	// The generated tree, saved so it doesn't need to be regenerated unnecessarily.
    
    // Localization data.
    var strings = {
        'de': {
            dow0: 'So', dow1: 'Mo', dow2: 'Di', dow3: 'Mi', dow4: 'Do', dow5: 'Fr', dow6: 'Sa',
            loading: 'Laden Fortschritte für %lookupname%...',
            noprogress: 'Kein Fortschritt für diese Woche.',
            progress: 'Fortschritt',
        },
        'en': {
            dow0: 'Su', dow1: 'Mo', dow2: 'Tu', dow3: 'We', dow4: 'Th', dow5: 'Fr', dow6: 'Sa',
            loading: 'Loading progress for %lookupname%...',
            noprogress: 'No progress for this week.',
            progress: 'Progress',
            show_tree: 'Show The Tree',
            hide_tree: 'Hide The Tree',
        },
        'es': {
            dow0: 'Do', dow1: 'Lu', dow2: 'Ma', dow3: 'Mi', dow4: 'Ju', dow5: 'Vi', dow6: 'Sa',
            loading: 'Cargando progreso para %lookupname%...',
            noprogress: 'Ningún progreso para esta semana.',
            progress: 'Progreso',
        },
        'fr': {
            dow0: 'Di', dow1: 'Lu', dow2: 'Ma', dow3: 'Me', dow4: 'Je', dow5: 'Ve', dow6: 'Sa',
            loading: 'Chargement en cours pour %lookupname%...',
            noprogress: 'Pas de cours pour cette semaine.',
            progress: 'Progrès',
        },
        'hu': {
            dow0: 'Va', dow1: 'Hé', dow2: 'Ke', dow3: 'Sz', dow4: 'Cs', dow5: 'Pé', dow6: 'Sz',
            loading: 'Betöltése folyamatban %lookupname%...',
            noprogress: 'Nem történt előrelépés ezen a héten.',
            progress: 'Haladás',
        },
        'nl': {
            dow0: 'Zo', dow1: 'Ma', dow2: 'Di', dow3: 'Wo', dow4: 'Do', dow5: 'Vr', dow6: 'Za',
            loading: 'Vooruitgang laden voor %lookupname%...',
            noprogress: 'Geen vooruitgang voor deze week.',
            progress: 'Vooruitgang',
        },
        'pl': {
            dow0: 'Ni', dow1: 'Po', dow2: 'Wt', dow3: 'Śr', dow4: 'Cz', dow5: 'Pi', dow6: 'So',
            loading: 'Ładowanie postęp dla %lookupname%...',
            noprogress: 'Brak postępów w tym tygodniu.',
            progress: 'Postęp',
        },
        'pt': {
            dow0: 'Do', dow1: 'Se', dow2: 'Te', dow3: 'Qa', dow4: 'Qu', dow5: 'Se', dow6: 'Sa',
            loading: 'Carregando progresso para %lookupname%...',
            noprogress: 'Nenhum progresso para esta semana.',
            progress: 'Progresso',
        },
        'ro': {
            dow0: 'Du', dow1: 'Lu', dow2: 'Ma', dow3: 'Mi', dow4: 'Jo', dow5: 'Vi', dow6: 'Sa',
            loading: 'Încărcarea progres pentru %lookupname%...',
            noprogress: 'Nici un progres pentru această săptămână.',
            progress: 'Progres',
        },
        'tr': {
            dow0: 'Pa', dow1: 'Pa', dow2: 'Sa', dow3: 'Ça', dow4: 'Pe', dow5: 'Cu', dow6: 'Cu',
            loading: '%lookupname% için ilerleme yükleniyor...',
            noprogress: 'Bu hafta için herhangi bir ilerleme.',
            progress: 'İlerleme',
        },
    };
    
    // Localization detection.
    var bodyElm = document.querySelector('body');
    if (bodyElm && (m=bodyElm.className.match(/global-(\w+)/))) { language = m[1]; }
    
    // Localization function.
    // If the string doesn't exist for the language it defaults to English.
    // If the string doesn't exist for English it's returned unchanged.
    function _(s) {
        return (strings[language] && strings[language][s] ? strings[language][s] : (strings.en[s] ? strings.en[s] : s)).replace('%lookupname%', lookupname);
    }
    
    // CSS.
    document.head.appendChild($(
        '<style type="text/css">'+
        '.dwp-progress { padding-top: 30px; }'+
        '.dwp-day { display: inline-block; margin: 0 6px; width: 22px; }'+
        '.dwp-bar { background-color: #ffc10d; background-image: linear-gradient(135deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent); }'+
        '.dwp-bar:hover { opacity: 0.85; }'+
        '.dwp-dow { text-align: center; }'+
        '.dwp-points { text-align: center; color: #999; font-weight:300; }'+
        '#app.home .dwp-progress { margin: 0 0 25px 0; border-top: 2px solid #efefef; text-align:center; }'+
        'body.dstree section.main-left > * { display:none; }'+
        'body.dstree section.main-left > #dstree { display:block; }'+
        '.ds-link { color:#1caff6; cursor:pointer; }'+
        '#dstree-link { margin-top:30px; }'+
        '#dstree { position:relative; }'+
        '#dstree-close { position:absolute; top:0; right:0; color:#dd381d; cursor:pointer; font-size:140%; font-weight:bold; }'+
        '#dstree .flag { position:relative; z-index:1; margin-right:-5px; }'+
    '</style>').get(0));
    
    // Analyze the page and initialize the AJAX request if it makes sense.
    function process() {
        
        console.log('process()');
        
        // Check if progress has already been shown on the page.
        if ($('.dwp-progress').length) { return; }
        
        // Make sure the duo object and it's expected attributes are available. Die otherwise.
        if (!duo || !duo.view || !duo.user || !duo.user.get) { return; }
        
        // Get the username of the person who's logged in. Die if we can't get it.
        username = duo.user.get('username');
        if (!username) { return; }
        
        console.log('view = ' + duo.view);
        
        // Make sure the tree isn't being shown.
        hideTree();
        
        if (duo.view=='home') {
            
            // Set lookupname.
            lookupname = username;
            console.log('lookupname = ' + lookupname);
            
            // Add progress element to page.
            createDWP('#app .sidebar-progress');
            
            // Show the chart.
           	showProgress(duo.user.get('language_data'), duo.user.get('learning_language'));
            
        } else if (duo.view=='profile') {
            
            // Set lookupname. Die if unknown.
            var lookupnameElm = document.querySelector('#app .profile-header-username');
            if (!lookupnameElm) { return; }
            lookupname = lookupnameElm.innerHTML;
            console.log('lookupname = ' + lookupname);
            
            // Add progress element to page.
            // Use the tier (translation), level "badge grids" and language list grids since not every profile has the tier or level grids.
            createDWP('#app .tier-badge-grid, #app .level-badge-grid, #app .profile-language-list', true);
            
            // Show the chart. Use the duo.user object if we're looking at our own profile, AJAX otherwise.
            if (username==lookupname) {
                console.log('timesaver');
                showProgress(duo.user.get('language_data'), duo.user.get('learning_language'));
        		
                $.getJSON('//www.duolingo.com/users/' + lookupname, function(data) {
                    dsUser = data;
                    cachedTree = null;
                });
            } else {
                $.getJSON('//www.duolingo.com/users/' + lookupname, function(data) {
                    dsUser = data;
                    cachedTree = null;
                    data && data.language_data && showProgress(data.language_data);
                });
            }
            
        }
        
    }
    
    // Selector matches the element to insert the graph after.
    function createDWP(selector, extraLinks) {
        $(selector).last().after(dwp = $('<div class="dwp-progress">' + _('loading') + '</div>'));
        
        // Add button for showing tree.
        if (extraLinks) {
        	dwp.parent().append($('<h3 id="dstree-link" class="ds-link">' + _('show_tree') + '</h3>').click(showTree));
        }
    }
    
    // Convert a Date object to an ISO-formatted date string.
    function isoDate(d) {
        return '' + d.getFullYear() + ('0'+(d.getMonth()+1)).slice(-2) + ('0'+d.getDate()).slice(-2);
    }
    
    // Creates HTML for showing the flag and level for the user's language.
    function getFlagLevel(l) {
		return '<span title="' + l.language_string + '" class="flag flag-' + l.language + '-micro"></span> ' + l.level;
		//return '<span title="' + data.language_data[lang].language_string + '" class="flag flag-' + lang + '-micro"></span> ' + data.language_data[lang].level;
	}
    
    // Hides the tree.
    function hideTree() {
        $('body').removeClass('dstree');
        $('#dstree').remove();
        $('#dstree-link').html(_('show_tree'));
    }
    
    // Shows the tree.
    function showTree(e) {
        
        if ($('body.dstree').length) {
            
            // Tree is already being shown.
            // The user clicked the link again, so hide the tree.
            hideTree();
            
        } else {
            
            // Switch the text in the "Show Tree" link.
            e.target.innerHTML = _('hide_tree');
            
            // Record that the tree is visible (and apply relevant styles).
            $('body').addClass('dstree');
            
            // Show the tree.
            if (cachedTree !== null) {
                
                // Show the cached tree.
           		$('section.main-left').append(cachedTree);
                
            } else {
                
                // Determine the language.
                var code=false;
                for (key in dsUser.language_data) { code=key; break; }
                if (!code) { return; }
                
                // Add the unpopulated tree.
                var tree = $(
                    '<div id="dstree">'+
                        '<div id="dstree-close">X</div>'+
                        '<h1>'+
                            '<span class="flag flag-' + code + '-small"></span>'+
                            '<span class="avatar avatar-medium "><img src="' + dsUser.avatar + '/xlarge"><span class="ring"></span></span> '+
                            dsUser.username+
                        '</h1>'+
                        '<ul class="skill-tree"></ul>'+
                    '</div>'
                );
                $('section.main-left').append(tree);
                
                // Sort the skills by y coordinate then x coordinate (the order they appear in).
                dsUser.language_data[code].skills.sort(function(a,b) {
                    var y = a.coords_y - b.coords_y;
                    return y===0 ? a.coords_x - b.coords_x : y;
                });
                
                // Build the HTML for each icon and store them all in rows.
                var rows = [];
                for (var i=0, li='', row=null; i<dsUser.language_data[code].skills.length; i++) {
                    
                    var skill = dsUser.language_data[code].skills[i];
                    
                    if (!rows[skill.coords_y]) {
                        rows[skill.coords_y] = [];
                    }
                    
                    var iconColour = '';
                    if (!skill.locked) {
                        iconColour = skill.strength === 1 ? 'gold' : skill.icon_color;
                    }
                    
                    var strengthBar = '';
                    var progressPie = '';
                    if (skill.learned) {
                        var strength = 5;
                        switch(skill.strength) {
                            case 0.75: strength=4; break;
                            case 0.5:  strength=3; break;
                            case 0.25: strength=2; break;
                        }
                        strengthBar = '<span class="skill-icon-strength skill-icon-strength-small strength-' + strength + '"></span>';
                    } else {
                        progressPie = '';
                    }
                    
                    var locked = '';
                    if (skill.strength !== 1) {
                        locked = skill.locked ? 'locked' : 'unlocked';
                    }
                    
                    var lesssonsLeft = '';
                    if (skill.missing_lessons > 0) {
                        lesssonsLeft = (skill.num_lessons - skill.missing_lessons) + '/' + skill.num_lessons;
                    }
                    
                    rows[skill.coords_y].push(
                        '<span id="skill-' + skill.coords_x + '-' + skill.coords_y + '" class="skill-' + skill.new_index + '" title="' + skill.title + '">'+
                            '<a href="/skill/' + code + '/' + skill.url_title + '" class="skill-badge-small">'+
                                '<span class="skill-icon small ' + iconColour + ' ' + locked + '">'+
                                    '<span class="skill-icon-image skill-icon-' + skill.new_index + '"></span>'+
                                    strengthBar+
                                    progressPie+
                                '</span>'+
                                '<span class="skill-badge-name">' + skill.short + '. '+
                                    '<span class="lessons-left">' + lesssonsLeft + '</span>'+
                                '</span>'+
                            '</a>'+
                        '</span>'
                    );
                }
                
                // Add the rows and their icons to the tree.
                list=$('.skill-tree', tree);
                for (y in rows) {
                    list.append('<li class="skill-tree-row row-' + y + '">' + rows[y].join('') + '</li>');
                }
                
                cachedTree = tree;
                console.log(tree);
                
            }
            
            // Listen for clicks on the close button.
            $('#dstree-close').click(hideTree);
            
        }
        
    }
    
    // ld is Duolingo's language_data attribute from the duo.user object
    // lang is the 2-character language code or null if looking at somebody else's profile since in that case language_data only has one key.
    function showProgress(ld, lang) {
        
        console.log('showProgress()');
        
        try {
            
            var
                l,											// Shortcut to duo.user.get('language_data')[lang]
                max = 0,									// Tracks the greatest amount of points earned in a single day.
                progress = {},								// Associative array of with ISO dates as keys. The values are objects with a 'date' atrribute (a Date object) and a 'points' attribute (an integer). Only days where points where earned are present.
                now = (new Date()).getTime(),				// The current date/time. Used to reference 'today'.
                dates = [];									// A numeric array of Date objects representing the last week, whether or not points where earned on any/all of days.
                
            // Determine which language the data is for. It should be the first/only attribute.
            if (lang) { l=ld[lang]; }
            else { for (key in ld) { l=ld[key]; break; } }
            
            // If there was no progress, show an appropriate message and then die.
            if (l.calendar.length==0) {
                dwp.html(_('noprogress') + (duo.view=='profile' ? ' &nbsp;' + getFlagLevel(l) : ''));
                return;
            }
            
            // Determine the number of points earned on each day.
            for (key in l.calendar) {
                var item = l.calendar[key];
                var date = new Date(item.datetime);
                var day = isoDate(date);
                if (progress[day]) { progress[day].points += item.improvement; }
                else { progress[day] = {date:date, points:item.improvement}; }
            }
            
            // Determine the dates to show in the chart.
            for (i = now - (6 * 86400*1000); i<=now; i+=86400*1000) { dates.push(new Date(i)); }
            
            // Clear the chart (it should have a 'loading' message).
            dwp.html('');
            
            // Show heading if on a profile (for consistency).
            if (duo.view=='profile') { dwp.append('<h3 class="gray">' + _('progress') + ' &nbsp;' + getFlagLevel(l) + '</h3>'); }
            
            // Get the max number of points earned on a single day.
            for (var i=0; i<dates.length; i++) {
                var date = isoDate(dates[i]);
                if (progress[date] && progress[date].points > max) { max = progress[date].points; }
            }
            
            // Generate the chart.
            for (var i=0; i<dates.length; i++) {
                var date = isoDate(dates[i]);
                var dow = _('dow'+[dates[i].getDay()]);
                var points = progress[date] ? progress[date].points : 0;
                var height = points / max * 120; // This integer is the maximum height of the bar in pixels.
                dwp.append('<div class="dwp-day"><div class="dwp-bar" style="height:' + (points / max * 120) + 'px"></div><div class="dwp-dow">' + dow + '</div><div class="dwp-points">' + points + '</div></div>');
            }
            
        } catch(x) {
            console.log('DWP: An error occured');
            console.log(x.message);
            if (x.stack) { console.log(x.stack); }
        }
        
    }
    
    $(document).ajaxComplete(process);
    process();
    
}
