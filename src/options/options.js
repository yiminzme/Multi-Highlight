// ************************************************************************
// Multi Highlight options js
// ************************************************************************

document.addEventListener('DOMContentLoaded', function () {

	chrome.storage.local.get( ['settings'], function(result){
	  // init
	  var settings = result.settings;
	  // set html
	  delimiter.value = settings.delim;
	  instant.checked = settings.isInstant;
	  pasteKeywords.checked = settings.isPasteKws;
	  addKw.checked = settings.isItemAddKw;
	  removeKw.checked = settings.isItemRemoveKw;
	  // register listener
	  $("#delimiter").on("input", function(){
	    handle_delimiter_change(null, settings);
	  })
	  $("#instant").on("input", function(){
	    handle_instant_mode_change(settings);
	  })
	  $("#pasteKeywords").on("input", function(){
	    handle_pasteKeywords_mode_change(settings);
	  })
	  $("#addKw").on("input", function(){
	  	console.log($(this)[0].checked);
	    handle_addKw_change($(this)[0].checked);
	  })
	  $("#removeKw").on("input", function(){
	  	console.log($(this)[0].checked);
	    handle_removeKw_change($(this)[0].checked);
	  })
	});
});