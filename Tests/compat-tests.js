var output = document.getElementById("output"), startTime = new Date().getTime();

QUnit.config.reorder = false;

function log(msg, cssText) {
    var div = document.createElement("div");
    if (cssText) {
        div.style.cssText = cssText;
    }
    msg = timeDiff() + msg;
    div.innerHTML = msg;
    output.appendChild(div);
}

function timeDiff() {
    var timeDiff = "", sec, ms, diffTimeMs = new Date().getTime() - startTime;
    sec = parseInt(diffTimeMs / 1000);
    ms = diffTimeMs % 1000;
    timeDiff = "[" + sec + ":" + (new Array(4 - ms.toString().length).join("0")) + ms + "] ";
    return timeDiff;
}

function addEvent(elm, event, func) {
    if (elm.addEventListener) {
        log("addEventListener('" + event + "')");
        elm.addEventListener(event, func, false);
    } else if (elm.attachEvent) {
        log("attachEvent('on" + event + "')");
        elm.attachEvent("on" + event, func);
    } else {
        throw new Error("addEvent() was called in a context without event listener support");
    }
}

QUnit.asyncTest("Test 'scroll' event", function() {
    var fixture, wrapper, content, innerWrapper, innerContent, timeout = 200, scrollTimeout = null, wrapperScrollFired = false, innerWrapperScrollFired = false;

    log("Begin 'scroll' event test", "font-weight:bold; text-decoration:underline;");
    QUnit.expect(2);

    innerContent = document.createElement("div");
    innerContent.style.cssText = "height: 200px;";

    innerWrapper = document.createElement("div");
    innerWrapper.style.cssText = "position:absolute; width:100%; height:100%; overflow:hidden;";
    innerWrapper.appendChild(innerContent);

    content = document.createElement("div");
    content.style.cssText = "position:relative; width:100px; height:150px;";
    content.appendChild(innerWrapper);

    wrapper = document.createElement("div");
    wrapper.style.cssText = "position:absolute; top:0; left:0; width:100px; height:100px; overflow:hidden;";
    wrapper.appendChild(content);

    fixture = document.getElementById("qunit-fixture");
    fixture.appendChild(wrapper);

    log("Scroll wrapper to bottom");
    wrapper.scrollTop = wrapper.scrollHeight - wrapper.clientHeight;
    log("wrapper.scrollTop: " + wrapper.scrollTop);

    log("Scroll innerWrapper to bottom");
    innerWrapper.scrollTop = innerWrapper.scrollHeight - innerWrapper.clientHeight;
    log("innerWrapper.scrollTop: " + innerWrapper.scrollTop);

    addEvent(wrapper, "scroll", function() {
        if (content.offsetHeight !== 140) {
            log("wrapper scroll event was fired, but its size wasn't changed yet", "color:OrangeRed;");
            return;
        } else if (wrapperScrollFired) {
            log("wrapper scroll event was fired again", "color:OrangeRed;");
            return;
        }
        wrapperScrollFired = true;
        window.clearTimeout(scrollTimeout);
        scrollTimeout = null;
        log("wrapper scroll event was fired, wrapper.scrollTop: " + wrapper.scrollTop, "color:green;");
        QUnit.ok(true, "wrapper scroll event was fired");
        increaseContentHeight();
    });

    addEvent(innerWrapper, "scroll", function() {
        if (content.offsetHeight !== 160) {
            log("innerWrapper scroll event was fired, but its size wasn't changed yet", "color:OrangeRed;");
            return;
        } else if (innerWrapperScrollFired) {
            log("innerWrapper scroll event was fired again", "color:OrangeRed;");
            return;
        }
        innerWrapperScrollFired = true;
        window.clearTimeout(scrollTimeout);
        scrollTimeout = null;
        log("innerWrapper scroll event was fired, innerWrapper.scrollTop: " + innerWrapper.scrollTop, "color:green;");
        QUnit.ok(true, "innerWrapper scroll event was fired");
        QUnit.start();
    });

    decreaseContentHeight();

    function decreaseContentHeight() {
        scrollTimeout = window.setTimeout(decreaseHeightScrollTimeoutHandler, timeout);
        log("Change content height to 140px");
        content.style.height = "140px";
    }

    function decreaseHeightScrollTimeoutHandler() {
        scrollTimeout = null;
        log("wrapper scroll event was not fired after " + timeout + "ms, wrapper.scrollTop: " + wrapper.scrollTop, "color:red;");
        QUnit.ok(false, "wrapper scroll event was not fired");
        increaseContentHeight();
    }

    function increaseContentHeight() {
        scrollTimeout = window.setTimeout(increaseHeightScrollTimeoutHandler, timeout);
        log("Change content height to 160px");
        content.style.height = "160px";
    }

    function increaseHeightScrollTimeoutHandler() {
        scrollTimeout = null;
        log("innerWrapper scroll event was not fired after " + timeout + "ms, innerWrapper.scrollTop: " + innerWrapper.scrollTop, "color:red;");
        QUnit.ok(false, "innerWrapper scroll event was not fired");
        QUnit.start();
    }
});

QUnit.asyncTest("Test AdobeBlank base64 encoded font", function() {
    var fixture, tester;

    log("Begin AdobeBlank font test", "font-weight:bold; text-decoration:underline;");
    QUnit.expect(1);

    tester = document.createElement("div");
    tester.style.cssText = "float:left; font-family: serif;";
    tester.appendChild(document.createTextNode("Hello World!"));

    fixture = document.getElementById("qunit-fixture");
    fixture.appendChild(tester);

    log("Element size before applying AdobeBlank font: " + tester.offsetWidth + "x" + tester.offsetHeight);
    tester.style.fontFamily = "AdobeBlank";

    window.setTimeout(function() {
        log("Element size after applying AdobeBlank font: " + tester.offsetWidth + "x" + tester.offsetHeight);
        QUnit.strictEqual(tester.offsetWidth, 0, "Width of an element with AdobeBlank font must be 0");
        QUnit.start();
    }, 100);
});

QUnit.asyncTest("Test 'resize' event, (this test should pass for IE10 and lower and should fail in other browsers)", function() {
    var fixture, tester, timeout, resizeTimeout = null, sync = true;

    log("Begin 'resize' event test", "font-weight:bold; text-decoration:underline;");
    QUnit.expect(2);

    timeout = 200;

    tester = document.createElement("div");
    tester.style.cssText = "float:left; font-family:serif;";
    tester.appendChild(document.createTextNode("Hello World!"));

    fixture = document.getElementById("qunit-fixture");
    fixture.appendChild(tester);

    addEvent(tester, "resize", resizeEventHandler);

    changeFontSync();

    function changeFontSync() {
        if (sync) {
            resizeTimeout = window.setTimeout(resizeTimeoutHandler, timeout);
            log("Change font-family to monospace synchronously");
            tester.style.fontFamily = "monospace";
        } else {
            resizeTimeout = window.setTimeout(resizeTimeoutHandler, timeout);
            log("Change font-family to monospace asynchronously");
            window.setTimeout(function() {
                tester.style.fontFamily = "";
            }, 0);
        }
    }

    function finishTest() {
        if (sync) {
            sync = false;
            changeFontSync();
        } else {
            QUnit.start();
        }
    }

    function resizeEventHandler() {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = null;
        log("Resize event was fired", "color:green;");
        QUnit.ok(true, "Resize event was fired " + (sync ? "synchronously" : "asynchronously"));
        finishTest();
    }

    function resizeTimeoutHandler() {
        resizeTimeout = null;
        log("Resize event was not fired after " + timeout + "ms", "color:red;");
        QUnit.ok(false, "Resize event was not fired " + (sync ? "synchronously" : "asynchronously"));
        finishTest();
    }
});