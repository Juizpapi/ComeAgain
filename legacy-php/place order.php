<?php
session_start();
require "db.php"; // make sure this connects to your database

// 1️⃣ Check if user is logged in
if(!isset($_SESSION['user_id'])){
    header("Location: login.php");
    exit();
}

// 2️⃣ Check if cart is not empty
if(!isset($_SESSION['cart']) || count($_SESSION['cart']) == 0){
    header("Location: cart.php");
    exit();
}

// 3️⃣ Calculate total amount
$total_amount = 0;
foreach($_SESSION['cart'] as $item){
    $total_amount += $item['price'] * $item['quantity'];
}

try {
    // 4️⃣ Insert into orders table
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)");
    
    // For Cash on Delivery, status = Pending
    $status = "Pending"; // If using online payment, change to 'Paid' after verification
    $stmt->execute([$_SESSION['user_id'], $total_amount, $status]);

    // Get the ID of the newly created order
    $order_id = $conn->lastInsertId(); // PDO function

    // 5️⃣ Insert each cart item into order_items table
    foreach($_SESSION['cart'] as $item){
        $stmt = $conn->prepare(
            "INSERT INTO order_items (order_id, item_name, price, quantity) VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([
            $order_id,
            $item['name'],
            $item['price'],
            $item['quantity']
        ]);
    }

    // 6️⃣ Clear the cart after placing the order
    unset($_SESSION['cart']);

    // 7️⃣ Redirect to a success page
    header("Location: order_success.php?order_id=$order_id");
    exit();

} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>
