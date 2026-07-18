<?php
session_start();
require "db.php";

// Check if Paystack sent a reference
if (!isset($_GET['reference'])) {
    die("Payment reference not found.");
}

$reference = $_GET['reference'];

// Your Paystack secret key
$secret_key = "sk_test_d3a3788cc7ab4544847280aa5ccb9f16f84fc105";

// Verify payment with Paystack
$url = "https://api.paystack.co/transaction/verify/" . $reference;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $secret_key"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$paymentData = json_decode($response, true);

// Check if verification failed
if (!$paymentData || !isset($paymentData["data"]["status"])) {
    die("Payment verification failed.");
}

// Check successful payment
if ($paymentData["data"]["status"] === "success") {

    // User must be logged in
    if (!isset($_SESSION['user_id']) || empty($_SESSION['cart'])) {
        die("User session expired or cart empty. Login again.");
    }

    $user_id = $_SESSION['user_id'];
    $items_json = json_encode($_SESSION['cart']);

    // Calculate total including addons
    $total_price = 0;
    foreach ($_SESSION['cart'] as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        if(isset($item['addons']) && is_array($item['addons'])){
            $addon_prices = ['Plantain'=>200, 'Salad'=>150, 'Chicken'=>500, 'Turkey'=>800, 'Meat'=>600, 'Pomo'=>400];
            foreach($item['addons'] as $addon){
                if(isset($addon_prices[$addon])){
                    $subtotal += $addon_prices[$addon] * $item['quantity'];
                }
            }
        }
        $total_price += $subtotal;
    }

    // Add delivery fee from GET parameter (passed from online_payment.php)
    $delivery_fee = isset($_GET['delivery_fee']) ? floatval($_GET['delivery_fee']) : 0;
    $total_price += $delivery_fee;

    // Insert order into orders table including delivery fee
    $stmt = $conn->prepare("INSERT INTO orders (user_id, items, total_amount, status, payment_method, delivery_fee) VALUES (?, ?, ?, ?, ?, ?)");
    $status = "Paid";
    $payment_method = "Online";
    $stmt->execute([$user_id, $items_json, $total_price, $status, $payment_method, $delivery_fee]);

    $order_id = $conn->lastInsertId(); // Get the inserted order ID

    // Clear cart
    unset($_SESSION['cart']);

    // Redirect to order success
    header("Location: order_success.php?order_id=$order_id");
    exit();

} else {
    echo "Payment failed or was not completed.";
    exit();
}
