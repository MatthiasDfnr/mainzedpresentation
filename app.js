var onSuccess = function(data) {
    //console.log(data);
    newReader = new Reader();
    var markdownObject = newReader.read(data);

    newWriter = new Writer();
    newWriter.write(markdownObject, 0);

};

$(document).ready(function() {

    // get text file
    $.get('tests/files/markdown.txt', function(data) {
       onSuccess(data);
    }, 'text');

});