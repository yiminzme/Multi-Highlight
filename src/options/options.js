// ************************************************************************
// Multi Highlight options js
// ************************************************************************

document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.local.get(['settings'], function (result) {
        // init
        var settings = result.settings;
        // set html
        delimiter.value = settings.delim;
        instant.checked = settings.isInstant;
        saveWords.checked = settings.isSaveKws;
        popupHeight.value = settings.popup_height;
        popupWidth.value = settings.popup_width;
        addKw.checked = settings.enableAddKw;
        removeKw.checked = settings.enableRemoveKw;

        // register listener
        $("#delimiter").on("input", function () {
            handle_delimiter_change(null, settings);
        })
        $("#instant").on("input", function () {
            handle_instant_mode_change(settings);
        })
        $("#saveWords").on("input", function () {
            handle_saveWords_mode_change(settings);
        })
        $("#popupHeight").on("input", function () {
            console.log("height" + $(this)[0].value);
            handle_popupSize_change($(this)[0].value, null);
        })
        $("#popupWidth").on("input", function () {
            console.log("width" + $(this)[0].value);
            handle_popupSize_change( null, $(this)[0].value);
        })
        $("#addKw").on("input", function () {
            console.log($(this)[0].checked);
            handle_addKw_change($(this)[0].checked);
        })
        $("#removeKw").on("input", function () {
            console.log($(this)[0].checked);
            handle_removeKw_change($(this)[0].checked);
        })
    });
});


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
