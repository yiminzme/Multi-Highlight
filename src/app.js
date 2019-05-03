var C, delim, tks, styleI, currTab, tksID, isInstant;

function hl_search(tksAdded) {
    for (var i=0; i < tksAdded.length; i++) {
      styleI += 1;
      chrome.tabs.executeScript(null,
      {code:"$(document.body).highlight('"+tksAdded[i]
        +"', {className:'"
        +C.sCSS1+" "
        +(C.sCSS2+(styleI%C.NHL))+" "
        +(C.sCSS3+encodeURI(tksAdded[i])) // escape special characters
        +"'})"
      }, _=>chrome.runtime.lastError);
    }
}


function hl_clear(tksRemoved) {

  // remove in reverse order to avoid removing nested-highlighted-words
  for (var i=tksRemoved.length-1; i >= 0; i--) {
    styleI -= 1;
    // escape meta-characters, special characters
    className = (C.sCSS3+encodeURI(tksRemoved[i])).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");
    chrome.tabs.executeScript(null,
        {code:"$(document.body).unhighlight({className:'"+className+"'})"}, _=>chrome.runtime.lastError);
  }
}


function hl_clearall() {
  chrome.tabs.executeScript(null,
      {code:"$(document.body).unhighlight({className:'"+C.sCSS1+"'})"}, _=>chrome.runtime.lastError);
}


function handle_highlightWords_change() {
  inputStr = highlightWords.value;

  if (isInstant || inputStr.slice(-1) == delim || !inputStr){ // check if (last char of input is delimiter) or (empty string)
    newTks = inputStr.split(delim).filter(i => i);
    tksAdded = $(newTks).not(tks).get(); // get tokens only occur in new input
    tksRemoved = $(tks).not(newTks).get(); // get tokens only occur in old input
    // console.log("new input: ", newTks, "previous input: ", tks);
    // console.log("[words added: ", tksAdded, "words removed: ", tksRemoved, "]");
    hl_clear(tksRemoved);
    hl_search(tksAdded);
    tks = newTks;
    chrome.storage.local.set({[tksID]:tks, 'styleI':styleI});
  }
}


function handle_delimiter_change() {
  delim = delimiter.value;
  chrome.storage.local.set({'delim':delim});
  // reset "highlightWords" input after delimiter changed
  highlightWords.value = "";
  handle_highlightWords_change();
}


function handle_instant_change(){
  isInstant = $('#instant').is(':checked');
  chrome.storage.local.set({'isInstant':isInstant});
}


document.addEventListener('DOMContentLoaded', function () {

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currTab = tabs[0];
    tksID = "tabs_"+currTab.id+"_tks";
    if (currTab) { // Sanity check

      chrome.storage.local.get({'C':{}, 'delim':" ", [tksID]:[], 'styleI':0, 'isInstant':true}, function(result){
        C = result.C;
        delim = result.delim; // default " "
        delimiter.value = delim;
        tks = result[tksID]; // default ""
        highlightWords.value = tks.join(delim);
        highlightWords.value += highlightWords.value ? delim : "";
        styleI = result.styleI; // default 0
        isInstant = result.isInstant; // default true
        instant.checked = isInstant;
        // console.log("variables retrived");

        $("#highlightWords").on("input", function(){
          handle_highlightWords_change();
        })
        $("#delimiter").on("input", function(){
          handle_delimiter_change();
        })
        $("#instant").on("input", function(){
          handle_instant_change();
        })
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            // respond to Backspace, Delete
            if (evt.keyCode == 8 || evt.keyCode == 46) {
              handle_highlightWords_change();
            }
        };
      })
    }
  });
});