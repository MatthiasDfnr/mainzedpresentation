"use strict";

function Reader() {

    // private static
    var symbols = {
        header1: "#",
        header2: "##",
        header3: "###",
        newslide: "---",
        normaltext: "[note]", // gets assigned automatically
        listelement: "*",
        bigtext: "[big]",
        image: "[image]",
        break: "[break]"  // gets assigned automatically
    };

    // holds the element of the last step,
    // e.g. to use when determeming start and end of lists
    this.currentElement = {};

    // private
    Array.min = function( array ){
        return Math.min.apply( Math, array );
    };

    // TODO: implement parameter to select 2nd or 3rd symbol
    // of a string
    Reader.prototype.getNextSymbol = function(string) {

        // record all records
        var resultDict = {};
        for (var key in symbols) {
            var currentSymbol = symbols[key] + " ";

            // add space after symbol -> to allow hashtags
            // this prevents markdown symbols from working if the
            // trailing whitespace after the symbol is missing!
            // e.g. "# title" -> markdown: header1
            // "#title" -> markdown: no markdown -> normaltext

            var index = string.indexOf(currentSymbol);

            if (index > -1) {
                //console.log("searching: " + string);
                //console.log("search for: " + symbols[key]);
                //console.log("found at: " + index);
                resultDict[index] = key;
            }
        }

        // determine lowest
        //console.log(resultDict);
        var values = [];
        for (var k in resultDict) values.push(k);
        var lowestIndex = Array.min(values);
        var nextSymbol = resultDict[lowestIndex];

        return nextSymbol;
    };

    /**
     * Determine the string that corresponds to the current symbol
     */
    Reader.prototype.getNextString = function(string, nextSymbol) {

        // get next markdown
        var nextMarkdown = symbols[nextSymbol];

        // split  // TODO: check if title follows another title
        var splitStrings = string.split(nextMarkdown);

        // remove empty strings
        // TODO: clean up more so the first element is the correct one!
        var removedEmtpyStrings = [];
        splitStrings.forEach(function(splitString) {
            if (splitString.length > 0) {
                removedEmtpyStrings.push(splitString);
            }
        });
        //console.log("--------");
        //console.log(removedEmtpyStrings[0]);
        //console.log("------------");

        var nextString = removedEmtpyStrings[0];

        // clean string after next markdown
        // use also nextString method, just for this short string


        var currentNextSymbol = this.getNextSymbol(nextString); /// this is wrong


        //console.log("supposed next symbol!:" + currentNextSymbol);
        //console.log(currentNextSymbol);
        nextMarkdown = symbols[currentNextSymbol];
        //console.log("supposed next markdown!:" + nextMarkdown);

        // use the next symbol to split this short string a second time
        // remove the tail

        // TODO: trim white space: function trim()

        var result = nextString.split(nextMarkdown)[0].trim();

        return result;
    };

    /**
     * Determines the string that corresponds to the current symbol.
     * returns an object with all specifications
     */
    Reader.prototype.getNextElement = function(currentString, nextSymbol) {

        var element = {};  // object to return

        // get next markdown
        var nextMarkdown = symbols[nextSymbol];

        // split  // TODO: check if title follows another title
        var splitStrings = currentString.split(nextMarkdown);

        // remove empty strings
        // TODO: clean up more so the first element is the correct one!
        var removedEmtpyStrings = [];
        splitStrings.forEach(function(splitString) {
            if (splitString.length > 0) {
                removedEmtpyStrings.push(splitString);
            }
        });
        //console.log("--------");
        //console.log(removedEmtpyStrings[0]);
        //console.log("------------");

        var nextString = removedEmtpyStrings[0];

        // clean string after next markdown
        // use also nextString method, just for this short string


        var currentNextSymbol = this.getNextSymbol(nextString); /// this is wrong


        //console.log("supposed next symbol!:" + currentNextSymbol);
        //console.log(currentNextSymbol);
        nextMarkdown = symbols[currentNextSymbol];
        //console.log("supposed next markdown!:" + nextMarkdown);

        // use the next symbol to split this short string a second time
        // remove the tail

        // TODO: trim white space: function trim()

        var result = nextString.split(nextMarkdown)[0].trim();


        // append to element
        element.style = nextSymbol;

        if (nextSymbol !== "break") {  // skip breaks when assigning text
            element.text = result;
        }

        // intercept images because they are still in this format
        // (url, caption, reference)
        // only use url for now
        if (nextSymbol === "image") {
            //console.log("image found!");

            // remove braces
            while (result.indexOf("(") > -1) {
                result = result.replace("(", "");
            }
            while (result.indexOf(")") > -1) {
                result = result.replace(")", "");
            }

            var url = result.split(",")[0].trim();
            var caption = result.split(",")[1].trim();
            var reference = result.split(",")[2].trim();

            element.url = url;
            element.caption = caption;
            element.reference = reference;
            element.text = undefined;
            //console.log(result);
        }

        if (nextSymbol === "listelement") {
            //console.log("list element!");
            // check if previous was list
            var previousSymbol = this.currentElement.style;
            //console.log("previous: " + previousSymbol);
            // check if next is list

            //console.log("currentString: " + currentString);
            //console.log("nextSymbol: " + nextSymbol);
            //console.log("result: " + element.text);

            var remainingString = this.getRestString(currentString, nextSymbol, result);

            // check if this was the last element on the slide
            var symbolAfterThis;
            if (remainingString === undefined) {
                symbolAfterThis = false;
            } else {
                symbolAfterThis = this.getNextSymbol(remainingString);
            }

            //console.log("next: " + symbolAfterThis);
            // if no: make it style: "startlistelement"
            if (previousSymbol !== "listelement" && previousSymbol !== "startlistelement") {  // no list before
                // the previous element was not a list element
                // so this could be the starting element of a
                // list or a standalone listelement
                //console.log("previous not a list!");
                if (symbolAfterThis === "listelement") {
                    //console.log("after is list!");
                    element.style = "startlistelement";
                } else {
                    //console.log("after is not a list!");
                    element.style = "singlelistelement";
                }

            } else {
                if (symbolAfterThis !== "listelement") {
                    // next element is not a list
                    // so make this element the end of the list
                    element.style = "endlistelement";
                } else {
                    // next element is also a list element
                    // so make this one a normal listelement
                    element.style = "listelement";
                }
            }
        }
        return element;
    };

    /**
     * Determine the remaining string
     */
    Reader.prototype.getRestString = function(string, nextSymbol, nextString) {

        var markdown = symbols[nextSymbol];

        // workaround!
        var replaceString = markdown + " " + nextString;

        var newString;
        var ready = false;

        // check with trailing whitespace
        if (string.indexOf(replaceString + " ") > -1) {
            newString = string.replace(replaceString + " ", "");
            ready = true;

        // check without whitespace
        } else if (!ready && string.indexOf(replaceString) > -1) {
            newString = string.replace(replaceString, "");
            ready = true;

        } else {
            newString = undefined;
        }

        if (newString === undefined || newString === "") {
            return undefined;
        } else {
            return newString;
        }
    };

    /**
     * returns object containing information on the current slide and
     * it's content. parameter "slideString" must not contain line breaks.
     * don't use this function as a standalone function, but use this.read
     * instead. this.read removes linebreaks before calling this function
     */
    Reader.prototype.readSlideMarkdown = function(slideString) {
        var currentSlideDict = {};

        var currentString = slideString;
        for (var i = 0; i < 1000; i++) {
            // scan for symbol and use first one and save string to this point

            // check which symbol comes first -> use the index, then cut string at
            // that point and repeat with the resulting string -> also I need
            // the index of the next following markdown to cut the string between
            // first and second index
            var nextSymbol = this.getNextSymbol(currentString);
            var element = this.getNextElement(currentString, nextSymbol);

            // save step
            currentSlideDict[i] = element;
            this.currentElement = element;  // save for other functions

            // now remove the last string from the long one and repeat process
            var nextString = this.getNextString(currentString, nextSymbol);
            var restString = this.getRestString(currentString, nextSymbol, nextString);


            if (restString === undefined) {
                //console.log("DONE! BREAK!");
                i = 1000; // break
            } else {
                //console.log("CONTINUE with: " + restString);
                currentString = restString;
            }
        }
        return currentSlideDict;
    };

    /**
     * Detects paragraphs without markdown symbols and addes the
     * symbol for normaltext [note] to them. returns the string
     * for provided slide.
     */
    Reader.prototype.detectNormaltext = function(slideString, linebreak) {

        var blankPositions = [];  // store paragraph indexes to be replaced with [note]

        var chunks = slideString.split(linebreak);

        chunks.forEach(function(chunk, i) {
            if (chunk.length > 0) {  // skip empty paragraphs
                //console.log(chunk);
                // check for known symbols
                // if not, make normaltext
                var foundSymbol = false;
                for (var key in symbols) {
                    if (chunk.indexOf(symbols[key]) !== -1) {  // symbol not in paragraph
                        foundSymbol = true;
                    }
                }
                if (!foundSymbol) {
                    blankPositions.push(i);
                }
            }
        });

        //console.log("replace the following with [note]: " + blankPositions);
        var paragraphs = slideString.split(linebreak);
        blankPositions.forEach(function(position) {
            paragraphs[position] = "[note] " + paragraphs[position];
        });

        // sow them back together :)
        slideString = paragraphs.join(linebreak);

        return slideString;
    };

    Reader.prototype.read = function(markdownString) {
        var me = this;
        var resultDict = {};

        // check for empty markdownstring
        if (markdownString.length < 1) {
            console.log("provided markdown string is empty!");
        }

        var slides = markdownString.split(symbols.newslide);

        slides.forEach(function(slideString, i) {
            var slideNumber = i + 1;

            // trim whitespace for entire slide string
            // if you dont do this, a trailing whitespace like
            // " ## title", will result in the first object being
            // assign the current slide string
            slideString = slideString.trim();
            //console.log("before: " + slideString);

            // should always work with \n, since it only adds stuff
            // \r\n should keep intact
            slideString = me.detectNormaltext(slideString, "\n");

            // detect extra breaks between paragraphs
            while (slideString.indexOf("\r\n\r\n\r\n") > -1) {
                slideString = slideString.replace(/\r\n\r\n\r\n/, " [break] ");
            }

            while (slideString.indexOf("\n\n\n") > -1) {
                slideString = slideString.replace(/\n\n\n/, " [break] ");
            }

            // all line breaks get removed earlier
            // remove all line breaks -> cannot use readSlideMarkdown without
            // this function first, because readSlideMarkdown doesnt work with line breaks
            while (slideString.indexOf("\r\n") > -1) {
                slideString = slideString.replace(/\r\n/, "");
            }
            while (slideString.indexOf("\n") > -1) {
                slideString = slideString.replace(/\n/, "");
            }
            while (slideString.indexOf("\r") > -1) {
                slideString = slideString.replace(/\r/, "");
            }

            //console.log("after: " + slideString);
            //console.log("found something: " + slideString.match(/\n/).length);

            var slideDict = me.readSlideMarkdown(slideString);
            resultDict[slideNumber] = slideDict;
            //console.log(slideDict);
        });

        return resultDict;
    };
}
