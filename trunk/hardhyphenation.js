/**
 * Plugin that is used for hard hyphenation of text that doesn't fit to the
 * width of the wrapper component. A word breaking characters are injected in
 * the text in order to force browser to make hyphenation.
 * 
 * @autor SVelikov
 * @version 1.0
 * @date 24.10.2009
 */
Hyphenation = {

	// array containing all the elements to be processed
	previewElements :null,

	// letter-spacing in pixels
	LETT_SPACE :0,

	// hyphen character provided with constructor
	HYPHEN_TYPE :'',

	// hyphens width - calculated in constructor
	HYPHEN_TYPE_WIDTH :0,

	// selector for the elements to be processed
	SELECTOR :'',

	// constant for the '<' character that is to be escaped when the text is
	// written back to document
	OPEN_TAG_ENTITY :'&#60;',

	// hyphen tpes enumeration
	HYPHEN_TYPES : {
		H :'<wbr>',
		S :'&shy;'
	},

	// hyphen widths enumeration
	HYPHEN_WIDTHS : {
		H :0,
		S :7
	},

	// word breaking chars enumeration
	WBR_CHARS : {
		'-' :0,
		' ' :1
	},

	/**
	 * Main method called on page load. Finds all the required elements using
	 * jQuery and calls a checkContent to process the found elements if any.
	 * Argument hyphenType has 2 possible values 'H' - for hard hyphenation
	 * using <wbr> (zero width space) tag and 'S' - for soft hyphenation using
	 * &shy; that inserts an hyphen char '-' where it is situated in the text.
	 * The selector argument is also required as it is used for the api to know
	 * on which elements to apply hyphenation algorithm.
	 * 
	 * @param hyphenType
	 *            to be used for the hyphenation
	 * @param selector
	 *            the selector to be used when search for elements to process
	 */
	findAndFix : function(hyphenType, selector) {
		if (hyphenType && hyphenType in this.HYPHEN_TYPES) {
			this.HYPHEN_TYPE = this.HYPHEN_TYPES[hyphenType];
			this.HYPHEN_TYPE_WIDTH = this.HYPHEN_WIDTHS[hyphenType];
		} else {
			return;
		}
		if (selector) {
			this.SELECTOR = selector;
		} else {
			return;
		}

		this.previewElements = jQuery(this.SELECTOR);
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
		for ( var i = 0; i < len; i++) {
			var currentCell = this.previewElements[i];
			var txt = currentCell.innerHTML;
			// call a method to trim left and right the text
			txt = txt.trim();
			// get the width in pixels of the current element
			var parentWidth = this.previewElements[i].parentNode.offsetWidth;
			// call the method to hyphenate the text if needed
			var fixedString = this.breakString(txt, parentWidth
					- this.HYPHEN_TYPE_WIDTH);
			// put back the returned string into its container element
			currentCell.innerHTML = fixedString;
		}
	},

	/**
	 * Parses the provided string and inserts a breaking character on place
	 * where string is going to overrun the provided container's width.
	 * 
	 * @param txt
	 *            the text that is containing in the current element
	 * @param the
	 *            width of the current element
	 * @return the string that is already hyphenated so to match the width of
	 *         the containing element
	 */
	breakString : function(txt, parentWidth) {
		var txtLength = txt.length;
		var resultStr = '';
		var sum = 0;
		for ( var i = 0; i < txtLength; i++) {
			var ch = txt.substring(i, i + 1);
			// flag that shows if any word breaking char is found on the current
			// row
			var wbr = false;
			// if current sign is a word-breacking one we notice that in
			// order to know whether to insert breaking char when we reach
			// to the end of the line (sum >= parentWidth)
			if (ch in this.WBR_CHARS) {
				wbr = true;
			}
			// if calculated sum is going to overrun the provided width we need
			// to hyphenate but if we have found a breacking char earlier on the
			// same row we doesn't inject a breaking char and rely on the
			// browser
			// to hyphenate (if it wants to)
			// FIXME there is an issue under FF3 where it doesn't hyphenate
			// properly
			var increment = allSigns[ch.charCodeAt(0) - 32] + this.LETT_SPACE;
			if ((sum + increment) >= parentWidth) {
				// if there isn't breaking char on the row we inject word
				// breaking char
				if (!wbr) {
					// insert breacking character
					resultStr += this.HYPHEN_TYPE;
					// clear the sum to start a new row
					sum = 0;
				}
			}

			// 32 - UTF8 for 'space', 1103 - UTF8 for 'who knows'
			if (ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 1103) {
				// we should replace an oppening tag '<' with its html entity
				// equivalent
				if (ch.charCodeAt(0) == 60) {
					ch = this.OPEN_TAG_ENTITY;
				}
				// increment the sum with the width of the current sign + letter
				// space
				sum += increment;
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
		var ch = document.getElementById('ch');
		var chWidth = 0;
		for (i = 32; i <= 1103; i++) {
			ch.innerHTML = String.fromCharCode(i);
			chWidth = ch.offsetWidth;
			this.print(chWidth + ', ', 1);
		}
	},

	/**
	 * Helper method that prints in the html page.
	 */
	print : function(txt, append) {
		if (append) {
			document.getElementById('print').innerHTML += txt;
		} else {
			document.getElementById('print').innerHTML = txt;
		}
	}
};

/**
 * Trims on the left and right the provided string. It is included as method in
 * String object.
 * 
 * @returns the string trimmed
 */
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
};

// the widths of the signs from 32 to 1103 UTF8 when font-size = 12px
var allSigns = new Array(0, 3, 4, 7, 7, 11, 8, 2, 4, 4, 5, 7, 3, 4, 3, 3, 7, 7,
		7, 7, 7, 7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 12, 7, 8, 9, 9, 8, 7, 9, 9,
		3, 6, 8, 7, 9, 9, 9, 8, 9, 9, 8, 7, 9, 7, 11, 7, 7, 7, 3, 3, 3, 5, 7,
		4, 7, 7, 6, 7, 7, 3, 7, 7, 3, 3, 6, 3, 11, 7, 7, 7, 7, 4, 7, 3, 7, 5,
		9, 5, 5, 5, 4, 3, 4, 7, 13, 13, 13, 13, 13, 13, 0, 13, 13, 13, 13, 13,
		13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
		13, 13, 13, 3, 3, 7, 7, 7, 7, 3, 7, 4, 9, 4, 7, 7, 4, 9, 7, 5, 7, 4, 4,
		4, 7, 6, 3, 4, 4, 4, 7, 10, 10, 10, 7, 7, 7, 7, 7, 7, 7, 12, 9, 8, 8,
		8, 8, 3, 3, 3, 3, 9, 9, 9, 9, 9, 9, 9, 7, 9, 9, 9, 9, 9, 7, 8, 8, 7, 7,
		7, 7, 7, 7, 11, 6, 7, 7, 7, 7, 3, 3, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7,
		7, 7, 7, 7, 5, 7, 5, 7, 7, 7, 7, 7, 7, 9, 6, 9, 6, 9, 6, 9, 6, 9, 7, 9,
		7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 3,
		3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 5, 6, 3, 8, 6, 7, 7, 3, 7, 3, 7, 4, 7, 4,
		7, 3, 9, 7, 9, 7, 9, 7, 7, 9, 7, 9, 7, 9, 7, 9, 7, 12, 11, 9, 4, 9, 4,
		9, 4, 8, 7, 8, 7, 8, 7, 8, 7, 7, 3, 7, 5, 7, 3, 9, 7, 9, 7, 9, 7, 9, 7,
		9, 7, 9, 7, 11, 9, 7, 5, 7, 7, 5, 7, 5, 7, 5, 3, 7, 9, 8, 7, 8, 7, 9,
		9, 6, 9, 10, 8, 7, 7, 8, 9, 8, 7, 7, 9, 8, 11, 3, 3, 8, 6, 3, 6, 10, 9,
		7, 9, 10, 8, 11, 8, 9, 7, 8, 8, 6, 7, 5, 3, 7, 3, 7, 10, 8, 9, 9, 9, 6,
		7, 6, 6, 7, 6, 6, 7, 7, 5, 6, 7, 3, 3, 9, 3, 16, 14, 12, 13, 9, 5, 14,
		11, 9, 7, 7, 3, 3, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 7, 7, 7, 7, 7,
		12, 11, 8, 7, 8, 7, 7, 6, 9, 7, 9, 7, 6, 5, 3, 16, 14, 12, 9, 7, 13, 7,
		9, 7, 7, 7, 12, 11, 9, 7, 7, 7, 7, 7, 8, 7, 8, 7, 3, 3, 3, 3, 9, 7, 9,
		7, 9, 4, 9, 4, 9, 7, 9, 7, 7, 5, 8, 5, 6, 5, 9, 7, 8, 13, 7, 6, 7, 6,
		7, 7, 7, 7, 9, 7, 9, 7, 9, 7, 9, 7, 7, 5, 13, 13, 13, 13, 13, 13, 13,
		13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
		13, 13, 13, 7, 7, 7, 7, 6, 6, 7, 7, 7, 7, 9, 6, 6, 8, 6, 4, 7, 7, 7, 6,
		7, 7, 7, 7, 3, 3, 3, 4, 3, 3, 7, 10, 10, 10, 7, 7, 7, 7, 9, 8, 7, 4, 4,
		4, 4, 4, 3, 3, 6, 6, 6, 3, 4, 3, 5, 3, 3, 7, 7, 6, 6, 9, 6, 6, 6, 7, 5,
		6, 6, 6, 6, 6, 9, 7, 6, 7, 7, 5, 6, 5, 7, 6, 6, 11, 11, 12, 9, 5, 9, 9,
		8, 7, 6, 7, 13, 13, 5, 5, 3, 3, 3, 4, 4, 6, 4, 7, 6, 4, 4, 4, 4, 4, 4,
		4, 5, 5, 5, 5, 4, 4, 3, 4, 5, 7, 3, 7, 7, 7, 5, 5, 3, 3, 6, 6, 6, 6, 4,
		4, 4, 4, 4, 4, 3, 13, 5, 2, 4, 5, 4, 5, 5, 5, 5, 5, 13, 13, 13, 13, 13,
		13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
		13, 13, 13, 13, 0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
		13, 13, 13, 13, 13, 13, 4, 4, 13, 13, 13, 13, 7, 13, 13, 13, 3, 13, 13,
		13, 13, 13, 4, 4, 7, 3, 9, 10, 4, 13, 9, 13, 9, 9, 3, 7, 8, 7, 7, 8, 7,
		9, 9, 3, 8, 7, 9, 9, 8, 9, 9, 8, 13, 7, 7, 7, 9, 7, 9, 9, 3, 7, 7, 5,
		7, 3, 7, 7, 7, 5, 7, 5, 5, 7, 7, 3, 7, 5, 7, 5, 5, 7, 8, 7, 6, 7, 5, 7,
		8, 6, 9, 9, 3, 7, 7, 7, 9, 13, 7, 7, 9, 11, 9, 7, 8, 7, 9, 7, 9, 6, 7,
		6, 8, 6, 9, 7, 10, 10, 8, 7, 8, 6, 8, 8, 7, 7, 9, 7, 6, 5, 7, 7, 6, 3,
		9, 6, 6, 13, 13, 13, 13, 13, 13, 13, 13, 13, 7, 8, 10, 7, 9, 8, 3, 3,
		6, 13, 12, 10, 7, 8, 8, 9, 7, 8, 8, 7, 8, 8, 11, 7, 9, 9, 7, 8, 9, 9,
		9, 9, 8, 9, 7, 8, 9, 7, 9, 8, 11, 11, 10, 10, 8, 9, 12, 9, 7, 7, 6, 4,
		7, 7, 9, 6, 7, 7, 6, 7, 9, 7, 7, 7, 7, 6, 5, 5, 9, 5, 7, 6, 9, 9, 8, 9,
		7, 6, 9, 7);