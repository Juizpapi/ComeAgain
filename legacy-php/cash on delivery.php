<?php
session_start();
require "db.php"; // make sure to include DB connection

if(!isset($_SESSION['cart']) || count($_SESSION['cart']) == 0){
    header('Location: index.php');
    exit();
}

// Make sure user is logged in
if(!isset($_SESSION['user_id'])){
    header('Location: login.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Get delivery fee from GET or POST (pass from cart.php)
$delivery_fee = isset($_GET['delivery_fee']) ? floatval($_GET['delivery_fee']) : 0;

// Calculate total including addons
$total = 0;
foreach($_SESSION['cart'] as $item){
    $subtotal = $item['price'] * $item['quantity'];
    if(isset($item['addons']) && is_array($item['addons'])){
        $addon_prices = ['Plantain'=>200, 'Salad'=>150, 'Chicken'=>500, 'Turkey'=>800, 'Meat'=>600, 'Pomo'=>400];
        foreach($item['addons'] as $addon){
            if(isset($addon_prices[$addon])){
                $subtotal += $addon_prices[$addon] * $item['quantity'];
            }
        }
    }
    $total += $subtotal;
}

// Add delivery fee
$total += $delivery_fee;

// Convert cart to JSON
$items_json = json_encode($_SESSION['cart']);

// Insert order into database
$stmt = $conn->prepare("
    INSERT INTO orders (user_id, items, total_amount, status, payment_method, delivery_fee) 
    VALUES (:user_id, :items, :total_amount, :status, :payment_method, :delivery_fee)
");
$status = "Pending";
$payment_method = "COD";
$stmt->execute([
    ':user_id' => $user_id,
    ':items' => $items_json,
    ':total_amount' => $total,
    ':status' => $status,
    ':payment_method' => $payment_method,
    ':delivery_fee' => $delivery_fee
]);

$order_id = $conn->lastInsertId();

// Clear cart
unset($_SESSION['cart']);

// Redirect to order success page
header("Location: order_success.php?order_id=$order_id");
exit();
