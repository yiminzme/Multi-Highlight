// ************************************************************************
// Multi Highlight popup js
// ************************************************************************
defaultSettings = {
	delim: " ",
	isAlwaysSearch: false,
	isCasesensitive: true,
	isInstant: true,
	isNewlineNewColor: false,
	isSaveKws: false,
	isWholeWord: false,
	latest_keywords: [],
	popup_height: 100,
	popup_width: 400
};

document.addEventListener('DOMContentLoaded', function () {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		var currTab = tabs[0];
		if (currTab) { // Sanity check
			var tabkey = get_tabkey(currTab.id);
			chrome.storage.local.get(['settings', tabkey], function (result) {
				// fetch general settings
				var settings = Object.assign(defaultSettings, result.settings);
				var tabinfo = result[tabkey];
				var flag = {
					"reconstruct_str": false, // indicate whether we should use saved word list
					"skip_highlight": false, // if true, saved words should have been highlighted since page loaded, but not stored in tabinfo.
					"force_refresh": false, // whether to re-highlighting
				};
				// init popup interface
				container.style.width = settings.popup_width + "px";
				highlightWords.style.minHeight = settings.popup_height + "px";
				// init popup values
				delimiter.value         = settings.delim;
				instant.checked         = settings.isInstant;
				alwaysSearch.checked    = settings.isAlwaysSearch;
				newlineNewColor.checked = settings.isNewlineNewColor;
				casesensitive.checked   = settings.isCasesensitive;
				wholeWord.checked       = settings.isWholeWord;
				saveWords.checked       = settings.isSaveKws;

				flag.reconstruct_str 	= tabinfo.isNewPage && settings.isSaveKws;
				flag.skip_highlight		= tabinfo.isNewPage && settings.isSaveKws && settings.isAlwaysSearch;
				flag.force_refresh		= tabinfo.isNewPage && (!settings.isAlwaysSearch);
				// reconstruct highlightWords values if in "Save Kws" mode and is a new page
				kws = flag.reconstruct_str ? settings.latest_keywords : tabinfo.keywords;
				tabinfo.keywords = flag.skip_highlight ? kws : tabinfo.keywords; // if true, saved words have been highlighted but not stored, so store it
				if(kws.length && (kws[0] instanceof Array)){
					highlightWords.value = kws.map(line=>line.join(settings.delim)).join("\n");
				}else{
					highlightWords.value = kws.join(settings.delim);
					// append deliminator if there are words
					highlightWords.value += highlightWords.value ? settings.delim : "";
				}

				tabinfo.isNewPage = false;
				chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
					handle_highlightWords_change(tabkey, {refresh: flag.force_refresh, skipHighlight: flag.skip_highlight});
				});
				// register listener
				$("#highlightWords").on("input", function () {
					handle_highlightWords_change(tabkey);
				})
				$("#kw-list").on("click", function (event) {
					handle_keyword_removal(event, tabkey);
				})
				$("#casesensitive, #wholeWord, #delimiter, #instant," 
					+ " #saveWords,#alwaysSearch,#newlineNewColor").on("input", function () {
					handle_option_change(tabkey);
				})
				$("#options_icon").click(function(){
					chrome.runtime.openOptionsPage();
				})
			});
		}
	});
	check_keywords_existence();
});

chrome.runtime.onMessage.addListener(function(request, sender) {
	if (request.action == "getVisibleText") {
		visibleText = request.source;
		chrome.storage.local.get(['settings'], function (result) {
			var settings = result.settings;
			isCasesensitive = settings.isCasesensitive;
			visibleText = isCasesensitive ? visibleText : visibleText.toLowerCase();
			lastVisibleText = visibleText;
			document.querySelectorAll('#kw-list>.keywords').forEach(elem=>{
				if(-1 === visibleText.indexOf(isCasesensitive ? elem.innerText : elem.innerText.toLowerCase())){
					elem.classList.add("notAvailable");
				}else{
					elem.classList.remove("notAvailable");
				}
			});
		});
	}
});
