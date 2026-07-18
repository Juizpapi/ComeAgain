<?php
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, trim($user['password']))) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user'] = $user['username'];
        header('Location: index.php');
        exit;
    } else {
        $error = "Invalid username or password.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login – Come Again Restaurant</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #FF5722, #FF8C42);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-container {
    background: #F1FAEE;
    padding: 40px;
    width: 100%;
    max-width: 420px;
    border-radius: 12px;
    box-shadow: 0 8px 18px rgba(0,0,0,0.3);
    text-align: center;
}

.login-container h1 {
    color: #FF5722;
    margin-bottom: 10px;
}

.login-container p {
    color: #555;
    margin-bottom: 30px;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 14px;
    margin-bottom: 18px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
}

input:focus {
    outline: none;
    border-color: #FF5722;
    box-shadow: 0 0 5px rgba(255,87,34,0.4);
}

button {
    width: 100%;
    padding: 14px;
    background: #FF5722;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

button:hover {
    background: #e64a19;
    transform: translateY(-2px);
}

.error {
    background: #ffe6e6;
    color: #b30000;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
    font-weight: bold;
}

.links {
    margin-top: 20px;
}

.links a {
    color: #FF5722;
    font-weight: bold;
    text-decoration: none;
}

.links a:hover {
    text-decoration: underline;
}

.brand {
    font-size: 14px;
    color: #999;
    margin-top: 25px;
}
</style>
</head>

<body>

<div class="login-container">
    <h1>COME AGAIN</h1>
    <p>Please log in to continue</p>

    <?php if($error): ?>
        <div class="error"><?php echo $error; ?></div>
    <?php endif; ?>

    <form method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>

    <div class="links">
        <p>Don't have an account?
            <a href="register.php">Register</a>
        </p>
    </div>

    <div class="brand">
        © <?php echo date('Y'); ?> Come Again Restaurant
    </div>
</div>

</body>
</html>
