(function($){
	$.fn.upyun = function (opts) {
        if (window._upanel === undefined) {
            //目前不能动态的改主题
            window._upanel = new upyun.panel(opts.theme);
        }
		return this.each(function () {
			var element = $(this),
                holder = opts.holder || element.attr('data-holder');
			opts.title = opts.title || element.attr('data-title');
            opts.api = opts.api || element.attr('data-api');

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
