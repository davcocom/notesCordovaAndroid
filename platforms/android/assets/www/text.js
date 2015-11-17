document.addEventListener("deviceready", deviceReady, false);
var filesystem = null;
var messageBox;

function deviceReady() {

    // Allow for vendor prefixes.
    window.requestFileSystem = window.requestFileSystem ||
        window.webkitRequestFileSystem;
    messageBox = document.getElementById('messages');


// Start the app by requesting a FileSystem (if the browser supports the API)
    if (window.requestFileSystem) {
        initFileSystem();
        //alert("Si se pueden escribir archivos.");
        leerArchivo();
    } else {
        alert("Sorry! Your browser doesn\'t support the FileSystem API :(");
    }

    //Visualize actual notes in device
    refreshNotes();
}

// A simple error handler to be used throughout this demo.
function errorHandler(error) {
    var message = '';
    switch (error.code) {
        case FileError.SECURITY_ERR:
            message = 'Security Error';
            break;
        case FileError.NOT_FOUND_ERR:
            message = 'Not Found Error';
            break;
        case FileError.QUOTA_EXCEEDED_ERR:
            message = 'Quota Exceeded Error';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            message = 'Invalid Modification Error';
            break;
        case FileError.INVALID_STATE_ERR:
            message = 'Invalid State Error';
            break;
        default:
            message = 'Unknown Error UAY';
            break;
    }
    alert(message);
}

function pruebaArchivos() {
    if (window.requestFileSystem) {
        alert("Los archivos si son soportados");
    } else {
        alert("No se soportan el manejo de archivos :(");
    }

}


function initFileSystem() {
    // Request a file system with the new size.
    window.requestFileSystem(window.PERSISTENT, 1024, function (fs) {
        filesystem = fs;
    }, errorHandler);
}


function saveFile(filename, content) {
    filesystem.root.getFile(filename, {create: true}, function (fileEntry) {

        fileEntry.createWriter(function (fileWriter) {
            var fileParts = [content];
            var contentBlob = new Blob(fileParts, {type: 'text/html'});
            fileWriter.write(contentBlob);

            fileWriter.onwriteend = function (e) {
                //messageBox.innerHTML = 'File saved!';
                new $.nd2Toast({
                    message : "Nota agregada con exito",
                    action : {
                        title : "Ok",
                        fn : function() {
                            console.log("I am the function called by 'Pick phone...'");
                        },
                        color : "lime"
                    },
                    ttl : 3000
                });
            };

            fileWriter.onerror = function (e) {
                console.log('Write error: ' + e.toString());
                alert('An error occurred and your file could not be saved!');
            };

        }, errorHandler);

    }, errorHandler);
}

function addNote() {
    var name = document.getElementById('noteTitle');
    var content = document.getElementById('noteContent');
    saveFile(name.value+".txt", content.value);
    refreshNotes(name.value, content.value);
    name.value = "";
    content.value = "";
};

function leerArchivo() {

    filesystem.root.getFile('prueba .txt', {}, function (fileEntry) {

        // Get a File object representing the file,
        // then use FileReader to read its contents.
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
                var noteTest = document.getElementById('testNote');
                noteTest.innerHTML = this.result;

            };

            reader.readAsText(file);
        }, errorHandler);

    }, errorHandler);

}

function deleteFile(name) {
    window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function () {
        filesystem.root.getFile(name+'.txt', {create: false}, function (fileEntry) {

            fileEntry.remove(function () {
                new $.nd2Toast({
                    message : "Nota eliminada con exito",
                    action : {
                        title : "Ok",
                        fn : function() {
                            console.log("I am the function called by 'Pick phone...'");
                        },
                        color : "red"
                    },
                    ttl : 3000
                });
            }, errorHandler);

        }, errorHandler);
    }, errorHandler);
}

function refreshNotes(name, content) {
    genericNote = '<div class="nd2-card">' +
        '<div class="card-title has-supporting-text">' +
        '<h3 class="card-primary-title">'+name+'</h3>' +
        //'<h5 class="card-subtitle">From Wikipedia, the free encyclopedia</h5>' +
        '</div>' +
        '<div id="testNote" class="card-supporting-text has-action has-title">' +
            content+
        '</div>' +
        '<div class="card-action">' +
        '<div class="row between-xs">' +
        '<div class="col-xs-12 align-right">' +
        '<div class="box">' +
        '<a href="#" onclick="deleteFile('+name+')" class="ui-btn ui-btn-inline ui-btn-fab"><i class="zmdi zmdi-delete"></i></a>' +
        '<a href="#" class="ui-btn ui-btn-inline ui-btn-fab"><i class="zmdi zmdi-edit"></i></a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    document.getElementById('main').innerHTML += genericNote;
}