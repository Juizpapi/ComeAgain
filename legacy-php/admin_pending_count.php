<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'admin') {
    echo 0;
    exit;
}

$stmt = $conn->prepare("SELECT COUNT(*) FROM orders WHERE status='pending'");
$stmt->execute();
$pending_orders_count = $stmt->fetchColumn();

echo $pending_orders_count;
