<?php

define('MC_OK','0');
define('MC_ERROR','1');

/**
 * 
 **/
class mc {

	protected $upyun;

	protected $host;

	protected $path = '/';

	protected $size;

	private $_events;

	function __construct($bucket,$name,$pwd,$host,$size) {
		include('upyun.class.php');

		$this->upyun = new UpYun($bucket,$name,$pwd);
		$this->host = $host;
		$this->size = $size;
		session_start();
		// $_SESSION['list'] = false;
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
	 * undocumented function
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
	}

	/**
	 * 上传文件
	 *
	 * @return void
	 * @author hwz
	 **/
	protected function action_upload() {
		$response = array(
			'error'=>MC_OK,
			'msg'=>'上传成功!',
		);
		if (empty($_FILES)) {
			$response['msg'] = '文件列表为空!';
			$response['error'] = MC_ERROR;
		}
		$file = $_FILES['file'];
		$response['data'] = array(
			'url'=>$this->host,
			'type'=>$file['type'],
		);

		try{

			$this->_fire('preUpload');
			$response['data'] = $this->upyun->writeFile($this->path . $file['name'],
				file_get_contents($file['tmp_name']));
			$response['data']['url']= $this->host . $this->path . $file['name'] . $this->size;
			$this->_fire('postUpload');
			$_SESSION['list'] = false;

		}catch(UpYunException $e){

			$response['error'] = MC_ERROR;
			$response['msg'] = $e->getMessage();
			$response['data'] = '';

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
				$response['error'] = MC_OK;

			}catch(UpYunException $e){
				$response['error'] = MC_ERROR;
				$response['msg'] = $e->getMessage();
			}
			echo json_encode($response);
			die();
		}
		echo json_encode(array(
			'error'=>MC_ERROR,
			'msg'=>'路径错误！',
		));
		die();
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
			call_user_func_array($mixed,$params);
		}
	}
}

//End of file 
