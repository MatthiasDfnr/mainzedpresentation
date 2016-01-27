
function Reader() {

    // private static
    var symbols = {
        title: "##",
        newslide: "---",
        normaltext: "[note]",
        italics: "*",
        bigtext: "[big]",
        image: "[image]"
    };

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
            var index = string.indexOf(symbols[key]);

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
        for(var k in resultDict) values.push(k);
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
        for (i = 0; i < 100; i++) {
            //console.log("ROUND: " + i);
            // scan for symbol and use first one and save string to this point

            // check which symbol comes first -> use the index, then cut string at
            // that point and repeat with the resulting string -> also I need
            // the index of the next following markdown to cut the string between
            // first and second index
            //console.log("current: " + currentString);
            var nextSymbol = this.getNextSymbol(currentString);
            //console.log("current string: " + currentString);
            //console.log("next symbol: " + nextSymbol);

            var nextString = this.getNextString(currentString, nextSymbol);
            //console.log("next String: " + nextString);  // this is wrong for last

            // form object
            var currentObj = {};
            currentObj["style"] = nextSymbol;
            currentObj["text"] = nextString;

            // save step
            currentSlideDict[i] = currentObj;

            // now remove the last string from the long one and repeat process
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

            // all line breaks get removed earlier
            // remove all line breaks -> cannot use readSlideMarkdown without
            // this function first, because readSlideMarkdown doesnt work with line breaks
            while (slideString.indexOf("\n") > -1) {
                slideString = slideString.replace(/\n/, "");
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
