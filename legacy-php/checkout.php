<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require "db.php";

// User must be logged in and have items in cart
if (!isset($_SESSION['user_id']) || empty($_SESSION['cart'])) {
    header("Location: cart.php");
    exit();
}

// Only allow COD orders
if (!isset($_POST['method']) || $_POST['method'] !== 'COD') {
    die("Invalid checkout method. Please go back to cart.");
}

$user_id = $_SESSION['user_id'];

// Get delivery fee from POST (default to 0 if not set)
$delivery_fee = isset($_POST['delivery_fee']) ? floatval($_POST['delivery_fee']) : 0;

// Convert cart to JSON
$items_json = json_encode($_SESSION['cart']);

// Calculate total amount including delivery
$total = 0;
foreach ($_SESSION['cart'] as $item) {
    $subtotal = $item['price'] * $item['quantity'];
    // Include addons if present
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

// Add delivery fee to total
$total += $delivery_fee;

// Insert order into 'orders' table
$stmt = $conn->prepare("
    INSERT INTO orders (user_id, items, total_amount, delivery_fee, status, payment_method) 
    VALUES (:user_id, :items, :total_amount, :delivery_fee, :status, :payment_method)
");
$status = "Pending";
$payment_method = "COD";

$stmt->execute([
    ':user_id' => $user_id,
    ':items' => $items_json,
    ':total_amount' => $total,
    ':delivery_fee' => $delivery_fee,
    ':status' => $status,
    ':payment_method' => $payment_method
]);

// Get inserted order ID
$order_id = $conn->lastInsertId();

// Clear cart
unset($_SESSION['cart']);

// Redirect to order success page
header("Location: order_success.php?order_id=$order_id");
exit();
