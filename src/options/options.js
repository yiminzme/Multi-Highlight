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
        addKw.checked = settings.isItemAddKw;
        removeKw.checked = settings.isItemRemoveKw;

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