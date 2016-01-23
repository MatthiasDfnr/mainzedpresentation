
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

    testString = symbols.title + " This is the title " + symbols.bigtext + " more text " + symbols.newslide + " " + symbols.normaltext + " This is the body of the slide! " + symbols.title + " ueberschrift " + symbols.newslide + " " + symbols.normaltext + " more";
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
/*
QUnit.test("actual markdown file test", function(assert)  {
    console.log("start test");
    // get text file

    function onSuccess(data) {
        return this.reader.read(data);
    };

    var done = assert.async();
    //var input = $( "#test-input" ).focus();
    var expected = {
        "1": {
            "title on the very first slide": "title",
            "normal text on the first slide": "normaltext",
            "more normal text on the first slide": "normaltext",
            "another title on the first page": "title"  
        },
        "2": {
            "title of the second slide": "title",
            "this is normal text on the second slide": "normaltext",
            "this is some big text on the second slide after the normal text": "bigtext"    
        },
        "3": {
            "this is a title on the third slide": "title",
            "asdasd nur text": "bigtext"
        }
    }; 
    var markdownString = "hm";

    $.ajax({
        url : "markdown.txt",
        type : "get",
        dataType: "text",
        async: false,
        success : function(data) {
            markdownString = data;
        }
    });

    //stop(1000); // wait a second

    var result = this.reader.read(markdownString);

    setTimeout(function() {
        assert.equal(JSON.stringify(result), JSON.stringify(expected));
        done();
    });

});
*/

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

QUnit.test("diverse tests", function(assert)  {

    var multiLineString = [
        "## title on the very first slide",
        "",
        "[note] normal text on the first slide",
        "",
        "[note] more normal text on the first slide",
        "",
        "## another title on the first page",
        "",
        "---",
        "",
        "## title of the second slide",
        "",
        "[note] this is normal text on the second slide",
        "[big] this is some big text on the second slide after the normal text",
        "",
        "---",
        "",
        "## this is a title on the third slide",
        "",
        "[big] asdasd nur text"
    ].join('\n');

    var nextSymbol = this.reader.getNextSymbol(multiLineString);
    assert.equal(nextSymbol, "title");
     
    var nextString = this.reader.getNextString(multiLineString, nextSymbol);
    assert.equal(nextString, "title on the very first slide");

    var restString = this.reader.getRestString(multiLineString, nextSymbol, nextString);
    var expectedString = [
        //"## title on the very first slide",
        "",
        "[note] normal text on the first slide",
        "",
        "[note] more normal text on the first slide",
        "",
        "## another title on the first page",
        "",
        "---",
        "",
        "## title of the second slide",
        "",
        "[note] this is normal text on the second slide",
        "[big] this is some big text on the second slide after the normal text",
        "",
        "---",
        "",
        "## this is a title on the third slide",
        "",
        "[big] asdasd nur text"
    ].join('\n');
    
    assert.equal(restString, expectedString);


});

    