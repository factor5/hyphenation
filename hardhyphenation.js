/**
 * Plugin that is used for hard hyphenation of text that doesn't fit to the
 * width of the wrapper component. A word breaking characters are injected in
 * the text in order to force browser to make hyphenation.
 * 
 * @autor SVelikov
 */
Hyphenation = {

	/**
	 * Letter-spacing in pixels.
	 */	
	LETT_SPACE : 0,

	/**
	 * Hyphen character provided trough constructor.
	 */	
	HYPHEN_TYPE : '',

	/**
	 * Hyphen's width that is set in constructor.
	 */	
	HYPHEN_TYPE_WIDTH : 0,

	/**
	 * Selector for the elements to be processed.
	 */	
	SELECTOR : '',

	/**
	 * Constant for the '<' character that is to be escaped when the text is
	 * written back to document.
	 */	
	OPEN_TAG_ENTITY : '&#60;',

	/**
	 * Object literal containing hyphen types.
	 */	
	HYPHEN_TYPES : {
		h : '<wbr>',
		s : '&shy;'
	},

	/**
	 * Object literal containing hyphen widths.
	 */	
	HYPHEN_WIDTHS : {
		h : 0,
		s : 7
	},

	/**
	 * Object literal containing word breaking chars.
	 */	
	WBR_CHARS : {
		'-' : 0,
		' ' : 1
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
	run : function (hyphenType, selector) {
		if (hyphenType) {		
			hyphenType = hyphenType.toLowerCase();
			if (hyphenType in this.HYPHEN_TYPES) {
				this.HYPHEN_TYPE = this.HYPHEN_TYPES[hyphenType];
				this.HYPHEN_TYPE_WIDTH = this.HYPHEN_WIDTHS[hyphenType];
			}
		} else {
			return;
		}

		if (selector !== null || selector !== undefined) {
			if (selector.length === undefined) {
				var selectorObj = selector;
				for (selector in selectorObj) {
					this.findAndFix(selectorObj[selector]);      
				}          
			} else {
				this.findAndFix(selector);    
			}
		} else {
			return;
		}
	},

	/**
	 * Finds all elements matched by the provided selector using jQuery. If found 
	 * any elements they are processed.
	 * 
	 * @param selector any allowed from jQuery selector (css class, id, tag name and so on)
	 */
	findAndFix : function (selector) {
		var previewElements = jQuery(selector);
		if (previewElements.length > 0) {
			this.checkContent(previewElements);
		}
	},

	/**
	 * Iterates the provided array and for every element there calculates the
	 * elements width in pixels and calls method to hyphenate the text if needed
	 * providing the width of the element and the text itself.
	 */
	checkContent : function (previewElements) {
		var len = previewElements.length;
		for (var i = 0; i < len; i++) {
			var currentCell = previewElements[i];
			var txt = currentCell.innerHTML;
			// call a method to trim left and right the text
			txt = txt.trim();
			// get the width in pixels of the current element
			var eleWidth = previewElements[i].offsetWidth;
			// call the method to hyphenate the text if needed
			var fixedString = this.breakString(txt, eleWidth - this.HYPHEN_TYPE_WIDTH);
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
	breakString : function (txt, eleWidth) {
		var txtLength = txt.length;
		var resultStr = '';
		var sum = 0;
		for (var i = 0; i < txtLength; i++) {
			var ch = txt.substring(i, i + 1);
			// flag that shows if any word breaking char is found on the current row
			var wbr = false;
			// if current sign is a word-breacking one we notice that in
			// order to know whether to insert breaking char when we reach
			// to the end of the line (sum >= eleWidth)
			if (ch in this.WBR_CHARS) {
				wbr = true;
			}

			// if '<' sign is found assume that it is a beginning of a tag so we
			// need to check if it is one of the following that should not be
			// processed and if it is we just attach the found tag to the result
			// and continue the processing of the string after the tag
			// TODO NEED OPTIMIZATION
			if (ch.charCodeAt(0) == 60) {
				if ((txt.charCodeAt(i + 1) == 98 || txt.charCodeAt(i + 1) == 66) && (txt.charCodeAt(i + 2) == 62)) {
					i += 2;
					resultStr += '<b>';
					continue;
				} else if ((txt.charCodeAt(i + 1) == 47) && (txt.charCodeAt(i + 2) == 98 || txt
								.charCodeAt(i + 2) == 66) && (txt.charCodeAt(i + 3) == 62)) {
					i += 3;
					resultStr += '</b>';
					continue;
				} else if ((txt.charCodeAt(i + 1) == 87 || txt
						.charCodeAt(i + 1) == 119) && (txt.charCodeAt(i + 2) == 98 || txt
						.charCodeAt(i + 2) == 66) && (txt.charCodeAt(i + 3) == 82 || txt
						.charCodeAt(i + 3) == 114) && (txt.charCodeAt(i + 4) == 62)) {
					i += 4;
					resultStr += '<wbr>';
					continue;
				}
			}

			// if calculated sum is going to overrun the provided width we need
			// to hyphenate but if we have found a breacking char earlier on the
			// same row we doesn't inject a breaking char and rely on the
			// browser
			// to hyphenate (if it wants to)
			// FIXME there is an issue under FF3 where it doesn't hyphenate
			// properly
			var increment = this.allSigns[ch.charCodeAt(0) - 32] + this.LETT_SPACE;
			if ((sum + increment) >= eleWidth) {
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
	getFontSize : function (rootTag) {
		var fSize = (rootTag.currentStyle || (window.getComputedStyle && getComputedStyle(rootTag, null)) || rootTag.style).fontSize;
		return fSize.substring(0, (fSize.length - 2));
	},

	/**
	 * Helper function that may be used to calculate the letters width.
	 */
	calculateWidth : function (neededFSize) {
		if (!neededFSize || (neededFSize < 6 || neededFSize > 32)) {
			alert('Font size argument is reqired!');
			return;
		}

		var elDiv = document.createElement('div');
		elDiv.id = 'elDiv';
		elDiv.setAttribute('class', 'printOut');
		elDiv.setAttribute('className', 'printOut');
		elDiv.style.fontSize = neededFSize;
		document.body.appendChild(elDiv);
		var containerSpan = document.createElement('span');
		document.body.appendChild(containerSpan);
		var chWidth = 0;
		for (var i = 32; i <= 1103; i++) {
			containerSpan.innerHTML = String.fromCharCode(i);
			chWidth = containerSpan.offsetWidth + ', ';
			this.print('elDiv', chWidth, 1);
		}
	},

	/**
	 * Helper method that prints in the html page.
	 */
	print : function (id, txt, append) {
		if (append) {
			document.getElementById(id).innerHTML += txt;
		} else {
			document.getElementById('print').innerHTML = txt;
		}
	},
	
	/**
	 * Тhe widths of the signs from 32 to 1103 UTF8 for 12px font-size.
	 */	
	allSigns : [0, 3, 4, 7, 7, 11, 8, 2, 4, 4, 5, 7, 3, 4, 3, 3, 7, 7,
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
		7, 6, 9, 7]	
};

/**
 * Trims on the left and right the provided string. It is included as method in
 * String object.
 * 
 * @returns the string trimmed
 */
String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, "");
};