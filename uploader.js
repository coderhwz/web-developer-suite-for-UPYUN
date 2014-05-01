(function($){
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
