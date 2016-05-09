FontLoader
==========

The FontLoader detects and notifies when fonts of the specified font-families loaded and rendered by the browser. This, without using timeouts (when possible) to poll for element dimensions like it is done traditionally. Instead it utilizes the "scroll" event to receive an instantaneous event when element size is changed. In IE10 and lower it uses "onresize" event which brings a similar result. In addition it utilizes [AdobeBlank][1] font to eliminate known issues related to [metric compatible fonts][2].

More info on how the FontLoader works can be found [here][3].

Usage
=====

The FontLoader receives an array of fonts and notifies the `delegate` object via `fontLoaded` and `complete` methods when specific or all fonts were loaded respectively. The FontLoader does not load the fonts, the insertion of specified font-families into the document should be done elsewhere.

The `FontLoader(fonts, delegate, timeout)` constructor receives three parameters:

1. `font` - array of font-family strings with optionally specified variations using [FVD][4] notation, or `FontDescriptor` objects.
2. `delegate` - the delegate object with following optional methods which are invoked in the context of the delegate object:
  * `fontLoaded(font)` - called when one of the specified fonts was loaded with the font itself passed as the `FontDescriptor` object.
  * `complete(error)` -  called when all specified fonts were loaded, in which case the `error` will be `null`. Or when the timeout was reached before all specified fonts were loaded, in which case `error` will be an object with two fields - the `message` string and the `notLoadedFonts` array with all the fonts that weren't loaded as `FontDescriptor` objects.
3. `timeout` - optional timeout in milliseconds, default is 3000. Pass `null` to disable the timeout.

After the `FontLoaded` was instantiated, call `loadFonts` method to begin watching for fonts to load. If some or all fonts were already loaded, the appropriate delegate methods will be invoked as expected.

The `FontDescriptor` object is an object with the following fields:

1. `family` - the font family (e.g.: 'Open Sans')
2. `weight` - the font weight (e.g.: 400)
3. `style` - the font style (e.g.: 'italic')
4. `stretch` - the font stretch (e.g.: 'condensed'), optional

Example
=======

```html
<!DOCTYPE html>
<html>
<head>
    <style type="text/css">
        @font-face {
            font-family: 'MyFont';
            font-style: normal;
            font-weight: 400;
            src:  url(path/to/MyFont.woff) format('woff');
        }
        @font-face {
            font-family: 'MyOtherFont';
            font-style: italic;
            font-weight: 800;
            src:  url(path/to/MyOtherFont.woff) format('woff');
        }
    </style>
</head>
<body>
    <script type="text/javascript" src="FontLoader.js"></script>
    <script type="text/javascript">
        var fontLoader = new FontLoader(["MyFont", "MyOtherFont:i8"], {
            "fontLoaded": function(font) {
                // One of the fonts was loaded
                console.log("font loaded: " + font.family);
            },
            "complete": function(error) {
                if (error !== null) {
                    // Reached the timeout but not all fonts were loaded
                    console.log(error.message);
                    console.log(error.notLoadedFonts);
                } else {
                    // All fonts were loaded
                    console.log("all fonts were loaded");
                }
            }
        }, 3000);
        fontLoader.loadFonts();
    </script>
</body>
</html>
```

[1]: http://blogs.adobe.com/typblography/2013/03/introducing-adobe-blank.html "Introducing Adobe Blank"
[2]: http://en.wikipedia.org/wiki/Typeface#Font_metrics "Font metrics"
[3]: http://smnh.me/web-font-loading-detection-without-timers/ "Web font loading detection, without timers"
[4]: https://github.com/typekit/fvd "Font Variation Description"