"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AliyunFileSystem_1 = require("./AliyunFileSystem");
var AliyunSerializer = (function () {
    function AliyunSerializer() {
    }
    AliyunSerializer.prototype.uid = function () {
        return 'DropboxFSSerializer-1.0.0';
    };
    AliyunSerializer.prototype.serialize = function (fs, callback) {
        callback(null, {
            accessKey: fs.accessKey
        });
    };
    AliyunSerializer.prototype.unserialize = function (serializedData, callback) {
        var fs = new AliyunFileSystem_1.AliyunFileSystem(serializedData.accessKey);
        callback(null, fs);
    };
    return AliyunSerializer;
}());
exports.AliyunSerializer = AliyunSerializer;
