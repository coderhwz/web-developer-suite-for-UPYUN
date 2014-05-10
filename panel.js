/*
 * 约定 :
 *     t === this 
 *     t._g('a') === $('.fs-a',this.cover)
 *     $._d('a') === $(this).attr('data-a')
 */
(function($){
    "use strict";
    upyun.panel = function(options){
        this._stack = [];
        this._curPath = '/';
        this._setup();
        this.eventHandle();
    };
    upyun.panel.prototype={

        loadData:function(callback){
            if (this.loading) {return;}
            var _this = this;
            _this.loading = true;
            $.post(this._getUrl('list'),{path:_this._curPath},function(result){
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
                $('.fs-selected img',_this.objsHolder).each(function(index,value){
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
                    $('.fs-selected',_this.objsHolder).removeClass('fs-selected');
                }
                $(this).toggleClass('fs-selected');
                if ($('.fs-selected',_this.objsHolder).length < 1){
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
                $(this).addClass('fs-hover');
            });
            this.objsHolder.delegate('li','mouseleave',function(){
                $(this).removeClass('fs-hover');
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

            this.objsHolder.delegate('.fs-del','click',function(event){
                event.preventDefault();
                var $this = $(this);
                return _this._dialog('confirm','确定要删除该文件吗？',function(status){
                    if (status ) {
                        _this._deleteFile($this.next()._d('name'),function(status){
                            if (status ) {
                                $this.parent().remove();
                            }
                        });
                    }
                });
            });

            this.objsHolder.delegate('li','dblclick',function(){
                if ($(this).hasClass('fs-folder')) {
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
            $('li',this.objsHolder).removeClass('fs-selected');
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
            abspath = abspath.replace('//','/');
            var _pos = this._stack.indexOf(abspath),
            _this = this;
            //当前文件夹
            if (_pos < 0) {
                var _curPos = this._stack.indexOf(this._curPath),
                    level = abspath.split('/').length -1 ;
                this._stack.splice(level-1);
                $('a',this.breadCrumbs).each(function(i,el){
                    if (i >= level-1) {
                        el.remove();
                    }
                });
                _this._curPath = abspath;
                this.loadData(function(status){
                    if (status === 0) {
                        var dirName = upyun.util.getDirName(abspath);
                        _this._stack.push(abspath);
                        _this.breadCrumbs.append('<a href="' + abspath + '">' + dirName + '</a>');
                        _this._setBreadSelected(abspath);
                        _this._editFile({
                            name: dirName == '/' ? '根目录' : dirName,
                            url:_this.now.folderIcon,
                        });
                    }
                });
            }else{
                _this._curPath = abspath;
                this.loadData(function(status){
                    if (status === 0) {
                        //设置当前面包
                        _this._setBreadSelected(abspath);
                    }
                });
            }


            this.uploader.setOpts({
                api:this._getUrl('upload'),
                multiUpload:true,
                post:{
                    path:this._curPath
                }
            });
        },
        _setBreadSelected:function(path){
            $('a',this.breadCrumbs).each(function(){
                if ($(this).attr('href') == path){
                    $(this).addClass('cur-bread');
                }else{
                    $(this).removeClass('cur-bread');
                }
            });
        },
        /*
         * level:warn,success,prompt,error,confirm
         */
        _dialog:function(level,msg,callback){
            var _this = this,
                msgBox = $('.fs-msg',this.dialog),
                btns = $('a',this.dialog);

            msgBox.attr('class','fs-msg');
            msgBox.addClass('fs-' + level);
            msgBox.html('<i></i>');
            btns.show();
            if (level == 'prompt') {
                msgBox.html('<span>'+msg+'</span><input class="v" type="text" />');
                $('.fs-cancel',this.dialog).hide();
            }else{
                if(level != 'confirm'){
                    $('.fs-cancel',this.dialog).hide();
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
                    callback($(this).hasClass('fs-confirm'),val);
                }
                _this.dialog.animate({height:0});
            });
        },
        _editFile:function(file){
            var thumb = $('<img class="fs-image" />').attr('src',file.url),
                info = $('<ul class="fs-info" />');
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
                var meta = $('<ul class="fs-meta" />');
                meta.append('<li><label>宽度：<input class="fs-width" type="text" /></label></li>');
                meta.append('<li><label>高度：<input class="fs-height" type="text" /></label></li>');
                meta.append('<li><label>链接：<input class="fs-href" value="'+file.url+'" type="text" /></label></li>');
                meta.append('<li><label>代替文本：<input class="fs-alt" value="'+file.name+'" type="text" /></label></li>');
                meta.append('<li><label>新标签中打开：<input class="fs-blank" value="" type="checkbox" /></label></li>');
                this.edit.append(meta);
                thumb.load(function(){
                    $('.fs-width').val(this.width);
                    $('.fs-height').val(this.height);
                });
            }
            this.edit.prepend(thumb);
        },

        _appendFile:function(file,isNew){
            var _this = this,
                img = $('<img />'),
                li = $('<li />'),
                keys = ['name','size','type','time','url','width','height'];
            li.append('<a class="fs-del" href="#" >×</a>');
            li.css({'width':_this.now.tWidth});
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (file[key] !== undefined) {
                    li.attr('data-' + key,file[key]);
                }
            }

            if (file.type == 'folder') {
                img.attr('src',_this.now.folderIcon);
                li.addClass('fs-folder');
            } else{
                img.attr('src',file.url + _this.now.style);
            }
            img.attr('alt',file.name);
            img.attr('title',file.name);
            img._d('name',file.name);
            if (file.width && file.height) {
                var scale = upyun.util.getScale(file.width,file.height ,
                                                _this.now.tWidth,_this.now.tHeight);
                img.css(scale);
            }else{
                img.load(function(){
                    var scale = upyun.util.getScale(this.naturalWidth,this.naturalHeight ,
                                                    _this.now.tWidth,_this.now.tHeight);
                                                    $(this).animate(scale);
                });
            
            }
            li.append(img);
            if (isNew) {
                if (file.type == 'file') {
                    $('.fs-folder:last',_this.objsHolder).after(li);
                }else{
                    li.prependTo(_this.objsHolder);
                }
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
        },
        _getUrl:function(action){
            return upyun.util.urlConcat(this.now.api,'action=' + action);
       },
       _g:function(noPrefix){
           return $('.fs-' + noPrefix,this.cover);
       },
        _setup:function(){

            var t = this;
            if (t._g('cover').length > 0 ) {
                return ;
            }
            var tpl = 
                    '<div style="display:none;" class="fs-cover">'+
                        '<div class="fs-panel" style="height:500px;width:1120px;">'+
                            '<div class="fs-panel-left">'+
                                '<div id="fs-logo">'+
                                    '<img src="../themes/default/images/logo.png" width="50">'+
                                '</div>'+
                                '<div class="fs-tool-bar">'+
                                    '<a class="fs-mkdir">'+
                                        '<i></i>'+
                                        '创建文件夹'+
                                    '</a>'+
                                    '<a class="fs-upload">'+
                                        '<i></i>'+
                                        '上传图片'+
                                    '</a>'+
                                '</div>'+
                            '</div>'+
                            '<div class="fs-panel-right">'+
                                '<div class="fs-header">'+
                                    '<div class="fs-header-left" style="width: 950px;">'+
                                        '<h2>又拍图片中心</h2>'+
                                        '<p>请选择一张图片作为你的logo</p>'+
                                    '</div>'+
                                    '<a class="fs-close" style="margin-left:960px;">关闭</a>'+
                                '</div>'+
                                '<div class="fs-dialog">'+
                                    '<div class="fs-dialog-wrapper">'+
                                        '<div class="fs-msg">'+
                                            '<i></i>'+
                                            '<span>确定要删除吗？</span>'+
                                        '</div>'+
                                        '<div class="fs-dialog-footer">'+
                                            '<a href="#" class="fs-cancel">取消</a>'+
                                            '<a href="#" class="fs-confirm">确定</a>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="fs-menu">'+
                                    '<div class="fs-breadcrumbs">'+
                                    '</div>'+
                                    '<div class="fs-search">'+
                                    '</div>'+
                                '</div>'+
                                '<div class="fs-content" style="height:340px;">'+
                                    '<div class="fs-content-left" style="width:800px">'+
                                    '</div>'+
                                    '<div class="fs-content-right" style="margin-left:800px">'+
                                    '</div>'+
                                '</div>'+
                                '<div class="fs-footer">'+
                                    '<span>对象总数：<span class="fs-cnt" >125</span></span>'+
                                    '<a href="#" class="fs-confirm">确定</a>'+
                                    '<a href="#" class="fs-cancel">取消</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
            t.cover       = $(tpl).appendTo($('body'));
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
            t.btnOk       = t._g('confirm');
            t.btnCancel   = t._g('cancel');
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
