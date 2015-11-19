document.addEventListener("deviceready", deviceReady, false);
var filesystem = null;
var messageBox;
var arrayNotes = new Array();

function deviceReady() {
    // Allow for vendor prefixes.
    window.requestFileSystem = window.requestFileSystem ||
        window.webkitRequestFileSystem;
    messageBox = document.getElementById('messages');


// Start the app by requesting a FileSystem (if the browser supports the API)
    if (window.requestFileSystem) {
        initFileSystem();
        //alert("Si se pueden escribir archivos.");

    } else {
        alert("Sorry! Your browser doesn\'t support the FileSystem API :(");
    }

    //Visualize actual notes in device
    // refreshNotes();
    onInitFs();
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
    showToast(message);
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
                showToast('Nota agregada con exito');
            };

            fileWriter.onerror = function (e) {
                console.log('Write error: ' + e.toString());
                alert('An error occurred and your file could not be saved!');
            };

        }, errorHandler);

    }, errorHandler);
}

function addNote(titleID, contentID) {
    var name = document.getElementById(titleID);
    var content = document.getElementById(contentID);
    arrayNotes.push(name.value);
    saveFile(name.value + ".txt", content.value);
    displayNote(name.value, content.value);
    name.value = "";
    content.value = "";
};

function readFile(name) {
    var content = null;
    filesystem.root.getFile(name + '.txt', {}, function (fileEntry) {

        // Get a File object representing the file,
        // then use FileReader to read its contents.
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
                content = String(this.result);
                displayNote(name,content);
            };
            reader.readAsText(file);

        }, errorHandler);

    }, errorHandler);
}

function setContentToID(name,id) {
    var content = null;
    filesystem.root.getFile(name + '.txt', {}, function (fileEntry) {

        // Get a File object representing the file,
        // then use FileReader to read its contents.
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
                content = String(this.result);
                document.getElementById(id).innerHTML = content;
            };
            reader.readAsText(file);

        }, errorHandler);

    }, errorHandler);
    return content;
}

function deleteFile(name) {
    window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function () {
        filesystem.root.getFile(name + '.txt', {create: false}, function (fileEntry) {

            fileEntry.remove(function () {
                document.getElementById('note_' + name).remove();
                showToast('Nota eliminada con exito');
            }, errorHandler);

        }, errorHandler);
    }, errorHandler);

}

function displayNote(name, content) {
    var moreInfo = content.length > 140 ? '<a onclick="setNoteToViewPage(\'' + name + '\')" class="card-subtitle" href="#viewNote">Leer más</a>' : '';
    content = content.substr(0,140) + '...';
    genericNote = '<div class="nd2-card" id="note_' + name + '" >' +
        '<div class="card-title has-supporting-text">' +
        '<h3 class="card-primary-title">' + name + '</h3>' +
            moreInfo +
        '</div>' +
        '<div id="testNote" class="card-supporting-text has-action has-title">' +
        content +
        '</div>' +
        '<div class="card-action">' +
        '<div class="row between-xs">' +
        '<div class="col-xs-12 align-right">' +
        '<div class="box">' +
        '<a href="#confirmationDeleteDialog" onclick="setFileToDelete(\'' + name + '\')" data-rel="popup" data-position-to="window" data-transition="pop" class="ui-btn ui-btn-inline ui-btn-fab"><i class="zmdi zmdi-delete"></i></a>' +
        '<a href="#editNote" onclick="setNoteToEdit(\'' + name + '\')" class="ui-btn ui-btn-inline ui-btn-fab"><i class="zmdi zmdi-edit"></i></a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    document.getElementById('main').innerHTML += genericNote;
}

function setNoteToViewPage(name){
    document.getElementById('viewTitle').innerHTML = name;
    setContentToID(name,'viewContent');
}

function setFileToDelete(name){
    document.getElementById('confirmationDelete').name = name;
}

function setNoteToEdit(name){
    //set the note's content to a textArea
    setContentToID(name,'editContent');
    //Set the note's title to the text field
    document.getElementById('editTitle').value = name;
    //set the note's name to an anchor for making easier the edition
    document.getElementById('saveEdition').name = name;
}

function saveEdition(name){
    deleteFile(name);
    addNote('editTitle', 'editContent');
    showToast('Nota editada con éxito');
}

function showToast(message) {
    new $.nd2Toast({
        message: message,
        action: {
            title: "Ok",
            fn: function () {
                console.log("I am the function called by 'Pick phone...'");
            },
            color: "yellow"
        },
        ttl: 3000
    });
}

function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
}

function listResults(entries) {
    // Document fragments can improve performance since they're only appended
    // to the DOM once. Only one browser reflow occurs.
    //var fragment = document.createDocumentFragment();

    entries.forEach(function (entry, i) {
        if (!entry.isDirectory) {
            file = (entry.name).split('.');
            if (file[1] == 'txt') {
                readFile(file[0]);
            }
        }
    });

    //document.querySelector('#filelist').appendChild(fragment);
}

function onInitFs() {
    setTimeout(mostrar, 500);
}

function mostrar() {
    var dirReader = filesystem.root.createReader();
    var entries = [];

    // Call the reader.readEntries() until no more results are returned.
    var readEntradas = function () {

        dirReader.readEntries (function (results) {
            if (!results.length) {
                listResults(entries.sort());
            } else {
                entries = entries.concat(toArray(results));
                readEntradas();
            }
        }, errorHandler);
    };

    readEntradas(); // Start reading dirs.
}
