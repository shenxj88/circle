// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.cloud.init({
      env:'cloud1-1gypbc6782059567'
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    //登录优化
    try {
      var value = wx.getStorageSync('userInfo')
      if (value) {
        this.globalData.userInfo = JSON.parse(value);
      }
    } catch (e) {
      console.log('app js:', '用户未登录')
    }
  },
  globalData: {
    // userInfo: null
  }

})
