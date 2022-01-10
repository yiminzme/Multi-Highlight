// ************************************************************************
// Multi Highlight Library
// ************************************************************************

// global variables
lastVisibleText = "";


// ****** general functions
function get_tabkey(tabId) {
    return "multi-highlight_" + tabId;
}
function makeSafeForCSS(name) {
    return name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
}

// What is the fastest or most elegant way to compute a set difference using Javascript arrays? - Stack Overflow: https://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javasc
function SetMinus(A, B){
	return A.filter(x => !B.includes(x) );
}

const TrueOrFalse = (opt) => opt? "true" : "false";

function KeywordEscape(kw){
	return kw.replace(/\n/sgi, '\\n');
}

// ****** Multi Highlight functions
function hl_search(addedKws, settings, tabinfo) { // isNewLineNewColor expects 2d array, otherwise 1d
	// console.log("addedKws: " + addedKws);
	
	isWholeWord     = TrueOrFalse(settings.isWholeWord);
	isCasesensitive = TrueOrFalse(settings.isCasesensitive);


	if(settings.isNewlineNewColor){
		for (var i = 0; i < addedKws.length; i++) {
			addedKws[i] = remove_duplicate_Kws(addedKws[i], isCasesensitive); // remove duplicate keywords of 1d array
			addedKws[i] = sort_Kws_by_length(addedKws[i], false); // sort addedKws by length, from longest to shortest

			className = settings.CSSprefix1 + " " + (settings.CSSprefix2 + (i % settings.CSS_COLORS_COUNT)) + " " + settings.CSSprefix3;
			code = addedKws[i].filter(j=>j).map((kw) => {
				if(kw.length < 1) return "";
				cls  = className +  encodeURI(kw);
				return "$(document.body).highlight(" + `'${KeywordEscape(kw)}', `
					+ `{className: '${cls}', wordsOnly: ${isWholeWord}, caseSensitive: ${isCasesensitive}  ` + "})";
			}).join(";\n");
			console.log(code);
			chrome.tabs.executeScript(tabinfo.id, { code: code }, _ => chrome.runtime.lastError);
		}
	}else{
		addedKws = remove_duplicate_Kws(addedKws, isCasesensitive); // remove duplicate keywords of 1d array
		addedKws = sort_Kws_by_length(addedKws, false); // sort addedKws by length, from longest to shortest

		clsPrefix = settings.CSSprefix1 + " " + settings.CSSprefix2 ;
		code = addedKws.filter(i=>i).map((kw, ind)=>{ // filter() removes empty array elms
			// if(kw.length < 1) return "";
			cls = clsPrefix + ((tabinfo.style_nbr + ind) % settings.CSS_COLORS_COUNT) +  " "
						+ (settings.CSSprefix3 + encodeURI(kw)); // escape special characters
			return "$(document.body).highlight(" + `'${KeywordEscape(kw)}', `
				+ `{className: '${cls}', wordsOnly: ${isWholeWord}, caseSensitive: ${isCasesensitive}  ` + "})";

		}).join(";\n");
		console.log(code);
		chrome.tabs.executeScript(tabinfo.id, { code: code }, _ => chrome.runtime.lastError);
		tabinfo.style_nbr += addedKws.length;
	}
}


function hl_clear(removedKws, settings, tabinfo) { // isNewLineNewColor expects 2d array, otherwise 1d

	isCasesensitive = TrueOrFalse(settings.isCasesensitive);

	
	removedKws = [].concat.apply([], removedKws); // convert 2d array to 1d (for isNewlineNewColor)
	removedKws = remove_duplicate_Kws(removedKws, isCasesensitive); // remove duplicate keywords of 1d array
	removedKws = sort_Kws_by_length(removedKws); // sort addedKws by length, from shortest to longest

	code = removedKws.filter(i=>i).flatMap(kw=>{ // filter() removes empty array elms
		// if(kw.length < 1) return "";
		className = (settings.CSSprefix3 + encodeURI(kw)).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");
		return "$(document.body).unhighlight({className:'" + className + "'})";
	}).join(";\n");
	// console.log(`removedKws${removedKws.length}:` + removedKws);
	// console.log("REMOVE: " + code);
	chrome.tabs.executeScript(tabinfo.id, {code: code}, _ => chrome.runtime.lastError);
	settings.isNewlineNewColor || (tabinfo.style_nbr -= removedKws.length);
}


function hl_clearall(settings, tabinfo) {
    chrome.tabs.executeScript(tabinfo.id,
        {code: "$(document.body).unhighlight({className:'" + settings.CSSprefix1 + "'})"}, _ => chrome.runtime.lastError);
}

function sort_Kws_by_length(Kws, start_from_shortest = true){
	Kws.sort(function(a, b){
		return a.length - b.length;
	});

	if (!start_from_shortest){
		Kws.reverse()
	}
	return Kws
}
function remove_duplicate_Kws(Kws, isCasesensitive){
	var uniq = [];

	if (isCasesensitive){
		uniq = [...new Set(Kws)];
	} else {
		var uniq_lowercase = [];

		Kws.forEach( Kw => {
			if ( !(uniq.includes(Kw) || uniq_lowercase.includes(Kw.toLowerCase())) ){
				uniq.push(Kw);
				uniq_lowercase.push(Kw.toLowerCase());
			}
		})
	}

	return uniq
}


function check_keywords_existence(){
	chrome.tabs.executeScript(null, {
		file: "getPagesSource.js"
	}, function() {
		// If you try and inject into an extensions page or the webstore/NTP you'll get an error
		if (chrome.runtime.lastError) {
			console.error( 'There was an error injecting script : \n' + chrome.runtime.lastError.message);
		}
	});
}

function handle_highlightWords_change(tabkey, option, callback=null) {
    inputStr = highlightWords.value;
		// .toLowerCase();

    chrome.storage.local.get(['settings', tabkey], function (result) {
        var settings = result.settings;
        var tabinfo = result[tabkey];

        // (instant search mode) or (last char of input is delimiter)
        if (settings.isInstant || inputStr.slice(-1) == settings.delim) {
            if (settings.isNewlineNewColor){
							inputKws = inputStr.split(/\n/g).filter(i=>i).map(line=>line.split(settings.delim).filter(i=>i)); // 2d-array
							// in the case of toggle newline-new-color mode, previouse keyword-list is 1D array,
							// So re-construct it into 2D array
							savedKws = (tabinfo.keywords.length && (tabinfo.keywords[0] instanceof Array) ) 
								? tabinfo.keywords
								: (tabinfo.keywords.join(settings.delim) || "").split(/\n/g).filter(i=>i).map(line=>line.split(settings.delim).filter(i=>i)); // 2d-array
							ntypes = inputKws.length < tabinfo.keywords.length ? inputKws.length : tabinfo.keywords.length;
							addedKws = [];
							removedKws = [];
							for(i = 0; i<ntypes; ++i){
								addedKws.push(SetMinus(inputKws[i], savedKws[i]));
								removedKws.push(SetMinus(savedKws[i], inputKws[i]));
							}
							for(i=ntypes; i < inputKws.length; ++i){
								addedKws.push(inputKws[i]);
							}
							for(i=ntypes; i < savedKws.length; ++i){
								removedKws.push(savedKws[i]);
							}
            }else{
                inputKws = inputStr.split(settings.delim).filter(i => i); // filter() removes empty array elms
                addedKws   = SetMinus(inputKws, tabinfo.keywords); // get tokens only occur in new input
                removedKws = SetMinus(tabinfo.keywords, inputKws); // get tokens only occur in old input
            }

			if(option && option.refresh){
				hl_clearall(settings, tabinfo);
				// hl_clear(tabinfo.keywords, settings, tabinfo);
				hl_search(inputKws, settings, tabinfo);
			}else if(option && option.skipHighlight){
				// skip highlight if required
			}
			else{
				hl_clear(removedKws, settings, tabinfo);
				hl_search(addedKws, settings, tabinfo);
			}

			html = settings.isNewlineNewColor 
				?  inputKws.map(line=> line.map(elem=>`<span class="keywords">${elem}</span>`).join("")).join("")
				: inputKws.map(elem=>`<span class="keywords">${elem}</span>`).join("");
			// todo: don't delete all 
			$('#kw-list>.keywords').remove();
			$(html).appendTo($('#kw-list'));
			check_keywords_existence();
            tabinfo.keywords = inputKws;
            settings.latest_keywords = inputKws;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings});
        } else if (!inputStr) { // (empty string)
            hl_clearall(settings, tabinfo)
            tabinfo.keywords = [];
            settings.latest_keywords = "";
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings});
        }

		callback && callback();
    });
}
function handle_keyword_removal(event, tabkey){
	console.log(event);
	if(event.ctrlKey && event.target.matches('.keywords')){ // bugfix: don't remove the container
		chrome.storage.local.get(['settings'], function (result) {
			var settings = result.settings;
			event.target.remove();
			highlightWords.value = [...document.querySelectorAll('#kw-list>.keywords')].map(elem=>elem.innerText).join(settings.delim);
			handle_highlightWords_change(tabkey); // update highlights
		});
	}
}


function handle_option_change(tabkey) { // tabkey of popup window
	chrome.storage.local.get(['settings'], function (result) {
		var settings = result.settings;

		var forceRefresh = (settings.isWholeWord != wholeWord.checked) 
			|| (settings.isCasesensitive != casesensitive.checked)
			|| (settings.isNewlineNewColor != newlineNewColor.checked);
		// update settings
		settings.delim             = delimiter.value;
		settings.isInstant         = instant.checked;
		settings.isAlwaysSearch    = alwaysSearch.checked;
		settings.isNewlineNewColor = newlineNewColor.checked;
		settings.isCasesensitive   = casesensitive.checked;
		settings.isWholeWord       = wholeWord.checked;
		settings.isSaveKws         = saveWords.checked;

        if (settings.isSaveKws){
            $('#alwaysSearch').removeAttr('disabled'); // enable input
        }else{
            $('#alwaysSearch').prop("checked", false); // uncheck alwaysSearch
            settings.isAlwaysSearch = false; // set alwaysSearch to false
            $('#alwaysSearch').attr('disabled', true); // disable alwaysSearch checkbox
        }
		
		chrome.storage.local.set({'settings': settings}, function () {
			if (tabkey) {
				handle_highlightWords_change(tabkey, {refresh: forceRefresh});
			}
		});
	});
}



function handle_addKw_change(enableIt) {
    chrome.storage.local.get(['settings'], function (result) {
        if (enableIt) {
            chrome.contextMenus.create({
                title: 'Add Keyword',
                id: 'addKw', // you'll use this in the handler function to identify this context menu item
                contexts: ['selection'],
            });
            result.settings.enableAddKw = true;
        } else {
            chrome.contextMenus.remove("addKw");
            result.settings.enableAddKw = false;
        }

        chrome.storage.local.set({'settings': result.settings});
    });
}


function handle_removeKw_change(enableIt) {
    chrome.storage.local.get(['settings'], function (result) {
        if (enableIt) {
            chrome.contextMenus.create({
                title: 'Remove Keyword',
                id: 'removeKw', // you'll use this in the handler function to identify this context menu item
                contexts: ['selection'],
            });
            result.settings.enableRemoveKw = true;
        } else {
            chrome.contextMenus.remove("removeKw");
            result.settings.enableRemoveKw = false;
        }

        chrome.storage.local.set({'settings': result.settings});
    });
}


function handle_popupSize_change(newHeight, newWidth) {
    chrome.storage.local.get(['settings'], function (result) {
        is_changed = false;
        if (newHeight){
            result.settings.popup_height = newHeight;
            is_changed = true;
        }
        if (newWidth){
            result.settings.popup_width = newWidth;
            is_changed = true;
        }
        if(is_changed){
            chrome.storage.local.set({'settings': result.settings});
        }
    });
}
