function mc(options){
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

	this.opts = $.extend(this.opts,options,{});
	this._body = $('body');
	this.path = '/';
	this.init();
	this.setupPanel();
	this.loadData();
	this.eventHandle();
}
mc.prototype={
	init:function(){
	},
	setupPanel:function(){

		var _this = this;
		if ($('.fs-cover').length > 0 ) {
			return ;
		}
		this.cover = $('<div class="fs-cover" > </div>');
		this.cover.appendTo(this._body);

		this.panel = $('<div class="fs-panel" style="height:500px;width:1120px;"></div>');
		this.panel.appendTo(this.cover);

		this.layoutLeft = $('<div class="fs-panel-left" />');
		this.layoutLeft.appendTo(this.panel);

		this.logo = $('<div id="fs-logo"> <img src="../themes/default/images/logo.png" width="50"> </div>'); 
		this.logo.appendTo(this.layoutLeft);

		this.toolbar = $('<div class="fs-tool-bar" />');
		this.toolbar.appendTo(this.layoutLeft);

		this.mkdir = $('<a class="fs-mkdir"> <i></i> 创建文件夹 </a>');
		this.mkdir.appendTo(this.toolbar);

		this.upload = $('<a class="fs-upload"> <i></i> 上传图片 </a>');
		this.upload.appendTo(this.toolbar);

		this.layoutRight = $('<div class="fs-panel-right" />');
		this.layoutRight.appendTo(this.panel);

		this.header = $('<div class="fs-header" />');
		this.header.appendTo(this.layoutRight);

		this.headConetnt = $('<div class="fs-header-left" style="width: 950px;"> <h2>双拍图片中心</h2> <p>请选择一张图片作为你的logo</p> </div>');
		this.headConetnt.appendTo(this.header);
		this.btnClose = $('<a class="fs-close" style="margin-left:960px;">关闭</a>').appendTo(this.header);

		this.menu = $('<div class="fs-menu" />');
		this.menu.appendTo(this.layoutRight);
		this.breadCrumbs = $('<div class="fs-breadcrumbs"> <a href="">首页</a> <a href="">双怕图片</a> </div>');
		this.breadCrumbs.appendTo(this.menu);

		this.search = $('<div class="fs-search" />');
		this.search.appendTo(this.menu);
		this.content = $('<div class="fs-content" style="height:340px;" />').appendTo(this.layoutRight);
		this.mainContent = $('<div class="fs-content-left" style="width:800px">').appendTo(this.content);
		this.edit = $('<div class="fs-content-right" style="margin-left:800px">').appendTo(this.content);
		this.footer = $('<div class="fs-footer" />').appendTo(this.layoutRight);
		this.tip = $('<span>图片总数：125</span>').appendTo(this.footer);
		this.btnOk = $('<a href="#" class="fs-confirm">确定</a>').appendTo(this.footer);
		this.btnCancel = $('<a href="#" class="fs-cancel">取消</a>').appendTo(this.footer);







		
		/* this.mcheader = $('<div class="fs-header"/>');
		this.mcheader.appendTo(this.panel);
		this.mcheader.text(this.opts.title);
		this.btnClose = $('<span class="fs-close" >×</span>');

		this.mcbody = $('<div class="fs-body" />');
		this.mcbody.appendTo(this.panel);
		console.log(this.panel.height());

		this.uploadPanel = $('<div class="fs-upload-panel" />');
		this.uploadPanel.appendTo(this.mcbody).text('上传'); 


		this.picsList = $('<ul class="fs-list" />');
		this.picsList.appendTo(this.mcbody);


		new mcUploader(this.uploadPanel[0],{
			api:this.opts.api + '?action=upload',
			onSuccess:function(result){
				var li = $('<li><span style="vertical-align:middle;"><img src="'+result.data.url+'" /></span></li>').prependTo(_this.picsList).click(function(){
					$(this).toggleClass('fs-selected');
					_this.fireEvent('onSelected',this); 
				});
			}
		});

		this.mcfooter = $('<div class="fs-footer" />');
		this.mcfooter.appendTo(this.panel);

		this.btnOk = $('<button class="fs-btn-ok" />').text(this.opts.label_ok);
		this.btnOk.appendTo(this.mcfooter);
		this.btnCancel = $('<button class="fs-btn-cancel" />').text(this.opts.label_cancel);
		this.btnCancel.appendTo(this.mcfooter);

		this.btnClose.appendTo(this.mcheader);

		this.btnClose.click(function(){
			_this.close();
			$('li',_this.picsList).removeClass('fs-selected');
		});

		this.btnCancel.click(function(){
			_this.close();
			$('li',_this.picsList).removeClass('fs-selected');
		});
		this.btnOk.click(function(){
			var urls = [];
			$('.fs-selected img',_this.picsList).each(function(index,value){
				urls.push(this.src);
			});
			_this.fireEvent('onOK',urls);
			_this.close();
			$('li',_this.picsList).removeClass('fs-selected');
		});
		this.mcbody.height(this.panel.height() - 60); */

	},

	loadData:function(){
		var _this = this;
		$.post(this.opts.api + '?action=list',{},function(result){
			result = $.parseJSON(result);
			for (var i = 0; i < result.data.length; i++) {
				var file = result.data[i];
				if (file.type == 'file') {
					var li = $('<li />').appendTo(_this.mainContent);
					li.append('<a class="fs-del" href="javascript:;" >×</a>');
					li.css({'width':_this.opts.imgWidth});

					var img = $('<img />');
					img.attr('src',file.url);
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
						this.width = newWidth;
						this.height = newHeight;
					});
					img.attr('data-name',file.name);
					li.append(img);
				}
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
			$('li',_this.picsList).removeClass('fs-selected');
		});

		this.btnOk.click(function(){
			event.preventDefault();
			var urls = [];
			$('.fs-selected img',_this.picsList).each(function(index,value){
				urls.push(this.src);
			});
			_this.fireEvent('onOK',urls);
			_this.close();
			$('li',_this.picsList).removeClass('fs-selected');
		});

		this.panel.delegate('li','click',function(){
			$(this).toggleClass('fs-selected');
			_this.fireEvent('onSelected',this);
		});

		new mcUploader(this.upload,{
			api:this.opts.api + '?action=upload',
			onSuccess:function(result){
				if (result.error !== 0) {
					return alert(result.msg);
				};
				var li = $('<li><span style="vertical-align:middle;"><img src="'+result.data.url+'" /></span></li>').prependTo(_this.picsList).click(function(){
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

		this.panel.delegate('.fs-del','click',function(event){
			event.preventDefault();
			var $this = $(this);
			if (confirm('确定要删除该文件吗？')) {
				$.post(_this.opts.api + '?action=delete',{path:_this.path + $(this).next().attr('data-name') },function(result){
					result = $.parseJSON(result);
					console.log(result);
					if (result.error === 0) {
						$this.parent().remove();
					}else{
						alert(result.msg);
					}
				});
			}
		});

		this.panel.delegate('li','dblclick',function(){
			var url = $(this).find('img').attr('src');

			_this.fireEvent('onOK',[url]);
			_this.close();
			$('li',_this.picsList).removeClass('fs-selected');
		});
		$(window).resize(function(){
			console.log(_this.panel.height());
			_this.mcbody.height(_this.panel.height() - 60);
		});
	},

	fireEvent:function(event,params){
		if (this.instance && this.instance.hasOwnProperty(event)) {
			console.log(event,'fired');
			return this.instance[event](params);
		}
	},

	close:function(){
		this.cover.hide();
	},
	open:function(instanceOpts){
		this.instance = instanceOpts;
		this.cover.show();
		this.setupPanel();
		$(window).resize();
	},
	resize:function(){
	},
};
