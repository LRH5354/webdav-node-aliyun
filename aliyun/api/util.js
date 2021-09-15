const request = require('../client/request')

async function createStream(url,range,size){
    let apiurl = url
    let start,end;
    let headers = {}
    if(range){
        let regx = /([0-9]*)-([0-9]*)/gi
        let s = regx.exec(range)
        start = s[1]
        end = s[2]
        headers = {
            range:`bytes=${start||0}-${end||size}`
        }
    }
    console.log(headers)
    let resBody = await request.get(apiurl, {responseType:'stream', headers:headers})
    if(resBody.status == 200||resBody.status==206||resBody.data){
        return resBody.data
    }
    return {"code":503,"message":"创建数据流失败"}
}

module.exports={
    createStream
}