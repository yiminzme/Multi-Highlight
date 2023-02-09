// debugger;
chrome.runtime.onInstalled.addListener(function (details) { // when first installed, extension updated, browser updated

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
            element: 'mh',
    
            // context menu settings
            enableAddKw: true,
            enableRemoveKw: true
        }
    
        // add context menu item
        chrome.contextMenus.create({
            title: 'Add Keyword',
            id: 'addKw', // you'll use this in the handler function to identify this context menu item
            contexts: ['selection'],
        });
        chrome.contextMenus.create({
            title: 'Remove Keyword',
            id: 'removeKw', // you'll use this in the handler function to identify this context menu item
            contexts: ['selection'],
        });
    
        chrome.storage.local.set({'settings': settings});

    }else{

        chrome.storage.local.get(['settings'], function(result){
            var settings = result.settings;

            handle_addKw_change(settings.enableAddKw);
            handle_removeKw_change(settings.enableRemoveKw);
            handle_popupSize_change(settings.popup_height, settings.popup_width);
        });
    }

});

// handle new page loaded
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {

    // if (changeInfo.status === 'complete') {
    if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {

        chrome.storage.local.get(['settings'], function(result){
            var settings = result.settings;
            var tabkey = get_tabkey(tabId);
            tabinfo = init_tabinfo(tabId, settings);
            chrome.storage.local.set({[tabkey]: tabinfo});
        });

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
            for(var i = 0, len = kws.length; i < len; ++i){ // if selected kw isn't in saved list, set pos=-1
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
            // settings.isNewlineNewColor || (tabinfo.style_nbr -= [kws[pos]].length); // !! always keep this after _hl_clear function !!
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
                addedKws: [addedKw],
            });
            // _hl_search([addedKw], settings, tabinfo);

            settings.latest_keywords = tabinfo.keywords;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
            });
        });
    }

});


function handle_addKw_change(enableIt) { // option page
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


function handle_removeKw_change(enableIt) { // option page
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


function handle_popupSize_change(newHeight, newWidth) { // option page
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


// handle message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getTabId"){
        sendResponse({tabId: sender.tab.id});
    } else if(request.action == "handle_addKw_change"){
        handle_addKw_change(request.enableIt);
    } else if(request.action == "handle_removeKw_change"){
        handle_removeKw_change(request.enableIt);
    } else if(request.action == "handle_popupSize_change"){
        handle_popupSize_change(request.newHeight, request.newWidth);
    }
});
