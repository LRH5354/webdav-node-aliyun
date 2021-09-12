var webdav_server_1 = require("webdav-server");
var {ApiTokenLogin} = require("../api/login") 
var {FileList,FileInfo} = require("../api/apiFile")
var {GetUserBoxID} = require("../api/user")

function AliyunClient(refleshToken){
    this.refleshToken =refleshToken
    this.isLogined = false
    this.resources={}
    // Aliyun 登录测试
    ApiTokenLogin(refleshToken).then(()=>{
        this.isLogined = true
    })
}

AliyunClient.prototype.FileInfo = function ({boxid,path}){

    var boxid = boxid || GetUserBoxID()
    var file_id = this.getFileIdByPath(path)
    return new Promise((resove,reject)=>{
        /**    
         *  获取文件详细信息
            content_type:'folder'
            trashed:false
            created_at:'2021-09-06T15:41:11.852Z'
            domain_id:'bj29'
            drive_id:'402880'
            encrypt_mode:'none'
            file_id:'61363697949741ca87f24a9e84a449125269a392'
            hidden:false
            name:'动漫'
            parent_file_id:'root'
            starred:false
            status:'available'
            type:'folder'
            updated_at:'2021-09-06T15:41:11.852Z'
         */
        FileInfo(boxid,file_id).then(data=>{
            this.resources[path]
            resove(data)
        }).catch(err=>{
            reject(err)
        })
    })
}
AliyunClient.prototype.FileList = function ({boxid,path}) { 
    var boxid = boxid || GetUserBoxID()
    var parentid = this.getFileIdByPath(path)
    // 存储根目录
    if(path == '') {
        this.resources[path] = { 
                    '.tag': 'folder',
                    "name": '',
                    "size": 0}
    }
    return new Promise((resove,reject)=>{
        FileList(boxid,parentid,undefined).then((filelist)=>{
            /** 
             * 存储文件id
             * return
             * return
             * {items:[
                    created_at: "2021-08-14T10:59:42.908Z"
                    domain_id: "bj29"
                    drive_id: "402880"
                    encrypt_mode: "none"
                    file_id: "6117a21e5585dab18cbe4d21991739c7c4b07efc"
                    hidden: false
                    name: "进击的巨人 第二季"
                    parent_file_id: "6117a21e4314143a3bd14fcf824b85e412ff4cff"
                    starred: false
                    status: "available"
                    type: "folder"
                    updated_at: "2021-08-14T10:59:42.908Z"}
             */
            
             filelist.items.forEach(item => {
                let pathKey = path + "/" + item.name
                item.type = item.type == "folder" ?  webdav_server_1.v2.ResourceType.Directory : webdav_server_1.v2.ResourceType.File;
                this.resources[pathKey] = item
                this.resources[pathKey].metadata = item
             });
             resove(filelist.items)
        }).catch(err=>{
            reject(err)
        })
    })

 }

 AliyunClient.prototype.getFileIdByPath = function(path){
   if(path == "" ) return 'root'
   return  this.resources[path] && this.resources[path] && this.resources[path].file_id || null
 }

module.exports = AliyunClient