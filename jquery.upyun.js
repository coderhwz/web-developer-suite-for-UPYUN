/* code by hwz */
(function($){

	function upyun(element,options){
		var _this = this;
		if (window._upanel == undefined) {
			window._upanel = new mc({
				api:options.api,
			});
		};

		this.element = $(element);
		if (options.panel) {
			this.element.click(function(){
				window._upanel.open({
					onOK:function(urls){
						_this.element.val(urls[0]);
						$('#holder').attr('src',urls[0]);
					}
				});
			});
		}else{
			new mcUploader({
				api:options.api + '?action=upload',
			});
		};
	}
	$.fn.upyun = function (options) {
		return this.each(function () {
			if (!$.data(this, 'upyun')) {
				$.data(this, 'upyun', new upyun(this,options));
			}
		}); 
    };
})(jQuery);


