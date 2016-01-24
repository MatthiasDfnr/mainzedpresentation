
function Reader() {
    //console.log("init new reader");
    //this.filename = filename;
    //console.log("init new reader");
    
    // private static
    var symbols = {
        title: "##",
        newslide: "---", 
        normaltext: "[note]",
        bigtext: "[big]",
        image: ".jpg"
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

    Reader.prototype.getRestString = function(string, nextSymbol, nextString) {

        // nextString is too long for last -> ## still included

        //console.log("determine rest of string: " + string);
        // now remove the last string from the long one and repeat process
        var markdown = symbols[nextSymbol];
        //console.log("previous result: " + nextString);
        //console.log("next symbol: " + nextSymbol);

        /*var splitNew = string.split(markdown + " " + nextString + " "); // add the removed whitespace
        // workaround!

        //console.log(cleanList[0]);
        var cleanList = [];
        console.log(splitNew);
        splitNew.forEach(function(part) {
            if (part.length > 0) {
                cleanList.push(part);
            } else {
                console.log("first part of array is empty!");
                // empty string, check if they are new lines
                 if (part.indexOf("\n\n") > -1) {  // if newline is first thing
                    
                    //newString = cleanList[1];
                    console.log("new line on position: " + splitNew[0].indexOf("\n"));
                    //console.log("found empty line in: " + splitNew[0]);
                    //console.log("used next instead: " + cleanList[1]);
                };
            }
        });*/
        
        //newString = cleanList[0];

        // workaround!
        var replaceString = markdown + " " + nextString + " ";
        console.log("old: " + string);
        console.log("replacing: " + replaceString);
        //console.log("match: " + string.match(replaceString));
        // remove the first occurance
        var newString = string.replace(replaceString, "");
        //console.log(newString);
        
        //str = str.replace(',', ''); // Remove the first one
        

        console.log("rest: " + newString);
        
        if (newString === string) {
            return undefined;
        };
        return newString;
    };

    Reader.prototype.readSlideMarkdown = function(slideString) {
        var currentSlideDict = {};

        var currentString = slideString;
        for (i = 0; i < 100; i++) {
            console.log("ROUND: " + i)
            // scan for symbol and use first one and save string to this point

            // check which symbol comes first -> use the index, then cut string at 
            // that point and repeat with the resulting string -> also I need
            // the index of the next following markdown to cut the string between
            // first and second index
            //console.log("current: " + currentString);
            var nextSymbol = this.getNextSymbol(currentString);  
            //console.log("current string: " + currentString);
            console.log("next symbol: " + nextSymbol);

            var nextString = this.getNextString(currentString, nextSymbol);
            console.log("next String: " + nextString);  // this is wrong for last
            
            // save step
            currentSlideDict[nextString] = nextSymbol;
            console.log("after save!");
            // now remove the last string from the long one and repeat process
            var restString = this.getRestString(currentString, nextSymbol, nextString);
            console.log("string left: " + restString);
            

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

        var slides = markdownString.split(symbols.newslide);

        slides.forEach(function(slideString, i) {
            var slideNumber = i + 1;  

            // trim whitespace for entire slide string
            // if you dont do this, a trailing whitespace like
            // " ## title", will result in the first object being
            // assign the current slide string
            slideString = slideString.trim();
            console.log("before: " + slideString);
            
            // remove all line breaks
            var noBreaks;
            if (slideString.match(/\n/).length > 1) {
                slideString = slideString.replace(/\n/, "");
            }
            
            console.log("after: " + slideString);

            var slideDict = me.readSlideMarkdown(slideString);
            resultDict[slideNumber] = slideDict; 
            //console.log(slideDict);    
        });

        return resultDict;
    };

};

var onSuccess = function(data) {
    //console.log(data);
    newReader = new Reader();
    console.log(data);
    var result = newReader.read(data);

    console.log(result);
};

$(document).ready(function() {

    // get text file
    /*$.get('tests/files/markdown.txt', function(data) {
       onSuccess(data);
    }, 'text');
    */

    var myString = [
        "## title on the very first slide",
        "",
        "[note] normal text on the first slide",
        "",
        "[note] more normal text on the first slide"
    ].join('\n');
    var reader = new Reader();
    reader.read(myString);

    //console.log(myString);
});