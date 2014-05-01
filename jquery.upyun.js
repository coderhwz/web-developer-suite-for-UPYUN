(function($){
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
