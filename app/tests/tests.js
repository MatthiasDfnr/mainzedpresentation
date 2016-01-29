"use strict";

QUnit.module("Reader", {
    beforeEach: function() {
        // prepare something for all following tests
        this.reader = new Reader();
    },
    afterEach: function() {
        // clean up after each test
    }
});

QUnit.test("getNextSymbol test", function(assert)  {

    var testString = "## This is the title [note] This is the body of the slide!";
    var result = this.reader.getNextSymbol(testString);

    assert.equal(result, "header2");

    testString = "## This is the title";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "header2");

    testString = "[note] This is the title";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "normaltext");

    testString = "[note] This is the title ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "normaltext");

    testString = "[big] This is the title ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "bigtext");

    testString = "* This is a list element ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "listelement");

    // doube titles
    testString = "## This is the title ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "header2");

    // added whitespace
    testString = " ## This is the title ## whatever ";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "header2");

    // added whitespace
    testString = "[image] (bild.jpg, 'caption', 'reference') ## whatever ";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "image");

    // empty
    testString = "";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, undefined);

    // empty
    testString = " hello";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, undefined);

    // allow hashtags when no space after #
    testString = "This is a normal text with a #hashtag!";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, undefined);
});

QUnit.test("getNextString test", function(assert)  {
    var testString = "## This is the title [note] This is the body of the slide!";
    var nextSymbol = this.reader.getNextSymbol(testString);
    var result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "This is the title");

    testString = "[note] This is the body! ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "This is the body!");

    testString = "[big] This is the big body! ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "This is the big body!");

    testString = "[image] (bild.jpg, 'caption', 'reference') ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "(bild.jpg, 'caption', 'reference')");
});

QUnit.test("getNextElement test", function(assert)  {
    var testString;
    var nextSymbol;
    var element;

    // header 2 element
    testString = "## This is the title [note] This is the body of the slide!";
    nextSymbol = this.reader.getNextSymbol(testString);
    element = this.reader.getNextElement(testString, nextSymbol);
    assert.equal(element.style, "header2");
    assert.equal(element.text, "This is the title");

    // normaltext element
    testString = "[note] This is the body! ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    element = this.reader.getNextElement(testString, nextSymbol);
    assert.equal(element.style, "normaltext");
    assert.equal(element.text, "This is the body!");

    // normaltext element
    testString = "[image] (koala.jpg, this is a caption, https://reference.com) ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    element = this.reader.getNextElement(testString, nextSymbol);
    assert.equal(element.style, "image");
    assert.equal(element.url, "koala.jpg");
    assert.equal(element.reference, "https://reference.com");

    /*
    testString = "[note] This is the body! ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "This is the body!");

    testString = "[big] This is the big body! ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "This is the big body!");

    testString = "[image] (bild.jpg, 'caption', 'reference') ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "(bild.jpg, 'caption', 'reference')");
    */
});

QUnit.test("getRestString test", function(assert)  {
    var testString = "## This is the title [note] This is the body of the slide!";
    var nextSymbol = this.reader.getNextSymbol(testString);
    assert.equal(nextSymbol, "header2");  // ## +
    var nextString = this.reader.getNextString(testString, nextSymbol);
    assert.equal(nextString, "This is the title");
    var restString = this.reader.getRestString(testString, nextSymbol, nextString);
    assert.equal(restString, "[note] This is the body of the slide!");

    testString = "[big] This is the title [note] This is the body of the slide! ## ueberschrift";
    nextSymbol = this.reader.getNextSymbol(testString);
    assert.equal(nextSymbol, "bigtext");  // ## +
    nextString = this.reader.getNextString(testString, nextSymbol);
    assert.equal(nextString, "This is the title");
    restString = this.reader.getRestString(testString, nextSymbol, nextString);
    assert.equal(restString, "[note] This is the body of the slide! ## ueberschrift");

    testString = "[image] bild.jpg ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);
    assert.equal(nextSymbol, "image");  // ## +
    nextString = this.reader.getNextString(testString, nextSymbol);
    assert.equal(nextString, "bild.jpg");
    restString = this.reader.getRestString(testString, nextSymbol, nextString);
    assert.equal(restString, "## This is the title ", "image ok");

    // with italics
    /*
    testString = "[big] This is big text *This is in italics";
    nextSymbol = this.reader.getNextSymbol(testString);
    nextString = this.reader.getNextString(testString, nextSymbol);
    restString = this.reader.getRestString(testString, nextSymbol, nextString);

    assert.equal(restString, "[note] This is the body of the slide! ## ueberschrift");*/
});

QUnit.test("getRestString following strings test", function(assert)  {
    var testString = "## This is the title [note] This is the body of the slide! [note] another body text";
    var nextSymbol = this.reader.getNextSymbol(testString);
    var nextString = this.reader.getNextString(testString, nextSymbol);
    var restString = this.reader.getRestString(testString, nextSymbol, nextString);
    assert.equal(restString, "[note] This is the body of the slide! [note] another body text");

    testString = restString;
    nextSymbol = this.reader.getNextSymbol(testString);
    assert.equal(nextSymbol, "normaltext");
    nextString = this.reader.getNextString(testString, nextSymbol);
    assert.equal(nextString, "This is the body of the slide!");
    restString = this.reader.getRestString(testString, nextSymbol, nextString);
    assert.equal(restString, "[note] another body text");

    testString = restString;
    nextSymbol = this.reader.getNextSymbol(testString);
    assert.equal(nextSymbol, "normaltext");
    nextString = this.reader.getNextString(testString, nextSymbol);
    assert.equal(nextString, "another body text");
    restString = this.reader.getRestString(testString, nextSymbol, nextString);
    assert.equal(restString, undefined, "correctly returned undefined!");
});

QUnit.test("readSlideMarkdown test", function(assert)  {
    var testString = "## This is the title [note] This is the body of the slide! [note] another body text [image] (bild.jpg, caption, reference)";
    var expected = {
        0: {
            style: "header2",
            text: "This is the title"
        },
        1: {
            style: "normaltext",
            text: "This is the body of the slide!"
        },
        2: {
            style: "normaltext",
            text: "another body text"
        },
        3: {
            style: "image",
            url: "bild.jpg",
            caption: "caption",
            reference: "reference"
        }
    };
    var result = this.reader.readSlideMarkdown(testString);

    assert.equal(JSON.stringify(result), JSON.stringify(expected), "returned correct object!");
});

QUnit.test("detectNormaltext test", function(assert)  {
    var testString = "## This is the title \nThis is the body of the slide! \n[note] another body text \n[image] (bild.jpg, caption, reference)";
    var expected = "## This is the title \n[note] This is the body of the slide! \n[note] another body text \n[image] (bild.jpg, caption, reference)";
    var result = this.reader.detectNormaltext(testString, "\n");

    assert.equal(JSON.stringify(result), JSON.stringify(expected), "returned correct object!");
});

QUnit.test("read test", function(assert)  {
    var testString = "# This is the title --- [note] This is the body of the slide!";
    var expected = {
        "1": {
            0: {
                style: "header1",
                text: "This is the title"
            }
        } ,
        "2": {
            0: {
                style: "normaltext",
                text: "This is the body of the slide!"
            }
        }
    };
    var result = this.reader.read(testString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));

    testString = "# This is the title [big] more text --- [note] This is the body of the slide! ## ueberschrift --- [note] more";
    expected = {
        "1": {
            0: {
                style: "header1",
                text: "This is the title"
            },
            1: {
                style: "bigtext",
                text: "more text"
            }
        },
        "2": {
            0: {
                style: "normaltext",
                text: "This is the body of the slide!"
            },
            1: {
                style: "header2",
                text: "ueberschrift"
            }
        },
        "3": {
            0: {
                style: "normaltext",
                text: "more"
            }
        }
    };
    result = this.reader.read(testString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
});

QUnit.test("list tests", function(assert)  {
    var testString;
    var expected;
    var result;

    testString = "# This is the title --- * list element!";
    expected = {
        "1": {
            0: {
                style: "header1",
                text: "This is the title"
            }
        },
        "2": {
            0: {
                style: "singlelistelement",
                text: "list element!"
            }
        }
    };
    result = this.reader.read(testString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected), "standalone list works!");

    testString = "* first element * second element";
    expected = {
        "1": {
            0: {
                style: "startlistelement",
                text: "first element"
            },
            1: {
                style: "endlistelement",
                text: "second element"
            }
        }
    };
    result = this.reader.read(testString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected), "start and end works!");

    testString = "## subtitle * first element * second element * third element # title";
    expected = {
        "1": {
            0: {
                style: "header2",
                text: "subtitle"
            },
            1: {
                style: "startlistelement",
                text: "first element"
            },
            2: {
                style: "listelement",
                text: "second element"
            },
            3: {
                style: "endlistelement",
                text: "third element"
            },
            4: {
                style: "header1",
                text: "title"
            }
        }
    };
    result = this.reader.read(testString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected), "normal listelement end works!");
});

QUnit.test("multiline for single slide", function(assert)  {

    var multiLineString = [
        "## title on the very first slide",
        "",
        "[note] normal text on the first slide"
    ].join('\n');

    var expected = {
        "1": {
            0: {
                style: "header2",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "normal text on the first slide"
            }
        }
    };

    var result = this.reader.read(multiLineString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
});

QUnit.test("multiline for multiple slides", function(assert)  {

    var multiLineString = [
        "# title on the very first slide",
        "",
        "[note] normal text on the first slide",
        "",
        "---",
        "",
        "## title on the second slide",
        "",
        "[big] big text on the second slide"
    ].join('\n');

    var expected = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "normal text on the first slide"
            }
        },
        "2": {
            0: {
                style: "header2",
                text: "title on the second slide"
            },
            1: {
                style: "bigtext",
                text: "big text on the second slide"
            }
        }
    };

    var result = this.reader.read(multiLineString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
});

QUnit.test("complex markdown for multiple slides", function(assert)  {

    var multiLineString = [
        "[big] digitalität und diversität",
        "",
        "---",
        "",
        "## title on 2nd slide!",
        "",
        "first paragraph on 2nd slide",
        "",
        "second paragraph on 2nd slide",
        "",
        "[image] (Koala.gif, caption, reference)",
        "",
        "[note] last paragraph on 2nd slide",
        "",
        "---",
        "",
        "## title on 3nd slide!",
        "",
        "only paragraph on 2nd slide",
        "",
        "## another title on 3nd slide!",
        "",
        "---",
        "",
        "## title on 4th slide!",
        "",
        "[note] some text above the image",
        "[image] (Koala23.jpg, caption, reference)",
        "some text below the image",
        "",
        "---",
        "",
        "[big] big text on the last slide"
    ].join("\n");

    var expected = {
        "1": {
            0: {
                style: "bigtext",
                text: "digitalität und diversität"
            }
        },
        "2": {
            0: {
                style: "header2",
                text: "title on 2nd slide!"
            },
            1: {
                style: "normaltext",
                text: "first paragraph on 2nd slide"
            },
            2: {
                style: "normaltext",
                text: "second paragraph on 2nd slide"
            },
            3: {
                style: "image",
                url: "Koala.gif",
                caption: "caption",
                reference: "reference"
            },
            4: {
                style: "normaltext",
                text: "last paragraph on 2nd slide"
            }
        },
        "3": {
            0: {
                style: "header2",
                text: "title on 3nd slide!"
            },
            1: {
                style: "normaltext",
                text: "only paragraph on 2nd slide"
            },
            2: {
                style: "header2",
                text: "another title on 3nd slide!"
            }
        },
        "4": {
            0: {
                style: "header2",
                text: "title on 4th slide!"
            },
            1: {
                style: "normaltext",
                text: "some text above the image"
            },
            2: {
                style: "image",
                url: "Koala23.jpg",
                caption: "caption",
                reference: "reference"
            },
            3: {
                style: "normaltext",
                text: "some text below the image"
            }
        },
        "5": {
            0: {
                style: "bigtext",
                text: "big text on the last slide",
            }
        }
    };

    var result = this.reader.read(multiLineString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
});

QUnit.test("$.ajax done", function(assert)  {
    var result;
    var isFirefox = typeof InstallTrigger !== "undefined";
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

    // success
    result = undefined;
    $.ajax({
        url: "files/markdown.txt",
        dataType: "text",
        async: false
    }).done(function() {
        result = "done!";
    });
    assert.equal(result, "done!", "done correct");

    // not found
    result = undefined;
    $.ajax({
        url: "files/notAValidFilePath.txt",
        dataType: "text",
        async: false,
        success: function(data) {
            if (data.length < 1) {
                result = "success, but no data";
            } else {
                result = "success with data";
            }

        },
        error: function() {
            result = "error";
        }
    });
    if (isFirefox) {
        assert.equal(result, "error", "firefox error correct");
    } else {
        assert.equal(result, "success, but no data", "error correct");
    };

});

QUnit.module("Writer", {
    beforeEach: function() {
        // prepare something for all following tests
        this.writer = new Writer();
        this.linebreak = this.writer.LINEBREAK;
    },
    afterEach: function() {
        // clean up after each test
    }
});

QUnit.test("write title", function(assert)  {
    var markdownObject = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            }
        }
    };
    var expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<h1>title on the very first slide</h1>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    var result = this.writer.write(markdownObject);
    assert.equal(result, expected, "returned title html");
});

QUnit.test("write normaltext", function(assert)  {

    // title + normaltext
    var markdownObject = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "the body of the first slide"
            }
        }
    };
    var expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<h1>title on the very first slide</h1>" + this.linebreak +
                 "<p>the body of the first slide</p>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    var result = this.writer.write(markdownObject);
    assert.equal(result, expected, "returned normaltext html");
});

QUnit.test("write bigtext", function(assert)  {

    // title + normaltext + bigtext + normaltext
    var markdownObject = {
        "1": {
            0: {
                style: "header3",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "the body of the first slide"
            },
            2: {
                style: "bigtext",
                text: "some big text"
            },
            3: {
                style: "normaltext",
                text: "the 2nd body"
            }
        }
    };
    var expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<h3>title on the very first slide</h3>" + this.linebreak +
                 "<p>the body of the first slide</p>" + this.linebreak +
                 "<p class='bigtext'>some big text</p>" + this.linebreak +
                 "<p>the 2nd body</p>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    var result = this.writer.write(markdownObject);
    assert.equal(result, expected, "returned bigtext html");
});

QUnit.test("write image", function(assert)  {
    var markdownObject;
    var expected;
    var result;

    // no caption
    markdownObject = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "the body of the first slide"
            },
            2: {
                style: "image",
                url: "Koala.jpg",
                caption: "",
                reference: "some reference"
            },
            3: {
                style: "normaltext",
                text: "the 2nd body"
            }
        }
    };
    expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<h1>title on the very first slide</h1>" + this.linebreak +
                 "<p>the body of the first slide</p>" + this.linebreak +
                 "<img src='Koala.jpg' />" + this.linebreak +
                 "<p>the 2nd body</p>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    result = this.writer.write(markdownObject);
    assert.equal(result, expected, "image without caption");

    // with caption
    markdownObject = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "the body of the first slide"
            },
            2: {
                style: "image",
                url: "Koala.jpg",
                caption: "Caption this!",
                reference: "some reference"
            },
            3: {
                style: "normaltext",
                text: "the 2nd body"
            }
        }
    };
    expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<h1>title on the very first slide</h1>" + this.linebreak +
                 "<p>the body of the first slide</p>" + this.linebreak +
                 "<figure>" + this.linebreak +
                 "<img src='Koala.jpg' />" + this.linebreak +
                 "<figcaption>Caption this!</figcaption>" + this.linebreak +
                 "</figure>" + this.linebreak +
                 "<p>the 2nd body</p>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    result = this.writer.write(markdownObject);
    assert.equal(result, expected, "image with caption");
});

QUnit.test("write lists", function(assert)  {

    var markdownObject;
    var expected;
    var result;

    // standalone lists
    markdownObject = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            },
            1: {
                style: "singlelistelement",
                text: "standalone list element"
            },
            2: {
                style: "normaltext",
                text: "some normal text"
            }
        }
    };
    expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<h1>title on the very first slide</h1>" + this.linebreak +
                 "<ul>" + this.linebreak +
                    "<li>standalone list element</li>" + this.linebreak +
                 "</ul>" + this.linebreak +
                 "<p>some normal text</p>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    result = this.writer.write(markdownObject);
    assert.equal(result, expected, "standalone lists work!");

    // start and end list
    markdownObject = {
        "1": {
            0: {
                style: "startlistelement",
                text: "start"
            },
            1: {
                style: "endlistelement",
                text: "end"
            }
        }
    };
    expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<ul>" + this.linebreak +
                    "<li>start</li>" + this.linebreak +
                    "<li>end</li>" + this.linebreak +
                 "</ul>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    result = this.writer.write(markdownObject);
    assert.equal(result, expected, "start and end lists work!");

    // normal list
    markdownObject = {
        "1": {
            0: {
                style: "startlistelement",
                text: "start"
            },
            1: {
                style: "listelement",
                text: "middle"
            },
            2: {
                style: "listelement",
                text: "middle"
            },
            3: {
                style: "endlistelement",
                text: "end"
            }
        }
    };
    expected = "<div class='slide' id='slide1'>" + this.linebreak +
                 "<ul>" + this.linebreak +
                    "<li>start</li>" + this.linebreak +
                    "<li>middle</li>" + this.linebreak +
                    "<li>middle</li>" + this.linebreak +
                    "<li>end</li>" + this.linebreak +
                 "</ul>" + this.linebreak +
               "</div>" + this.linebreak + this.linebreak;
    result = this.writer.write(markdownObject);
    assert.equal(result, expected, "normal lists work!");
});

QUnit.test("write multiple slides", function(assert)  {

    // title + normaltext + bigtext + normaltext
    var markdownObject = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "the body of the first slide"
            },
            2: {
                style: "image",
                url: "Koala.jpg",
                caption: "",
                reference: ""
            },
            3: {
                style: "normaltext",
                text: "the 2nd body"
            }
        },
        "2": {
            0: {
                style: "bigtext",
                text: "some text on the 2nd slide"
            },
            1: {
                style: "image",
                url: "Koala1.jpg",
                caption: "",
                reference: ""
            },
            2: {
                style: "image",
                url: "Koala2.jpg",
                caption: "",
                reference: ""
            },
            3: {
                style: "normaltext",
                text: "text below the two images"
            }
        }
    };
    var expected = "<div class='slide' id='slide1'>" + this.linebreak +
                     "<h1>title on the very first slide</h1>" + this.linebreak +
                     "<p>the body of the first slide</p>" + this.linebreak +
                     "<img src='Koala.jpg' />" + this.linebreak +
                     "<p>the 2nd body</p>" + this.linebreak +
                   "</div>" + this.linebreak + this.linebreak +
                   "<div class='slide' id='slide2'>" + this.linebreak +
                     "<p class='bigtext'>some text on the 2nd slide</p>" + this.linebreak +
                     "<img src='Koala1.jpg' />" + this.linebreak +
                     "<img src='Koala2.jpg' />" + this.linebreak +
                     "<p>text below the two images</p>" + this.linebreak +
                   "</div>" + this.linebreak + this.linebreak;
    var result = this.writer.write(markdownObject);
    assert.equal(result, expected, "returned multiple slides html");
});

QUnit.test("write table of content", function(assert)  {

    // title + normaltext + bigtext + normaltext
    var markdownObject = {
        "1": {
            0: {
                style: "header1",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "the body of the first slide"
            }
        },
        "2": {
            0: {
                style: "header1",
                text: "first title on 2nd slide"
            },
            1: {
                style: "image",
                url: "Koala1.jpg",
                caption: "",
                reference: ""
            },
            2: {
                style: "header2",
                text: "second title on 2nd slide"
            },
            3: {
                style: "normaltext",
                text: "some more text"
            }
        },
        "3": {
            0: {
                style: "header1",
                text: "title on the third slide"
            }
        },
        "4": {
            0: {
                style: "header1",
                text: "title on the last slide"
            }
        }
    };
    var expected = "<div id='content'>" + this.linebreak +
                        "<ul>" + this.linebreak +
                            "<li><a href='#slide1'>title on the very first slide 1</a></li>" + this.linebreak +
                            "<li><a href='#slide2'>first title on 2nd slide 2</a></li>" + this.linebreak +
                            "<li><a href='#slide2'>second title on 2nd slide 2</a></li>" + this.linebreak +
                            "<li><a href='#slide3'>title on the third slide 3</a></li>" + this.linebreak +
                            "<li><a href='#slide4'>title on the last slide 4</a></li>" + this.linebreak +
                        "</ul>" + this.linebreak +
                   "</div>" + this.linebreak + this.linebreak;
    var result = this.writer.writeTableOfContent(markdownObject);
    assert.equal(result, expected, "returned content html");
});

QUnit.module("DOM", {
    beforeEach: function() {

        this.reader = new Reader();

        // get markdown
        var markdown;
        $.ajax({
            url: "files/markdown.txt",
            dataType: "text",
            async: false,
            success: function(data) {
                markdown = data;
            }
        });

        // convert to markdownObject
        var markdownObject = this.reader.read(markdown);

        // write html
        this.writer = new Writer();
        //this.linebreak = this.writer.LINEBREAK;
        //linebreaks not needed -> will be converted to \n in DOM

        var generatedHtml = this.writer.write(markdownObject);

        // append generated html to specific div that is not visible
        $("body").append("<div id='domtest'></div>");
        //$("#domtest").hide();
        $("#domtest").append(generatedHtml);

    },
    afterEach: function() {
        $("#domtest").remove();
    }
});

QUnit.test("test DOM elements", function(assert)  {
    var expect;
    var result;

    // slide 1
    expect = '\n<p class="bigtext">digitalität und diversität</p>\n';
    result = $("#slide1").html();
    assert.equal(result, expect, "#slide1 correct");

    // slide 2
    expect = '\n<h1>title on 2nd slide!</h1>\n' +
                '<p>first paragraph on 2nd slide</p>\n' +
                '<p>second paragraph on 2nd slide</p>\n' +
                '<p>third paragraph on 2nd slide</p>\n' +
                '<p>last paragraph on 2nd slide</p>\n';
    result = $("#slide2").html();
    assert.equal(result, expect, "#slide2 correct");

    // slide 3
    expect = '\n<h1>title on 3rd slide!</h1>\n' +
                '<p>paragraph on 3rd slide</p>\n' +
                '<ul>\n' +
                    '<li>first list element</li>\n' +
                    '<li>second list element</li>\n' +
                    '<li>third list element</li>\n' +
                '</ul>\n' +
                '<h2>subtitle on 3rd slide!</h2>\n';
    result = $("#slide3").html();
    assert.equal(result, expect, "#slide3 correct");

    // slide 4
    expect = '\n<h1>title on 4th slide!</h1>\n' +
                '<p>some text above the image</p>\n' +
                '<figure>\n' +
                '<img src="Koala.jpg">\n' +
                '<figcaption>caption this!</figcaption>\n' +
                '</figure>\n' +
                '<p>some text below the image</p>\n';
    result = $("#slide4").html();
    assert.equal(result, expect, "#slide4 correct");
});
