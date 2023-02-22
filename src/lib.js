// ************************************************************************
// Multi Highlight Library
// ************************************************************************

// ****** general functions
function get_tabkey(tabId) {
    return "multi-highlight_" + tabId;
}
function get_tabId(tabkey){
	return parseInt(tabkey.substring(16))
}
function makeSafeForCSS(name) {
    return name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
}

// What is the fastest or most elegant way to compute a set difference using Javascript arrays? - Stack Overflow: https://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javasc
function SetMinus(A, B){
	return A.filter(x => !B.includes(x) );
}

const TrueOrFalse = (opt) => opt? "true" : "false";

function KeywordEscape(kw){
	return kw.replace(/\n/sgi, '\\n');
}


// return an array of keword object:
// [{kwGrp: kwGrpNum, kwStr: keywordString}, {kwGrp: ..., kwStr: ...}, ...]
// The kwGrp is defined in two ways, if in the NewColorNewLine mode, the kwGrp
// is the same for keywords on the same line; otherwise, the kwGrp increases
// every keywords
function keywordsFromStr(inputStr, settings){
	if(settings.isNewlineNewColor){
		return inputStr.split(/\n/g).filter(i=>i).reduce((arr, line, lineCnt)=>{
			arr = arr.concat(line.split(settings.delim).filter(i=>i).map(kws=>{
				return {kwGrp: (lineCnt % 20), kwStr: kws};
			}));
			console.log(arr);
			return arr;
		}, []);
	}else{
		return inputStr.split(settings.delim).filter(i=>i).map((kws,cnt)=>{
			return {kwGrp: (cnt % 20), kwStr: kws};
		});
	}
}
function keywordsToStr(kws, settings){
	var str = "";
	if(settings.isNewlineNewColor){
		for(var i = 0, len = kws.length - 1; i < len; ++ i){
			str += kws[i].kwStr + ((kws[i].kwGrp != kws[i+1].kwGrp) ? "\n": settings.delim);
		}
		// and the last one
		kws.length && (str += kws[kws.length-1].kwStr);
	}else{
		if (!Array.isArray(kws)) {
			return str
		}
		str = kws.map(kw=>kw.kwStr).join(settings.delim);
		// append deliminator if there are words
		str += str ? settings.delim : "";
	}
	return str
}
function KeywordsMinus(kwListA, kwListB){
	function KwListContain(kwList, kwA){
		for(const kw of kwList)	{
			if(kw.kwStr === kwA.kwStr && kw.kwGrp === kwA.kwGrp ){
				return true;
			}
		}
		return false;
	}
	// console.log(kwListA.map(x=>KwListContain(kwListB, x)));
	if (Array.isArray(kwListA)) {
		return kwListA.filter(x=>!KwListContain(kwListB, x));
	}
	return [] //empty array
}
