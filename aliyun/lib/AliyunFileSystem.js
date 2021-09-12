"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });

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
        if (this.useCache && this.resources[path.toString(false)] && this.resources[path.toString(false)].metadata) {
            callback(undefined, this.resources[path.toString(false)]);
        }
        else {
            if (path.isRoot()) {
                callback(undefined, {
                    '.tag':  'folder',
                    name: '',
                    size: 0
                });
            }
            else {
                this.alidb.FileInfo({
                    path: this.getRemotePath(path)
                }).then(function (data) {
                    if (!_this.resources[path.toString(false)])
                        _this.resources[path.toString(false)] = {};
                    // 获取文件信息并覆写
                     _this.resources[path.toString(false)].metadata = data
                    callback(undefined,data);
                }).catch(function (e) {
                    callback(e);
                });
            }
        }
    };
    ;
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
    };
    ;
    AliyunFileSystem.prototype._create = function (path, ctx, callback) {
        if (ctx.type.isFolder) {
            this.dbx.filesCreateFolderV2({
                path: this.getRemotePath(path)
            }).then(function () {
                callback();
            }).catch(function (e) {
                callback();
            });
        }
        else {
            this.dbx.filesUpload({
                path: this.getRemotePath(path),
                contents: 'empty'
            }).then(function () {
                callback();
            }).catch(function (e) {
                callback();
            });
        }
    };
    ;
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
    };
    ;
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
                }).then(function () {
                }).catch(function (e) {
                });
            });
            callback(null, stream);
        });
    };
    ;
    AliyunFileSystem.prototype._openReadStream = function (path, ctx, callback) {
        this.dbx.filesDownload({
            path: this.getRemotePath(path)
        }).then(function (r) {
            var stream = new webdav_server_1.v2.VirtualFileReadable([r.fileBinary]);
            callback(undefined, stream);
        }).catch(function (e) {
            callback(webdav_server_1.v2.Errors.ResourceNotFound);
        });
    };
    ;
    AliyunFileSystem.prototype._size = function (path, ctx, callback) {
        var _this = this;
        this.getMetaData(path, function (e, data) {
            if (e)
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            if (!_this.resources[path.toString(false)])
                _this.resources[path.toString(false)] = {};
            _this.resources[path.toString(false)].size = data.size;
            callback(undefined, data.size);
        });
    };
    ;
    AliyunFileSystem.prototype._lockManager = function (path, ctx, callback) {
        var _this = this;
        this.getMetaData(path, function (e) {
            if (e) {
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            }
            if (!_this.resources[path.toString(false)])
                _this.resources[path.toString(false)] = {};
            if (!_this.resources[path.toString(false)].locks)
                _this.resources[path.toString(false)].locks = new webdav_server_1.v2.LocalLockManager();
            callback(undefined, _this.resources[path.toString(false)].locks);
        });
    };
    ;
    AliyunFileSystem.prototype._propertyManager = function (path, ctx, callback) {
        var _this = this;
        this.getMetaData(path, function (e) {
            if (e)
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            if (!_this.resources[path.toString(false)])
                _this.resources[path.toString(false)] = {};
            if (!_this.resources[path.toString(false)].props)
                _this.resources[path.toString(false)].props = new webdav_server_1.v2.LocalPropertyManager({});
            callback(undefined, _this.resources[path.toString(false)].props);
        });
    };
    ;
    AliyunFileSystem.prototype._readDir = function (path, ctx, callback) {
        this.alidb.FileList({
            path: this.getRemotePath(path)
        }).then(function (data) {
            var files = data.map(function (entry) { return entry.name; });
            callback(undefined, files);
        }).catch(function (e) {
            callback(webdav_server_1.v2.Errors.ResourceNotFound);
        });
    };
    ;
    AliyunFileSystem.prototype._creationDate = function (path, ctx, callback) {
        this._lastModifiedDate(path, ctx, callback);
    };
    ;
    AliyunFileSystem.prototype._lastModifiedDate = function (path, ctx, callback) {
        this.getMetaData(path, function (e, data) {
            if (e)
                return callback(webdav_server_1.v2.Errors.ResourceNotFound);
            callback(undefined, data.updated_at || data.server_modified);
        });
    };
    ;
    AliyunFileSystem.prototype._type = function (path, ctx, callback) {
        var _this = this;
        if (this.useCache && this.resources[path.toString(false)] && this.resources[path.toString(false)].type) {
            callback(undefined, this.resources[path.toString(false)].type);
        }
        else {
            this.getMetaData(path, function (e, data) {
                if (e)
                    return callback(webdav_server_1.v2.Errors.ResourceNotFound);
                var isFolder = data['.tag'] === 'folder';
                var type = isFolder ? webdav_server_1.v2.ResourceType.Directory : webdav_server_1.v2.ResourceType.File;
                if (!_this.resources[path.toString(false)])
                    _this.resources[path.toString(false)] = {};
                _this.resources[path.toString(false)].type = type;
                callback(undefined, type);
            });
        }
    };
    ;
    return AliyunFileSystem;
}(webdav_server_1.v2.FileSystem));
exports.AliyunFileSystem = AliyunFileSystem;
