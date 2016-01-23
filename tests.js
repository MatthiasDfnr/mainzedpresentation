
QUnit.test("getNextSymbol test", function(assert)  {

	var testString = "## This is the title [note] This is the body of the slide!";

	assert.equal(getNextSymbol(testString), "title");

	testString = "## This is the title";
	assert.equal(getNextSymbol(testString), "title");

	testString = "[note] This is the title";
	assert.equal(getNextSymbol(testString), "normaltext");

	testString = "[note] This is the title ## whatever";
	assert.equal(getNextSymbol(testString), "normaltext");

	testString = "[big] This is the title ## whatever";
	assert.equal(getNextSymbol(testString), "bigtext");

	// doube titles
	testString = "## This is the title ## whatever";
	assert.equal(getNextSymbol(testString), "title");

	// added whitespace
	testString = " ## This is the title ## whatever ";
	assert.equal(getNextSymbol(testString), "title");

	// empty
	testString = "";
	assert.equal(getNextSymbol(testString), undefined);

	// empty
	testString = " hello";
	assert.equal(getNextSymbol(testString), undefined);

});

QUnit.test("getNextString test", function(assert)  {
	var testString = "## This is the title [note] This is the body of the slide!";
	var nextSymbol = getNextSymbol(testString);  
    var result = getNextString(testString, nextSymbol);
	assert.equal(result, "This is the title");

	testString = "[note] This is the body! ## This is the title ";
	nextSymbol = getNextSymbol(testString);  
    result = getNextString(testString, nextSymbol);
	assert.equal(result, "This is the body!");

	testString = "[big] This is the big body! ## This is the title ";
	nextSymbol = getNextSymbol(testString);  
    result = getNextString(testString, nextSymbol);
	assert.equal(result, "This is the big body!");
});

QUnit.test("getRestString test", function(assert)  {
	var testString = "## This is the title [note] This is the body of the slide!";
	var nextSymbol = getNextSymbol(testString);  
	assert.equal(nextSymbol, "title");  // ## + 
	var nextString = getNextString(testString, nextSymbol);
	assert.equal(nextString, "This is the title");
	var restString = getRestString(testString, nextSymbol, nextString);
	assert.equal(restString, "[note] This is the body of the slide!");

	testString = "[big] This is the title [note] This is the body of the slide! ## ueberschrift";
	nextSymbol = getNextSymbol(testString);  
	assert.equal(nextSymbol, "bigtext");  // ## + 
	nextString = getNextString(testString, nextSymbol);
	assert.equal(nextString, "This is the title");
	restString = getRestString(testString, nextSymbol, nextString);
	assert.equal(restString, "[note] This is the body of the slide! ## ueberschrift");
});

QUnit.test("getRestString following strings test", function(assert)  {
	var testString = "## This is the title [note] This is the body of the slide! [note] another body text";
	var nextSymbol = getNextSymbol(testString);  
	var nextString = getNextString(testString, nextSymbol);
	var restString = getRestString(testString, nextSymbol, nextString);
	assert.equal(restString, "[note] This is the body of the slide! [note] another body text");

	testString = restString;
	nextSymbol = getNextSymbol(testString);  
	assert.equal(nextSymbol, "normaltext");
	nextString = getNextString(testString, nextSymbol);
	assert.equal(nextString, "This is the body of the slide!");
	restString = getRestString(testString, nextSymbol, nextString);
	assert.equal(restString, "[note] another body text");

	testString = restString;
	nextSymbol = getNextSymbol(testString);  
	assert.equal(nextSymbol, "normaltext");
	nextString = getNextString(testString, nextSymbol);
	assert.equal(nextString, "another body text");
	restString = getRestString(testString, nextSymbol, nextString);
	assert.equal(restString, undefined);
});

QUnit.test("readSlideMarkdown test", function(assert)  {
	var testString = "## This is the title [note] This is the body of the slide! [note] another body text";
	var result = readSlideMarkdown(testString); 
	var expected = {
		"This is the title": "title",
		"This is the body of the slide!": "normaltext",
		"another body text": "normaltext"
	};
	assert.equal(result, expected);
	
	testString = "## This is the title ## This is the body of the slide! [big] another body text";
	result = readSlideMarkdown(testString); 
	expected = {
		"This is the title": "title",
		"This is the body of the slide!": "title",
		"another body text": "bigtext"
	};
	assert.equal(result, expected);
});