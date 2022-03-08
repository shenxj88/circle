// pages/publish/publish.js
var that;
const db = wx.cloud.database();

Page({
  /*** 页面的初始数据*/
  data: {
  userInfo:null,
  content:'',
  textLength:0,
  images:[],
  maxCount:9,//图片最多9张
  images:[],
  images_upload_success:[],  //图片上传成功后的云端图片地址数据
  images_upload_success_size:0,   //图片上传成功的数量
  isClickSend:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  that = this;
  //获取登录成功的用户信息
  wx.getStorage({
    key:'userInfo',
    success(res){
      console.log('set storage success:',JSON.parse(res.data))
      that.setData({
        userInfo:JSON.parse(res.data)
      })
    }
  })
  },
  // 文本框
  bindInput:function(e){
    that.setData({
      content:e.detail.value,
      textLength:e.detail.value.lenght
    })
  },
  // 选择图片
  chooseImage:function(){
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        that.setData({
           // tempFilePath可以作为img标签的src属性显示图片
          images:res.tempFilePaths
        })
      }
    })
    },
    //预览图片
    previewImage:function(e){
      wx.previewImage({
        current: that.data.images[e.currentTarget.dataset.index], // 当前显示图片的http链接
        urls: that.data.images // 需要预览的图片http链接列表
      })
    },
    //上传图片
    uploadImage:function(index){
      // 上传到存储中
      wx.cloud.uploadFile({
        cloudPath:'circle'+new Date().getTime()+"_"+Math.floor(Math.random()*1000)+".jpg",
        filePath:that.data.images[index],  //文件路径
        success: res=>{
          console.log(res.fileID);
          that.data.images_upload_success[index] = res.fileID;
          that.data.images_upload_success_size = that.data.images_upload_success_size+1;
          //全部上传成功
          if(that.data.images_upload_success_size == that.data.images.length){
            console.log("success:",that.data.images_upload_success)
            //添加到数据库
            that.circleAdd();
          }else{
            //继续上传
            that.uploadImage(index+1);
          }
        },
        fail:err=>{
          that.setData({
            images_upload_success:[],
            images_upload_success_size:0
          })
          //关闭提示
          wx.hideLoading()
          wx.showToast({
            icon:'none',
            title:'图片上传失败，请重试',
          })
        }
      })

        
    },
// 点击上传
    clickSend:function(){
      //如果文字填写内容为空并且没有天界图片时
      if(that.data.content.length==0 && that.data.images.length==0){
        wx.showToast({
          icon:'none',
          title: '请发布点内容吧',
        })
        return ;
      }
      if(that.data.images.length>0){
        that.setData({
          images_upload_success:that.data.images
        })
        that.uploadImage(0)
      }else{
        that.circleAdd();
      }
    },
    ////将发布的内容添加到云数据库
    circleAdd(){
      db.collection('circle').add({
        data:{
          content:that.data.content,
          images:that.data.images_upload_success,
          time:new Date(),
          loveList:[],
          commentList:[],
          userInfo:that.data.userInfo,
        }
      }).then(res=>{
        console.log('add circle success:',res)
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        //获取上一个页面
        let pages = getCurrentPages();
        let before = pages[pages.length - 2]
        //刷新列表页面
        before.refresh()
        // 关闭发布页面,返回上一个页面
        wx.navigateBack({
          delta:1
        })
      }).catch(error=>{
        console.log('add circle error:',error)
        wx.hideLoading()
        wx.showToast({
          title: '发布失败',
        })
      })
    },
})