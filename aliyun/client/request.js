var axios = require('axios') 
var {getAuthorization} = require("../api/user")
const instance = axios.create({
  timeout: 15000
})

!function initInterceptors(instance) {
  instance.interceptors.request.use(
    config => {
      // 复写请求配置，添加Authorization请求头
      Object.assign(config.headers,getAuthorization()) 
      console.log("request请求：", `${config.url}  ${config.method}  ${config.data}`)
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    response => {
      return response
    },
    error => {
      return Promise.reject(error)
    }
  )
}(instance)

module.exports=instance
