<?php

include('config.php');
include('mc.php');

$upCloud = new UpCloud(BUCKET,NAME,PWD,HOST,SIZE);
$upCloud->takeOver();

//End of file 
