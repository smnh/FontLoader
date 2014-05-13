FontLoader
==========

The FontLoader detects and notifies when fonts of the specified font-families loaded and rendred without using any timeouts to poll for element dimensions like it is done traditionally. Instead it utilizes the "scroll" event to receive an instantaneous notification when element size is changed. In IE10 and lower it uses "onresize" event which brings a similar result. In addition it utilizes [AdobeBlank][1] font to eliminate known issues related to [metric compatible fonts][2].

More info on how the FontLoader works can be found [here][3].

The FontLoader receives an array of font-families and notifies the `delegate` object via `fontLoaded` and `fontsLoaded` methods when specific or all fonts were loaded respectively. The FontLoader does not load the fonts, the insertion of specified font-families into the document should be done elsewhere.

The `FontLoader(fontFamiliesArray, delegate, timeout)` constructor receives three parameters:

1. `fontFamiliesArray` Array of font-family strings.
2. `delegate` The delegate object with two optional methods, `fontLoaded(fontFamily)` and `fontsLoaded(error)`, that will be invoked in the context of the delegate object.
3. `timeout` Optional timeout in milliseconds, default is 3000. Pass `null` to disable the timeout.

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
            font-style: normal;
            font-weight: 400;
            src:  url(path/to/MyOtherFont.woff) format('woff');
        }
    </style>
</head>
<body>
    <script type="text/javascript" src="FontLoader.js"></script>
    <script type="text/javascript">
        var fontLoader = new FontLoader(["MyFont", "MyOtherFont"], {
            "fontsLoaded": function(error) {
                if (error !== null) {
                    // Reached the timeout but not all fonts were loaded
                    console.log(error.message);
                    console.log(error.notLoadedFontFamilies);
                } else {
                    // All fonts were loaded
                    console.log("all fonts were loaded");
                }
            },
            "fontLoaded": function(fontFamily) {
                // One of the fonts was loaded
                console.log("font loaded: " + fontFamily);
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
