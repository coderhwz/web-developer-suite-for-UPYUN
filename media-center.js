function mc(options){
	this.opts = {
		cover:true,
		label_cancel:"取消",
		label_ok:"确定",
		label_upload:"上传文件",
	};

	this.opts = $.extend(this.opts,options,{});
	this._body = $('body');
	this.init();
	this.setupPanel();
	this.loadData();
}
mc.prototype={
	init:function(){
		console.log('init');
		if (this.opts.cover) {
			this.setupCover();
		};
		this.eventHandle();
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

		this.uploadPanel = $('<div class="mc-upload-panel" />');
		this.uploadPanel.appendTo(this.mcbody).text('点击或拖过来'); 

		new mcUploader(this.uploadPanel[0],{ });

		this.picsList = $('<ul class="mc-list" />');
		this.picsList.appendTo(this.mcbody);

		this.mcfooter = $('<div class="mc-footer" />');
		this.mcfooter.appendTo(this.panel);

		this.btnOk = $('<button class="mc-btn-ok" />').text(this.opts.label_ok);
		this.btnOk.appendTo(this.mcfooter);
		this.btnCancel = $('<button class="mc-btn-cancel" />').text(this.opts.label_cancel);
		this.btnCancel.appendTo(this.mcfooter);

		this.btnClose.appendTo(this.mcheader);
		this.btnClose.click(function(){
			console.log('close');
		});


		// this.picsList = $('.mc-list',this.panel);
		console.log(this.picsList,this.btnCancel,this.btnClose,this.panel);

	},

	loadData:function(){
		var _this = this;
		this.opts.api;
		$.post(this.opts.api + '?action=list',{},function(data){
			data = $.parseJSON(data);
			for (var i = 0; i < data.length; i++) {
				if (data[i].type == 'file') {
					_this.picsList.append('<li><img src="'+data[i].url+'" /></li>');
				};
			};
		});
	},

	eventHandle:function(){
		var _this = this;
		if (this.opts.cover) {
			this.cover.click(function(){
				_this.close();
			});
		};
	},
	close:function(){
		if (this.opts.cover) {
			this.cover.hide();
		};
		this.panel.hide();
	},
	open:function(){
		if (this.opts.cover) {
			this.cover.show();
		};
		this.setupPanel();
		this.panel.show();
	},
	resize:function(){
	},
};
