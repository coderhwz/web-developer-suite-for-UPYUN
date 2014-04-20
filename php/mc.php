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
			$list = $this->upyun->getList($this->path);
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

			$response['data'] = $this->upyun->writeFile($this->path . $file['name'],
				file_get_contents($file['tmp_name']));
			$_SESSION['list'] = 0;

		}catch(UpYunException $e){

			$response['error'] = MC_ERROR;
			$response['msg'] = $e->getMessage();
			$response['data'] = '';

		}
		echo json_encode($response);
		die();
	}
}

//End of file 
