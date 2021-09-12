var request = require('../client/request')
var {setUserToken} =  require("./user")
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
async function ApiTokenLogin(token) {
    var token = token || "89f9eb453c4a4249998a1bdd5f6f7725"
    if (typeof token == 'undefined' || token == '') {
        throw new Error('token 是必须的！！！')
    }
    var postData = {
        refresh_token: token
    }
    try {
        var res = await request({
            method: 'POST',
            url: "https://websv.aliyundrive.com/token/refresh",
            data: JSON.stringify(postData),
            headers: {
                "User-Agent":UA,
                "Content-Type":"application/json; charset=UTF-8"
            }
        })
        if (res.status !== 200||!res.data) {
            throw new Error("token 登录失败！！")
        }
         setUserToken(res.data)
    } catch (error) {
        console.log("更新token失败",error)
    }
}

module.exports = {
    ApiTokenLogin
}