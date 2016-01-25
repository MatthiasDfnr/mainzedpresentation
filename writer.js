
function Writer() {
    
    /** 
     * Takes an object generated by Reader.read and the
     * position of the element (integer) and returns
     * a HTML string for the specified element
     */
    Writer.prototype.writeElement = function(markdownObject, slideNumber, position) {
        var html;
        var element = markdownObject[slideNumber][position];
        
        if (element.style === "title") {
            html = "<h1>" + element.text + "</h1>";

        } else if (element.style === "bigtext") {
            html = "<b>" + element.text + "</b>";
        
        } else {
        
            html = "<p>" + element.text + "</p>";
        }   
               
        return html;
    };

}


