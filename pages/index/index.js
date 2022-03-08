// index.js
var that;
const db = wx.cloud.database();
var _ = db.command   //评论
var _animation; // 动画实体
var _animationIndex = 0; // 动画执行次数index（当前执行了多少次）
var _animationIntervalId = -1; // 动画定时任务id，通过setInterval来达到无限旋转，记录id，用于结束定时任务
const _ANIMATION_TIME = 300; // 动画播放一次的时长ms
Page({
  data: {
    scrollTop:null,
    userInfo:{},
    list:[],
    showOperationPannelIndex:-1,  //当前点击操作按钮的索引
    currentCircleIndex:-1,  //判断是否点击评论
    showCommentAdd:false,   //键盘显示
    commentContent:'',
    heightBottom:'',  //键盘高度
    refresh:false,
    loadMore: false,
    haveMoreData:true,
    loading:false,
    page:0,
    pageCount:5,
    reply:'',//回复
  },
  onLoad:function(options){
    that = this;
    //获取登录成功的用户信息
  //   wx.getUserProfile({
  //   success: (res)=>{
  //     console.log("登录成功获取的数据",res)
  //     const userInfo = res.userInfo
  //     ////调用API向本地缓存存入数据
  //     wx.setStorageSync('userinfo',userInfo );
  //   }
  // })
  wx.getStorage({
    key:'userInfo',
    success(res){
      console.log('set storage success:',JSON.parse(res.data))
      that.setData({
        userInfo:JSON.parse(res.data)
      })
    }
  })
    // 朋友圈发布内容循环
    // for(var i=1;i<10;i++){
    //   var circleData = {};
    //   circleData.nickName = "朋友-"+i;
    //   circleData.content = "朋友圈发布内容-"+i;
    //   circleData.time = "2020-05-1"+i;
    // //  定义图片、点赞、评论数组
    //   var imageList = [];
    //   var loveList = [];
    //   var commentList = [];
    //   //赋值
    //   circleData.imageList = imageList;
    //   circleData.loveList = loveList;
    //   circleData.commentList = commentList;
    //   // 图片、点赞、评论循环
    //   for(var j=1;j<i;j++){
    //     //图片
    //     imageList.push(j);
    //     //点赞
    //     var loveData = {};
    //     loveData.nickName = "点赞-"+j;
    //     loveList.push(loveData);
    //     //评论
    //     var commentData = {};
    //     commentData.nickName="兰陵王-"+j + ":";
    //     commentData.content = "评论内容 " + j;
    //     commentList.push(commentData);
    //   }
    //   that.data.list.push(circleData);
    // }
    that.setData({
      list:that.data.list
    })
  },
    /**
   * 生命周期函数--监听页面显示
   */
      /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    _animationIndex = 0;
    _animationIntervalId = -1;
    this.data.animation = '';

    _animation = wx.createAnimation({
      duration: _ANIMATION_TIME,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    })

    that.refresh();
  },
  onShow: function () {
  },
  /**
   * 开始旋转
   */
  startAnimationInterval: function () {
    var that = this;
    that.rotateAni(++_animationIndex); // 进行一次旋转
    _animationIntervalId = setInterval(function () {
      that.rotateAni(++_animationIndex);
    }, _ANIMATION_TIME); // 每间隔_ANIMATION_TIME进行一次旋转
  },

  /**
   * 停止旋转
   */
  stopAnimationInterval: function () {
    if (_animationIntervalId > 0) {
      clearInterval(_animationIntervalId);
      _animationIntervalId = 0;
    }
  },
    /**
   * 实现image旋转动画，每次旋转 120*n度
   */
  rotateAni: function (n) {
    _animation.rotate(120 * (n)).step()
    this.setData({
      animation: _animation.export()
    })
  },
  // 点赞操作模板的显示隐藏
  showOperationPannel:function(e){
    var index = e.currentTarget.dataset.index;
    if(that.data.showOperationPannelIndex == index){
      that.setData({
        showOperationPannelIndex:-1
      })
    }else{
      that.setData({
        showOperationPannelIndex:index
      })
    }
  },
  // 点赞
  clickLove:function(e){
    //获取当前点击的索引
    var index = e.currentTarget.dataset.index;
    var circleData = that.data.list[index];
    var loveList = circleData.loveList;

    var isHaveLove = false;
    //判断当前用户是否点过赞
    for (var i = 0; i < loveList.length; i++) {
      if (that.data.userInfo._openid == loveList[i]._openid) {
        isHaveLove = true;
        loveList.splice(i, 1);
        // 如果已经点赞，取消赞
        wx.cloud.callFunction({
            name: 'updateCircleLove',
            data: {
              type: 0,
              circleId: circleData._id
            }
          })
          .then(res => {
            console.log('取消赞成功', res)
          })
          .catch(err => {
            console.log('取消赞失败', err)
          })
        circleData.isLove = false;
        break;
      }
    }
    //没点过赞则添加
    if (!isHaveLove) {
      loveList.push({
        nickName: that.data.userInfo.nickName,
        _openid: that.data.userInfo._openid
      });
      // 如果未点赞，去点赞
      wx.cloud.callFunction({
          name: 'updateCircleLove',
          data: {
            type: 1,
            circleId: circleData._id,
            nickName: that.data.userInfo.nickName
          }
        })
        .then(res => {
          console.log('点赞成功', res)
        })
        .catch(err => {
          console.log('点赞失败', err)
        })
      circleData.isLove = true;
    }
    //重新渲染数据
    that.setData({
      list:that.data.list,
      showOperationPannelIndex:-1
    })
  },
 
  //评论
  clickComment:function(e){
    that.setData({
      currentCircleIndex:e.currentTarget.dataset.index,
      showCommentAdd:true,
      showOperationPannelIndex:-1,
    })
  },
  bindInput:function(e){
      that.setData({
        commentContent:e.detail.value
      })
  },
  bindFocus:function(e){
    that.setData({
      heightBottom:e.detail.height
    })
  },
  clickSend:function(e){
    var circleData = that.data.list[that.data.currentCircleIndex];
    var commentList = circleData.commentList;
    var commentData = {};
    commentData.nickName = that.data.userInfo.nickName + ":";
    commentData.content = that.data.commentContent;
    commentData._openid = that.data.userInfo._openid;
    //回复
    commentData.reply = that.data.reply;
    if(that.data.reply.length>0){
      commentData.nickName = that.data.userInfo.nickName;
    }
    commentList.push(commentData);
    this.setData({
      list:that.data.list,
      showCommentAdd:false,
      commentContent:'',
      reply:''
    })
    //将评论添加到运输局库
    db.collection('circle').doc(circleData._id).update({
      data:{
        commentList:_.push(commentData)
      }
    })
    .then(res=>{
      console.log("comment add success:",res)
    })
    .catch(err=>{
      console.log("comment add fail:",err)
    })
  },
   // 点击评论列表条目
  clickCommentItem(e){

    // 1.获取评论所属的朋友圈信息index
    var circleIndex = e.currentTarget.dataset.index;
    // 2.获取评论在评论列表中的索引
    var commentIndex = e.currentTarget.dataset.commentindex;

    var circleData = that.data.list[circleIndex];
    var commentList = circleData.commentList;

    var commentData = commentList[commentIndex]
    var nickName = commentData.nickName;

    that.setData({
      currentCircleIndex: e.currentTarget.dataset.index,
      showCommentAdd: true,
      showOperationPannelIndex: -1,
      reply:nickName
    })
  },
  //跳转到发布页面
  goPublish:function(){
    wx.navigateTo({
      url: '../publish/publish',
    })
  },
  //从数据库中获取朋友圈列表数据
  getList() {
    if (that.data.loading) {
      return
    } else {
      that.setData({
        loading: true
      })
    }
    var currentPage = that.data.page;
    // 如果是刷新，要设置请求的页码为0
    if (that.data.refresh) {
      currentPage = 0;
    }
    // 获取好友的朋友圈信息
    db.collection('circle')
      .orderBy('time', 'desc')
      .skip(currentPage * that.data.pageCount)
      .limit(that.data.pageCount)
      .get()
      .then(res => {
        console.log('getList:', res)
        if (that.data.refresh) {
          that.setData({
            list: []
          })
        }
        if (res.data.length > 0) {
          for (var i = 0; i < res.data.length; i++) {
            res.data[i].isLove = false;
            for (var j = 0; j < res.data[i].loveList.length; j++) {
              if (that.data.userInfo._openid == res.data[i].loveList[j]._openid) {
                // 如果已经点赞，设置状态isLove true
                res.data[i].isLove = true;
                break;
              }
            }
            res.data[i].time = that.js_date_time(res.data[i].time);
            that.data.list.push(res.data[i])
          }
          that.setData({
            list: that.data.list
          })

          if (res.data.length == that.data.pageCount) {
            that.setData({
              haveMoreData: true
            })
          } else {
            that.setData({
              haveMoreData: false
            })
          }
        }
        that.setData({
          refresh: false,
          loading: false,
          loadMore: false,
          page: currentPage + 1
        })
        that.stopAnimationInterval();
        // wx.hideLoading()
      })
      .catch(error => {
        console.log('getList error:', error)
        that.stopAnimationInterval();
        that.setData({
          refresh: false,
          loading: false,
          loadMore: false,
        })
        // wx.hideLoading()
      })
  },
    //转换年月日
    js_date_time(unixtime) {
      var date = new Date(unixtime);
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      var h = date.getHours();
      h = h < 10 ? ('0' + h) : h;
      var minute = date.getMinutes();
      var second = date.getSeconds();
      minute = minute < 10 ? ('0' + minute) : minute;
      second = second < 10 ? ('0' + second) : second;
      return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second; //年月日时分秒
    },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("onReachBottom")
    if (that.data.loading) {
      return
    } else {
      that.setData({
        loadMore: true,
      })
     //延时处理
      setTimeout(() => {
        that.getList();
      }, 1500);
    }
  },
  
   refresh(){
    // loveList.push({nickName:that.data.userInfo.nickName});
    // var avatarUrl=that.data.list.userInfo;
     console.log("refresh:",that.refresh);
     if(that.data.loading){
       return
     }
     that.setData({
       refresh:true,
     })
     that.startAnimationInterval();
     that.getList();
   },
})
