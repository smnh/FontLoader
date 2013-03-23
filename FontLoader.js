(function () {
	
	/**
	 * This function waits until all fonts specified by fontFamiliesArray loaded and rendered. Then it executes the
	 * "fontsLoaded" delegate method. Specified font-families should be already defined in the document with CSS, by URL
	 * or base64.
	 * 
	 * If timeout parameter is specified and timeout is reached before all fonts were loaded, then "fontsLoaded" delegate
	 * method will be invoked with an error parameter. This parameter is an object with error description in its "message"
	 * field and array with all the font-families that weren't loaded in its "notLoadedFontFamilies" field. If all fonts
	 * were loaded then this parameter will be null.
	 *
	 * @param {Array}    fontFamiliesArray Array with font-families of fonts to load.
	 * @param {Object}   delegate Delegate object whose delegate methods will be invoked in its own context.
	 * @param {Function} [delegate.fontsLoaded] Callback function invoked after all fonts are loaded or timeout is reached.
	 * @param {Function} [delegate.fontLoaded] Callback function invoked for each loaded font with its font-family string as its first parameter.
	 * @param {Number}   [timeout=null]
	 * @constructor
	 */
	function FontLoader(fontFamiliesArray, delegate, timeout) {
		this._fontFamiliesArray = fontFamiliesArray.slice(0);
		this.delegate = delegate;
		this.timeout = (typeof timeout === "number") ? timeout : null;
		
		this._testContainer = null;
		this._timeoutId = null;
		this._intervalId = null;
		this._intervalDelay = 50;
		this._numberOfLoadedFonts = 0;
		this._numberOfFontFamilies = this._fontFamiliesArray.length;
		this._fontsMap = {};
		this._finished = false;
	}
	
	this.FontLoader = FontLoader;
	
	FontLoader.testDiv = null;
	FontLoader.referenceFontFamilies = ["serif", "cursive"];
	FontLoader.referenceFontFamiliesSizes = [];
	
	FontLoader.prototype = {
		constructor: FontLoader,
		loadFonts: function() {
			var self = this,
				isIE = /MSIE/i.test(navigator.userAgent),
				clonedDiv,
				i, j,
				sizeWatchers = [],
				sizeWatcher;
			
			if (this._numberOfFontFamilies === 0) {
				this._finish();
				return;
			}
			
			if (this.timeout !== null) {
				this._timeoutId = window.setTimeout(function timeoutFire() {
					self._finish();
				}, this.timeout);
			}
			
			if (isIE) {
				this._intervalId = window.setInterval(function intervalFire() {
					self._checkSizes();
				}, this._intervalDelay);
			}
			
			// Use pretty big fonts "50px" so the smallest difference between standard "serif" fonts and tested font-family will be noticeable.
			this._testContainer = document.createElement("div");
			this._testContainer.style.cssText = "position:absolute; left:-10000px; top:-10000px; white-space: nowrap; font-size:50px; visibility: hidden;";
			
			if (FontLoader.testDiv === null) {
				FontLoader.testDiv = document.createElement("div");
				FontLoader.testDiv.style.position = "absolute";
				FontLoader.testDiv.appendChild(document.createTextNode(" !\"\\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~"));
				
				// Get default dimensions
				clonedDiv = FontLoader.testDiv.cloneNode(true);
				this._testContainer.appendChild(clonedDiv);
				document.body.appendChild(this._testContainer);
				
				for (j = 0; j < FontLoader.referenceFontFamilies.length; j++) {
					clonedDiv.style.fontFamily = FontLoader.referenceFontFamilies[j];
					FontLoader.referenceFontFamiliesSizes.push(new Size(clonedDiv.offsetWidth, clonedDiv.offsetHeight));
				}

				this._testContainer.parentNode.removeChild(this._testContainer);
				clonedDiv.parentNode.removeChild(clonedDiv);
			}
			
			// Add div for each font-family
			for (i = 0; i < this._numberOfFontFamilies; i++) {
				this._fontsMap[this._fontFamiliesArray[i]] = true;
				
				if (isIE) {
					for (j = 0; j < FontLoader.referenceFontFamilies.length; j++) {
						clonedDiv = FontLoader.testDiv.cloneNode(true);
						clonedDiv.setAttribute("data-font-family", this._fontFamiliesArray[i]);
						clonedDiv.setAttribute("data-ref-font-family-index", String(j));
						clonedDiv.style.fontFamily = this._fontFamiliesArray[i] + ", " + FontLoader.referenceFontFamilies[j];
						this._testContainer.appendChild(clonedDiv);
					}
				} else {
					for (j = 0; j < FontLoader.referenceFontFamilies.length; j++) {
						clonedDiv = FontLoader.testDiv.cloneNode(true);
						clonedDiv.setAttribute("data-font-family", this._fontFamiliesArray[i]);
						clonedDiv.setAttribute("data-ref-font-family-index", String(j));
						clonedDiv.style.fontFamily = FontLoader.referenceFontFamilies[j];
						sizeWatcher = new SizeWatcher(clonedDiv, this._testContainer, this, FontLoader.referenceFontFamiliesSizes[j]);
						// The prepareForWatch() and beginWatching() methods will be invoked in separate iterations to
						// reduce number of browser's CSS recalculations.
						sizeWatchers.push(sizeWatcher);
					}
				}
			}
			
			// Append the testContainer after all test elements to minimize DOM insertions
			document.body.appendChild(this._testContainer);
			
			if (isIE) {
				// Make first synchronous check, and then if not all fonts rendered start polling interval
				this._checkSizes();
			} else {
				// We are dividing the prepareForWatch() and beginWatching() methods to optimize browser performance by
				// removing CSS recalculation from each iteration to the end of iterations.
				for (i = 0; i < this._numberOfFontFamilies * FontLoader.referenceFontFamilies.length; i++) {
					sizeWatcher = sizeWatchers[i];
					sizeWatcher.prepareForWatch();
				}
				for (i = 0; i < this._numberOfFontFamilies * FontLoader.referenceFontFamilies.length; i++) {
					sizeWatcher = sizeWatchers[i];
					sizeWatcher.beginWatching();
					// Apply tested font-family
					clonedDiv = sizeWatcher.getWatchedElement();
					clonedDiv.style.fontFamily = clonedDiv.getAttribute("data-font-family") + ", " + FontLoader.referenceFontFamilies[clonedDiv.getAttribute("data-ref-font-family-index")];
				}
			}
		},
		_checkSizes: function() {
			var i, testDiv, currSize, refSize;
			for (i = this._testContainer.childNodes.length - 1; i >= 0; i--) {
				testDiv = this._testContainer.childNodes[i];
				currSize = new Size(testDiv.offsetWidth, testDiv.offsetHeight);
				refSize = FontLoader.referenceFontFamiliesSizes[testDiv.getAttribute("data-ref-font-family-index")];
				if (!refSize.isEqual(currSize)) {
					// Element dimensions changed, this means its font loaded, remove it from testContainer div
					testDiv.parentNode.removeChild(testDiv);
					this._elementSizeChanged(testDiv);
				}
			}
		},
		_elementSizeChanged: function(element) {
			var fontFamily = element.getAttribute("data-font-family");
			
			if (this._finished) {
				return;
			}
			
			// Check that this font wasn't already loaded using one of the default font-families. 
			if (typeof this._fontsMap[fontFamily] === "undefined") {
				return;
			}
			
			this._numberOfLoadedFonts++;
			delete this._fontsMap[fontFamily];
			
			if (this.delegate && typeof this.delegate.fontLoaded === "function") {
				this.delegate.fontLoaded(fontFamily);
			}
			
			if (this._numberOfLoadedFonts === this._numberOfFontFamilies) {
				this._finish();
			}
		},
		_finish: function() {
			var callbackParameter,
				fontFamily,
				notLoadedFontFamilies = [];
			
			if (this._finished) {
				return;
			}
			
			this._finished = true;
			
			if (this._testContainer !== null) {
				this._testContainer.parentNode.removeChild(this._testContainer);
			}
			
			if (this._timeoutId !== null) {
				window.clearTimeout(this._timeoutId);
			}
			
			if (this._intervalId !== null) {
				window.clearInterval(this._intervalId);
			}
			
			if (this._numberOfLoadedFonts < this._numberOfFontFamilies) {
				for (fontFamily in this._fontsMap) {
					if (this._fontsMap.hasOwnProperty(fontFamily)) {
						notLoadedFontFamilies.push(fontFamily);
					}
				}
				callbackParameter = {
					message: "Not all fonts are loaded",
					notLoadedFontFamilies: notLoadedFontFamilies
				};
			} else {
				callbackParameter = null;
			}
			if (this.delegate && typeof this.delegate.fontsLoaded === "function") {
				this.delegate.fontsLoaded(callbackParameter);
			}
		},
		/**
		 * SizeWatcher delegate method
		 * @param {SizeWatcher} sizeWatcher
		 */
		sizeWatcherChangedSize: function(sizeWatcher) {
			this._elementSizeChanged(sizeWatcher.getWatchedElement());
		}
	};
	
	/**
	 * Size object
	 *
	 * @param width
	 * @param height
	 * @constructor
	 */
	function Size(width, height) {
		this.width = width;
		this.height = height;
	}
	
	/**
	 * Compares receiver object to passed in size object.
	 * 
	 * @param otherSize
	 * @returns {boolean}
	 */
	Size.prototype.isEqual = function(otherSize) {
		return (this.width === otherSize.width && this.height === otherSize.height);
	};
	
	/**
	 * SizeWatcher observes size of an element and notifies when its size is changed. It doesn't use any timeouts
	 * to check the element size, when change in size occurs a callback method immediately invoked.
	 * 
	 * To watch for element's size changes the element, and other required elements are appended to a container element
	 * you specify, and which must be added to the DOM tree before invoking prepareForWatch() method. Your container
	 * element should be positioned outside of client's visible area. Therefore you shouldn't use SizeWatcher to watch
	 * for size changes of elements used for UI.
	 * Such container element could be a simple <div> that is a child of the <body> element:
	 * <div style="position:absolute; left:-10000px; top:-10000px;"></div>
	 * 
	 * You must invoke SizeWatcher's methods in a specific order to establish size change listeners:
	 * 
	 * 1. Create SizeWatcher instance by invoke SizeWatcher constructor passing the element (size of which you want to
	 *    observe), the container element, the delegate object and optional size parameter of type Size which should be
	 *    the pre-calculated initial size of your element.
	 * 4. Invoke prepareForWatch() method. This method will calculate element size if you didn't passed it to the constructor.
	 * 5. Invoke beginWatching() method. This method will set event listeners and invoke your delegate's method once
	 *    element size changes. 
	 * 
	 * Failing to invoke above methods in their predefined order will throw an exception.
	 * 
	 * @param {HTMLElement} element An element, size of which will be observed for changes.
	 * @param {HTMLElement} container An element to which special observing elements will be added. Must be in DOM tree
	 *                      when prepareForWatch() method is called.
	 * @param {Object}      delegate A delegate object
	 * @param {Function}    delegate.sizeWatcherChangedSize A delegate object's method which will be invoked, in context
	 *                      of the delegate object, when change in size occurs. This method is invoked with single
	 *                      parameter which is the current SizeWatcher instance.
	 * @param {Size}        [size] The pre-calculated initial size of your element. When passed, the element is not
	 *                      asked for offsetWidth and offsetHeight, which may be useful to reduce browser's CSS
	 *                      recalculations. If you will not pass the size parameter then its size calculation will be
	 *                      deferred to prepareForWatch() method.
	 * @constructor
	 */
	function SizeWatcher(element, container, delegate, size) {
		this._element = element;
		this._delegate = delegate;
		this._size = null;
		this._disposable = true;
		this._sizeIncreaseWatcherContentElm = null;
		this._sizeDecreaseWatcherElm = null;
		this._sizeIncreaseWatcherElm = null;
		this._state = SizeWatcher.states.initialized;
		
		this._generateScrollWatchers(size);
		this._appendScrollWatchersToElement(container);
	}
	
	SizeWatcher.states = {
		initialized: 0,
		generatedScrollWatchers: 1,
		appendedScrollWatchers: 2,
		preparedScrollWatchers: 3,
		watchingForSizeChange: 4,
		disposed: 6
	};
	
	SizeWatcher.prototype = {
		constructor: SizeWatcher,
		getWatchedElement: function() {
			return this._element;
		},
		setSize: function(size) {
			this._size = size;
			this._sizeIncreaseWatcherContentElm.style.cssText = "width: " + (size.width + 1) + "px; height: " + (size.height + 1) + "px;";
			this._sizeDecreaseWatcherElm.style.cssText = "position:absolute; left: 0px; top: 0px; overflow: hidden; width: " + (size.width - 1) + "px; height: " + (size.height - 1) + "px;";
		},
		_generateScrollWatchers: function(size) {
			this._sizeIncreaseWatcherContentElm = document.createElement("div");
			
			this._sizeIncreaseWatcherElm = document.createElement("div");
			this._sizeIncreaseWatcherElm.style.cssText = "position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden;";
			this._sizeIncreaseWatcherElm.appendChild(this._sizeIncreaseWatcherContentElm);
			
			this._element.style.position = "absolute";
			this._element.appendChild(this._sizeIncreaseWatcherElm);
			
			this._sizeDecreaseWatcherElm = document.createElement("div");
			this._sizeDecreaseWatcherElm.appendChild(this._element);
			
			if (size) {
				this.setSize(size);
			}
			
			this._state = SizeWatcher.states.generatedScrollWatchers;
		},
		_appendScrollWatchersToElement: function(container) {
			if (this._state !== SizeWatcher.states.generatedScrollWatchers) {
				throw new Error("SizeWatcher._appendScrollWatchersToElement() was invoked before SizeWatcher._generateScrollWatchers()");
			}
			
			container.appendChild(this._sizeDecreaseWatcherElm);
			
			this._state = SizeWatcher.states.appendedScrollWatchers;
		},
		prepareForWatch: function() {
			var parentNode;
			
			if (this._state !== SizeWatcher.states.appendedScrollWatchers) {
				throw new Error("SizeWatcher.prepareForWatch() invoked before SizeWatcher._appendScrollWatchersToElement()");
			}
			
			if (this._size === null) {
				this.setSize(new Size(this._element.offsetWidth, this._element.offsetHeight));
			}
			
			this._sizeDecreaseWatcherElm.scrollTop = 1;
			this._sizeDecreaseWatcherElm.scrollLeft = 1;
			
			this._sizeIncreaseWatcherElm.scrollTop = 1;
			this._sizeIncreaseWatcherElm.scrollLeft = 1;
			
			// Check if scroll positions updated.
			if (this._sizeDecreaseWatcherElm.scrollTop === 0
				|| this._sizeDecreaseWatcherElm.scrollLeft === 0
				|| this._sizeIncreaseWatcherElm.scrollTop === 0
				|| this._sizeIncreaseWatcherElm.scrollLeft === 0) {
				
				// Traverse tree to the top node to see if watcher elements are in the DOM tree.
				parentNode = this._sizeDecreaseWatcherElm.parentNode;
				while (parentNode !== window.document && parentNode !== null) {
					parentNode = parentNode.parentNode;
				}
				
				if (parentNode === null) {
					throw new Error("Can't set scroll position of scroll watchers. SizeWatcher is not in the DOM tree.");
				} else if (console && typeof console.warn === "function") {
					console.warn("SizeWatcher can't set scroll position of scroll watchers.");
				}
			}
			
			this._state = SizeWatcher.states.preparedScrollWatchers;
		},
		beginWatching: function() {
			if (this._state !== SizeWatcher.states.preparedScrollWatchers) {
				throw new Error("SizeWatcher.beginWatching() invoked before SizeWatcher.prepareForWatch()");
			}
			
			this._sizeDecreaseWatcherElm.addEventListener("scroll", this, false);
			this._sizeIncreaseWatcherElm.addEventListener("scroll", this, false);
			
			this._state = SizeWatcher.states.watchingForSizeChange;
		},
		endWatching: function() {
			if (this._state !== SizeWatcher.states.watchingForSizeChange) {
				throw new Error("SizeWatcher.endWatching() invoked before SizeWatcher.beginWatching()");
			}
			
			this._sizeDecreaseWatcherElm.removeEventListener("scroll", this, false);
			this._sizeIncreaseWatcherElm.removeEventListener("scroll", this, false);
			this._state = SizeWatcher.states.preparedScrollWatchers;
		},
		/**
		 * @private
		 */
		handleEvent: function(event) {
			var newSize, oldSize;
			
			// This is not suppose to happen because when we set state to disposed we also remove scroll listeners.
			// But just in case some browser will fire second scroll event which happened before listener was removed do this check.
			if (this._state === SizeWatcher.states.disposed) {
				return;
			}
			
			newSize = new Size(this._element.offsetWidth, this._element.offsetHeight);
			oldSize = this._size;
			
			// Check if element size is changed. How come that element size isn't changed but scroll event fired?
			// This can happen in two cases: when double scroll occurs or immediately after calling prepareForWatch()
			// (event if scroll event listeners attached after it).
			// The double scroll event happens when one size dimension (e.g.:width) is increased and another
			// (e.g.:height) is decreased.
			if (oldSize.isEqual(newSize)) {
				return;
			}
			
			if (this._delegate && typeof this._delegate.sizeWatcherChangedSize === "function") {
				this._delegate.sizeWatcherChangedSize(this);
			}
			
			if (this._disposable) {
				this.endWatching();
				this._state = SizeWatcher.states.disposed;
			} else {
				// Set the new size so in case of double scroll event we won't cause the delegate method to be executed twice.
				this.setSize(newSize);
				// change state so prepareFowWatch() won't throw exception about wrong order invocation.
				this._state = SizeWatcher.states.appendedScrollWatchers;
				// Run prepareForWatch to reset the scroll watchers, we have already set the size
				this.prepareForWatch();
				// Set state to listeningForSizeChange, there is no need to invoke beginWatching() method as scroll event
				// listeners and callback are already set.
				this._state = SizeWatcher.states.watchingForSizeChange;
				
			}
		}
	};
	
}).apply(window);