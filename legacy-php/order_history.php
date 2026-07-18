<?php
session_start();
require "db.php";

// User must be logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

// Get user's orders
$sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->execute([$user_id]);
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>My Orders - Come Again Restaurant</title>
<style>
body { font-family: Arial, sans-serif; background:#fff8e1; }
.container { max-width:900px; margin:40px auto; background:#FF5722; padding:20px; border-radius:10px; color:#fff; }
h1 { text-align:center; }
.order-card { background:#fff; color:#333; border-radius:10px; padding:20px; margin-bottom:20px; box-shadow:2px 4px 8px rgba(0,0,0,0.2); }
.order-card h3 { margin-top:0; color:#FF5722; }
.order-details { display:flex; flex-wrap:wrap; justify-content:space-between; margin-top:10px; }
.order-details div { width:48%; margin-bottom:10px; }
.items-list { background:#fff3e0; padding:10px; border-radius:8px; font-size:0.95em; }
.status { font-weight:bold; padding:4px 10px; border-radius:5px; display:inline-block; margin-top:5px; }
.status-pending { background:#FFCC80; color:#FF5722; }
.status-completed { background:#C8E6C9; color:green; }
.status-cancelled { background:#FFCDD2; color:red; }
a { color:#fff; text-decoration:underline; display:block; text-align:center; margin-top:20px; }
@media(max-width:700px){ .order-details div { width:100%; } }
</style>
</head>
<body>

<div class="container">
<h1>My Orders</h1>

<?php if (count($orders) == 0): ?>
    <div class="empty" style="background:#fff; color:#333; padding:20px; text-align:center; border-radius:8px;">You have not placed any orders yet.</div>
<?php else: ?>
    <?php foreach ($orders as $order): 
        $items = json_decode($order['items'], true);
        $items_total = 0;
        foreach ($items as $item) {
            $subtotal = $item['price'] * $item['quantity'];
            if(isset($item['addons']) && is_array($item['addons'])){
                $addon_prices = ['Plantain'=>200, 'Salad'=>150, 'Chicken'=>500, 'Turkey'=>800, 'Meat'=>600, 'Pomo'=>400];
                foreach($item['addons'] as $addon){
                    if(isset($addon_prices[$addon])){
                        $subtotal += $addon_prices[$addon] * $item['quantity'];
                    }
                }
            }
            $items_total += $subtotal;
        }
        $delivery_fee = isset($order['delivery_fee']) ? (float)$order['delivery_fee'] : 0;
        $grand_total  = $items_total + $delivery_fee;
    ?>
    <div class="order-card" style="border-left:6px solid <?= strtolower($order['status'])==='pending'?'#FF5722':(strtolower($order['status'])==='completed'?'green':'red') ?>;">
        <h3>Order #<?= $order['id'] ?> — <?= htmlspecialchars($_SESSION['user']); ?></h3>
        <div class="order-details">
            <div>
                <strong>Items:</strong>
                <div class="items-list">
                    <?php foreach ($items as $item): ?>
                        <?= htmlspecialchars($item['name']) ?> x <?= (int)$item['quantity'] ?><br>
                        <?php if(isset($item['addons']) && is_array($item['addons'])): ?>
                            <small>Addons: <?= implode(', ', $item['addons']) ?></small><br>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>
            <div>
                <strong>Items Total:</strong> ₦<?= number_format($items_total, 2) ?><br>
                <strong>Delivery Fee:</strong> ₦<?= number_format($delivery_fee, 2) ?><br>
                <strong>Grand Total:</strong> ₦<?= number_format($grand_total, 2) ?><br>
                <strong>Status:</strong> <span class="status status-<?= strtolower($order['status']) ?>"><?= ucfirst($order['status']) ?></span><br>
                <strong>Payment:</strong> <?= htmlspecialchars($order['payment_method']) ?><br>
                <strong>Date:</strong> <?= date("d M Y, h:i A", strtotime($order['created_at'])) ?>
            </div>
        </div>
    </div>
    <?php endforeach; ?>
<?php endif; ?>

<a href="index.php">⬅ Back to Menu</a>
</div>

</body>
</html>
