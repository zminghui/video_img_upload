//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    imgSrc:'',
    videoSrc:'',
  },
  //选择图片
  upload_image_: function(fileName) {
    var this_ = this;

    wx.chooseImage({
      success(res) {
        console.log("图片信息" + res)
        //判断图片大小
        if (res.tempFiles[0].size > 1024 * 1024 * 20) {
          wx.showToast({
            title: "图片不能超过20M！",
            icon: 'none',
            duration: 1000 * 2,
            mask: true
          })
          return;
        }

        //上传
        var filePath = res.tempFilePaths[0];

        this_.upload_II_(fileName, filePath, res.tempFiles[0].size);
        this_.setData({
          imgSrc: res.tempFilePaths[0]
        })

      }
    })

  },

  //选择视频

  upload_video_: function(fileName) {
    var this_ = this;

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      compressed: false,
      success(res) {
        console.log("视频信息-临时路径" + res.tempFilePath)
        console.log("视频信息-大小" + res.size)
        console.log("视频信息-时长" + res.duration)

        if (res.size > 1024 * 1024 * 200) {
          wx.showToast({
            title: "视频不能超过200M！",
            icon: 'none',
            duration: 1000 * 2,
            mask: true
          })
          return;
        }
        this_.setData({
          videoSrc: res.tempFilePath
        })
        this_.upload_II_(fileName, res.tempFilePath, res.size);
      }
    })
  },
  upload_II_: function(fileName, filePath, fileSize) {

    wx.showToast({
      title: '正在上传',
      icon: 'loading',
      duration: 1000 * 100,
      mask: true
    })

    var this_ = this;
    //【1】获取oss信息
    wx.request({
      url: '你的后端提供的接口地址',
      data: {
        fileSize: fileSize
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        console.log(res)
        if (res.statusCode == 200) {
          // res = res.data;
          var accessid = res.data.accessid;
          var policy = res.data.policy;
          var signature = res.data.signature;
          var fPath = res.data.dir;
          var expire = res.data.expire;
          var uploadUrl = res.data.host;

          //【2】上传文件
          var fType = filePath.substring(filePath.lastIndexOf("."), filePath.length);
          console.log("类型 ：" + fType);

          //业务逻辑拼 key 和文件名称
          fileName = new Date().getTime() + Math.floor(Math.random() * 150) + fType;
          fPath = fPath + '/' + fileName;
          console.log('fPath:', fPath, 'fileName:', fileName)
          // console.log(babyData);

          //这里是进度条
          this_.setData({
            percent_: 0,
            display_: "display: block;"
          });

          const uploadTask = wx.uploadFile({
            url: uploadUrl,
            formData: {
              'Filename': fileName,
              'Content-Disposition': 'filename=' + fileName, //文件描述 这里可以设置直接下载还是可以在线查看
              'key': fPath, //key 是阿里云储存路径
              'policy': policy,
              'OSSAccessKeyId': accessid,
              'success_action_status': '200', //让服务端返回200,不然，默认会返回204
              'signature': signature
            },
            name: 'file',
            filePath: filePath,
            header: {
              'content-type': 'multipart/form-data;boundary=' + fileSize
            },
            success: res => {
              console.log(res);
              console.log("UPLOAD : " + new Date());
              if (res.statusCode == 200) {
                //上传成功
                //访问地址
                console.log(uploadUrl+"/"+fPath);
                
                wx.showToast({
                  title: '上传成功',
                  icon: 'success',
                  duration: 1000 * 1,
                  mask: true
                })
                //进度条
                this_.setData({
                  percent_: 100
                });


              } else {
                //系统错误
                wx.showToast({
                  title: '系统错误！',
                  icon: 'none',
                  duration: 1000 * 2,
                  mask: true
                })
              }

            }
          })

          uploadTask.onProgressUpdate((res) => {

            console.log('上传进度', res.progress + " " + new Date())
            console.log('已经上传的数据长度', res.totalBytesSent)
            console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
            console.log(new Date());
            this_.setData({
              percent_: res.progress - 1
            });
          })


        } else {
          var msg = '系统错误！';
          if (res.data.msg) {
            msg = res.data.msg;
          }
          //系统错误
          wx.showToast({
            title: '系统错误！',
            icon: 'none',
            duration: 1000 * 2,
            mask: true
          })
        }
      }
    })

  },

})