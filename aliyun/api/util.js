const request = require('../client/request')

async function createStream(url){
    let apiurl = url
    let resBody = await request.get(apiurl, {responseType:'stream'})
    if(resBody.status != 200||!resBody.data){
        return {"code":503,"message":"创建数据流失败"}
    }
    return resBody.data
}

module.exports={
    createStream
}