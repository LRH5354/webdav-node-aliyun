const request = require('../client/request')

async function createStream(url,range){
    let apiurl = url
    let resBody = await request.get(apiurl, {responseType:'stream',headers: {'Connection': 'keep-alive', "range":range}})
    if(resBody.status == 200||resBody.status==206||resBody.data){
        return resBody.data
    }
    return {"code":503,"message":"创建数据流失败"}
   
}

module.exports={
    createStream
}