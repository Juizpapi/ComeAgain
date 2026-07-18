<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = $_POST['name'];
    $price = (float) $_POST['price'];
    $quantity = (int) $_POST['quantity'];
    $addons = isset($_POST['addons']) ? $_POST['addons'] : [];

    // Add-on prices
    $addon_prices = [
        'Plantain' => 200,
        'Salad' => 150,
        'Chicken' => 500,
        'Turkey' => 800,
        'Meat' => 600,
        'Pomo' => 400
    ];

    // Calculate total price including addons
    $total_price = $price;
    foreach($addons as $addon){
        if(isset($addon_prices[$addon])){
            $total_price += $addon_prices[$addon];
        }
    }

    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    // Check if item with same addons exists
    $found = false;
    foreach ($_SESSION['cart'] as &$cartItem) {
        if ($cartItem['name'] === $name && $cartItem['addons'] === $addons) {
            $cartItem['quantity'] += $quantity;
            $cartItem['total_price'] += $total_price * $quantity;
            $found = true;
            break;
        }
    }

    if (!$found) {
        $_SESSION['cart'][] = [
            'name' => $name,
            'price' => $price,
            'quantity' => $quantity,
            'addons' => $addons,
            'total_price' => $total_price * $quantity
        ];
    }

    echo "ok";
    exit();
}
