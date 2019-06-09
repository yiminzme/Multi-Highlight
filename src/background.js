chrome.runtime.onInstalled.addListener(function(details){
	var settings = {
		isInstant: true,
		isPasteKws: true,
		delim: ' ',
		last_keywords: [],

		max_style_nbr: 6, // number of available highlight colors
		sCSS1: "chrome-extension-FindManyStrings",
		sCSS2: "chrome-extension-FindManyStrings-style-",
		sCSS3: "CE-FMS-"
	}
	chrome.storage.local.set( {'settings':settings} );
});

chrome.tabs.onUpdated.addListener(function (tabId , info) {
	if (info.status === 'complete') {
		var tabkey = "multi-highlight_"+tabId;
		var tabinfo = {};
		tabinfo.tabkey = tabkey;
		tabinfo.style_nbr = 0;
		tabinfo.isNewPage = true;
		tabinfo.keywords = [];
		chrome.storage.local.set({ [tabkey]:tabinfo });
  }
});