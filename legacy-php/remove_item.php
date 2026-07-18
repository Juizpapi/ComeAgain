<?php
session_start();

header('Content-Type: application/json');

if(isset($_POST['index'])){
    $index = $_POST['index'];
    if(isset($_SESSION['cart'][$index])){
        unset($_SESSION['cart'][$index]);
        $_SESSION['cart'] = array_values($_SESSION['cart']); // reindex array
        echo json_encode(['success'=>true]);
        exit();
    }
}

echo json_encode(['success'=>false]);
exit();
