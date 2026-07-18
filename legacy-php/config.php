<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

/* MAMP MySQL connection (PORT IS CRITICAL) */
$conn = new mysqli("localhost", "root", "root", "comeagain", 8889);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
