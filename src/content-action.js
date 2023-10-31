// debugger;

var tabId = null;
var tabkey = null;

chrome.runtime.sendMessage(
    {
        action: "getTabId",
    },
    function (response) {
        // new page initialization
        tabId = response.tabId;
        tabkey = get_tabkey(tabId);


        // https://t.ly/R-Dq
        var MutationObserver =
            window.MutationObserver || window.WebKitMutationObserver;
        var MutationObserverConfig = {
            childList: true,
            subtree: true,
            characterData: true,
        };
        var observer = new MutationObserver(function (mutations) {
            chrome.storage.local.get(["settings", tabkey], function (result) {
                var settings = result.settings;
                var tabinfo = result[tabkey];

                if (settings.isOn && settings.isAlwaysSearch) { // refresh if extension is on
                    // console.log("[Multi-Highlight] MutationObserver")
                    hl_refresh(tabinfo.keywords, settings, tabinfo);
                }
            });
        });
        observer.observe(document.body, MutationObserverConfig);

        chrome.runtime.onMessage.addListener(function (
            request,
            sender,
            sendResponse
        ) {
            if (request.action == "hl_clearall") {
                chrome.storage.local.get(["settings", tabkey], function (result) {
                    var settings = result.settings;
                    var tabinfo = result[tabkey];
                    hl_clearall(settings, tabinfo);
                });
                sendResponse({action: "null"});
            } else if (request.action == "hl_refresh") {
                chrome.storage.local.get(["settings", tabkey], function (result) {
                    var settings = result.settings;
                    var tabinfo = result[tabkey];
                    hl_refresh(request.inputKws, settings, tabinfo);
                });
                sendResponse({action: "null"});
            } else if (request.action == "hl_refresh_existing") {
                chrome.storage.local.get(["settings", tabkey], function (result) {
                    // console.log("[Multi-Highlight] hl_refresh_existing");
                    var settings = result.settings;
                    var tabinfo = result[tabkey];
                    hl_refresh(tabinfo.keywords, settings, tabinfo);
                });
                sendResponse({action: "null"});
            } else if (request.action == "_hl_search") {
                chrome.storage.local.get(["settings", tabkey], function (result) {
                    var settings = result.settings;
                    var tabinfo = result[tabkey];
                    _hl_search(request.addedKws, settings, tabinfo);
                });
                sendResponse({action: "null"});
            } else if (request.action == "_hl_clear") {
                chrome.storage.local.get(["settings", tabkey], function (result) {
                    var settings = result.settings;
                    var tabinfo = result[tabkey];
                    _hl_clear(request.removedKws, settings, tabinfo);
                });
                sendResponse({action: "null"});
            }
        });

        function hl_refresh(Kws, settings, tabinfo) { // remove all highlights, and rehighlight input Kws
            // // log all entries in kws
            // Object.entries(Kws).forEach(([key, value]) => {
            // 	console.log(`hl_refresh: [${key}, ${value.kwGrp}, ${value.kwStr}]`);
            // });
            hl_clearall(settings, tabinfo);
            _hl_search(Kws, settings, tabinfo);
        }

        function _hl_search(addedKws, settings, tabinfo) {
            // Return if URL blacklisted
            if (isBlacklisted(settings)) return;

            isWholeWord = settings.isWholeWord;
            isCasesensitive = settings.isCasesensitive;
            clsPrefix = settings.CSSprefix1 + " " + settings.CSSprefix2;

            addedKws.sort((firstElem, secondElem) => {
                return secondElem.kwStr.length - firstElem.kwStr.length;
            });
            // log all entries in addedKws
            Object.entries(addedKws).forEach(([key, value]) => {
                // console.log(`_hl_search: [${key}, ${value.kwGrp}, ${value.kwStr}]`);
            });

            function KeywordEscape(kw) {
                return kw.replace(/\n/sgi, '\\n');
            }

            // var code = addedKws
            // 	.map((kw) => {
            // 		var cls =
            // 			clsPrefix +
            // 			kw.kwGrp +
            // 			" " +
            // 			settings.CSSprefix3 +
            // 			encodeURI(kw.kwStr);
            // 		return (
            // 			"$(document.body).highlight(" +
            // 			`'${KeywordEscape(kw.kwStr)}', ` +
            // 			`{className: '${cls}', wordsOnly: ${isWholeWord}, caseSensitive: ${isCasesensitive}, element: '${settings.element}'  ` +
            // 			"});"
            // 		);
            // 	})
            // 	.join("\n");
            // console.log(code);
            observer.disconnect();
            for (var i = 0; i < addedKws.length; i++) {
                kw = addedKws[i];
                var hl_param1 = KeywordEscape(kw.kwStr);
                var hl_param2 = clsPrefix + kw.kwGrp + " " + settings.CSSprefix3 + encodeURI(kw.kwStr);
                var hl_param2 = {
                    className: hl_param2,
                    wordsOnly: isWholeWord,
                    caseSensitive: isCasesensitive,
                    element: settings.element
                }
                // console.log("[Multi-Highlight] _hl_search: " + hl_param1 + " " + hl_param2)
                $(document.body).highlight(hl_param1, hl_param2);
            }
            observer.observe(document.body, MutationObserverConfig);
        }

        function _hl_clear(removedKws, settings, tabinfo) {
            // code = removedKws
            // 	.flatMap((kw) => {
            // 		// if(kw.length < 1) return "";
            // 		className = (settings.CSSprefix3 + encodeURI(kw.kwStr)).replace(
            // 			/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g,
            // 			"\\\\$&"
            // 		);
            // 		return (
            // 			`$(document.body).unhighlight({className:'${className}', element: '${settings.element}'})`
            // 		);
            // 	})
            // 	.join(";\n");
            // console.log(`[Multi-Highlight] _hl_clear: ${removedKws.length}` + removedKws );
            // console.log("[Multi-Highlight] REMOVE: " + code);
            observer.disconnect();
            removedKws_flatten = removedKws.flat();
            for (var i = 0; i < removedKws_flatten.length; i++) {
                kw = removedKws_flatten[i];
                className = (settings.CSSprefix3 + encodeURI(kw.kwStr)).replace(
                    /[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g,
                    "\\$&"
                );
                // log all entries in removedKws
                Object.entries(removedKws).forEach(([key, value]) => {
                    // console.log(`_hl_clear: [${key}, ${value.kwGrp}, ${value.kwStr}]`);
                });
                // console.log("[Multi-Highlight] _hl_clear: " + className + " " + settings.element);
                $(document.body).unhighlight({className: className, element: settings.element});
            }
            observer.observe(document.body, MutationObserverConfig);
        }

        function hl_clearall(settings, tabinfo) {
            // var code =
            // 	"$(document.body).unhighlight({className:'" +
            // 	settings.CSSprefix1 +
            // 	`', element: '${settings.element}'})`;
            // console.log("hl_clearall");
            observer.disconnect();
            $(document.body).unhighlight({className: settings.CSSprefix1, element: settings.element});
            observer.observe(document.body, MutationObserverConfig);
        }
    }
);


// convertion between tabkey and tabId
function get_tabkey(tabId) {
    return "multi-highlight_" + tabId;
}

function get_tabId(tabkey) {
    return parseInt(tabkey.substring(16))
}

/**
 * Checks whether the current pathname
 * @param settings
 * @returns {boolean}
 */
function isBlacklisted(settings) {
    if (!settings.blacklist || settings.blacklist?.length <= 0) return false;

    let currentUrl = window.location.host;
    return settings.blacklist.some(blacklistedUrl => {
        return currentUrl.toLowerCase().includes(blacklistedUrl.toLowerCase());
    });
}