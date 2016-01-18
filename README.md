# tinymce-attachment-qiniu
将附件上传到七牛云端的tinmyce插件

插件基于AngualrJS开发
<<<<<<< HEAD

## 安装
复制attachment目录到tinymce/js/plugins/目录下边
```
 tinymce.init({
 selector:'your selector',
 plugins:[
'attachment',
 ],
 toolbar:'attachment'
 
 })
```
## 配置
attachment/js/attachmentUploadApp.js文件中按七牛官方文档说明配置uploader 
##编辑器工具条中看到‘回形针’图标即为配置成功。


# 如果需要轻量级的插件，切换到simple-mode分支使用。
