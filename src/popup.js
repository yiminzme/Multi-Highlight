// ************************************************************************
// Multi Highlight popup js
// ************************************************************************
defaultSettings = {
	delim: ",",
	isAlwaysSearch: false,
	isOn: true,
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
				toggleMHL.checked       = settings.isOn;
				alwaysSearch.checked    = settings.isAlwaysSearch;
				newlineNewColor.checked = settings.isNewlineNewColor;
				casesensitive.checked   = settings.isCasesensitive;
				wholeWord.checked       = settings.isWholeWord;
				saveWords.checked       = settings.isSaveKws;
				// reconstruct highlightWords values
				flag.is_change = settings.isSaveKws && tabinfo.isNewPage;
				kws = flag.is_change ? settings.latest_keywords : tabinfo.keywords;
				if(settings.isNewlineNewColor){
					// highlightWords.value = kws.map(line=>line.join(settings.delim)).join("\n");
					// add newline character to where the kwGrp changes, otherwise, add delimeter
					var res = "";
					for(var i = 0, len = kws.length - 1; i < len; ++ i){
						res += kws[i].kwStr + ((kws[i].kwGrp != kws[i+1].kwGrp) ? "\n": settings.delim);
					}
					// and the last one
					kws.length && (res += kws[kws.length-1].kwStr);
					console.log(res);
					highlightWords.value = res;
				}else{
					highlightWords.value = kws.map(kw=>kw.kwStr).join(settings.delim);
					// append deliminator if there are words
					highlightWords.value += highlightWords.value ? settings.delim : "";
				}

				tabinfo.isNewPage = false;
				chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
					handle_highlightWords_change(tabkey, {refresh: flag.force_refresh, skipHighlight: flag.skip_highlight});
				});
				build_keywords_list(kws);
				// register listener
				$("#highlightWords").on("input", function () {
					handle_highlightWords_change(tabkey);
				})
				$("#kw-list").on("click", function (event) {
					handle_keyword_removal(event, tabkey);
				})
				$("#toggleMHL,#casesensitive, #wholeWord, #delimiter, #instant,"
					+ " #saveWords,#alwaysSearch,#newlineNewColor").on("input", function(event) {
					handle_option_change(tabkey, event);
				});
				$('#forceRefresh').on("click", function(){
					handle_highlightWords_change(tabkey, {refresh: true});
				})
				$("#options_icon").click(function(){
					chrome.runtime.openOptionsPage();
				})
			});
		}
	});
	check_keywords_existence();
});
