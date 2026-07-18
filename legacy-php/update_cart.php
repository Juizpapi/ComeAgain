<?php
session_start();
header('Content-Type: application/json');

if(isset($_POST['index'], $_POST['action'])){
    $index = $_POST['index'];
    $action = $_POST['action'];

    if(isset($_SESSION['cart'][$index])){
        if($action === 'increase'){
            $_SESSION['cart'][$index]['quantity']++;
        } elseif($action === 'decrease' && $_SESSION['cart'][$index]['quantity'] > 1){
            $_SESSION['cart'][$index]['quantity']--;
        }

        $item = $_SESSION['cart'][$index];
        $subtotal = $item['price'] * $item['quantity'];
        if(isset($item['addons']) && is_array($item['addons'])){
            $addon_prices = ['Plantain'=>200,'Salad'=>150,'Chicken'=>500,'Turkey'=>800,'Meat'=>600,'Pomo'=>400];
            foreach($item['addons'] as $addon){
                if(isset($addon_prices[$addon])){
                    $subtotal += $addon_prices[$addon] * $item['quantity'];
                }
            }
        }

        echo json_encode(['success'=>true, 'quantity'=>$item['quantity'], 'subtotal'=>$subtotal]);
        exit();
    }
}

echo json_encode(['success'=>false]);
exit();
