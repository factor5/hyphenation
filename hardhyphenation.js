/**
 * Plugin that is used for hard hyphenation of too long strings that doesn't fit
 * to the width of the wrapper component.
 */
Hyphenation = {

	// array containing all the elements to be processed
	previewElements :null,

	// font size that is set on body - calculated bellow
	// fSize : 0,

	// letter-spacing in pixels
	LETT_SPACE :0,

	// hyphen character provided with constructor
	HYPHEN_TYPE :'',

	// hyphens width - calculated in constructor
	HYPHEN_TYPE_WIDTH :0,

	// black space
	SPACE :' ',

	// hyphen
	HYPHEN :'-',

	// 9 is length of the blank space
	BLANKS_WIDTH :9,

	// 7 is length of the hyphen sign
	HYPHENS_WIDTH :7,

	// selector for the elements to be processed
	SELECTOR :'',

	/**
	 * Main method called onload. Finds all the required elements using jQuery
	 * and calls a checkContent to process the found elements if any.
	 * 
	 * @param hyphenType
	 *            to be used for the hyphenation
	 * @param selector
	 *            the selector to be used when search for elements to process
	 */
	findAndFix : function(hyphenType, selector) {
		if (hyphenType) {
			this.HYPHEN_TYPE = hyphenType;
			this.HYPHEN_TYPE_WIDTH = signs[hyphenType.charCodeAt(0)];
		} else {
			return;
		}
		if (selector) {
			this.SELECTOR = selector;
		} else {
			return;
		}

		this.previewElements = jQuery(this.SELECTOR);
		// this.fSize = this.getFontSize(document.body);
		if (this.previewElements.length > 0) {
			this.checkContent();
		}
	},

	/**
	 * Iterates the provided array and for every element there calculates the
	 * elements width in pixels and calls method to hyphenate the text if needed
	 * providing the width of the element and the text itself.
	 */
	checkContent : function() {
		var len = this.previewElements.length;
		var currentCell = null;
		var txt = null;
		var parentWidth = 0;
		var fixedString = null;
		for ( var i = 0; i < len; i++) {
			currentCell = this.previewElements[i];
			txt = currentCell.innerHTML;
			// call a method to trim left and right the text
			txt = txt.trim();
			// get the width in pixels of the current element
			parentWidth = this.previewElements[i].parentNode.offsetWidth;
			// call the method to hyphenate the text if needed
			fixedString = this.breakString(txt, parentWidth
					- this.HYPHEN_TYPE_WIDTH);
			currentCell.innerHTML = fixedString;
		}
	},

	/**
	 * Parses the provided string and inserts a breaking character (hyphen or
	 * space) on place where string is to overrun the provided width.
	 * 
	 * @param txt
	 *            the text that is containing in the current element
	 * @param the
	 *            width of the current element
	 * @return the string that is already fixed to match the width of the
	 *         current element
	 */
	breakString : function(txt, parentWidth) {
		var txtLength = txt.length;
		var resultStr = '';
		var sum = 0;
		for ( var i = 0; i < txtLength; i++) {
			var ch = txt.substring(i, i + 1);
			var wbr = 0;
			if ((ch == ' ') || (ch == '-')) {
				wbr = 1;
				sum = 0;
			}
			// if calculated sum is to overrun the width we need to hyphenate
			if (sum >= parentWidth) {
				if (wbr == 0) {
					// insert breacking character
					resultStr += this.HYPHEN_TYPE;
					// clear the sum to start a new 'line'
					sum = 0;
				}
			}
			// increment the sum with the width of the current sign
			// 32 - ascii for 'space', 126 - ascii for '~'
			if (ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126) {
				sum += signs[ch.charCodeAt(0) - 32] + this.LETT_SPACE;
			}

			// append the current char to the resulting string
			resultStr += ch;
		}
		return resultStr;
	},

	/**
	 * Calculates the font-size applied on the provided tag.
	 * 
	 * @param the
	 *            tag to get its fonts size
	 * @return the calculated font size in pixels on the provided tag
	 */
	getFontSize : function(rootTag) {
		var fSize = (rootTag.currentStyle
				|| (window.getComputedStyle && getComputedStyle(rootTag, null)) || rootTag.style).fontSize;
		return fSize.substring(0, (fSize.length - 2));
	},
	
	/**
	 * Helper function that may be used to calculate the letters width.
	 */
	calculateWidth : function() {
		var el = document.getElementById('lett');
		var el2 = document.getElementById('arr');
		var chDiv = document.getElementById('ch');
		var arr = new Array();
		for (i = 32; i <= 126; i++) {
			el.innerHTML = String.fromCharCode(i);			
			arr[i] = el.offsetWidth;
			el2.innerHTML += (String.fromCharCode(i) + '=' + arr[i] + ', ');
			chDiv.innerHTML += String.fromCharCode(i) + ', ';
		}
	}
}

/**
 * Trims on the left and right the provided string. It is included as method in
 * String object.
 * 
 * @returns the string trimmed
 */
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

// the widths of the signs from 32 to 126 ascii when font-size = 12px
var signs = new Array(8, 3, 4, 7, 7, 11, 8, 2, 4, 4, 5, 7, 3, 4, 3, 3, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 12, 7, 8, 9, 9, 8, 7, 9, 9,
		3, 6, 8, 7, 9, 9, 9, 8, 9, 9, 8, 7, 9, 7, 11, 7, 7, 7, 3, 3, 3, 5, 7,
		4, 7, 7, 6, 7, 7, 3, 7, 7, 3, 3, 6, 3, 11, 7, 7, 7, 7, 4, 7, 3, 7, 5,
		9, 5, 5, 5, 4, 3, 4, 7);
