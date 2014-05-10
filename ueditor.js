(function($){
    'use strict';
    if (upyun.setUpUEditor === undefined) {
        upyun.setUpUEditor = function(editor,options){
            var html = 
                '<div  class="edui-box edui-button edui-for-upyun edui-default">'+
                    '<div class="edui-default">'+
                        '<div class="edui-button-wrap edui-default">'+
                            '<div unselectable="on" title="又拍" class="edui-button-body edui-default">'+
                                '<div class="edui-box edui-icon edui-default"></div>'+
                                '<div class="edui-box edui-label edui-default"></div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>',
            toolbar = $('.edui-toolbar'),
            btn = $(html);
            options = upyun.util.checkOpts(options);
            if (toolbar.length < 1) {
                console.log('集成 UEDITOR 失败');
                return false;
            }
            btn.appendTo(toolbar);
            $('.edui-icon',btn).css('background-image','url('+options.editorIcon+')');
            $('.edui-icon',btn).css('background-size','cover');
            options.onOK = function(files){
                for (var i = 0, len = files.length; i < len; i++) {
                    var file = files[i],
                        image = '<a target="#target#" href="#href#"><img #width# #height# alt="#alt#" src="#src#"></a>';
                    file.href = file.href || '';
                    file.alt = file.alt || '';
                    file.width = file.width ? 'width="'+file.width+'"' : '';
                    file.height = file.height ? 'height="'+file.height+'"' : '';
                    file.blank = file.blank || '';
                    image = image.replace('#href#',file.href)
                                .replace('#src#',file.url)
                                .replace('#alt#',file.alt)
                                .replace('#target#',file.blank)
                                .replace('#width#',file.width)
                                .replace('#height#',file.height);
                    editor.execCommand( 'inserthtml',image);
                }
            };
            options.richEditor = true;
            options.style="!small";
            btn.click(function(event){
                _upanel.open(options);
            });
        };
    }
})(jQuery);
