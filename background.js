var C = {
	NHL : 6, // number of available highlight styles
	sCSS1 : "chrome-extension-FindManyStrings", // fixed CSS class name 1
	sCSS2 : "chrome-extension-FindManyStrings-style-", // fixed CSS class name 2
	sCSS3 : "CE-FMS-" //fixed CSS class name 3
};


chrome.storage.local.set({'C':C, "styleI":0}, function(){
	// console.log("initialized variabes");
});

chrome.tabs.onUpdated.addListener(function (tabId , info) {
  if (info.status === 'complete') {
  	tksID = "tabs_"+tabId+"_tks";
    chrome.storage.local.set({[tksID]:[]});
  }
});