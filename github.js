
// JavaScript
const webdav = require('webdav-server').v2;
const github = require('@webdav-server/github');

const server = new webdav.WebDAVServer({
    // [...]
    autoLoad: {
        // [...]
        serializers: [
            new github.GitHubSerializer()
            // [...]
        ]
    }
})

// for client_id and client_secret, refer to https://developer.github.com/v3/oauth_authorizations/
server.setFileSystemSync('/myPath', new github.GitHubFileSystem('openmarshal', 'npm-WebDAV-Server', 'client_id...', 'client_secret...'), false);

server.start((s) => console.log('Ready on port', s.address().port));