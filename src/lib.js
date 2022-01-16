// ************************************************************************
// Multi Highlight Library
// ************************************************************************


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
function handle_highlightWords_change(tabkey, option, callback=null) {
    inputStr = highlightWords.value;
		// .toLowerCase();

    chrome.storage.local.get(['settings', tabkey], function (result) {
        var settings = result.settings;
        var tabinfo = result[tabkey];

		if(!settings.isOn){
			hl_clearall(settings, tabinfo);
			return;
		}

        // (instant search mode) or (last char of input is delimiter)
        if (settings.isInstant || inputStr.slice(-1) == settings.delim) {
			inputKws = keywordsFromStr(inputStr, settings);
			savedKws = tabinfo.keywords;
			// console.log(`inputKws: ${inputKws.length}: `);
			// console.log(inputKws);
			// differ it
			addedKws = KeywordsMinus(inputKws, savedKws);
			removedKws = KeywordsMinus(savedKws, inputKws);
			// console.log(addedKws);
			// console.log(removedKws);

			if(option && option.refresh){
				hl_clearall(settings, tabinfo);
				// make a copy to avoid affection from sorting the _hl_search
				_hl_search([...inputKws], settings, tabinfo);
			}else{
				_hl_clear(removedKws, settings, tabinfo);
				_hl_search(addedKws, settings, tabinfo);
			}
          
            tabinfo.keywords = inputKws;
			build_keywords_list(inputKws);
            settings.latest_keywords = inputKws;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings});
        } else if (!inputStr) { // (empty string)
            _hl_clearall(settings, tabinfo)
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
function _hl_search(addedKws, settings, tabinfo) {
	// console.log("addedKws: " + addedKws);

	isWholeWord     = TrueOrFalse(settings.isWholeWord);
	isCasesensitive = TrueOrFalse(settings.isCasesensitive);
	clsPrefix = settings.CSSprefix1 + " " + settings.CSSprefix2 ;

	addedKws.sort((firstElem, secondElem)=>{
		return secondElem.kwStr.length - firstElem.kwStr.length;
	});
	// console.log(addedKws);
	var code = addedKws.map(kw=>{
		var cls = clsPrefix + kw.kwGrp + " " + settings.CSSprefix3+encodeURI(kw.kwStr);
		return "$(document.body).highlight(" + `'${KeywordEscape(kw.kwStr)}', `
			+ `{className: '${cls}', wordsOnly: ${isWholeWord}, caseSensitive: ${isCasesensitive}  ` + "});";
	}).join("\n");
	console.log(code);
	chrome.tabs.executeScript(tabinfo.id, { code: code }, _ => chrome.runtime.lastError);
}


function _hl_clear(removedKws, settings, tabinfo) {
	code = removedKws.flatMap(kw=>{
		// if(kw.length < 1) return "";
		className = (settings.CSSprefix3 + encodeURI(kw.kwStr)).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");
		return "$(document.body).unhighlight({className:'" + className + "'})";
	}).join(";\n");
	// console.log(`removedKws${removedKws.length}:` + removedKws );
	// console.log("REMOVE: " + code);
	chrome.tabs.executeScript(tabinfo.id, {code: code}, _ => chrome.runtime.lastError);
	settings.isNewlineNewColor || (tabinfo.style_nbr -= removedKws.length);
}


function hl_clearall(settings, tabinfo) {
	var code = "$(document.body).unhighlight({className:'" + settings.CSSprefix1 + "'})";
	// console.log("REMOVE: " + code);
    chrome.tabs.executeScript(tabinfo.id,
        {code: code }, _ => chrome.runtime.lastError);
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

// return an array of keword object:
// [{kwGrp: kwGrpNum, kwStr: keywordString}, {kwGrp: ..., kwStr: ...}, ...]
// The kwGrp is defined in two ways, if in the NewColorNewLine mode, the kwGrp
// is the same for keywords on the same line; otherwise, the kwGrp increases
// every keywords
function keywordsFromStr(inputStr, settings){
	if(settings.isNewlineNewColor){
		return inputStr.split(/\n/g).filter(i=>i).reduce((arr, line, lineCnt)=>{
			arr = arr.concat(line.split(settings.delim).filter(i=>i).map(kws=>{
				return {kwGrp: (lineCnt % 20), kwStr: kws};
			}));
			console.log(arr);
			return arr;
		}, []);
	}else{
		return inputStr.split(settings.delim).filter(i=>i).map((kws,cnt)=>{
			return {kwGrp: (cnt % 20), kwStr: kws};
		});
	}
}
function KeywordsMinus(kwListA, kwListB){
	function KwListContain(kwList, kwA){
		for(const kw of kwList)	{
			if(kw.kwStr === kwA.kwStr && kw.kwGrp === kwA.kwGrp ){
				return true;
			}
		}
		return false;
	}
	// console.log(kwListA.map(x=>KwListContain(kwListB, x)));
	return kwListA.filter(x=>!KwListContain(kwListB, x));

}
function build_keywords_list(inputKws){
	var html = inputKws.map(kw=>`<span class="keywords">${kw.kwStr}</span>`).join("");
	$('#kw-list>.keywords').remove();
	$(html).appendTo($('#kw-list'));
	check_keywords_existence();
}


function handle_option_change(tabkey, event) { // tabkey of popup window
	chrome.storage.local.get(['settings'], function (result) {
		var settings = result.settings;

		var forceRefresh = (settings.isWholeWord != wholeWord.checked)
			|| (settings.isCasesensitive != casesensitive.checked)
			|| (settings.isNewlineNewColor != newlineNewColor.checked)
			|| event.currentTarget === toggleMHL;
		// update settings
		settings.isOn              = toggleMHL.checked;
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


chrome.runtime.onMessage.addListener(function(request, sender) {
	if (request.action == "getVisibleText") {
		visibleText = request.source;
		chrome.storage.local.get(['settings'], function (result) {
			var settings = result.settings;
			document.querySelectorAll('#kw-list>.keywords').forEach(elem=>{
				var pattern = settings.isWholeWord
					? '\\b(' + elem.innerText + ')\\b'
					: '(' + elem.innerText + ')';
				visibleText.match(new RegExp(pattern, settings.isCasesensitive ? '': 'i'))
					?  elem.classList.remove("notAvailable")
					: elem.classList.add("notAvailable");
			});
		});
	}
});