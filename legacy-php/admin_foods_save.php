<?php
session_start();
require 'db.php';

// Only admin
if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'admin') {
    http_response_code(403);
    echo "Unauthorized";
    exit;
}

$available_addons = ['Plantain', 'Salad', 'Chicken', 'Pomo', 'Turkey'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_food'])) {
    $addons = isset($_POST['addons']) ? implode(',', $_POST['addons']) : '';
    $stmt = $conn->prepare("UPDATE foods SET name=?, price=?, category=?, recommended=?, addons=? WHERE id=?");
    $stmt->execute([$_POST['name'], $_POST['price'], $_POST['category'], $_POST['recommended'], $addons, $_POST['id']]);
    echo "Saved";
    exit;
}
?>
