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
	this.init();
	this.setupPanel();
	this.loadData();
	this.eventHandle();
}
mc.prototype={
	init:function(){
		console.log('init');
		if (this.opts.cover) {
			this.setupCover();
		};
	},
	setupCover:function(){
		if ($('.mc-cover').length > 0) {
			this.cover = $('.mc-cover');
		}else{
			this.cover = $('<div class="hide mc-cover"> </div>');
			this.cover.appendTo(this._body);
		};
	},
	setupPanel:function(){

		var _this = this;
		if ($('.mc-panel').length > 0 ) {
			return ;
		};

		this.panel = $('<div class="mc-panel"></div>');
		this.panel.appendTo(this._body);
		this.mcheader = $('<div class="mc-header"/>');
		this.mcheader.appendTo(this.panel);
		this.mcheader.text(this.opts.title);
		this.btnClose = $('<span class="mc-close" >×</span>');

		this.mcbody = $('<div class="mc-body" />');
		this.mcbody.appendTo(this.panel);
		this.mcbody.height(this.panel.height() - 60);

		this.uploadPanel = $('<div class="mc-upload-panel" />');
		this.uploadPanel.appendTo(this.mcbody).text('点击此处或将文件拖拽该面板'); 


		this.picsList = $('<ul class="mc-list" />');
		this.picsList.appendTo(this.mcbody);


		new mcUploader(this.uploadPanel[0],{
			api:this.opts.api + '?action=upload',
			onSuccess:function(result){
				var li = $('<li><span style="vertical-align:middle;"><img src="'+result.data.url+'" /></span></li>').prependTo(_this.picsList).click(function(){
					$(this).toggleClass('mc-selected');
					_this.fireEvent('onSelected',this); 
				});
			}
		});

		this.mcfooter = $('<div class="mc-footer" />');
		this.mcfooter.appendTo(this.panel);

		this.btnOk = $('<button class="mc-btn-ok" />').text(this.opts.label_ok);
		this.btnOk.appendTo(this.mcfooter);
		this.btnCancel = $('<button class="mc-btn-cancel" />').text(this.opts.label_cancel);
		this.btnCancel.appendTo(this.mcfooter);

		this.btnClose.appendTo(this.mcheader);

		this.btnClose.click(function(){
			_this.close();
			$('li',_this.picsList).removeClass('mc-selected');
		});

		this.btnCancel.click(function(){
			_this.close();
			$('li',_this.picsList).removeClass('mc-selected');
		})
		this.btnOk.click(function(){
			var urls = [];
			$('.mc-selected img',_this.picsList).each(function(index,value){
				urls.push(this.src);
			});
			_this.fireEvent('onOK',urls);
			_this.close();
			$('li',_this.picsList).removeClass('mc-selected');
		});

	},

	loadData:function(){
		var _this = this;
		this.opts.api;
		$.post(this.opts.api + '?action=list',{},function(data){
			data = $.parseJSON(data);
			for (var i = 0; i < data.length; i++) {
				if (data[i].type == 'file') {
					var li = $('<li />').appendTo(_this.picsList);

					var img = $('<img />');
					img.attr('src',data[i].url);
					img.load(function(){
						var percent = this.naturalWidth / this.naturalHeight;
						var newWidth=0,newHeight=0;
						if (this.naturalWidth > this.naturalHeight) {
							newWidth = _this.opts.imgWidth;
							newHeight = newWidth / percent;
							if (newHeight > _this.opts.imgHeight) {
								newHeight = _this.opts.imgHeight;
								newWidth = newHeight * percent;
							}; 
						}else{
							newHeight = _this.opts.imgHeight;
							newWidth = newHeight * percent;
							if (newWidth > _this.opts.imgWidth) {
								newHeight = newWidth / percent;
							};
						};
					   this.width = newWidth;
					   this.height = newHeight;
					})
					li.append(img);
				};
			};
		});
	},

	selectHandle:function(){
	},

	eventHandle:function(){
		var _this = this;
		if (this.opts.cover) {
			this.cover.click(function(){
				_this.close();
			});
		};
		this.mcbody.delegate('li','click',function(){
			$(this).toggleClass('mc-selected');
			_this.fireEvent('onSelected',this);
		})

		this.mcbody.delegate('li','dblclick',function(){
			var url = $(this).find('img').attr('src');

			_this.fireEvent('onOK',[url]);
			_this.close();
			$('li',_this.picsList).removeClass('mc-selected');
		})
		$(window).resize(function(){
			_this.mcbody.height(_this.panel.height() - 60);
		});
	},

	fireEvent:function(event,params){
		if (this.instance.hasOwnProperty(event)) {
			console.log(event,'fired');
			return this.instance[event](params);
		};
	},

	close:function(){
		if (this.opts.cover) {
			this.cover.hide();
		};
		this.panel.hide();
	},
	open:function(instanceOpts){
		this.instance = instanceOpts;
		if (this.opts.cover) {
			this.cover.show();
		};
		this.setupPanel();
		this.panel.show();
	},
	resize:function(){
	},
};
