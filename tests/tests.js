
QUnit.module("Reader Tests", {
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

    assert.equal(result, "title");

    testString = "## This is the title";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "title");

    testString = "[note] This is the title";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "normaltext");

    testString = "[note] This is the title ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "normaltext");

    testString = "[big] This is the title ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "bigtext");

    testString = "*This is in italics* ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "italics");

    // doube titles
    testString = "## This is the title ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "title");

    // added whitespace
    testString = " ## This is the title ## whatever ";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "title");

    // added whitespace
    testString = "[image] bild.jpg ## whatever ";
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

    testString = "[image] bild.jpg ## This is the title ";
    nextSymbol = this.reader.getNextSymbol(testString);  
    result = this.reader.getNextString(testString, nextSymbol);
    assert.equal(result, "bild.jpg");
});

QUnit.test("getRestString test", function(assert)  {
    var testString = "## This is the title [note] This is the body of the slide!";
    var nextSymbol = this.reader.getNextSymbol(testString);  
    assert.equal(nextSymbol, "title");  // ## + 
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
    var testString = "## This is the title [note] This is the body of the slide! [note] another body text [image] bild.jpg";
    var expected = {
        0: {
            style: "title", 
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
            text: "bild.jpg"
        }
    }; 
    var result = this.reader.readSlideMarkdown(testString);
    
    assert.equal(JSON.stringify(result), JSON.stringify(expected), "returned correct object!");
});

QUnit.test("read test", function(assert)  {
    var testString = "## This is the title --- [note] This is the body of the slide!";
    var expected = {
        "1": {
            0: {
                style: "title",
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

    testString = "## This is the title [big] more text --- [note] This is the body of the slide! ## ueberschrift --- [note] more";
    expected = {
        "1": {
            0: {
                style: "title",
                text: "This is the title"
            },
            1: {
                style: "bigtext",
                text: "more text"
            }
        } ,
        "2": {
            0: {
                style: "normaltext",
                text: "This is the body of the slide!"
            },
            1: {
                style: "title",
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

QUnit.test("multiline for single slide", function(assert)  {

    var multiLineString = [
        "## title on the very first slide",
        "",
        "[note] normal text on the first slide"
    ].join('\n');

    var expected = {
        "1": {
            0: {
                style: "title",
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
        "## title on the very first slide",
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
                style: "title",
                text: "title on the very first slide"
            },
            1: {
                style: "normaltext",
                text: "normal text on the first slide"
            }
        },
        "2": {
            0: {
                style: "title",
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

/*QUnit.module("markdown ajax tests", {
    beforeEach: function() {
        // prepare something for all following tests
        this.reader = new Reader();

        // to be still able to use $.get instead of $.ajax
        jQuery.ajaxSetup({async:false});

    },
    afterEach: function() {
        // clean up after each test
    }
});*/ 

QUnit.module("Writer Tests", {
    beforeEach: function() {
        // prepare something for all following tests
        this.writer = new Writer();
        this.markdownObject = {
            "1": {
                0: {
                    style: "title",
                    text: "title on the very first slide"
                },
                1: {
                    style: "normaltext",
                    text: "normal text on the first slide"
                }
            },
            "2": {
                0: {
                    style: "title",
                    text: "title on the second slide"
                },
                1: {
                    style: "bigtext",
                    text: "big text on the second slide"
                }
            }
        }; 
    },
    afterEach: function() {
        // clean up after each test
    }
});

QUnit.test("writeElement Tests", function(assert)  {
    var expected;
    var result;

    // title
    expected = "<h1>title on the very first slide</h1>";



    result = this.writer.writeElement(this.markdownObject, 1, 0);
    

    assert.equal(result, expected, "returned title html");

    // normaltext
    expected = "<p>normal text on the first slide</p>";
    result = this.writer.writeElement(this.markdownObject, 1, 1);
    assert.equal(result, expected, "returned normaltext html");

    // bigtext
    expected = "<b>big text on the second slide</b>";
    result = this.writer.writeElement(this.markdownObject, 2, 1);
    assert.equal(result, expected, "returned bigtext html");

});