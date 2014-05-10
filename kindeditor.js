(function($){
    upyun.setUpKEditor = function(editor,options){
        var btnTpl =
            '<span class="ke-outline" data-name="upyun" title="又拍" >'+
                '<span class="ke-toolbar-icon ke-toolbar-icon-url" ></span>'+
            '</span>';
        options = upyun.util.checkOpts(options);
        var btn = $(btnTpl).appendTo($('.ke-toolbar',editor.container));
        $('.ke-toolbar-icon',btn).css({
            'background-image':'url('+options.editorIcon+')',
            'background-size':'cover',
            'height':'16px',
            'width':'16px'
        });
        options.onOK = function(files){
            for (var i = 0, len = files.length; i < len; i++) {
                var image = upyun.util.renderImg(files[i]);
                editor.insertHtml(image);
            }
        };
        options.richEditor = true;
        btn.click(function(event){
            _upanel.open(options);
        });
    };
})(jQuery);
