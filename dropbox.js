// JavaScript
const webdav = require('webdav-server').v2;
const dropbox = require('@webdav-server/dropbox');

const server = new webdav.WebDAVServer({
    // [...]
    autoLoad: {
        // [...]
        serializers: [
            new dropbox.DropboxSerializer()
            // [...]
        ]
    }
})

server.setFileSystemSync('/myPath', new dropbox.DropboxFileSystem('dropboxAccessKey...'), false);

server.start((s) => console.log('Ready on port', s.address().port));