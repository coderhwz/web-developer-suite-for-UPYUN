/* code by hwz */

var upyun = window.upyun || {};

upyun.util = {
	getDirName:function(path){
		var m = path.match(/([^/])*\/$/)[0];
		return m.length < 1 ? '/' : m;
	},
	getScale:function(sw,sh,tw,th){
		// s:source w:width  h:height t:target 
		var percent = sw / sh;
		if (sw > sh) {
			nw = tw;
			nh = nw / percent;
			if (nh > th) {
				nh = th;
				nw = nh * percent;
			} 
		}else{
			nh = th;
			nw = nh * percent;
			if (nw > tw) {
				nh = nw / percent;
			}
		}
		return {width:nw,height:nh};
	},
	formatDate:function(timestamp){
		var time = new Date(timestamp*1000),
		month = time.getMonth()+1,
		year = time.getFullYear(),
		day = time.getDate(),
		hour = time.getHours(),
		minute = time.getMinutes(),
		second = time.getSeconds();
		month = month < 10 ? '0' + month.toString() : month;
		hour = hour < 10 ? '0' + hour.toString() : hour;
		minute = minute < 10 ? '0' + minute.toString() : minute;
		second = second < 10 ? '0' + second.toString() : second;
		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
	},
    checkOpts:function(options){
        var defaults = {
            title:'请选择图片',
            panelLogo:'../themes/default/images/logo.png',
            editorIcon:'../themes/default/images/logo.png',
            tWidth:120,
            tHeight:74,
            multiSelect:false,
        };
        return $.extend(options,defaults,{});
    }
};

