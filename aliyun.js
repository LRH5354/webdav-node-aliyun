const webdav = require('webdav-server').v2;
const aliyun = require('./aliyun/lib/exports');

const server = new webdav.WebDAVServer({
    // [...]
    autoLoad: {
        // [...]
        serializers: [
            new aliyun.AliyunSerializer()
            // [...]
        ]
    }
}) 

server.setFileSystemSync('/aliyun', new aliyun.AliyunFileSystem(), false);
server.start((s) => console.log('Ready on port', s.address().port));