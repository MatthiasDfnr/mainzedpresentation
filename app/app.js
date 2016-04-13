"use strict";

var onSuccess = function(data) {

    var newReader = new Reader();
    var markdownObject = newReader.read(data);
    //console.log(markdownObject);
    var newWriter = new Writer();

    $("body").append(newWriter.write(markdownObject));
    $("body").append(newWriter.writeTableOfContent(markdownObject));
    $("body").append(newWriter.writeTableOfImages(markdownObject));

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

    if (e.keyCode === 39 || e.keyCode === 34) {  // 43 is remote left
        // if ($activeslide.next('.slides').length) {}
        if (currentslide < $('.slide').length){
            currentslide += 1;
            $("#counter").text(currentslide + " / " + $('.slide').length );
            location.hash = "#slide" + currentslide;
        }
    }
    if (e.keyCode === 37 || e.keyCode === 33) {  // 33 is remote right
        console.log(currentslide);
        // if ($activeslide.prev('.slides').length) {}
        if (currentslide > 1) {
            currentslide -= 1;
            $("#counter").text(currentslide + " / " + $('.slide').length );
            location.hash = "#slide" + currentslide;
        }
    }
});
