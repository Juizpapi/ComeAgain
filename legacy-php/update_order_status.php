<?php

session_start();
require 'db.php';

// Only admin
if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'admin') {
    exit('Unauthorized');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = intval($_POST['order_id']);
    $status = $_POST['status'];

    if(in_array($status, ['completed','cancelled'])){
        $stmt = $conn->prepare("UPDATE orders SET status=:status WHERE id=:id");
        $stmt->execute(['status'=>$status, 'id'=>$order_id]);
        echo "Order #$order_id marked as $status.";
    } else {
        echo "Invalid status.";
    }
}
