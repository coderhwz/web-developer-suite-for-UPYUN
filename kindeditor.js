(function($){
    upyun.setUpKEditor = function(editor,options){
        var btnTpl =
            '<span class="ke-outline" data-name="upyun" title="又拍" >'+
                '<span class="ke-toolbar-icon ke-toolbar-icon-url ke-icon-" ></span>'+
            +'</span>';
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
                editor.insertHtml(image);
            }
        };
        options.richEditor = true;
        options.style="!small";
        btn.click(function(event){
            _upanel.open(options);
        });
    }
})(jQuery)
