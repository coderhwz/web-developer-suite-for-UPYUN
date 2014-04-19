<?php

/**
 * 
 **/
class mc {

	protected $upyun;

	protected $host;

	protected $path = '/';

	function __construct() {
		include('upyun.class.php');
		$this->upyun = new UpYun('bitbucket','hwz','bitbucket');
		$this->host = 'http://bitbucket.b0.upaiyun.com';
	}

	/**
	 * undocumented function
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
		$list = $this->upyun->getList($this->path);
		foreach ($list as &$pic) {
			if ($pic['type'] == 'file') {
				$pic['url'] = $this->host . $this->path . $pic['name'];
			}
		}
		echo json_encode($list);
	}
}

//End of file 
