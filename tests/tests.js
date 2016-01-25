
QUnit.module("Reader Single Line Tests", {
    beforeEach: function() {
        // prepare something for all following tests
        this.reader = new Reader();

        // to be still able to use $.get instead of $.ajax
        jQuery.ajaxSetup({async:false});

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

    // doube titles
    testString = "## This is the title ## whatever";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "title");

    // added whitespace
    testString = " ## This is the title ## whatever ";
    result = this.reader.getNextSymbol(testString);
    assert.equal(result, "title");

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
    var testString = "## This is the title [note] This is the body of the slide! [note] another body text";
    var expected = {
        "This is the title": "title", 
        "This is the body of the slide!": "normaltext", 
        "another body text": "normaltext"
    }; 
    var result = this.reader.readSlideMarkdown(testString);
    
    assert.equal(JSON.stringify(result), JSON.stringify(expected), "returned correct object!");
});

QUnit.test("read test", function(assert)  {
    var testString = "## This is the title --- [note] This is the body of the slide!";
    var expected = {
        "1": {
            "This is the title": "title"   
        } ,
        "2": {
            "This is the body of the slide!": "normaltext"    
        }
    }; 
    var result = this.reader.read(testString);    
    assert.equal(JSON.stringify(result), JSON.stringify(expected));

    testString = "## This is the title [big] more text --- [note] This is the body of the slide! ## ueberschrift --- [note] more";
    expected = {
        "1": {
            "This is the title": "title",
            "more text": "bigtext"   
        } ,
        "2": {
            "This is the body of the slide!": "normaltext",
            "ueberschrift": "title"    
        },
        "3": {
            "more": "normaltext"
        }
    }; 
    result = this.reader.read(testString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
});

QUnit.module("Reader Multi Line Tests", {
    beforeEach: function() {
        // prepare something for all following tests
        this.reader = new Reader();

        // to be still able to use $.get instead of $.ajax
        jQuery.ajaxSetup({async:false});

    },
    afterEach: function() {
        // clean up after each test
    }
});

QUnit.test("multiline for single slide", function(assert)  {

    var multiLineString = [
        "## title on the very first slide",
        "",
        "[note] normal text on the first slide"
    ].join('\n');

    var expected = {
        "1": {
            "title on the very first slide": "title",
            "normal text on the first slide": "normaltext"    
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
            "title on the very first slide": "title",
            "normal text on the first slide": "normaltext"    
        },
        "2": {
            "title on the second slide": "title",
            "big text on the second slide": "bigtext"  
        }
    }; 

    var result = this.reader.read(multiLineString);
    assert.equal(JSON.stringify(result), JSON.stringify(expected));
});

    