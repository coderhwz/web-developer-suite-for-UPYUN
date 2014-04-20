/* code by hwz */


(function($){
	function mcUploader(element,options){
		this.holder = $(element);
		this.opts = {
		};
		this.opts = $.extend(this.opts,options,{});
		this.init();
	}
	mcUploader.prototype = {
		init:function(){
			var _this = this;
			this.uploadInput = $('<input type="file"  class="hide mc-upload-holder">');
			this.holder.after(this.uploadPanel);
			this.holder.click(function(){
				_this.uploadInput.click();
			});
			_this.uploadInput.on('change',function(){
				console.log('change');
				var formData = new FormData();
				$.each(_this.opts.post,function(key,val){
					formData.append(key,val);
				})
				formData.append('file',this.files[0]);
				$.ajax({
					url: '/media-center-for-upyun/php/api.php?action=upload', 
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
						console.log(result);
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
			})
		}
	};
	function mc(element,options){
		this.element = $(element);
		this.opts = {
			cover:true,
			label_cancel:"取消",
			label_ok:"确定",
			label_upload:"上传文件",
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

			var _this = this;
			if ($('.mc-dialog').length > 0 ) {
				return ;
			};

			this.dialog = $('<div class="mc-dialog"></div>');
			this.dialog.appendTo(this._body);
			this.mcheader = $('<div class="mc-header"/>');
			this.mcheader.appendTo(this.dialog);
			this.mcheader.text(this.opts.title);
			this.btnClose = $('<span class="mc-close" >X</span>');

			this.mcbody = $('<div class="mc-body" />');
			this.mcbody.appendTo(this.dialog);

			this.uploadPanel = $('<div class="mc-upload-panel" />');
			this.uploadPanel.appendTo(this.mcbody).text('点击或拖过来'); 

			new mcUploader(this.uploadPanel[0],{
				post:{action:'upload'}
			});

			// this.btnUpload = $('<button class="mc-btn-upload" />').text(this.opts.label_upload);
			// this.btnUpload.appendTo(this.mcbody);

			// this.uploadInput = $('<input type="file"  class="hide mc-upload-holder">');
			// this.uploadInput.appendTo(this.uploadPanel);

			this.picsList = $('<ul class="mc-list" />');
			this.picsList.appendTo(this.mcbody);

			this.mcfooter = $('<div class="mc-footer" />');
			this.mcfooter.appendTo(this.dialog);

			// this.btnUpload.click(function(){
				// console.log('click');
				/* var h = _this.mcbody.height()-15;
				_this.uploadPanel.css({'height':h+'px','line-height':h+'px'});
				_this.uploadPanel.show(); */
			// });

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
		},
		resize:function(){
		},
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


