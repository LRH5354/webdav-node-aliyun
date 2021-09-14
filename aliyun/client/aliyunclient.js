var cache = require('memory-cache')
var webdav_server_1 = require("webdav-server");
var {ApiTokenLogin} = require("../api/login") 
var {FileList,FileInfo,FiledownloadUrl} = require("../api/apiFile")
var {createStream} = require('../api/util')
var {GetUserBoxID} = require("../api/user")

// 设置缓存 key value time（ms） callback
// cache.put('houdini', 'disappear', 100, function(key, value) {
//     console.log(key + ' did ' + value);
// }); 

function AliyunClient(refleshToken){
    this.refleshToken = refleshToken
    this.isLogined = false
    this.resources= new cache.Cache();
    // Aliyun 登录测试
    ApiTokenLogin(refleshToken).then(()=>{
        this.isLogined = true
    })
};

/**    
 *  返回文件详细信息
    content_type:'folder'
    trashed:false
    created_at:'2021-09-06T15:41:11.852Z'
    domain_id:'bj29'
    drive_id:'402880'
    encrypt_mode:'none'
    file_id:'61363697949741ca87f24a9e84a449125269a392'
    hidden:false
    name:'folderName'
    parent_file_id:'root'
    starred:false
    status:'available'
    type:'folder'
    updated_at:'2021-09-06T15:41:11.852Z'
  */
AliyunClient.prototype.FileInfo = function ({boxid,path}){
    var boxid = boxid || GetUserBoxID()
    var file_id = this.getFileIdByPath(path)
    return new Promise((reslove,reject)=>{
        FileInfo(boxid,file_id).then(data=>{
            reslove(data)
        }).catch(err=>{
            reject(err)
        })
    })
};
/** 
 * 存储文件id
 * {items:[{
    created_at: "2021-08-14T10:59:42.908Z"
    domain_id: "bj29"
    drive_id: "402880"
    encrypt_mode: "none"
    file_id: "6117a21e5585dab18cbe4d21991739c7c4b07efc"
    name: ""
    parent_file_id: "6117a21e4314143a3bd14fcf824b85e412ff4cff"
    starred: false
    status: "available"
    type: "folder"
    updated_at: "2021-08-14T10:59:42.908Z"}]}
*/
AliyunClient.prototype.FileList = function ({boxid,path}) { 
    var boxid = boxid || GetUserBoxID()
    var parentid = this.getFileIdByPath(path)
    // 存储根目录
    if(path == "" || path =="/") {
        this.resources.put('/', {  
                                   '.tag': 'folder',
                                    "name": '',
                                    "file_id":"root",
                                    "metadata":{}
                                })
    }
    return new Promise((reslove,reject)=>{
        FileList(boxid,parentid,undefined).then((filelist)=>{
             filelist.items.forEach(item => {
                let pathKey = path + "/" + item.name
                let fileCache = {
                    ".tag":item.type,
                    "name":item.name,
                    "file_id":item.file_id,
                    "metadata":Object.assign({},item)
                }
                this.resources.put(pathKey,fileCache)
             });
             reslove(filelist.items)
        }).catch(err=>{
            reject(err)
        })
    })

 }

 AliyunClient.prototype.FileDownload = function({boxid,path,headers}){
    var boxid = boxid || GetUserBoxID()
    var file_id = this.getFileIdByPath(path)
    var range = headers&&headers.range
    return new Promise((reslove,reject)=>{
        FiledownloadUrl(boxid,file_id,60*60*3).then(({url,size})=>{
            createStream(url,range,size).then(data=>{
                if(data.code &&data.code == 503){
                   reject("创建读写流失败！！！")
                }
                reslove(data)
            }).catch(err=>{
                reject(err)
            })
        })
    })
 }

 AliyunClient.prototype.createDownLoadStream = function(url){

 }

 AliyunClient.prototype.getFileIdByPath = function(path){
   if(path == ""|| path =="/") return 'root'
   return  this.resources.get(path) && this.resources.get(path).file_id || null
 }

module.exports = AliyunClient