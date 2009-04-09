
StringFixer = {
	previewElements : null,
	fSize : 0,
	SPACE : ' ',
	HYPHEN : '-',
	SELECTOR : '.preview',
	
	
	findAndFix : function() {
		this.previewElements = $(this.SELECTOR);
		this.fSize = this.getFontSize(document.body);
		this.checkContent();
	},

	checkContent : function () {
		var len = this.previewElements.length;
		var currentCell = null;
		var txt = null;
		var parentWidth = 0;
		var fixedString = null;
		for (var i = 0; i <= len; i++) {		
			currentCell = this.previewElements[i];
			txt = currentCell.innerHTML;
			txt = this.trim(txt);
			parentWidth = this.previewElements[i].parentNode.offsetWidth;
			var neededWordLen = Math.round(parentWidth / 9);
			alert(parentWidth + ':' + neededWordLen);
			fixedString = this.wbr(txt, neededWordLen);
			//fixedString = this.breakString(txt, parentWidth - 6);	

			currentCell.innerHTML = fixedString;
		}	
	},
	
	wbr : function (str, num) {  
	  return str.replace(RegExp("(\\w{" + num + "})(\\w)", "g"), function(all,text,char){ 
		return text + "<wbr>" + char; 
	  }); 
	},
	
	breakString : function (txt, parentWidth) {
		var txtLength = txt.length;
		var resultStr = '';
		var sum = 0;
		for (var i = 0; i < txtLength; i++) {
			var ch = txt.substring(i, i + 1);
			if (sum >= parentWidth) {
				resultStr += this.SPACE;
				sum = 0;
			}
			sum += char[ch] + 2;
			resultStr += ch;
		}
		return resultStr;
	},
	
	getFontSize : function (rootTag) {
		var fSize =
			(
				rootTag.currentStyle||
				(window.getComputedStyle&&getComputedStyle(rootTag,null))||
				rootTag.style
			).fontSize;
		return fSize.substring(0, (fSize.length - 2));
	},
	
	trim : function (str) {
		return str.replace(/^\s+|\s+$/g,"");
	}
}

/* 14px fontSize lower */
var char = new Object();
char.a = 6;
char.b = 6;
char.c = 5;
char.d = 6;
char.e = 6;
char.f = 4;
char.g = 6;
char.h = 6;
char.i = 1;
char.j = 3;
char.k = 6;
char.l = 1;
char.m = 9;
char.n = 6;
char.o = 6;
char.p = 6;
char.q = 6;
char.r = 4;
char.s = 5;
char.t = 4;
char.u = 6;
char.v = 7;
char.w = 9;
char.x = 6;
char.y = 7;
char.z = 6;
/* ----- capital ----- */
char.A = 9;
char.B = 7;
char.C = 8;
char.D = 8;
char.E = 7;
char.F = 7;
char.G = 9;
char.H = 7;
char.I = 1;
char.J = 5;
char.K = 8;
char.L = 7;
char.M = 9;
char.N = 7;
char.O = 9;
char.P = 7;
char.Q = 9;
char.R = 8;
char.S = 7;
char.T = 7;
char.U = 7;
char.V = 9;
char.W = 13;
char.X = 8;
char.Y = 9;
char.Z = 8;


/* ----------------------------------- */
function walkTheDom() {
    var items = document.getElementsByTagName('*');
    var i=items.length;
    var item;
	i--;
    do {
		item = items[i];
		if (item.tagName == 'SPAN') {
			if (hasClassName(item, 'preview')) {
				var txt = item.innerHTML;
				var txtLen = txt.length;
				var elWidth = item.offsetWidth;
				var fSize = document.body.style.fontSize;	
				
			}
		}
    } while (i--);
}

function hasClassName(objElement, strClass) {
	// if there is a class
	if ( objElement.className ) {
	
		var arrList = objElement.className.split(' ');
		var strClassUpper = strClass.toUpperCase();
		
		for ( var i = 0; i < arrList.length; i++ ) {
	        if ( arrList[i].toUpperCase() == strClassUpper ) {
				return true;
			}
		}
		
	}
   return false;
}

function test() {
	var spanFS = document.body.style.fontSize;
				
	alert(spanFS);
}
