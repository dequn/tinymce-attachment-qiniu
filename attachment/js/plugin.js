/**
 *plugins.js
 *
 *Released under MIT License.
 *Copyright (c) 2014-2015 www.friendsbt.com. All rights reserved.
 *
 */
tinymce.PluginManager.add('attachment', function(editor, url) {
  function showDialog() {
    var win = editor.windowManager.open({
      title: "Attachment",
      url: url + '/attachment.html',
      width: 700,
      height: 500,
    });
  }

  editor.addCommand("mceAttachmentEditor", showDialog);

  editor.addButton('attachment', {
    image: url + '/images/icon-paperclip.png',
    tooltip: 'Add Attachment',
    onclick: showDialog
  });

  editor.addMenuItem('attachment', {
      icon: 'code',
      image: url + '/images/icon-paperclip.png',
      text: 'Add Attachment',
      context: 'tools',
      onclick: showDialog
  });
});
