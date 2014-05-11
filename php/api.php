<?php

include('config.php');
include('upyun.class.php');
include('UpCloud.php');

$upCloud = new UpCloud(BUCKET,NAME,PWD,HOST,SIZE);
$upCloud->when('preGetList',function($_this){
});
$upCloud->when('postGetList',function($_this,$list){
    // var_dump($_this,$list);
    // $_this->error('测试错误');
});
$upCloud->takeOver();

//End of file 
