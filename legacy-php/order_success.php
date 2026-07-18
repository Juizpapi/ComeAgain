<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require "db.php";

// Get order_id from URL
if (!isset($_GET['order_id'])) {
    header("Location: index.php");
    exit();
}

$order_id = $_GET['order_id'];

// Fetch order details
$stmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
$stmt->execute([$order_id]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    die("Order not found.");
}

// Decode items JSON
$items = json_decode($order['items'], true);

// Add-on prices (same as in cart.php)
$addon_prices = ['Plantain'=>200, 'Salad'=>150, 'Chicken'=>500, 'Turkey'=>800, 'Meat'=>600, 'Pomo'=>400];
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Success - Come Again Restaurant</title>
<style>
body { font-family: Arial, sans-serif; margin:0; padding:0; background:#fff8e1; }
.container { max-width:700px; margin:50px auto; padding:20px; background:#FF5722; color:#fff; border-radius:10px; }
h1, h2 { text-align:center; }
table { width:100%; border-collapse:collapse; margin-top:20px; background:#fff; color:#333; border-radius:10px; }
th, td { padding:12px; text-align:center; border-bottom:1px solid #ddd; }
th { background:#FF5722; color:#fff; }
.status { padding:5px 10px; border-radius:6px; color:#fff; font-weight:bold; }
.status.Pending { background:#FF9800; }
.status.Paid { background:#2196F3; }
.status.COD { background:#FF5722; }
.back-btn { display:block; width:50%; margin:20px auto; text-align:center; padding:12px 25px; background:#fff; color:#FF5722; text-decoration:none; font-weight:bold; border-radius:8px; }
.back-btn:hover { background:#ffe8b3; }
</style>
</head>
<body>

<div class="container">
<h1>Order Placed Successfully!</h1>
<h2>Order #<?= $order['id']; ?></h2>

<p style="text-align:center;">
    Status: 
    <?php 
    if($order['status'] === 'Paid'){
        echo "<span class='status Paid'>Paid (Online)</span>";
    } elseif($order['payment_method'] === 'COD'){
        echo "<span class='status COD'>Pending (COD)</span>";
    } else {
        echo "<span class='status Pending'>".$order['status']."</span>";
    }
    ?>
</p>

<table>
    <tr>
        <th>Item</th>
        <th>Add-ons</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Subtotal</th>
    </tr>
    <?php 
    $grand_total = 0;
    foreach($items as $item):
        $subtotal = $item['price'] * $item['quantity'];
        $addons_list = '';
        if(isset($item['addons']) && is_array($item['addons'])){
            $addons_list = implode(', ', $item['addons']);
            foreach($item['addons'] as $addon){
                if(isset($addon_prices[$addon])){
                    $subtotal += $addon_prices[$addon] * $item['quantity'];
                }
            }
        }
        $grand_total += $subtotal;
    ?>
    <tr>
        <td><?= htmlspecialchars($item['name']); ?></td>
        <td><?= $addons_list ?: '—'; ?></td>
        <td><?= (int)$item['quantity']; ?></td>
        <td>₦<?= number_format($item['price'],2); ?></td>
        <td>₦<?= number_format($subtotal,2); ?></td>
    </tr>
    <?php endforeach; ?>
    <tr>
        <td colspan="4" style="font-weight:bold; text-align:right;">Delivery Fee</td>
        <td>₦<?= number_format($order['delivery_fee'],2); ?></td>
    </tr>
    <tr style="font-weight:bold; font-size:16px;">
        <td colspan="4" style="text-align:right;">Grand Total</td>
        <td>₦<?= number_format($grand_total + $order['delivery_fee'],2); ?></td>
    </tr>
</table>

<a href="index.php" class="back-btn">Back to Menu</a>
</div>

</body>
</html>
