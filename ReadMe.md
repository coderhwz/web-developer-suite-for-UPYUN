# 又拍开发者套件

![示例图](./screenshot.png)

## 开发列表

- 多文件上传
- 插入编辑器时可编辑


## 一分钟入门

### 前端
HTML:

	<script src="dist/upyun.min.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" href="dist/themes/default/style.css" type="text/css" media="screen" charset="utf-8">
	<input type="text" class="upyun" />
JS:

	$('.upyun').upyun({
		api:'/media-center-for-upyun/php/api.php'
	});`


### 服务端
PHP:
	
	<?php

	include('config.php');
	include('UpCloud.php');

	$upCloud = new UpCloud(BUCKET,NAME,PWD,HOST,SIZE);
	$upCloud->takeOver();

	//End of file 


## 扩展

### 前端

### 服务端
