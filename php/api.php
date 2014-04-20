<?php

include('config.php');
include('mc.php');
$mc = new mc(BUCKET,NAME,PWD,HOST,SIZE);
$mc->handle();

//End of file 
