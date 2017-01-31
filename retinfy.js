(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.retinfy = factory(root);
	}
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

	'use strict';
	//
	// Variables
	//

	var retinfy = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings, eventTimeout;
	var inlineReplace = /url\(('|")?([^\)'"]+)('|")?\)/i;
	var srcReplace = /(\.[A-z]{3,4}\/?(\?.*)?)$/;

	// Default settings
	var defaults = {
		'@1': 'data-x1',
		'@2': 'data-x2',
		'@3': 'data-x3',
		activeClass: 'retinfy',
		initClass: 'retinfy-loaded',
		callbackBefore: function () {},
		callbackAfter: function () {}
	};


	//
	// Methods
	//

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};



	var getDevicePixelRatio = function () {
	    var ratio = 1;
	    // To account for zoom, change to use deviceXDPI instead of systemXDPI
	    if (root.screen.systemXDPI !== undefined && root.screen.logicalXDPI       !== undefined && root.screen.systemXDPI > root.screen.logicalXDPI) {
	        // Only allow for values > 1
	        ratio = root.screen.systemXDPI / root.screen.logicalXDPI;
	    }
	    else if (root.devicePixelRatio !== undefined) {
	        ratio = root.devicePixelRatio;
	    }
	    return Math.ceil(ratio) > 3 ? 3 : Math.ceil(ratio);
	};


	var getBgImg = function(img) {
	  return img.style.backgroundImage.replace(inlineReplace, '$2');
	}

	var forceOriginalDimensions = function (image) {
	  if (!image.hasAttribute('data-no-resize')) {
	    if (image.offsetWidth === 0 && image.offsetHeight === 0) {
	      image.setAttribute('width', image.naturalWidth);
	      image.setAttribute('height', image.naturalHeight);
	    } else {
	      image.setAttribute('width', image.offsetWidth);
	      image.setAttribute('height', image.offsetHeight);
	    }
	  }
	  return image;
	}


	var setImage = function (element, settings, ratio){
		var src;
		if(element.nodeName.toLowerCase() === 'img'){
			src = element.getAttribute('src');
			if (ratio && (src === element.getAttribute(settings['@' + ratio]) || src === element.getAttribute(settings['@1']))) return false;
			element = forceOriginalDimensions(element);
			var correctImage = element.getAttribute(settings['@' + ratio]) || element.getAttribute(settings['@' + ratio-1]) || element.getAttribute(settings['@1']);
			element.setAttribute('src', correctImage);
			element.classList.add( settings.initClass);
			return true;
		}
		else{
			src = getBgImg(element);
			if (ratio && (src === element.getAttribute(settings['@' + ratio]) || src === element.getAttribute(settings['@1']))) return false;
			var correctImage = element.getAttribute(settings['@' + ratio]) || element.getAttribute(settings['@' + ratio-1]) || element.getAttribute(settings['@1']);
			var style = element.getAttribute('style');
			style = style.replace(inlineReplace, 'url(\'' + correctImage + '\')');
			element.setAttribute('style', style);
			element.classList.add(settings.initClass);
			return true;
		}
		
	}


	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function ( defaults, options ) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};

	/**
	 * Convert data-options attribute into an object of key/value pairs
	 * @private
	 * @param {String} options Link-specific options as a data attribute string
	 * @returns {Object}
	 */
	var getDataOptions = function ( options ) {
		return !options || !(typeof JSON === 'object' && typeof JSON.parse === 'function') ? {} : JSON.parse( options );
	};




	/*
		Developed by Robert Nyman, http://www.robertnyman.com
		Code/licensing: http://code.google.com/p/getelementsbyclassname/
	*/	
	var getElementsByClassName = function (className, tag, elm){
		if (document.getElementsByClassName) {
			getElementsByClassName = function (className, tag, elm) {
				elm = elm || document;
				var elements = elm.getElementsByClassName(className),
					nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
					returnElements = [],
					current;
					var test = elements.length;
				for(var i=0, il=elements.length; i<il; i+=1){
					current = elements[i];
					if(!nodeName || nodeName.test(current.nodeName)) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}
		else if (document.evaluate) {
			getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = "",
					xhtmlNamespace = "http://www.w3.org/1999/xhtml",
					namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
					returnElements = [],
					elements,
					node;
				for(var j=0, jl=classes.length; j<jl; j+=1){
					classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
				}
				try	{
					elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
				}
				catch (e) {
					elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
				}
				while ((node = elements.iterateNext())) {
					returnElements.push(node);
				}
				return returnElements;
			};
		}
		else {
			getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = [],
					elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
					current,
					returnElements = [],
					match;
				for(var k=0, kl=classes.length; k<kl; k+=1){
					classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
				}
				for(var l=0, ll=elements.length; l<ll; l+=1){
					current = elements[l];
					match = false;
					for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
						match = classesToCheck[m].test(current.className);
						if (!match) {
							break;
						}
					}
					if (match) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}
		return getElementsByClassName(className, tag, elm);
	};


	/**
	 * Get the closest matching element up the DOM tree
	 * @param {Element} elem Starting element
	 * @param {String} selector Selector to match against (class, ID, or data attribute)
	 * @return {Boolean|Element} Returns false if not match found
	 */
	var getClosest = function (elem, selector) {
		var firstChar = selector.charAt(0);
		for ( ; elem && elem !== document; elem = elem.parentNode ) {
			if ( firstChar === '.' ) {
				if ( elem.classList.contains( selector.substr(1) ) ) {
					return elem;
				}
			} else if ( firstChar === '#' ) {
				if ( elem.id === selector.substr(1) ) {
					return elem;
				}
			} else if ( firstChar === '[' ) {
				if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
					return elem;
				}
			}
		}
		return false;
	};



	/**
	 * Destroy the current initialization.
	 * @public
	 */
	retinfy.destroy = function () {
		// If plugin isn't already initialized, stop
		if ( !settings ) return;		
		var images = getElementsByClassName(settings.initClass);
		forEach(images, function(image){
			image.classList.remove( settings.initClass );
		});

		// Reset variables
		settings = null;

	};







	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	retinfy.init = function ( options ) {
		// feature test
		if ( !supports ) return;

		// Destroy any existing initializations
		retinfy.destroy();
		// Set the Device Pixel Ratio
		var device = getDevicePixelRatio();
		// Merge user options with defaults
		settings = extend( defaults, options || {} );

		var images = getElementsByClassName(settings.activeClass);
		forEach(images, function(image){
			setImage(image, settings, device);
		});

	};

	//
	// Public APIs
	//

	return retinfy;

});