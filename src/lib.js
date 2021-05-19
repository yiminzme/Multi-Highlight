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

// ****** Multi Highlight functions
function hl_search(addedKws, settings, tabinfo) {
    for (var i = 0; i < addedKws.length; i++) {
        if (settings.isNewlineNewColor && addedKws[i] == "\n"){ // if isNewLineNewColor mode on and addedKws[i] is newline
            tabinfo.style_nbr += 1;
            continue;
        }
        
        chrome.tabs.executeScript(tabinfo.id,
            {
                code: "$(document.body).highlight('" + addedKws[i]
                    + "', {className:'"
                    + settings.CSSprefix1 + " "
                    + (settings.CSSprefix2 + (tabinfo.style_nbr % settings.CSS_COLORS_COUNT)) + " "
                    + (settings.CSSprefix3 + encodeURI(addedKws[i])) // escape special characters
                    // + (settings.CSSprefix3 + makeSafeForCSS(addedKws[i])) // escape special characters
                    + "'})"
            }, _ => chrome.runtime.lastError);
        if (!settings.isNewlineNewColor){
            tabinfo.style_nbr += 1;
        }
    }
}


function hl_clear(removedKws, settings, tabinfo) {
    // remove in reverse order to avoid removing nested-highlighted-words
    for (var i = removedKws.length - 1; i >= 0; i--) {
        if (settings.isNewlineNewColor && removedKws[i] == "\n"){ // if isNewLineNewColor mode on and removedKws[i] is newline
            tabinfo.style_nbr -= 1;
            continue;
        }

        // escape meta-characters, special characters
        className = (settings.CSSprefix3 + encodeURI(removedKws[i])).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");
        // className = (settings.CSSprefix3 + makeSafeForCSS(removedKws[i]));
        chrome.tabs.executeScript(tabinfo.id,
            {code: "$(document.body).unhighlight({className:'" + className + "'})"}, _ => chrome.runtime.lastError);
        if (!settings.isNewlineNewColor){
            tabinfo.style_nbr -= 1;    
        }
        
    }
}


function hl_clearall(settings, tabinfo) {
    chrome.tabs.executeScript(tabinfo.id,
        {code: "$(document.body).unhighlight({className:'" + settings.CSSprefix1 + "'})"}, _ => chrome.runtime.lastError);
}


function handle_highlightWords_change(tabkey, callback=null) {
    inputStr = highlightWords.value.toLowerCase();

    chrome.storage.local.get(['settings', tabkey], function (result) {
        var settings = result.settings;
        var tabinfo = result[tabkey];

        // (instant search mode) or (last char of input is delimiter)
        if (settings.isInstant || inputStr.slice(-1) == settings.delim) {
            if (settings.isNewlineNewColor){
                var inputKws = []
                inputLines = inputStr.split(/(\n)/g); // split by newline, but keep newlines
                for (var i=0; i < inputLines.length; i++){
                    inputKws = inputKws.concat(inputLines[i].split(settings.delim).filter(i => i)); // split inputline by deliminator; filter() removes empty array elms
                }
                addedKws = $(inputKws).not($(tabinfo.keywords).not(["\n"]).get()).get(); // get tokens only occur in new input
                removedKws = $(tabinfo.keywords).not($(inputKws).not(["\n"]).get()).get(); // get tokens only occur in old input
            }else{
                inputKws = inputStr.split(settings.delim).filter(i => i); // filter() removes empty array elms
                addedKws = $(inputKws).not(tabinfo.keywords).get(); // get tokens only occur in new input
                removedKws = $(tabinfo.keywords).not(inputKws).get(); // get tokens only occur in old input
            }
            hl_clear(removedKws, settings, tabinfo);
            hl_search(addedKws, settings, tabinfo);
            tabinfo.keywords = inputKws;
            settings.latest_keywords = inputKws;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings});
        } else if (!inputStr) { // (empty string)
            hl_clearall(settings, tabinfo)
            tabinfo.keywords = [];
            settings.latest_keywords = "";
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings});
        }

        if (callback){
            callback();
        }
    });
}


function handle_delimiter_change(tabkey) { // tabkey of popup window
        chrome.storage.local.get(['settings'], function (result) {
        var settings = result.settings;
        settings.delim = delimiter.value;
        chrome.storage.local.set({'settings': settings}, function () {
            if (tabkey) {
                // reset keywords
                highlightWords.value = "";
                handle_highlightWords_change(tabkey);
            }
        });
    });
}


function handle_instant_mode_change(tabkey) { // tabkey of popup window
    chrome.storage.local.get(['settings'], function (result) {
        var settings = result.settings;
        settings.isInstant = $('#instant').is(':checked');
        chrome.storage.local.set({'settings': settings});
    });
}


function handle_saveWords_mode_change(tabkey) { // tabkey of popup window
    chrome.storage.local.get(['settings'], function (result) {
        var settings = result.settings;
        settings.isSaveKws = $('#saveWords').is(':checked');
        if (settings.isSaveKws){
            $('#alwaysSearch').removeAttr('disabled'); // enable input
        }else{
            $('#alwaysSearch').prop("checked", false); // uncheck alwaysSearch
            settings.isAlwaysSearch = false; // set alwaysSearch to false
            $('#alwaysSearch').attr('disabled', true); // disable alwaysSearch checkbox
        }
        chrome.storage.local.set({'settings': settings});
    });
}


function handle_alwaysSearch_mode_change(tabkey) {
    chrome.storage.local.get(['settings'], function (result) {
        var settings = result.settings;
        settings.isAlwaysSearch = $('#alwaysSearch').is(':checked');
        chrome.storage.local.set({'settings': settings});
    });
}


function handle_newlineNewColor_mode_change(tabkey) {
    chrome.storage.local.get(['settings'], function (result) {
        var settings = result.settings;
        if (tabkey) {
            // reset keywords
            highlightWords.value = "";
            handle_highlightWords_change(tabkey, function() {
                settings.isNewlineNewColor = $('#newlineNewColor').is(':checked');
                chrome.storage.local.set({'settings': settings});
            });
        }
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