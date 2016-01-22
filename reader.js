Array.min = function( array ){
    return Math.min.apply( Math, array );
};

var getNextSymbol = function(string) {
    var resultDict = {};
    for (var key in symbols) {
        var index = string.search(symbols[key]);
        if (index > -1) {
            resultDict[key] = index;
        }
    }
    //return resultDict;    

    // determine next
    var values = [];
    for(var k in resultDict) values.push(resultDict[k]);

    var lowestIndex = Array.min(values);
    
    for (var key in symbols) {
        if (key === lowestIndex] 
    }
    console.log(symbols[lowestIndex]);

};



$(document).ready(function() {
    
    var rawMarkdown = markdown;
    var rawSymbols = symbols;
    /*var symbols = {
        title: "## ",
        newslide: "---", 
        normaltext: "[note]",
        bigtext: "[big]",
        image: ".jpg",
        image: "[image: *.png]",
    }*/
    
    var resultDict = {};

    var slides = markdown.split(rawSymbols.newslide);
    slides.forEach(function(slideString, i) {
        if (i < 1) {  // only first slide for test
            var slideNumber = i + 1;
            var currentSlideDict = {};

            // scan for symbol and use first one and save string to this point

            // check which symbol comes first -> use the index, then cut string at 
            // that point and repeat with the resulting string


            console.log(getNextSymbol(slideString));
        };    

        // save
        resultDict[slideNumber] = currentSlideDict;
    });

    //console.log(resultDict);

});