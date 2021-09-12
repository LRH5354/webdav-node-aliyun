"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var AliyunFileSystem_1 = require("./AliyunFileSystem");
var AliyunSerializer_1 = require("./AliyunSerializer");
__export(require("./AliyunFileSystem"));
__export(require("./AliyunSerializer"));
exports.info = {
    settings: [{
            key: 'fleshToken',
            type: 'string',
            required: true
        }],
    fs: AliyunFileSystem_1.AliyunFileSystem,
    serializer: new AliyunSerializer_1.AliyunSerializer()
};
