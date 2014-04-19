/* code by hwz */


(function($){
	function mc(element,options){
		this.element = $(element);
		this.opts = {
			cover:true,
			label_cancel:"取消",
			label_ok:"确定",
		};

		this.opts = $.extend(this.opts,options,{});
		this._body = $('body');
		this.init();
		this.setupDialog();
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
		setupDialog:function(){

			if ($('.mc-dialog').length > 0 ) {
				return ;
			};

			var html =	'<div class="mc-dialog">'+
							'<div class="mc-header">'+
								'%title%'+
								'<span class="mc-close">X</span>'+
							'</div>'
							'<div class="mc-body">'+
								'<ul class="mc-list"> </ul>'+
							'</div>'+
							'<div class="mc-footer"> '+
								'<button class="mc-btn-ok">%label_ok%</button>'+
								'<button class="mc-btn-cancel">%label_cancel%</button>'+
							'</div>'+
						'</div>';
			html = html.replace('%title%',this.opts.title)
				.replace('%label_ok%',this.opts.label_ok)
				.replace('%label_cancel%',this.opts.label_cancel);
			this.dialog = $(html);
			this.btnOK = $('.mc-btn-ok',this.dialog);
			this.btnCancel = $('.mc-btn-cancel',this.dialog);
			this.btnClose = $('.mc-close',this.dialog);
			// this.dialog.appendTo(this._body);

			this.dialog = $('<div class="mc-dialog"></div>');
			this.dialog.appendTo(this._body);
			this.mcheader = $('<div class="mc-header"/>');
			this.mcheader.appendTo(this.dialog);
			this.mcheader.text(this.opts.title);
			this.btnClose = $('<span class="mc-close" >X</span>');

			this.mcbody = $('<div class="mc-body" />');
			this.mcbody.appendTo(this.dialog);
			this.picsList = $('<ul class="mc-list" />');
			this.picsList.appendTo(this.mcbody);

			this.mcfooter = $('<div class="mc-footer" />');
			this.mcfooter.appendTo(this.dialog);

			this.btnOk = $('<button class="mc-btn-ok" />').text(this.opts.label_ok);
			this.btnOk.appendTo(this.mcfooter);
			this.btnCancel = $('<button class="mc-btn-cancel" />').text(this.opts.label_cancel);
			this.btnCancel.appendTo(this.mcfooter);

			this.btnClose.appendTo(this.mcheader);
			this.btnClose.click(function(){
				console.log('close');
			});


			// this.picsList = $('.mc-list',this.dialog);
			console.log(this.picsList,this.btnCancel,this.btnClose,this.dialog);

		},

		loadData:function(){
			var _this = this;
			this.opts.api;
			$.post(this.opts.api + '?action=list',{},function(data){
				console.log(data);
				console.log(_this.picsList);
				for (var i = 0; i < data.length; i++) {
					_this.picsList.append('<li><img src="'+data[i].url+'" /></li>');
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
			if (this.element.is("input")) {
				this.element.on('focus click',function(){
					_this.open();
				});
			};
		},
		close:function(){
			if (this.opts.cover) {
				this.cover.hide();
			};
			this.dialog.hide();
		},
		open:function(){
			if (this.opts.cover) {
				this.cover.show();
			};
			this.setupDialog();
			this.dialog.show();
		}

	};

	$.fn.mc = function (options) {
			new mc(this,options);
        /* return this.each(function () {
            if (!$.data(this, 'mc')) {
                $.data(this, 'mc', new mc(this,options));
            }
        }); */
    };
})(jQuery);


