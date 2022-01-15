chrome.runtime.onInstalled.addListener(function (details) {
    // initialize variables
    var settings = {
        // Pop-up window settings
        popup_width: 400,
        popup_height: 100,

        // CSS settings
        CSS_COLORS_COUNT: 20, // number of available highlight colors
        CSSprefix1: "chrome-extension-FindManyStrings",
        CSSprefix2: "chrome-extension-FindManyStrings-style-",
        CSSprefix3: "CE-FMS-",

        // search settings
        isInstant: true,
        isSaveKws: false,
        isAlwaysSearch: false,
        isNewlineNewColor: false,
        delim: ' ',
        latest_keywords: [],

        // context menu settings
        enableAddKw: true,
        enableRemoveKw: true
    }

    // add context menu item
    chrome.contextMenus.create({
        title: 'Remove Keyword',
        id: 'removeKw', // you'll use this in the handler function to identify this context menu item
        contexts: ['selection'],
    });
    chrome.contextMenus.create({
        title: 'Add Keyword',
        id: 'addKw', // you'll use this in the handler function to identify this context menu item
        contexts: ['selection'],
    });

    chrome.storage.local.set({'settings': settings});
});

// handle new page opened
chrome.tabs.onUpdated.addListener(function (tabId, info) {
    if (info.status === 'complete') {
        var tabkey = get_tabkey(tabId);
        var tabinfo = {};
        tabinfo.id = tabId;
        tabinfo.style_nbr = 0;
        tabinfo.isNewPage = true;
        tabinfo.keywords = [];
        chrome.storage.local.set({[tabkey]: tabinfo});

        chrome.storage.local.get(['settings'], function (result) {
            // init
            var settings = result.settings;

            // if "always search" mode is on, search all keywords immediately
            if (settings.isAlwaysSearch){
                hl_search(settings.latest_keywords, settings, tabinfo);
            }
        });
    }
});


// handle context menu item
chrome.contextMenus.onClicked.addListener(function getword(info, tab) {
    var tabkey = get_tabkey(tab.id);
    var kw = info.selectionText.toLowerCase().split(' ')[0];

    if (info.menuItemId === "removeKw") {
        chrome.storage.local.get(["settings", tabkey], function (result) {
            // init
            var settings = result.settings;
            var tabinfo = result[tabkey];
            var kws = tabinfo.keywords;

            var pos = -1;
            for(var i = 0, len = kws.length; i < len; ++i){
                if(kws[i].kwStr === kw){
                    pos = i;
                    break;
                }
            }
            if(pos < 0) return;
            hl_clear([kws[pos]], settings, tabinfo);
            tabinfo.keywords.splice(pos, 1);
            settings.latest_keywords = tabinfo.keywords;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
            });
        });
    } else if (info.menuItemId === "addKw") {
        chrome.storage.local.get(["settings", tabkey], function (result) {
            settings = result.settings;
            tabinfo = result[tabkey];

            if(settings.isNewlineNewColor){
                addedKw = {kwGrp: 0 , kwStr: kw};
                tabinfo.keywords.unshift(addedKw);
            }else{
                addedKw = {kwGrp:  (tabinfo.keywords.length % 20), kwStr: kw};
                tabinfo.keywords.push(addedKw);
            }
            hl_search([addedKw], settings, tabinfo);

            settings.latest_keywords = tabinfo.keywords;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
            });
        });
    }

});
