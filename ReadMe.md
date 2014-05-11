# 又拍开发者套件

## 简介
又拍开发者套件希望能够使用开发者和用户更方便的使用又拍云服务。套件前端基于jQuery,
后端封装了`upyun.class.php`,前后端约定以某一简单协议进行交互,目前支持jQuery调用,
百度UEditor和KindEditor

![示例图](./screenshot.png)


## 快速使用

### 前端
HTML
```html
	<script src="dist/upyun.min.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" href="dist/themes/default/style.css" type="text/css" media="screen" charset="utf-8">
	<input type="text" class="upyun" />
    <textarea id="u-content"></textarea>
    <textarea id="keditor"></textarea>
```

jQuery
```javascript

	$('.upyun').upyun({
		api:'/php/api.php'
	});
```
百度UEditor
```javascript
    var editor = UE.getEditor('u-content');
    editor.addListener( 'ready', function() {
        upyun.setUpUEditor(this,{
            api:'/php/api.php',
            style:'!small'
        });
    } );

```
KindEditor
```javascript
    KindEditor.ready(function(K) {
        var keditor = K.create('#keditor',{
            width:'100%'
        });
        upyun.setUpKEditor(keditor,{
            api:'/php/api.php',
            style:'!small'
        });
    });
```


### 服务端
php
```php
	
	<?php

    include('upyun.class.php');
	include('UpCloud.php');

	$upCloud = new UpCloud(BUCKET,NAME,PWD,HOST);
	$upCloud->takeOver();

	//End of file 
```


## 扩展

### 前端

### 服务端
