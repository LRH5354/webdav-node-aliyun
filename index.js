// JavaScript
const fs = require('fs')
const path = require('path')
const webdav = require('webdav-server').v2;
const virtualStored = require('@webdav-server/virtual-stored');

const serializer = new virtualStored.VirtualStoredSerializer('password', {
    salt: 'this is the salt of the world',
    cipher: 'aes-256-cbc',
    cipherIvSize: 16,
    hash: 'sha256',
    masterNbIteration: 80000,
    minorNbIteration: 1000,
    keyLen: 256
});

const server = new webdav.WebDAVServer({
    // [...]
    autoLoad: {
        // [...]
        serializers: [
            serializer
            // [...]
        ]
    }
})

const vsfsPath = path.resolve('./data');

serializer.createNewFileSystem(vsfsPath, (e, vsfs) => {
    if(e)
        throw e;
    server.setFileSystemSync('/myPath', vsfs, false);
})


server.start((s) => console.log('Ready on port', s.address().port));