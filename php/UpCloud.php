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

	protected $upyun;

	protected $host;

	protected $path;

	protected $size;

	private $_events;

	private const SUCCESS = 0;

	private const ERROR = 1;

	private const WARNING = 2;

	function __construct($bucket,$name,$pwd,$host,$size) {
		include('upyun.class.php');

		// todo 文件类型限制 ，文件大小限制 
		$this->upyun = new UpYun($bucket,$name,$pwd);
		$this->host = $host;
		$this->size = $size;
		session_start();
		// $_SESSION['list'] = false;
	}

	/**
	 * 响应一个错误,错误响应将立即停止执行
	 *
	 * @param $msg string 
	 * @return void
	 * @author hwz
	 **/
	public function error($msg) {
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
		$actions = array('delete','upload','list');
		$action = $_GET['action'];
		if (in_array($action,$actions)) {
			$this->{'action_' . $action}();
		}else{
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
		if ($_SESSION['list']) {
			$list = $_SESSION['list'];
		}else{
			$this->_fire('preGetList');
			$list = $this->upyun->getList($this->path);
			$this->_fire('postGetList',$list);
			foreach ($list as &$pic) {
				if ($pic['type'] == 'file') {
					$pic['url'] = $this->host . $this->path . $pic['name'] . $this->size;
				}
			}
			$_SESSION['list'] = $list;
		}
		echo json_encode($list);
		$this->success('',$list);
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
			$response = $this->upyun->writeFile($this->path . $file['name'],
				file_get_contents($file['tmp_name']));
			$response['url']= $this->host . $this->path . $file['name'] . $this->size;
			$response['type'] = $file['type'];
			$this->_fire('postUpload');

			$_SESSION['list'] = false;
			$this->success('上传成功',$response);

		}catch(UpYunException $e){
			$this->error($e->getMessage());
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
		$path = $_POST['path'];
		if ($path) {
			try{
				$this->upyun->delete($path);
				$this->success();

			}catch(UpYunException $e){
				$this->error($e->getMessage());
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
}

//End of file 
