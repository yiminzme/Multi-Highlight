// debugger;
chrome.runtime.onInstalled.addListener(function (details) {

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL){

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
            delim: ',',
            isAlwaysSearch: true,
            isOn: true,
            isCasesensitive: false,
            isInstant: true,
            isNewlineNewColor: false,
            isSaveKws: true,
            isWholeWord: false,
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

    }
});

// handle new page loaded
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {

    console.log(changeInfo)
    // if (changeInfo.status === 'complete') {
    if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {

        chrome.storage.local.get(['settings'], function(result){
            var settings = result.settings;
            var tabkey = get_tabkey(tabId);
            console.log(tabkey);
            var tabinfo = {};
            tabinfo.id = tabId;
            tabinfo.style_nbr = 0;
            tabinfo.keywords = settings.isSaveKws ? settings.latest_keywords : [];
            chrome.storage.local.set({[tabkey]: tabinfo});
        });

        // settings.isSaveKws
        // var tabkey = get_tabkey(tabId);
        // var tabinfo = {};
        // tabinfo.id = tabId;
        // tabinfo.style_nbr = 0;
        // // tabinfo.isNewPage = true;
        // tabinfo.keywords = [];
        // chrome.storage.local.set({[tabkey]: tabinfo}, function(){ // update storage.local in time for usage, e.g. tabinfo.isNewPage
        //     chrome.storage.local.get(['settings'], function (result) {
        //         // init
        //         var settings = result.settings;

        //         // if isOn and "always search" mode are true, search all keywords immediately
        //         if (settings.isAlwaysSearch && settings.isOn){
        //             chrome.tabs.sendMessage(tabId, {
		// 				action: "_hl_search",
		// 				addedKws: settings.latest_keywords,
		// 			});
        //             // _hl_search(settings.latest_keywords, settings, tabinfo);
        //             chrome.storage.local.set({[tabkey]: tabinfo}); // since tabinfo.style_nbr is updated, update storage.local
        //         }
        //     });
        // }); 
        

    }

});


// handle context menu item
chrome.contextMenus.onClicked.addListener(function getword(info, tab) {
    var tabId = tab.id;
    var tabkey = get_tabkey(tabId);
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
            chrome.tabs.sendMessage(tabId, {
                action: "_hl_clear",
                removedKws: [kws[pos]],
            });
            settings.isNewlineNewColor || (tabinfo.style_nbr -= removedKws.length); // !! always keep this after _hl_clear function !!
            // _hl_clear([kws[pos]], settings, tabinfo);
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
            chrome.tabs.sendMessage(tabId, {
                action: "_hl_search",
                addedKws: [addedKws],
            });
            // _hl_search([addedKw], settings, tabinfo);

            settings.latest_keywords = tabinfo.keywords;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
            });
        });
    }

});


// handle message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getTabId"){
        sendResponse({tabId: sender.tab.id});
    }
});