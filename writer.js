
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


function Writer() {
    
    /** 
     * Takes an object generated by Reader.read and the
     * position of the element (integer) and returns
     * a HTML string for the specified element
     */
    Writer.prototype.write = function(markdownObject) {
        var html = "";
        //var element = markdownObject[slideNumber][position];

        var slideCounter = 1;
        for (var key in markdownObject) {
            var slide = markdownObject[key];
            html += "<div class=slide id=slide" + slideCounter + ">";

            for (var k in slide) {
                var element = slide[k];
                if (element.style === "title") {
                    html += "<h1>" + element.text + "</h1>\n";

                } else if (element.style === "bigtext") {
                    html += "<p class='bigtext'>" + element.text + "</p>\n";
                
                } else if (element.style === "image") {
                    html += "<img src='" + element.text + "'/>";

                } else {
                    html += "<p>" + element.text + "</p>";
                }
            } 
            html += "</div>\n\n";
            slideCounter++;
        }      
                
        return html;
    };

}


