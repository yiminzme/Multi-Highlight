// var C, delim, tks, style_nbr, currTab, tksID, isInstant;
var settings, tabinfo;

function hl_search(addedKws) {
    for (var i=0; i < addedKws.length; i++) {
      tabinfo.style_nbr += 1;
      chrome.tabs.executeScript(null,
      {code:"$(document.body).highlight('"+addedKws[i]
        + "', {className:'"
        + settings.sCSS1 + " "
        + (settings.sCSS2 + (tabinfo.style_nbr % settings.max_style_nbr)) + " "
        + (settings.sCSS3 + encodeURI(addedKws[i])) // escape special characters
        + "'})"
      }, _=>chrome.runtime.lastError);
    }
}


function hl_clear(removedKws) {

  // remove in reverse order to avoid removing nested-highlighted-words
  for (var i = removedKws.length - 1; i >= 0; i--) {
    tabinfo.style_nbr -= 1;
    // escape meta-characters, special characters
    className = (settings.sCSS3+encodeURI(removedKws[i])).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");
    chrome.tabs.executeScript(null,
        {code:"$(document.body).unhighlight({className:'"+className+"'})"}, _=>chrome.runtime.lastError);
  }
}


function hl_clearall() {
  chrome.tabs.executeScript(null,
      {code:"$(document.body).unhighlight({className:'" + settings.sCSS1+"'})"}, _=>chrome.runtime.lastError);
}


function handle_highlightWords_change() {
  inputStr = highlightWords.value;

  // check if (instant search mode) or (last char of input is delimiter) or (empty string)
  if (settings.isInstant || inputStr.slice(-1) == settings.delim || !inputStr){
    newKws = inputStr.split(settings.delim).filter(i => i);
    addedKws = $(newKws).not(tabinfo.keywords).get(); // get tokens only occur in new input
    removedKws = $(tabinfo.keywords).not(newKws).get(); // get tokens only occur in old input
    hl_clear(removedKws);
    hl_search(addedKws);
    tabinfo.keywords = newKws;
    settings.last_keywords = newKws;
    chrome.storage.local.set({ [tabinfo.tabkey]:tabinfo, "settings":settings });
  }
}


function handle_delimiter_change() {
  settings.delim = delimiter.value;
  chrome.storage.local.set({'settings':settings});
  // reset keywords
  highlightWords.value = "";
  handle_highlightWords_change();
}


function handle_instant_mode_change(){
  settings.isInstant = $('#instant').is(':checked');
  chrome.storage.local.set({'settings':settings});
}


function handle_pasteKeywords_mode_change(){
  settings.isPasteKws = $('#pasteKeywords').is(':checked');
  chrome.storage.local.set({'settings':settings});
}


document.addEventListener('DOMContentLoaded', function () {

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currTab = tabs[0];
    if (currTab) { // Sanity check
      var tabkey = "multi-highlight_" + currTab.id;
      chrome.storage.local.get( ['settings', tabkey], function(result){
        // store
        settings = result.settings;
        tabinfo = result[tabkey];
        // set html
        delimiter.value = settings.delim;
        instant.checked = settings.isInstant;
        pasteKeywords.checked = settings.isPasteKws;
        if ( settings.isPasteKws && tabinfo.isNewPage ){
          highlightWords.value = settings.last_keywords.join(settings.delim);
          highlightWords.value += highlightWords.value ? settings.delim : "";
          handle_highlightWords_change();
        } else {
          highlightWords.value = tabinfo.keywords.join(settings.delim);
          highlightWords.value += highlightWords.value ? settings.delim : "";
        }
        tabinfo.isNewPage = false;
        chrome.storage.local.set({ [tabinfo.tabkey]:tabinfo });
        // register listener
        $("#highlightWords").on("input", function(){
          handle_highlightWords_change();
        })
        $("#delimiter").on("input", function(){
          handle_delimiter_change();
        })
        $("#instant").on("input", function(){
          handle_instant_mode_change();
        })
        $("#pasteKeywords").on("input", function(){
          handle_pasteKeywords_mode_change();
        })
        
      });
    }
  });
});