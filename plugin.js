/**
 *plugins.js
 *
 *Released under MIT License.
 *Copyright (c) 2014-2015 www.friendsbt.com. All rights reserved.
 *
 */
tinymce.PluginManager.add('attachment', function(editor, url) {

  var initUploader = function() {
    Qiniu.uploader({
      runtimes: 'html5,flash,html4',
      browse_button: 'attachment-pick',
      uptoken_url: '/fetch_token',
      domain: 'http://7xjkjd.dl1.z0.glb.clouddn.com/',
    save_key:true,
      max_retries: 3,
      auto_start: true,
      init: {
        'FileUploaded': function(up, file, info) {
          var domain = up.getOption('domain');
          var res = jQuery.parseJSON(info);
          var sourceLink = domain + res.key;
          $('#attachment-state').text('上传完成!').show();
          $('#attachment-state').attr('file-name',file.name);
          $('#attachment-url').val(sourceLink +  '?download/' + file.name);
        },

        'UploadProgress': function(up, file) {
          if (file.status === plupload.UPLOADING) {
            $('#attachment-state').text('正在上传  ' + file.percent + '%').show();
          } else {

            $('#attachment-state').text('正在尝试上传...').show();
          }
        },
        'Error': function(up, err, errTip) {
          //$('#attachment-state').text('上传出错,请重试！').show();
        },
        //'UploadComplete': function(up, file) {
        //  $('#attachment-state').text('上传完成').show();
        //}
      }
    });
  };

  editor.addButton('attachment', {
    image: url + '/images/icon-paperclip.png',
    //icon: 'image',
    tooltip: 'Add attachment',
    onclick: function() {
      showDialog(editor);
    }
  });

  editor.addMenuItem('attachment', {
    image: url + '/icon-paperclip.png',
    //icon: 'image',
    text: 'Add attachment',
    context: 'insert',
    onclick: function() {
      showDialog(editor);
    }
  });
  var showDialog = function(editor) {
    editor.windowManager.open({
      title: 'Add an attachment',
      body: [{
        id: 'attachment-url',
        type: 'textbox',
        name: 'url',
        label: 'Attachment URL'
      }, {
        type: 'button',
        text: 'Pick a File',
        name: 'attachment-pick',
        id: 'attachment-pick'
      }, {
        type: 'label',
        text: '请输入附件URL或从本地选择上传!',
        id: 'attachment-state',
      }],
      onsubmit: function(e) {
        onSubmit(editor);
      }
    });
    initUploader();
  };
  var onSubmit = function(editor) {
    var content = '<p>附件:<a target="_blank" href="/resource/download?is_attachment=1&download_link=' + $('#attachment-url').val() + '">' + $('#attachment-state').attr('file-name') + '</a></p>';
    editor.insertContent(content);
  };

});
