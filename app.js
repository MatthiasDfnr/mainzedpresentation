var onSuccess = function(data) {
    //console.log(data);
    newReader = new Reader();
    var markdownObject = newReader.read(data);

    newWriter = new Writer();
    $('body').append(newWriter.writeElement(markdownObject, 1, 0));
    $('body').append(newWriter.writeElement(markdownObject, 2, 0));
    $('body').append(newWriter.writeElement(markdownObject, 3, 0));

};

$(document).ready(function() {

    // get text file
    $.get('tests/files/markdown.txt', function(data) {
       onSuccess(data);
    }, 'text');

});