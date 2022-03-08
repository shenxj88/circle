// pages/center/center.js
var that;
var db =  wx.cloud.database()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null
  },
  // 授权登录
  // bindGetUserInfo(e){
    login(){
    that = this
      wx.getUserProfile({
        desc: '必须授权才可以继续使用',
        success:res=>{
      //     console.log('授权成功',res.userInfo)
      //     that.addUser(res.userInfo)
      //     // 存缓存
      //     // 获取登录信息成功
          // if(e.detail.userInfo){
            if(res.userInfo){
            // wx.setStorage({
            //   data:JSON.stringify(e.detail.userInfo),
            //   key:'userInfo',
            //   success(res){
            //     console.log('set storage success:',res)
            //   }
            // })
            // wx.getStorage({
            //   key:'userInfo',
            //   success(res){
            //     console.log('set storage success:',JSON.parse(res.data))
            //     that.setData({
            //       userInfo:JSON.parse(res.data)
            //     })
            //   }
            // })
            that.addUser(res.userInfo);
          }else{
            // 获取登录信息失败
            wx.showToast({
              icon:'none',
              title: '拒绝授权',
            })
          }
        
          // wx.setStorageSync('userInfo', res.userInfo) //把用户信息存储在本地缓存中
          that.setData({
            userInfo:res.userInfo
          })
        },
        fail:res=>{
          console.log('授权失败',res)
        },
      })
  },
  // 
  addUser(userInfo){
    wx.showLoading({
      title:'正在登录...'
    })
    wx.cloud.callFunction({
      name:'login',
      data:userInfo
    })
    // db.collection('sutuser').add({
    //   data:{
    //     nickName:userInfo.nickName,
    //     avatarUrl:userInfo.avatarUrl,
    //     gender:userInfo.gender,
    //     time:new Date()
    //   }
    // })
    .then(res=>{
      console.log('callFunction success',res)
      if(res.result.code==200){
        userInfo._openid=res.result.userInfo._openid
      }
      if(res.result.code==201){
        userInfo._openid=res.result._openid
      }
      wx.setStorage({
        data:JSON.stringify(userInfo),
        key:'userInfo',
        success(res){
          getApp().globalData.userInfo = userInfo;
          wx.hideLoading()
          wx.navigateTo({
            url: '/pages/index/index',
          })
          // wx.navigateTo({
          //   url: '../circle/circle',
          // })
        }
      })
    }).catch(console.error)
  },
  // 注销
  logOut(){
    this.setData({
      userInfo:{}
    })
    // 清除缓存
    wx.clearStorageSync('userInfo')
    wx.showToast({
      title: '退出成功',
      icon: 'success',
      duration:1000,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    wx.getStorage({
      key:'userInfo',
      success(res){
        console.log('set storage success:',JSON.parse(res.data))
        that.setData({
          userInfo:JSON.parse(res.data)
        })
      }
    })
  
    // const user = wx.getStorageSync('userInfo')
    // this.setData({
    //   userInfo:user
    // })
  },
 
})