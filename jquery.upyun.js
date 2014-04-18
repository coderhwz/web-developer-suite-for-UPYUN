/* code by hwz */


(function($){
	function mc(element,options){
		this.element = $(element);
		this.opts = {
			cover:true,
		};

		this.opts = $.extend(this.opts,options,{});
		this._body = $('body');
		this.init();
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
		},
		open:function(){
			if (this.opts.cover) {
				this.cover.show();
			};
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


