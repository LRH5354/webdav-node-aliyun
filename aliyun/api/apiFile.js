const request = require('../client/request')

async function FileList(boxid,parentid,marker){
    let apiurl = "https://api.aliyundrive.com/v2/file/list"
    let postData = {
        drive_id:boxid,
        parent_file_id:parentid,
        limit:100,
        all:false,
        fields:"thumbnail",
        order_by:'name',
        order_direction:"ASC",
        marker:marker
    }
    let resBody = await request.post(apiurl,JSON.stringify(postData))
    if(resBody.status != 200||!resBody.data){
        throw `获取文件列表失败！！`
    }
    return resBody.data
}

async function FileInfo(boxid,file_id,parentpath){
    let apiurl = "https://api.aliyundrive.com/v2/file/get"
    let postData = {
        drive_id:boxid,
        file_id:file_id
    }
    let resBody = await request.post(apiurl,JSON.stringify(postData))
    if(resBody.status != 200||!resBody.data){
        return {"code":503,"message":"获取文件信息失败！！"}
    }
    return resBody.data
}
async function CreatForder(boxid,parentid,name){
    let apiurl = "https://api.aliyundrive.com/v2/file/create"
    let postData = {
        drive_id:boxid,
        parent_file_id:parentid,
        naem:name,
        check_name_mode:'refuse',
        type:'folder'
    }
    let resBody = await request.post(apiurl,JSON.stringify(postData))
    let resBodyParse = JSON.parse(resBody)
    if(resBodyParse.code != 201||resBodyParse.file_id<20){
        return {"code":503,"message":"创建文件夹失败"}
    }
    return resBodyParse
}

async function Rename(boxid,file_id,name){
    let apiurl = "https://api.aliyundrive.com/v2/file/update"
    let postData = {
        drive_id:boxid,
        file_id:file_id,
        naem:name,
        check_name_mode:'refuse',
    }
    let resBody = await request.post(apiurl,JSON.stringify(postData))
    let resBodyParse = JSON.parse(resBody)
    if(resBodyParse.code != 200||resBodyParse.file_id<20){
        return {"code":503,"message":"重命名失败"}
    }
    return resBodyParse 
}

/**
 * 自定义获取下载链接的有效时长
 * @param {*} boxid
 * @param {*} file_id
 * @param {*} expire_sec
 */
async function FiledownloadUrl (boxid,file_id,expire_sec){
    let apiurl = "https://api.aliyundrive.com/v2/file/get_download_url"
    let postData = {
        drive_id: boxid,
		file_id:  file_id,
		expire_sec: expire_sec,
    }
    let resBody = await request.post(apiurl,JSON.stringify(postData))
    if(resBody.status == 401){
        return {"code":401,"message":"资源未授权"}
    }
    if(resBody.status != 200||!resBody.data){
        return {"code":503,"message":"获取文件信息失败！！"}
    }
    return resBody.data
}

async function TrashBatch(boxid,filelist){
    let apiurl = "https://api.aliyundrive.com/v2/file/update"
    let postData = {
        drive_id:boxid,
        file_id:file_id,
        naem:name,
        check_name_mode:'refuse',
    }
    let resBody = await request.post(apiurl,JSON.stringify(postData))
    let resBodyParse = JSON.parse(resBody)
    if(resBodyParse.code != 200||resBodyParse.file_id<20){
        return {"code":503,"message":"重命名失败"}
    }
    return resBodyParse 
}

module.exports={
    FileList,
    FileInfo,
    CreatForder,
    Rename,
    TrashBatch,
    FiledownloadUrl
}