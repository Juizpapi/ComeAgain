<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require 'db.php';

$message = '';

if(isset($_GET['email'], $_GET['token'])){
    $email = trim($_GET['email']);
    $token = trim($_GET['token']);

    // Find user with matching email and token, not yet confirmed
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email AND token = :token AND is_confirmed = 0");
    $stmt->execute(['email' => $email, 'token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if($user){
        // Confirm user
        $stmt = $conn->prepare("UPDATE users SET is_confirmed = 1, token = NULL WHERE id = :id");
        $stmt->execute(['id' => $user['id']]);
        $message = "Your account has been successfully confirmed! You can now login.";
        // Optional: auto redirect after 5 seconds
        header("refresh:5;url=login.php");
    } else {
        $message = "Invalid or expired confirmation link.";
    }
} else {
    $message = "Invalid confirmation request.";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm Account - Come Again Restaurant</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 0; background:#F1FAEE; color:#FF5722; }
header { background:#FF5722; color:#fff; text-align:center; padding:30px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.3); }
section { max-width:400px; margin:50px auto; padding:30px; background:#fff8e1; border-radius:10px; box-shadow:2px 4px 6px rgba(0,0,0,0.3); text-align:center; }
h2 { text-align:center; margin-bottom:20px; }
p { font-size:1em; }
.success { color:green; font-weight:bold; margin-bottom:10px; }
.error { color:red; font-weight:bold; margin-bottom:10px; }
a { display:block; text-align:center; margin-top:15px; color:#FF5722; text-decoration:none; font-weight:bold; }
a:hover { text-decoration:underline; }
</style>
</head>
<body>

<header>
<h1>COME AGAIN RESTAURANT</h1>
<p>Account Confirmation</p>
</header>

<section>
<h2>Confirmation Status</h2>
<?php 
// Display message safely
if($message === "Your account has been successfully confirmed! You can now login."){
    echo "<p class='success'>" . htmlspecialchars($message) . "</p>";
} else {
    echo "<p class='error'>" . htmlspecialchars($message) . "</p>";
}
?>
<a href="login.php">Go to Login</a>
</section>

</body>
</html>
