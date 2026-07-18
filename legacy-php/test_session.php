<?php
session_start();
$_SESSION['test'] = 'Hello World';
echo "<pre>";
print_r($_SESSION);
