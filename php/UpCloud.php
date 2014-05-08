<?php
/**
 * UpKit
 *
 * Desc:又拍开发者套件处理，封装所有基本操作
 *
 * Author:coderhwz@gmail.com
 *
 **/

class UpCloud {
	const SUCCESS = 0;

	const ERROR = 1;

	const WARNING = 2;

	protected $upyun;

	protected $host;

	protected $path;

	protected $size;

	private $_events;

	private $translate = array(
		'OK'=>'	操作成功',
		'Bad Request'=>'错误请求(如 URL 缺少空间名)',
		'Unauthorized'=>'访问未授权',
		'Sign error'=>'签名错误(操作员和密码,或签名格式错误)',
		'Need Date Header'=>'发起的请求缺少 Date 头信息',
		'Date offset error'=>'发起请求的服务器时间错误，请检查服务器时间是否与世界时间一致',
		'Not Access'=>'权限错误(如非图片文件上传到图片空间)',
		'File size too max'=>'单个文件超出大小(100Mb 以内)',
		'Not a Picture File'=>'图片类空间错误码，非图片文件或图片文件格式错误。针对图片空间只允许上传 jpg/png/gif/bmp/tif 格式。',
		'Picture Size too max'=>'图片类空间错误码，图片尺寸太大。针对图片空间，图片总像素在 200000000 以内。',
		'Bucket full'=>'空间已用满',
		'Bucket blocked'=>'空间被禁用,请联系管理员',
		'User blocked'=>'操作员被禁用',
		'Image Rotate Invalid Parameters'=>'图片旋转参数错误',
		'Image Crop Invalid Parameters'=>'图片裁剪参数错误',
		'Not Found'=>'获取文件或目录不存在',
		'Not Acceptable'=>'目录错误（创建目录时已存在同名文件；或上传文件时存在同名目录)',
		'System Error'=>'系统错误',
	);

	function __construct($bucket,$name,$pwd,$host,$size) {
		include('upyun.class.php');

		// todo 文件类型限制 ，文件大小限制 
		$this->upyun = new UpYun($bucket,$name,$pwd);
		$this->host = $host;
		// $this->size = $size;
		$this->path = isset($_POST['path']) ? $_POST['path'] : '';
		session_start();
        // $_SESSION['upyun-cache'] = false;
	}

	/**
	 * 响应一个错误
	 *
	 * @param $msg string 
	 * @return void
	 * @author hwz
	 **/
	public function error($msg,$data=null) {
		$this->_response(self::ERROR,$msg,$data);
	}

	/**
	 * 响应一个警告
	 *
	 * @param $msg string 必须
	 * @return void
	 * @author hwz
	 **/
	public function warning($msg){
		$this->_response(self::WARNING,$msg,$data);
	}

	/**
	 * 响应一个成功提示
	 *
	 * @return void
	 * @author hwz
	 **/
	public function success($msg=null,$data=null){
		$msg = $msg ? $msg : '操作成功!';
		$this->_response(self::SUCCESS,$msg,$data);
	}

	/**
	 * 发送响应
	 *
	 * @return void
	 * @author hwz
	 **/
	protected function _response($code,$msg,$data=null){
		$response = array(
			'error' => $code,
			'msg' => $msg,
			'data'=>$data,
		);
		die(json_encode($response));
	}

	/**
	 * 设置允许的文件类型
	 *
	 * @return void
	 * @author hwz
	 **/
	public function setAllowTypes() {

	}

	/**
	 * 处理
	 *
	 * @return void
	 * @author hwz
	 **/
	public function handle() {
		$this->dispatcher();
		// var_dump(is_callable($this->_events['preUpload']));
	}

	/**
	 * 
	 *
	 * @return void
	 * @author hwz
	 **/
	public function takeOver() {
		$this->handle();
	}

	/**
	 * 请求分发
	 *
	 * @return void
	 * @author hwz
	 **/
	private function dispatcher() {
		$actions = array('delete','upload','list','mkdir','rmdir');
		$action = $_GET['action'];
		if (in_array($action,$actions)) {
			$this->{'action_' . $action}();
		}else{
            $this->error('不支持操作');
		}

	}

	/**
	 * 列表
	 *
	 * @return void
	 * @author hwz
	 **/
	protected function action_list(){
		$this->path = isset($_POST['path']) ? $_POST['path'] : '/';
		// var_dump($_SESSION);
		$this->path = rtrim($this->path,'/') . '/';

		$list = $this->getCache($this->path);
		if ($list !== false) {
			$this->success('',$list);
		} else{
			$this->_fire('preGetList');
			$list = $this->upyun->getList($this->path);
			$this->_fire('postGetList',$list);
			$folders = array();
			$files = array();
			foreach ($list as $item) {
				if ($item['type'] == 'folder') {
					$folders[] = $item;
				}else{
					$item['url'] = $this->host . $this->path . $item['name'];
					$files[] = $item;
				}
			}
			$list = array_merge($folders,$files);
			$this->setCache($this->path,$list);
		}
		$this->success(null,$list);
	}

	/**
	 * 上传文件
	 *
	 * @return void
	 * @author hwz
	 **/
	protected function action_upload() {
		if (empty($_FILES)) {
			$this->error('文件列表为空!');
		}
		$file = $_FILES['file'];
		try{

			$this->_fire('preUpload');
			$result = $this->upyun->writeFile($this->path . $file['name'],
				file_get_contents($file['tmp_name']));
            $response['size'] = $file['size'];
            $response['time'] = time();
			$response['url']= $this->host . $this->path . $file['name'] . $this->size;
			$response['type'] = 'file';
            $response['name'] = $file['tmp_name'];
            $response['width'] = $result['x-upyun-width'];
            $response['height'] = $result['x-upyun-height'];
			$this->_fire('postUpload');

			$_SESSION['list'] = false;
			$this->success('上传成功',$response);

		}catch(UpYunException $e){
			$this->error($this->_getErrorMsg($e));
		}
		echo json_encode($response);
		die();
	}

	/**
	 * 删除文件
	 *
	 * @return void
	 * @author hwz
	 **/
	public function action_delete() {
        $name = trim($_POST['name']);
		if ($name) {
			try{
				$this->upyun->delete($this->path . $name);
                $this->delCache($this->path);
				$this->success();

			}catch(UpYunException $e){
				$this->error($this->_getErrorMsg($e));
			}
		}
		$this->error('路径错误!');
	}

	/**
	 * undocumented function
	 *
	 * @return void
	 * @author hwz
	 **/
	public function action_mkdir() {
        $name = trim($_POST['name']);
        if ($name) {
            try {
                $result = $this->upyun->makeDir($this->path . $name);
                $this->delCache($this->path);
                $this->success('创建成功!',array(
                    'name'=>$name,
                    'time'=>time(),
                    'type'=>'folder',
                ));
            } catch (UpYunException $e) {
                $this->error($this->_getErrorMsg($e));
            }
        }
	}

	/**
	 * 删除文件夹
	 *
	 * @return void
	 * @author hwz
	 **/
	public function action_rmdir() {

	}

	/**
	 * 添加事件处理回调
	 *
	 * @param $namw string 事件名称
	 * @param $callback mixed array,string,closure均可
	 * @return void
	 * @author hwz
	 **/
	public function when($name,$callback) {
		if ($callback) {
			$this->_events[$name] = $callback;
		}
	}

	/**
	 * 触发事件 
	 *
	 * @return void
	 * @author hwz
	 **/
	private function _fire($mixed,$params = null) {
		if (is_callable($mixed)) {
			// todo 传递 $this给回调
			call_user_func_array($mixed,$params);
		}
	}

	/**
	 * undocumented function
	 *
	 * @return void
	 * @author hwz
	 **/
	private function _getErrorMsg($e) {
		$msg = $e->getMessage();
		if (isset($this->translate[$msg])) {
			return $this->translate[$msg];
		}
		return $msg;
	}

	/**
	 * undocumented function
	 *
	 * @return void
	 * @author hwz
	 **/
	protected function setCache($key,$value) {
		$key = md5($key);
		if (!isset($_SESSION['upyun-cache'])) {
			$_SESSION = array();
		}
		$_SESSION['upyun-cache'][$key] = $value;
	}

	/**
	 * undocumented function
	 *
	 * @return void
	 * @author hwz
	 **/
	protected function getCache($key) {
		$key = md5($key);
		if (!isset($_SESSION['upyun-cache'])) {
			$_SESSION['upyun-cache'] = array();
			return false;
		}
		if (!isset($_SESSION['upyun-cache'][$key])) {
			return false;
		}
		return $_SESSION['upyun-cache'][$key];
	}

	/**
	 * undocumented function
	 *
	 * @return void
	 * @author hwz
	 **/
	protected function delCache($key) {
		$key = md5($key);
		if (!isset($_SESSION['upyun-cache'])) {
			return false;
		}
		if (isset($_SESSION['upyun-cache'][$key])) {
			unset($_SESSION['upyun-cache'][$key]);
		}
	}
}

//End of file 
