FontLoader
==========

FontLoader class detects and notifies when specified font-families loaded and rendered by the browser.

The `FontLoader(fontFamiliesArray, delegate, timeout)` constructor receives three parameters:

1. Array of font-family strings.
2. Delegate object with two optional callback methods: `fontLoaded()` and `fontsLoaded()`.
3. Optional number with a timeout (if not specified no timeout set).

More info on how `FontLoader` works can be found [here](http://smnh.me/web-font-loading-detection-without-timers/).

Example
=======

```javascript
var fontLoader = new FontLoader(["font family 1", "font family 2", "font family 3"], {
    "fontLoaded": function(fontFamily) {
		console.log("font loaded: " + fontFamily);
	},
    "fontsLoaded": function(error) {
        if (error !== null) {
            // Reached the timeout but not all fonts were loaded
            console.log(error.message);
            console.log(error.notLoadedFontFamilies);
        } else {
            // All fonts were loaded
        }
	}
}, 3000);
fontLoader.loadFonts();
```
