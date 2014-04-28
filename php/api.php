<?php

include('config.php');
include('UpCloud.php');

$upCloud = new UpCloud(BUCKET,NAME,PWD,HOST,SIZE);
$upCloud->takeOver();

//End of file 
