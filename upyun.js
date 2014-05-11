/* code by hwz */

window.upyun = window.upyun || {};

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
        return [year,month,day].join('-') + ' ' + [hour,minute,second].join(':');
	},
    checkOpts:function(options){
        var defaults = {
            title:'请选择图片',
            panelLogo:'../themes/default/images/logo.png',
            editorIcon:'../themes/default/images/cloud.png',
            folderIcon:'../themes/default/images/Folder.png',
            tWidth:120,
            tHeight:74,
            multiSelect:false,
            multiUpload:false,
        };
        return $.extend(defaults,options,{});
    },
    urlConcat:function(url,params){
        url = url.split('#')[0];

        if (url.indexOf('?') === -1) {
            return [url,params].join('?');
        }else{
            return [url,params].join('&');
        }
    },
    renderImg:function(file){
        var image = '<a target="#target#" href="#href#"><img #width# #height# alt="#alt#" src="#src#"></a>';
        file.href = file.href || '';
        file.alt = file.alt || '';
        file.width = file.width ? 'width="'+file.width+'"' : '';
        file.height = file.height ? 'height="'+file.height+'"' : '';
        file.blank = file.blank || '';
        return image.replace('#href#',file.href)
                    .replace('#src#',file.url)
                    .replace('#alt#',file.alt)
                    .replace('#target#',file.blank)
                    .replace('#width#',file.width)
                    .replace('#height#',file.height);
    }


};

