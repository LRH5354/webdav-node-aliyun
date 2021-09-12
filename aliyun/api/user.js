var _usertoken = {
    access_token: "",
    refresh_token: "",
    expires_in: "",
    token_type: "",
    user_id: "",
    user_name: "",
    avatar: "",
    nick_name: "",
    default_drive_id: "",
    default_sbox_drive_id: "",
    role: "",
    status: "",
    expire_time: "",
    state: "",
    need_link: "",
    pin_setup: "",
    is_first_login: "",
    need_rp_verify: "",
}
var _userinfo = {
    spu_id: "", //non-vip
    name: "", //普通用户
    is_expires: "",
    used_size: "",
    total_size: "",
    download_speed: "", //-1
    drive_size: "", //100GB
    safe_box_size: "", //50GB
    upload_size: "", //30GB
    M_info_time:""
}

var _loginuser = {
    UserLoginType: "",
    UserID: "",
    UserName: "",
    UserFace: "",
    UserXiangCeID: "",
    UserAccessToken: "",
    UserRefreshToken: "",
    UserToken: _usertoken,
    UserInfo: _userinfo,
}


function getAuthorization() {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "Origin": "https://www.aliyundrive.com",
        "Referer": "https://www.aliyundrive.com/",
        "Authorization": `${_loginuser.UserToken.token_type} ${_loginuser.UserToken.access_token}`
    }
}

function setUserToken(option){
    if(option){
        Object.assign(_loginuser.UserToken,option)
        console.log("更新token成功: ",{refresh_token:option.refresh_token,access_token:option.access_token})
    }
    //todo 将配置文件写入文件保存
}
/**
 * 获取网盘ID
 * @returns
 */
function GetUserBoxID(){
    return _usertoken.default_drive_id
}
/**
 * 获取分享网盘ID
 * @returns 
 */
function GetUserSBoxID(){
    return _usertoken.default_sbox_drive_id
}

module.exports={
    getAuthorization,
    setUserToken,
    GetUserBoxID,
    GetUserSBoxID
}