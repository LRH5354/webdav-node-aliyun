"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({
                __proto__: []
            }
            instanceof Array && function (d, b) {
                d.__proto__ = b;
            }) ||
        function (d, b) {
            for (var p in b)
                if (b.hasOwnProperty(p)) d[p] = b[p];
        };
    return function (d, b) {
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", {
    value: true
});

var AliyunSerializer_1 = require("./AliyunSerializer");
var webdav_server_1 = require("webdav-server");
var aliyun_client_1 = require("../client/aliyunclient")

var AliyunFileSystem = (function (_super) {
    __extends(AliyunFileSystem, _super);

    function AliyunFileSystem(refleshToken) {
        var _this = _super.call(this, new AliyunSerializer_1.AliyunSerializer()) || this;
        _this.refleshToken = refleshToken;
        _this.alidb = new aliyun_client_1(refleshToken);
        // 
        _this.resources = _this.alidb.resources;
        _this.useCache = true;
        return _this;

    }
    AliyunFileSystem.prototype.getRemotePath = function (path) {
        var pathStr = path.toString();
        if (pathStr === '/')
            return '';
        else
            return pathStr;
    };
    AliyunFileSystem.prototype.getMetaData = function (path, callback) {
        var _this = this;
        if (this.useCache && this.resources.get(path.toString(false))) {
            callback(undefined, this.resources.get(path.toString(false)));
        } else {
            if (path.isRoot()) {
                let rootCache = {  
                    '.tag': 'folder',
                     "name": '',
                     "file_id":"root",
                     "metadata":{}
                 }
                _this.resources.put(path.toString(false), rootCache)
                callback(undefined,rootCache);
            } else {
                this.alidb.FileInfo({
                    path: this.getRemotePath(path)
                }).then(function (data) {
                    let fileCache = {
                        ".tag": data.type,
                        "name": data.name,
                        "file_id": data.file_id,
                        "metadata": Object.assign({}, data)
                    }
                    _this.resources.put(path.toString(false), fileCache)
                    callback(undefined, fileCache);
                }).catch(function (e) {
                    callback(e);
                });
            }
        }
    };;
    AliyunFileSystem.prototype._create = function (path, ctx, callback) {
        if (ctx.type.isFolder) {
            this.dbx.filesCreateFolderV2({
                path: this.getRemotePath(path)
            }).then(function () {
                callback();
            }).catch(function (e) {
                callback();
            });
        } else {
            this.dbx.filesUpload({
                path: this.getRemotePath(path),
                contents: 'empty'
            }).then(function () {
                callback();
            }).catch(function (e) {
                callback();
            });
        }
    };;
    AliyunFileSystem.prototype._delete = function (path, ctx, callback) {
        var _this = this;
        this.dbx.filesDelete({
            path: this.getRemotePath(path)
        }).then(function () {
            delete _this.resources[path.toString(false)];
            callback();
        }).catch(function (e) {
            callback();
        });
    };;
    AliyunFileSystem.prototype._rename = function (pathFrom, newName, ctx, callback) {
        this.dbx.filesMoveV2({
                from_path: this.getRemotePath(pathFrom),
                to_path: this.getRemotePath(newName),
                allow_ownership_transfer: true,
                allow_shared_folder: true
            }).then(function () {
                callback(undefined, true);
            })
            .catch(function (e) {
                callback(webdav_server_1.v2.Errors.InvalidOperation);
            });
    };;
    AliyunFileSystem.prototype._openWriteStream = function (path, ctx, callback) {
        var _this = this;
        this.getMetaData(path, function (e, data) {
            if (e) {
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            }
            var content = [];
            var stream = new webdav_server_1.v2.VirtualFileWritable(content);
            stream.on('finish', function () {
                _this.dbx.filesUpload({
                    path: _this.getRemotePath(path),
                    contents: content,
                    strict_conflict: false,
                    mode: {
                        '.tag': 'overwrite'
                    }
                }).then(function () {}).catch(function (e) {});
            });
            callback(null, stream);
        });
    };;
    AliyunFileSystem.prototype._openReadStream = function (path, ctx, callback) {
        this.alidb.FileDownload({
            path: this.getRemotePath(path)
        }).then(function (data) {
            var stream =  new webdav_server_1.v2.VirtualFileReadable([data]);
            callback(undefined, stream);
        }).catch(function (e) {
            callback(webdav_server_1.v2.Errors.ResourceNotFound);
        });
    
    };;
    AliyunFileSystem.prototype._size = function (path, ctx, callback) {
        var _this = this;
        this.getMetaData(path, function (e, data) {
            if (e)
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            callback(undefined, data.metadata.size);
        });
    };;
    AliyunFileSystem.prototype._lockManager = function (path, ctx, callback) {
        var _this = this;
        this.getMetaData(path, function (e,data) {
            if (e) {
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            }
            data.locks = new webdav_server_1.v2.LocalLockManager();
            callback(undefined, _this.resources.get(path.toString(false)).locks);
        });
    };;
    AliyunFileSystem.prototype._propertyManager = function (path, ctx, callback) {
        var _this = this;
        this.getMetaData(path, function (e,data) {
            if (e)
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            data.props = new webdav_server_1.v2.LocalPropertyManager({});
            callback(undefined, _this.resources.get(path.toString(false)).props);
        });
    };;
    AliyunFileSystem.prototype._readDir = function (path, ctx, callback) {
        this.alidb.FileList({
            path: this.getRemotePath(path)
        }).then(function (data) {
            var files = data.map(function (entry) {
                return entry.name;
            });
            callback(undefined, files);
        }).catch(function (e) {
            callback(webdav_server_1.v2.Errors.ResourceNotFound);
        });
    };;
    AliyunFileSystem.prototype._creationDate = function (path, ctx, callback) {
        this.getMetaData(path, function (e, data) {
            if (e)
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            callback(undefined, new Date(data.metadata.created_at));
        });
    };;
    AliyunFileSystem.prototype._lastModifiedDate = function (path, ctx, callback) {
        this.getMetaData(path, function (e, data) {
            if (e)
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            callback(undefined, new Date(data.metadata.updated_at));
        });
    };;
    AliyunFileSystem.prototype._type = function (path, ctx, callback) {
        var _this = this;
        if (this.useCache && this.resources[path.toString(false)] && this.resources[path.toString(false)].type) {
            callback(undefined, this.resources[path.toString(false)].type);
        } else {
            this.getMetaData(path, function (e, data) {
                if (e)
                    return callback(webdav_server_1.v2.Errors.ResourceNotFound);
                var isFolder = data['.tag'] === 'folder';
                var type = isFolder ? webdav_server_1.v2.ResourceType.Directory : webdav_server_1.v2.ResourceType.File;
                callback(undefined, type);
            });
        }
    };;
    return AliyunFileSystem;
}(webdav_server_1.v2.FileSystem));
exports.AliyunFileSystem = AliyunFileSystem;