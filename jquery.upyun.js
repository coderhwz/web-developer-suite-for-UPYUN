/* code by hwz */
(function($){

	function upyun(element,options){
		console.log(options);
		if (window._upanel == undefined) {
			window._upanel = new mc({
				api:options.api,
			});
		};
		this.element = $(element);
		console.log(options);
		if (options.panel) {
			this.element.click(function(){
				window._upanel.open();
			});
		}else{
			this.element.upload5();
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


