(function($){
    "use strict";
    upyun.uploader = function(element,options){
        this.trigger = $(element);
        this.opts = {
            post:{},
            multiUpload:false
        };
        this.opts = $.extend(this.opts,options,{}); 
        this.init();
    };
    upyun.uploader.prototype = {
        init:function(){
            var _this = this;
            this.uploadInput = $('<input type="file" class="hide mc-upload-holder">');
            this.trigger.click(function(){
                _this.uploadInput.click();
            });
            _this.uploadInput.on('change',function(){
                for (var i = 0, len = this.files.length; i < len; i++) {
                    var formData = new FormData();
                    if (_this.opts.post !== undefined) {
                        $.each(_this.opts.post,function(key,val){
                            formData.append(key,val);
                        });
                    } formData.append('file',this.files[i]); $.ajax({
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


                }
                function onProcess(e){
                }
            });
        },
        setOpts:function(options){
            this.opts = $.extend(this.opts,options,{});
            var multiUpload = '';
            if (this.opts.multiUpload) {
                multiUpload = 'multiple';
            }
            this.uploadInput.attr('multiple','multiple');
        }
    };
})(jQuery);
