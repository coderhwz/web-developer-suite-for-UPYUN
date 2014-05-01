(function(){/* code by hwz */

var upyun = window.upyun || {};

;(function($){
	"use strict";
	upyun.uploader = function(element,options){
		this.holder = $(element);
		this.opts = {
			post:{}
		};
		this.opts = $.extend(this.opts,options,{});
		this.init();
	};
	upyun.uploader.prototype = {
		init:function(){
			var _this = this;
			this.uploadInput = $('<input type="file"  class="hide mc-upload-holder">');
			// this.holder.after(this.uploadPanel);
			this.holder.click(function(){
				_this.uploadInput.click();
			});
			_this.uploadInput.on('change',function(){
				console.log('change');
				var formData = new FormData();
				if (_this.opts.post !== undefined) {
					$.each(_this.opts.post,function(key,val){
						console.log(key,val);
						formData.append(key,val);
					});
				}
				formData.append('file',this.files[0]);
				$.ajax({
					url: _this.opts.api, 
					type: 'POST',
					xhr: function() {  
						var _xhr = $.ajaxSettings.xhr();
						if(_xhr.upload){ 
							_xhr.upload.addEventListener('progress',onProcess, false); 
						}
						return _xhr;
					},
					success: function(result) {
						console.log($.ajaxSettings.xhr().upload);
						result = $.parseJSON(result);
						if (_this.opts.onSuccess) {
							_this.opts.onSuccess(result);
						}
					},
					data: formData,
					cache: false,
					contentType: false,
					processData: false
				});

				function onProcess(e){
					console.log(e);
					if(e.lengthComputable){
						_this.holder.text(e.loaded + " / " + e.total);
					}
				}
			});
		}
	};
})(jQuery);
;(function($){
	"use strict";
	upyun.panel = function(options){
		this.opts = {
			cover:true,
			title:'又拍图片中心',
			label_cancel:"取消",
			label_ok:"确定",
			label_upload:"上传文件",
			multi:false,
			imgWidth:120,
			imgHeight:74,
		};
		this._events = {};
		this._folderStack = [];

		this.opts = $.extend(this.opts,options,{});
		this._body = $('body');
		this._curPath = '/';
		this.init();
		this.setupPanel();
		// this.loadData();
		this.eventHandle();
	};
	upyun.panel.prototype={
		init:function(){
		},
		setupPanel:function(){

			var _this = this;
			if ($('.fs-cover').length > 0 ) {
				return ;
			}
			this.cover = $('<div style="display:none;" class="fs-cover" />');
			this.cover.appendTo(this._body);

			this.panel = $('<div class="fs-panel" style="height:500px;width:1120px;" />');
			this.panel.appendTo(this.cover);

			this.layoutLeft = $('<div class="fs-panel-left" />');
			this.layoutLeft.appendTo(this.panel);

			this.logo = $('<div id="fs-logo"> <img src="../themes/default/images/logo.png" width="50"> </div>'); 
			this.logo.appendTo(this.layoutLeft);

			this.toolbar = $('<div class="fs-tool-bar" />');
			this.toolbar.appendTo(this.layoutLeft);

			this.mkdir = $('<a class="fs-mkdir"> <i></i> 创建文件夹 </a>');
			this.mkdir.appendTo(this.toolbar);

			this.upload = $('<a class="fs-upload"> <i></i> 上传文件 </a>');
			this.upload.appendTo(this.toolbar);

			this.layoutRight = $('<div class="fs-panel-right" />');
			this.layoutRight.appendTo(this.panel);

			this.header = $('<div class="fs-header" />');
			this.header.appendTo(this.layoutRight);

			this.headConetnt = $('<div class="fs-header-left" style="width: 950px;"> <h2>又拍图片中心</h2> <p></p> </div>');
			this.headConetnt.appendTo(this.header);
			this.btnClose = $('<a class="fs-close" style="margin-left:960px;">关闭</a>').appendTo(this.header);

			this.menu = $('<div class="fs-menu" />');
			this.menu.appendTo(this.layoutRight);
			this.breadCrumbs = $('<div class="fs-breadcrumbs" />');
			this.breadCrumbs.appendTo(this.menu);

			this.search = $('<div class="fs-search" />');
			this.search.appendTo(this.menu);
			this.content = $('<div class="fs-content" style="height:340px;" />').appendTo(this.layoutRight);
			this.mainContent = $('<div class="fs-content-left" />').appendTo(this.content);
			this.edit = $('<div class="fs-content-right" />').appendTo(this.content);
			this.footer = $('<div class="fs-footer" />').appendTo(this.layoutRight);
			this.tip = $('<span>图片总数：125</span>').appendTo(this.footer);
			this.btnOk = $('<a href="#" class="fs-confirm">确定</a>').appendTo(this.footer);
			this.btnCancel = $('<a href="#" class="fs-cancel">取消</a>').appendTo(this.footer);
		},

		loadData:function(callback){
			var _this = this;
			if (_this.loading) {return;}
			_this.loading = true;
			$.post(this.opts.api + '?action=list',{path:_this._curPath},function(result){
				_this.loading = false;
				result = $.parseJSON(result);
				callback(result.error);
				if (result.error === 0) {
					_this.mainContent.html('');
				}
				for (var i = 0; i < result.data.length; i++) {
					var file = result.data[i];
					var li = $('<li />').appendTo(_this.mainContent);
					li.append('<a class="fs-del" href="javascript:;" >×</a>');
					li.css({'width':_this.opts.imgWidth});
					li.attr('data-name',file.name);

					var img = $('<img />');
					if (file.type == 'folder') {
						img.attr('src','../themes/default/images/Folder.png');
						li.addClass('fs-folder');
					} else{
						img.attr('src',file.url + _this.instance.style);
					}
					img.attr('alt',file.name);
					img.attr('title',file.name);
					img.load(function(){
						var percent = this.naturalWidth / this.naturalHeight;
						var newWidth=0,newHeight=0;
						if (this.naturalWidth > this.naturalHeight) {
							newWidth = _this.opts.imgWidth;
							newHeight = newWidth / percent;
							if (newHeight > _this.opts.imgHeight) {
								newHeight = _this.opts.imgHeight;
								newWidth = newHeight * percent;
							} 
						}else{
							newHeight = _this.opts.imgHeight;
							newWidth = newHeight * percent;
							if (newWidth > _this.opts.imgWidth) {
								newHeight = newWidth / percent;
							}
						}
						// this.width = newWidth;
						// this.height = newHeight; 
						$(this).animate({'width':newWidth,'height':newHeight});
					});
					img.attr('data-name',file.name);
					li.append(img);
				}
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
				$('li',_this.mainContent).removeClass('fs-selected');
			});

			this.btnOk.click(function(){
				event.preventDefault();
				var urls = [];
				$('.fs-selected img',_this.mainContent).each(function(index,value){
					urls.push(this.src);
				});
				_this.fireEvent('onOK',urls);
				_this.close();
				$('li',_this.mainContent).removeClass('fs-selected');
			});

			this.panel.delegate('li','click',function(){
				if (!_this.instance.multi) {
					$('.fs-selected',_this.mainContent).removeClass('fs-selected');
				}
				$(this).toggleClass('fs-selected');
				if ($('.fs-selected',_this.mainContent).length < 1){
					_this.mainContent.css({'width':'auto'});
				}else{
					_this.mainContent.css({'width':'800px'});
					_this.fireEvent('onSelected',this);
				}
			});

			new upyun.uploader(this.upload,{
				api:this.opts.api + '?action=upload',
				onSuccess:function(result){
					if (result.error !== 0) {
						return alert(result.msg);
					}
					var li = $('<li><span style="vertical-align:middle;"><img src="'+result.data.url+'" /></span></li>').prependTo(_this.mainContent).click(function(){
						$(this).toggleClass('fs-selected');
						_this.fireEvent('onSelected',this); 
					});
				}
			});

			this.panel.delegate('li,img','mouseenter',function(){
				$(this).addClass('fs-hover');
			});
			this.panel.delegate('li,img','mouseout',function(){
				$(this).removeClass('fs-hover');
			});

			this.breadCrumbs.delegate('a','click',function(event){
				event.preventDefault();
				_this._openFolder($(this).attr('href'));
			});

			this.panel.delegate('.fs-del','click',function(event){
				event.preventDefault();
				var $this = $(this);
				if (confirm('确定要删除该文件吗？')) {
					$.post(_this.opts.api + '?action=delete',{path:_this._curPath + $(this).next().attr('data-name') },function(result){
						result = $.parseJSON(result);
						if (result.error === 0) {
							$this.parent().remove();
						}else{
							alert(result.msg);
						}
					});
				}
			});

			this.panel.delegate('li','dblclick',function(){
				if ($(this).hasClass('fs-folder')) {
					_this._openFolder(_this._curPath + '/' + $(this).attr('data-name') + '/');
				}else{
					var url = $(this).find('img').attr('src');
					_this.fireEvent('onOK',[url]);
					_this.close();
					$('li',_this.mainContent).removeClass('fs-selected');
				}
			});
			/* $(window).resize(function(){
				_this.panel.height(_this.panel.height() - 60);
			});  */
		},

		fireEvent:function(event,params){
			if (this.instance && this.instance.hasOwnProperty(event)) {
				return this.instance[event](params);
			}
		},

		close:function(){
			this.cover.hide();
		},
		open:function(instanceOpts){
			this.instance = instanceOpts;
			this._openFolder('/');
			// this.loadData();
			this.cover.show();
			// this.setupPanel();
			this.headConetnt.find('p').text(instanceOpts.title);
			// $(window).resize();
		},
		resize:function(){
		},
		//传入绝对地址
		_openFolder:function(abspath){
			abspath = abspath.replace('//','/');
			var _pos = this._folderStack.indexOf(abspath),
			_this = this;
			//当前文件夹
			if (_pos < 0) {
				var _curPos = this._folderStack.indexOf(this._curPath);
				var level = abspath.split('/').length -1 ;
				this._folderStack.splice(level-1);
				$('a',this.breadCrumbs).each(function(i,el){
					if (i >= level-1) {
						el.remove();
					}
				});
				_this._curPath = abspath;
				this.loadData(function(status){
					if (status === 0) {
						_this._folderStack.push(abspath);
						_this.breadCrumbs.append('<a href="' + abspath + '">' + _this._getDirName(abspath) + '</a>');
						_this._setBreadSelected(abspath);
					}
					console.log('stack',_this._folderStack);
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
		},
		_getDirName:function(path){
			var m = path.match(/([^/])*\/$/)[0];
			return m.length < 1 ? '/' : m;
		},
		_setBreadSelected:function(path){
			$('a',this.breadCrumbs).each(function(){
				if ($(this).attr('href') == path){
					$(this).addClass('cur-bread');
				}else{
					$(this).removeClass('cur-bread');
				}
			});
		}
	};
})(jQuery);
;(function($){
	$.fn.upyun = function (options) {
		return this.each(function () {
			var opts = {
				style:'!small',
				multi:false
			};

			var element = $(this);
			opts = $.extend(opts,options,{});
			if (window._upanel === undefined) {
				window._upanel = new upyun.panel({
					api:opts.api,
				});
			}

			opts.title = opts.title || element.attr('data-title') || '请选择图片';

			opts.onOK = opts.onOK || function(images){
				element.val(images[0]);
			};

			element.click(function(){
				window._upanel.open(opts);
			});
		}); 
    };
})(jQuery);
})(jQuery);