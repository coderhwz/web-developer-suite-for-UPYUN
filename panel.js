/*
 * 约定 :
 *     t === this 
 *     t._g('a') === $('.a',this.cover)
 *     $._d('a') === $(this).attr('data-a')
 */
(function($){
    "use strict";
    upyun.panel = function(theme){
        this._stack = [];
        this._theme = 'default';
        if (theme) {
            this._theme = theme;
        }
        this._curPath = '/';
        this.idoc = null;
        this._setup();

        this.eventHandle();
    };
    upyun.panel.prototype={

        loadData:function(path,callback){
            if (this.loading) {return;}
            var _this = this;
            _this.loading = true;
            $.post(this._getUrl('list'),{path:path},function(result){
                _this.loading = false;
                result = $.parseJSON(result);
                callback(result.error);
                if (result.error === 0) {
                    _this.objsHolder.html('');
                }
                for (var i = 0; i < result.data.length; i++) {
                    var file = result.data[i];
                    _this._appendFile(file);
                }
                _this._cnt.text(result.data.length);
            });
        },

        eventHandle:function(){
            var _this = this;
            this.btnClose.click(function(event){
                event.preventDefault();
                _this.close();
            });

            this.btnCancel.click(function(event){
                event.preventDefault();
                _this.close();
            });

            this.btnOk.click(function(){
                var t = _this;
                event.preventDefault();
                /* var urls = [];
                $('.selected img',_this.objsHolder).each(function(index,value){
                    urls.push(this.src);
                }); */
                var file = {
                    url    : t._g('image').attr('src'),
                    width  : t._g('width').val(),
                    height : t._g('height').val(),
                    alt    : t._g('alt').val(),
                    href   : t._g('href').val(),
                    blank  : t._g('blank').val(),
                };
                t.fireEvent('onOK',[file]);
                t.close();
            });

            this.objsHolder.delegate('li','click',function(){
                if (!_this.now.multiSelect) {
                    $('.selected',_this.objsHolder).removeClass('selected');
                }
                $(this).toggleClass('selected');
                if ($('.selected',_this.objsHolder).length < 1){
                    _this.objsHolder.css({'width':'auto'});
                }else{
                    _this.objsHolder.css({'width':'800px'});
                    _this.fireEvent('onSelected',this);
                }
                var t = $(this)._d('type'),
                file = {
                    type:t,
                    name:$(this)._d('name'),
                    url :_this.now.folderIcon,
                    time:upyun.util.formatDate(parseInt($(this)._d('time'),10)),
                };
                if (t == 'file') {
                    file.url = $(this)._d('url');
                    file.size = ( parseInt($(this)._d('size'),10) / 1024 ).toFixed(2);
                }
                _this._editFile(file);
            });


            this.uploader = new upyun.uploader(this.upload,{
                onSuccess:function(result){
                    if (result.error !== 0) {
                        return alert(result.msg);
                    }
                    return _this._appendFile(result.data,true);
                }
            });

            this.objsHolder.delegate('li','mouseenter',function(event){
                $(this).addClass('hover');
            });
            this.objsHolder.delegate('li','mouseleave',function(){
                $(this).removeClass('hover');
            });

            this.breadCrumbs.delegate('a','click',function(event){
                event.preventDefault();
                _this._openFolder($(this).attr('href'));
            });
            this.mkdir.click(function(event){
                event.preventDefault();
                _this._dialog('prompt','请输入文件夹名称',function(status,val){
                    $.post(_this._getUrl('mkdir'),{path:_this._curPath,name:val},function(result){
                        result = $.parseJSON(result);
                        if (result.error === 0) {
                            _this._dialog('success',result.msg);
                            _this._appendFile(result.data,true);
                        }else{
                            _this._dialog('error',result.msg);
                        }
                    });
                });
            });

            this.objsHolder.delegate('.delete','click',function(event){
                event.preventDefault();
                var $this = $(this);
                return _this._dialog('confirm','确定要删除该文件吗？',function(status){
                    if (status ) {
                        _this._deleteFile($this.parent()._d('name'),function(status){
                            if (status ) {
                                $this.parent().remove();
                                _this._cnt.text(parseInt(_this._cnt.text(),10) - 1);
                            }
                        });
                    }
                });
            });

            this.objsHolder.delegate('li','dblclick',function(){
                if ($(this).hasClass('folder')) {
                    _this._openFolder(_this._curPath + '/' + $(this)._d('name') + '/');
                }else{
                    var url = $(this)._d('url');
                    _this.fireEvent('onOK',[{url:url}]);
                    _this.close();
                }
            });
            /* $(window).resize(function(){
                _this.panel.height(_this.panel.height() - 60);
            });  */
        },

        fireEvent:function(event,params){
            if (this.now && this.now.hasOwnProperty(event)) {
                return this.now[event](params);
            }
        },

        close:function(){
            $('li',this.objsHolder).removeClass('selected');
            this.cover.hide();
        },
        open:function(nowOpts){
            var opts = upyun.util.checkOpts(nowOpts);
            this._applyOpts(opts);
            this.now = opts;
            this._openFolder('/');
            this.cover.show();
        },
        //传入绝对地址
        _openFolder:function(abspath){
            var _this = this;
            abspath = abspath.replace('//','/');
            this.loadData(abspath,function(status){
                if (status === 0) {
                    _this._setPath(abspath);
                }
            });

        },
        _setPath:function(path){
            var _pos = this._stack.indexOf(path),
                    breads = $('a',this.breadCrumbs);
            //当前文件夹
            if (_pos < 0) {
                var _curPos = this._stack.indexOf(this._curPath),
                    level = path.split('/').length -1 ;
                this._stack.splice(level-1);
                breads.each(function(i,el){
                    if (i >= level-1) {
                        el.remove();
                    }
                });
                this._curPathName = upyun.util.getDirName(path);
                this._stack.push(path);
                this.breadCrumbs.append('<a href="' + path + '">' + this._curPathName + '</a>');
            }
            this._curPath = path;
            breads.removeClass('cur-bread');
            $('a',this.breadCrumbs).each(function(){
                if ($(this).attr('href') == path) {
                    $(this).addClass('cur-bread');
                }
            });
            this.uploader.setOpts({
                api:this._getUrl('upload'),
                post:{
                    path:path
                }
            });
        },
        /*
         * level:warn,success,prompt,error,confirm
         */
        _dialog:function(level,msg,callback){
            var _this = this,
                msgBox = $('.msg',this.dialog),
                btns = $('a',this.dialog);

            msgBox.attr('class','msg');
            msgBox.addClass('' + level);
            msgBox.html('<i></i>');
            btns.show();
            if (level == 'prompt') {
                msgBox.html('<span>'+msg+'</span><input class="v" type="text" />');
            }else{
                if(level != 'confirm'){
                    $('.cancel',this.dialog).hide();
                }
                msgBox.html('<span>'+msg+'</span>');
            } 

            this.dialog.animate({height:'150'});
            this.dialog.undelegate('a','click');
            this.dialog.delegate('a','click',function(event){
                event.preventDefault();
                var input = $('.v',msgBox),val = false;
                if (input.length > 0) {
                    val = input.val();
                }
                if (callback) {
                    callback($(this).hasClass('confirm'),val);
                }
                _this.dialog.animate({height:0});
            });
        },
        _editFile:function(file){
            var thumb = $('<img class="image" />').attr('src',file.url),
                info = $('<ul class="info" />');
                info.append('<li>名称：'+file.name+'</li>');
            if (file.size > 0) {
                info.append('<li>大小：'+file.size+'K</li>');
            }
            if (file.time) {
                info.append('<li>创建时间：'+file.time+'</li>');
            }
            this.edit.html('');
            this.edit.append(info);
            if (this.now.richEditor && file.type == 'file') {
                var meta = $('<ul class="meta" />');
                meta.append('<li><label>宽度：<input class="width" type="text" /></label></li>');
                meta.append('<li><label>高度：<input class="height" type="text" /></label></li>');
                meta.append('<li><label>链接：<input class="href" value="'+file.url+'" type="text" /></label></li>');
                meta.append('<li><label>代替文本：<input class="alt" value="'+file.name+'" type="text" /></label></li>');
                meta.append('<li><label>新标签中打开：<input class="blank" value="" type="checkbox" /></label></li>');
                this.edit.append(meta);
                thumb.load(function(){
                    $('.width').val(this.width);
                    $('.height').val(this.height);
                });
            }
            this.edit.prepend(thumb);
        },

        _appendThumb:function(file,isNew){
            if (file.type == 'file') {
                return this._appendThumb(file,isNew);
            }
            var _this = this,
                img = $('<img />'),
                loading = $('<img class="thumb-loading" />'),
                li = $('<li class="item" />'),
                keys = ['name','size','type','time','url','width','height'];
            li.append('<a class="delete" href="#" >×</a>');
            li.css({
                'width':_this.now.tWidth,
                'height':_this.now.tHeight,
            });

            loading.attr('src',_this.now.loadingIcon);
            li.append(loading);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (file[key] !== undefined) {
                    li.attr('data-' + key,file[key]);
                }
            }
            img.attr('src',file.url + _this.now.style);
            img.attr('alt',file.name);
            img.attr('title',file.name);
            img._d('name',file.name);
            img.load(function(){
                var scale = upyun.util.getScale(this.naturalWidth,this.naturalHeight ,
                                                _this.now.tWidth,_this.now.tHeight);
                scale = {width:scale.width*0.9,height:scale.height*0.9};
                $(this).css(scale);
                $(this).show();
                loading.remove();
            });

            img.hide();
            li.append(img);
            if (isNew) {
                $('.folder:last',_this.objsHolder).after(li);
                _this._cnt.text(parseInt(_this._cnt.text(),10) + 1);
            }else{
                li.appendTo(_this.objsHolder);
            }
        },
        _appendFile:function(file,isNew){
            var _this = this,
                img = $('<img />'),
                loading = $('<img class="thumb-loading" />'),
                li = $('<li class="item" />'),
                keys = ['name','size','type','time','url','width','height'];
            li.append('<a class="delete" href="#" >×</a>');
            li.css({
                'width':_this.now.tWidth,
                'height':_this.now.tHeight,
            });

            loading.attr('src',_this.now.loadingIcon);
            li.append(loading);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (file[key] !== undefined) {
                    li.attr('data-' + key,file[key]);
                }
            }

            if (file.type == 'folder') {
                img.attr('src',_this.now.folderIcon);
                li.addClass('folder');
            } else{
                img.attr('src',file.url + _this.now.style);
            }
            img.attr('alt',file.name);
            img.attr('title',file.name);
            img._d('name',file.name);
            if (file.width && file.height) {
                var scale = upyun.util.getScale(file.width,file.height ,
                                                _this.now.tWidth,_this.now.tHeight);
                scale = {width:scale.width*0.9,height:scale.height*0.9};
                img.css(scale);
            }else{
                img.load(function(){
                    var scale = upyun.util.getScale(this.naturalWidth,this.naturalHeight ,
                                                    _this.now.tWidth,_this.now.tHeight);
                    scale = {width:scale.width*0.9,height:scale.height*0.9};
                    $(this).css(scale);
                    $(this).show();
                    loading.remove();
                });
            
            }
            img.hide();
            li.append(img);
            if (file.type == 'folder') {
                li.append('<p>'+file.name+'</p>');
            }
            if (isNew) {
                if (file.type == 'file') {
                    $('.folder:last',_this.objsHolder).after(li);
                }else{
                    li.prependTo(_this.objsHolder);
                }
                _this._cnt.text(parseInt(_this._cnt.text(),10) + 1);
            }else{
                li.appendTo(_this.objsHolder);
            }
        },
        _deleteFile:function(name,callback){
            var _this = this;
            $.post(this._getUrl('delete'),{path:this._curPath ,name:name },function(result){
                result = $.parseJSON(result);
                if (result.error === 0) {
                    callback(true);
                    _this._dialog('success',"删除成功");
                }else{
                    callback(false);
                    _this._dialog('error',result.msg);
                }
            });
        },
        _applyOpts:function(options){
            $('img',this.logo).attr('src',options.panelLogo);
            this.headConetnt.find('p').text(options.title);
            this.uploader.setOpts({multiSelect:options.multiSelect});
        },
        _getUrl:function(action){
            return upyun.util.urlConcat(this.now.api,'action=' + action);
       },
       _g:function(noPrefix){
           return $('.' + noPrefix,this.idoc);
       },
        _setup:function(){

            var t = this;
            if (t._g('cover').length > 0 ) {
                return ;
            }
            var iframe = document.createElement('iframe');   
            document.domain = iframe.domain = location.host;

            iframe.id = 'panel';   
            iframe.name = 'panel';   
            iframe.width = '100%';   
            iframe.height = '100%';   
            iframe.frameBorder="0";
            //firefox 没这不行
            iframe.src="javascript:void(0)";
            this.cover = $('<div style="display:none;" class="cover"></div>');
            this.cover.css({
                'background'      : 'url(../themes/default/images/cover.png) no-repeat',
                'background-size' : 'cover',
                'position'        : 'fixed',
                'padding-top'     : '2%',
                'top'             : '0',
                'left'            : '0',
                'width'           : '100%',
                'height'          : '100%',
                'z-index'         : 100000
            });
            this.cover.appendTo($('body'));
            this.cover.append(iframe);

            var tpl = 
                        '<div class="panel" style="height:500px;width:1120px;">'+
                            '<div class="panel-left">'+
                                '<div id="logo">'+
                                    '<img src="../themes/default/images/logo.png" width="50">'+
                                '</div>'+
                                '<div class="tool-bar">'+
                                    '<a class="mkdir">'+
                                        '<i></i>'+
                                        '创建文件夹'+
                                    '</a>'+
                                    '<a class="upload">'+
                                        '<i></i>'+
                                        '上传图片'+
                                    '</a>'+
                                '</div>'+
                            '</div>'+
                            '<div class="panel-right">'+
                                '<div class="header">'+
                                    '<div class="header-left" style="width: 950px;">'+
                                        '<h2>又拍图片中心</h2>'+
                                        '<p>请选择一张图片作为你的logo</p>'+
                                    '</div>'+
                                    '<a class="close" style="margin-left:960px;">关闭</a>'+
                                '</div>'+
                                '<div class="dialog">'+
                                    '<div class="dialog-wrapper">'+
                                        '<div class="msg">'+
                                            '<i></i>'+
                                            '<span>确定要删除吗？</span>'+
                                        '</div>'+
                                        '<div class="dialog-footer">'+
                                            '<a href="#" class="cancel">取消</a>'+
                                            '<a href="#" class="confirm">确定</a>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="menu">'+
                                    '<div class="breadcrumbs">'+
                                    '</div>'+
                                    '<div class="search">'+
                                    '</div>'+
                                '</div>'+
                                '<div class="content" style="height:340px;">'+
                                    '<div class="content-left" style="width:800px">'+
                                    '</div>'+
                                    '<div class="content-right" style="margin-left:800px">'+
                                    '</div>'+
                                '</div>'+
                                '<div class="footer">'+
                                    '<span>对象总数：<span class="cnt" >125</span></span>'+
                                    '<a href="#" class="confirm">确定</a>'+
                                    '<a href="#" class="cancel">取消</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
            // ibody.write(tpl);
            this.idoc = $('#panel').contents();
            this.idoc.find('head').append('<link rel="stylesheet" href="../themes/'+this._theme+'/style.css" type="text/css" media="screen">');
            this.idoc.find('body').html(tpl);

            // t.cover       = $(tpl).appendTo($('body'));
            t.panel       = t._g('panel');
            t.layoutLeft  = t._g('panel-right');
            t.toolbar     = t._g('tool-bar');
            t.upload      = t._g('upload');
            t.layoutRight = t._g('panel-right');
            t.header      = t._g('header');
            t.headConetnt = t._g('header-left');
            t.btnClose    = t._g('close');
            t.menu        = t._g('menu');
            t.breadCrumbs = t._g('breadcrumbs');
            t.search      = t._g('search');
            t.content     = t._g('content');
            t.objsHolder  = t._g('content-left');
            t.edit        = t._g('content-right');
            t.footer      = t._g('footer');
            t.tip         = $('span',this.footer);
            t.btnOk       = $('.confirm',this.footer);
            t.btnCancel   = $('.cancel',this.footer);
            t.dialog      = t._g('dialog');
            t._cnt        = t._g('cnt');
            t.mkdir       = t._g('mkdir');
            t.logo        = t._g('logo');
            $.fn.extend({
                _d:function(key){
                    return $(this).attr('data-'+key);
                }
            });
        }
    };
})(jQuery);
