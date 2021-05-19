// ************************************************************************
// Multi Highlight popup js
// ************************************************************************

// debugger;
function reconstruct_isNewLineNewColor_mode(kws, delim){
    var result = [];
    for (var i = 0; i < kws.length; i++){
        result.push(kws[i], delim);
    }
    newline_indices = [];
    for (var i = 0; i < result.length; i++){
        if (result[i] === '\n'){
            newline_indices.push(i);
        }
    }
    for (var i = newline_indices.length-1; i >= 0; i--){
        result.splice(newline_indices[i] + 1, 1);
        result.splice(newline_indices[i] - 1, 1);
    }
    if (result[-2] === '\n' && result[-1] === delim){ // if the last two kws are newline and deliminator, remove deliminator
        result.splice(-1, 1);
    }
    return result.join("");
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var currTab = tabs[0];
        if (currTab) { // Sanity check
            var tabkey = get_tabkey(currTab.id);
            chrome.storage.local.get(['settings', tabkey], function (result) {
                // fetch general settings
                var settings = result.settings;
                var tabinfo = result[tabkey];
                var flag = {"is_change": false};
                // init popup interface
                container.style.width = settings.popup_width + "px";
                highlightWords.style.minHeight = settings.popup_height + "px";
                // init popup values
                delimiter.value = settings.delim;
                instant.checked = settings.isInstant;
                alwaysSearch.checked = settings.isAlwaysSearch;
                newlineNewColor.checked = settings.isNewlineNewColor;
                saveWords.checked = settings.isSaveKws;
                // reconstruct highlightWords values
                flag.is_change = settings.isSaveKws && tabinfo.isNewPage;
                kws = flag.is_change ? settings.latest_keywords : tabinfo.keywords;
                if (settings.isNewlineNewColor){
                    highlightWords.value = reconstruct_isNewLineNewColor_mode(kws, settings.delim);
                }else{
                    highlightWords.value = kws.join(settings.delim);
                    // append deliminator if there are words
                    highlightWords.value += highlightWords.value ? settings.delim : "";
                }
                tabinfo.isNewPage = false;
                chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
                    if (flag.is_change) {
                        handle_highlightWords_change(tabkey);
                    }
                });
                // register listener
                $("#delimiter").on("input", function () {
                    handle_delimiter_change(tabkey);
                })
                $("#highlightWords").on("input", function () {
                    handle_highlightWords_change(tabkey);
                })
                $("#instant").on("input", function () {
                    handle_instant_mode_change(tabkey);
                })
                $("#saveWords").on("input", function () {
                    handle_saveWords_mode_change(tabkey);
                })
                $("#alwaysSearch").on("input", function () {
                    handle_alwaysSearch_mode_change(tabkey);
                })
                $("#newlineNewColor").on("input", function () {
                    handle_newlineNewColor_mode_change(tabkey);
                })
                $("#options_icon").click(function(){
                    console.log("asdf");
                    chrome.runtime.openOptionsPage();
                })
            });
        }
    });
});