// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env:"cloud1-1gypbc6782059567"
})

const db = cloud.database();
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  console.log(event)
  console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()
  const {
    nickName,
    avatarUrl,
    gender
  } = event;
  // 查询用户是否存在
  return db.collection('user').where({
      _openid: wxContext.OPENID
    }).get()
    .then(res => {
      if (res.data.length > 0) {
        // 用户存在，将用户信息返回
        return {
          code: 200,
          errMsg: '用户已经存在',
          userInfo: res.data[0]
        }
      } else {
        // 用户不存在，将用户添加进user表
        return db.collection('user').add({
          data: {
            _openid: wxContext.OPENID,
            nickName: nickName,
            avatarUrl: avatarUrl,
            gender: gender,
            time: new Date()
          }
        }).then(res => {
          return {
            code: 201,
            errMsg: '用户注册成功',
            _openid: wxContext.OPENID
          }
        })
        .catch(error=>{
          return {
            code: 301,
            errMsg: '用户注册失败',
          }
        })
      }
    }).catch(error=>{
      return {
        code: 300,
        errMsg:'用户查询失败',
      }
    })
  /**
   * 第二章
   * 1.第一个云函数
   * 2.第一个页面登录页面
   * 3.微信授权登录
   * 4.本地数据存储
   * 5.云端数据库存储数据
   * 6.自定义云函数
   * 
   * 第三章 
   * 1.朋友圈列表展示 
   *  item
   *  统称列表为一个list，列表的每一条数据，我们简称item
   * 
   */

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  //   env: wxContext.ENV,
  // }
  /**
   * 
   * const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    type,
    circleId, 
    nickName, 
  } = event;
  const wxContext = cloud.getWXContext()
  if(type==0){
    // 取消赞
    return db.collection('circle').doc(circleId).update({
      data: {
        loveList: _.pull({
          _openid: 'o7Utq5HE08zTyQ9Ja7VYjZ9jL-lg'
        })
      }
    }).then(res=>{
      return {
        code:'200',
        errMsg:'取消赞成功'
      }
    }).catch(err=>{
      return {
        code:'300',
        errMsg:'取消赞失败'
      }
    })
  } else {
    return db.collection('circle').doc(circleId).update({
      data: {
        loveList: _.push({
          _openid: 'o7Utq5HE08zTyQ9Ja7VYjZ9jL-lg',
          nickName:nickName
        })
      }
    }).then(res=>{
      return {
        code:'200',
        errMsg:'赞成功'
      }
    }).catch(err=>{
      return {
        code:'300',
        errMsg:'赞失败'
      }
    })
  }
   * 
   */
}