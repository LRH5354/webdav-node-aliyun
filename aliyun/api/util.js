const request = require('../client/request')

async function createStream(url,range,size){
    let apiurl = url
    let resBody = await request.get(apiurl, {responseType:'stream', headers:{range:`bytes=0-${size}`}})
    if(resBody.status == 200||resBody.status==206||resBody.data){
        return resBody.data
    }
    return {"code":503,"message":"创建数据流失败"}
   
}

module.exports={
    createStream
}