(function($){
	$.fn.upyun = function (options) {
        if (window._upanel === undefined) {
            window._upanel = new upyun.panel({
                api:options.api,
            });
        }
		return this.each(function () {
			var opts = {
				style:'!small',
				multi:false
			};

			var element = $(this);
			opts = $.extend(opts,options,{});

			opts.title = opts.title || element.attr('data-title') || '请选择图片';

			opts.onOK = opts.onOK || function(images){
                for (var i = 0, len = images.length; i < len; i++) {
                    var image = images[i];
                    element.val(image.url);
                }
			};

			element.click(function(){
				window._upanel.open(opts);
			});
		}); 
    };
})(jQuery);
