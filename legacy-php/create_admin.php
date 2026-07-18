<?php
require 'db.php'; // Your database connection

$username = 'admin';
$email = 'admin@example.com'; // You can change this
$password_plain = 'admin123'; // Choose your own strong password
$password_hashed = password_hash($password_plain, PASSWORD_DEFAULT);

$stmt = $conn->prepare("
    INSERT INTO users (username, email, password) 
    VALUES (:username, :email, :password)
");
$stmt->execute([
    'username' => $username,
    'email' => $email,
    'password' => $password_hashed
]);

echo "Admin user created successfully!";
?>
