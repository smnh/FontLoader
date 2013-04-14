FontLoader
==========

The FontLoader detects when web fonts specified in the `fontFamiliesArray` array were loaded and rendered. Then it
notifies the `delegate` object via `fontLoaded` and `fontsLoaded` methods when specific or all fonts were
loaded respectively. The use of this functions implies that the insertion of specified web fonts into the
document is done elsewhere.

The FontLoader detects when web fonts are loaded and ready for display without using any timeouts to poll for element 
dimensions like it is done traditionally (except when used in IE). Instead it utilizes the "scroll" event to receive an
instantaneous notification when element size is changed. In addition it utilizes [AdobeBlank][1] font to eliminate known
issues related to [metric compatible fonts][2].

More info on how `FontLoader` works can be found [here][3].

The `FontLoader(fontFamiliesArray, delegate, timeout)` constructor receives three parameters:

1. `fontFamiliesArray` Array of font-family strings.
2. `delegate` The delegate object with two optional methods which are invoked in the context of the object.
3. `timeout` Optional timeout in milliseconds, default is 3000. Pass "null" to not to set any timeout.

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

[1]: http://blogs.adobe.com/typblography/2013/03/introducing-adobe-blank.html "Introducing Adobe Blank"
[2]: http://en.wikipedia.org/wiki/Typeface#Font_metrics "Font metrics"
[3]: http://smnh.me/web-font-loading-detection-without-timers/ "Web font loading detection, without timers"