// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    type, //是点赞1， 还是取消赞 0
    circleId, //当前操作的circle id
    nickName, // 昵称
  } = event;
  const wxContext = cloud.getWXContext()
  if (type == 0) {
    return db.collection('circle').doc(circleId).update({
        data: {
          loveList: _.pull({
            _openid: wxContext.OPENID
          })
        }
      })
      .then(res => {
        return {
          code : 200,
          errMsg:'取消赞成功'
        }
      })
      .catch(err => {
        return {
          code : 300,
          errMsg:'取消赞失败'
        }
      })
  } else if (type == 1) {
    return db.collection('circle').doc(circleId).update({
        data: {
          loveList: _.push({
            _openid: wxContext.OPENID,
            nickName:nickName
          })
        }
      })
      .then(res => {
        return {
          code : 200,
          errMsg:'点赞成功'
        }
      })
      .catch(err => {
        return {
          code : 300,
          errMsg:'点赞失败'
        }
      })
  }
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}