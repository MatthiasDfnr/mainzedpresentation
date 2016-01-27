"use strict";

var onSuccess = function(data) {

    var newReader = new Reader();
    var markdownObject = newReader.read(data);
    //console.log(markdownObject);
    var newWriter = new Writer();

    $("body").append(newWriter.write(markdownObject));
    //$('body').append(newWriter.writeTableOfContent(markdownObject));
};

$(document).ready(function() {

    // get text file
    $.get("markdown.txt", function(data) {
        onSuccess(data);
    }, "text");

});

var currentslide = 1;
$(document.documentElement).keydown(function (e) {
    //var $activeslide = $('.slides.active'), $targetslide;

    if (e.keyCode === 39) {
        // if ($activeslide.next('.slides').length) {}
        if (currentslide < $('.slide').length){
            currentslide += 1;
            location.hash = "#slide" + currentslide;
        }
    }
    if (e.keyCode === 37) {
        console.log(currentslide);
        // if ($activeslide.prev('.slides').length) {}
        if (currentslide > 1) {
            currentslide -= 1;
            location.hash = "#slide" + currentslide;
        }
    }
});