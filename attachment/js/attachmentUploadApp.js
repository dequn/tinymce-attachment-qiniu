/**
 *attachmentUploadApp.js
 *
 *Released under MIT License.
 *Copyright (c) 2014-2015 www.friendsbt.com. All rights reserved
 *
 */
var app = angular.module('attachmentUploadApp', []);

app.controller('uploadAttachmentController', ['$scope',
  function($scope) {
    $scope.init = function() {
      $scope.fileList = [];
      $scope.isFileListEmpty = true;
      $scope.pickFileBtnText = '选择文件';

    };

    $scope.addFile = function(file) {
      $scope.fileList.push(file);
      $scope.doAfterFileListChange();
      $scope.$apply();
    };

    $scope.removeFile = function(file) {
      for (var i = 0, L = $scope.fileList.length; i < L; i++) {
        if ($scope.fileList[i].id == file.id) {
          $scope.fileList.splice(i, 1);
          break;
        }
      }
      $scope.uploader.removeFile(file);
      $scope.doAfterFileListChange();
      //$scope.$apply();
    };

    $scope.doAfterFileListChange = function() {
      var fileLength = $scope.fileList.length;
      $scope.isFileListEmpty = fileLength === 0 ? true : false;
      $scope.pickFileBtnText = fileLength === 0 ? '选择文件' : '继续添加';
      //$scope.$apply();
    };


    //获取背景图片
    $scope.getBgImage = function(file) {
      var full_file_name = file.name;
      var pointIndex = full_file_name.lastIndexOf(".");
      var ext = full_file_name.substring(pointIndex + 1, full_file_name.length);
      return 'file-type-' + ext.toLowerCase();
    };

    $scope.showSuccess = function(file) {
      if (file.status === plupload.DONE) {
        return true;
      }
      return false;
    };

    $scope.showError = function(file) {
      switch (file.status) {
        case plupload.QUEUED:
        case plupload.DONE:
        case plupload.UPLOADING:
          return false;
        default:
          return true;
      }
    };

    $scope.insertContent = function() {
      var st = $scope.uploader.state;
      if (st === plupload.UPLOADING) {
        alert('正在上传，不能插入');
        return;
      }
      if ($scope.uploader.total.uploaded < $scope.fileList.length) {
        alert('请删除不能上传的文件或重新上传');
        return;
      }
      var editor = top.tinymce.activeEditor;
      var length = $scope.uploader.files.length;
      for (var i = 0; i < length; i++) {
        var file = $scope.uploader.files[i];
        var content = '<p>附件:<a target="_blank" href="/resource/download?download_link=' + file.download_link + '">' + file.name + '</a></p>';
        editor.insertContent(content);
      }
      editor.windowManager.close();
    };

    $scope.getSummaryStatus = function() {
      if ($scope.uploader.state == plupload.STOPPED) {
        if ($scope.uploader.files.length > 0) {
          return '共选择' + $scope.uploader.files.length + '个文件';
        } else if ($scope.uploader.files.length === 0) {
          return '';
        }
        if ($scope.uploader.state === plupload.DONE) {
          return '上传完毕';
        }

      } else if ($scope.uploader.state == plupload.STARTED) {
        //更新的稍微慢一些，会出现当前上传的比总数还大的情况
        var uploaded = $scope.uploader.total.uploaded + 1;
        var length = $scope.uploader.files.length;
        uploaded = uploaded > length ? length : uploaded;
        return '正在上传:' + uploaded + '/' + length;
      } else {

        return '处理完毕';
      }
    };



    $scope.formatSpeed = function(speed) {
      //格式化上传速度
      if (speed < 1024) {
        return speed + 'B/S';
      } else if (speed >= 1024 && speed < 1048576) {
        return (speed / 1024).toFixed(2) + 'KB/S';
      } else {
        return (speed / 1048576).toFixed(2) + 'MB/S';
      }
    };


    //uploader的设置请参考七牛官方文档，根据需要修改参数
    $scope.uploader = Qiniu.uploader({
      runtimes: 'html5,flash,html4', //上传模式,依次退化
      browse_button: 'filePickerBtn', //上传选择的点选按钮，**必需**
      uptoken_url: '/fetch_token',
      domain: 'http://7xjkjd.dl1.z0.glb.clouddn.com/', //bucket 域名，下载资源时用到，**必需**
      chunk_size: '4mb', //分块上传时，每片的体积
      auto_start: false, //选择文件后自动上传，若关闭需要自己绑定事件触发上传,
      filters: { //这里配置过滤器，限制文件大小、文件类型等
        max_file_size: "100mb",
        prevent_duplicates: true,
        //max_filename_length: 50
      },
      init: {
        'Init': function(up) {},

        'FilesAdded': function(up, files) {
          plupload.each(files, function(file) {
              file.panel = false;
            $scope.addFile(file);
          });

        },
        'UploadProgress': function(up, file) {
        },
        'FileUploaded': function(up, file, info) {

          var domain = up.getOption('domain'); //获得上传的domain
          var res = angular.fromJson(info);
          var download_link = domain + res.key;
          file.download_link = download_link;
          $scope.$apply();
          $scope.getSummaryStatus();

        },
        'StateChanged':function(up){
            $scope.getSummaryStatus();
        },

        'Error': function(up, err, errTip) {
          //上传出错时,处理相关的事情
          if (up.state == plupload.QUEUED) {
            //正在往里边添加文件的时候出错，说明不符合filter
            // $scope.$apply(function() {
            err.file.status = err.code; //把文件的状态改为err.code，否则永远是4
            err.file.percent = 100;
            $scope.addFile(err.file);
            // });
          } else if (up.state == plupload.STARTED) {
            //正在上传的时候出错,说明是七牛出错,正上传时添加重复文件也会运行到这儿
            if (err.code == plupload.FILE_DUPLICATE_ERROR || err.code == plupload.FILE_SIZE_ERROR) {
              //上传时新添加文件不符合filter的情况
              // $scope.$apply(function() {
              err.file.status = err.code; //把文件的状态改为err.code，否则永远是4
              err.file.percent = 100;
              $scope.addFile(err.file);
              // });
            } else {
              //这剩下的是正在上传的时候七牛服务器出错了
              // $scope.$apply(function() {
              err.file.status = err.code;
              err.file.percent = 100;
              // });
            }
          }
        },
      }
    });
    $scope.startUpload = function() {
      $scope.uploader.start();
    };

    $scope.mouseEnterFile = function(file){
        file.panel = true;
    };
    
    $scope.mouseLeaveFile = function(file){
        file.panel = false;
    };
  }
]);
