chrome.runtime.onInstalled.addListener(function(details){
	// initialize variables
	var settings = {
		isInstant: true,
		isPasteKws: true,
		delim: ' ',
		latest_keywords: [],

		// context menu items
		isItemAddKw: true,
		isItemRemoveKw: true,

		max_style_nbr: 6, // number of available highlight colors
		sCSS1: "chrome-extension-FindManyStrings",
		sCSS2: "chrome-extension-FindManyStrings-style-",
		sCSS3: "CE-FMS-"
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

	chrome.storage.local.set( {'settings':settings} );
});

// handle new page opened
chrome.tabs.onUpdated.addListener(function (tabId , info) {
	if (info.status === 'complete') {
		var tabkey = get_tabkey(tabId);
		var tabinfo = {};
		tabinfo.id = tabId;
		tabinfo.style_nbr = 0;
		tabinfo.isNewPage = true;
		tabinfo.keywords = [];
		chrome.storage.local.set({ [tabkey]:tabinfo });
  }
});

// handle context menu item
chrome.contextMenus.onClicked.addListener(function getword(info,tab) {
	var tabkey = get_tabkey(tab.id);
	var kw = info.selectionText.toLowerCase().split(' ')[0];

	if (info.menuItemId === "removeKw"){
		chrome.storage.local.get( ["settings", tabkey], function(result){
			// init
			settings = result.settings;
		    tabinfo = result[tabkey];
		    // check existence
		    var index = tabinfo.keywords.indexOf(kw);
			if (index !== -1){
				length = tabinfo.keywords.length
				// check if any keywords is a substring of kw
				while (length--){ 
					if (kw.indexOf(tabinfo.keywords[length])!=-1 && length!=index) {
						return;
					}
				}
				tabinfo.keywords.splice(index, 1);
			}
		  	settings.latest_keywords = tabinfo.keywords;
	    	hl_clear([kw], settings, tabinfo);
		    chrome.storage.local.set({ [tabkey]:tabinfo, "settings":settings }, function(){
			});
		});
	}else if (info.menuItemId === "addKw"){
		chrome.storage.local.get( ["settings", tabkey], function(result){
			// init
			settings = result.settings;
		    tabinfo = result[tabkey];
			tabinfo.keywords.push(kw);
		  	settings.latest_keywords = tabinfo.keywords;
	    	hl_search([kw], settings, tabinfo);
		    chrome.storage.local.set({ [tabkey]:tabinfo, "settings":settings }, function(){
			});
		});
	}

});
