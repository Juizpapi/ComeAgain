<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require 'db.php';

// Include PHPMailer files
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/SMTP.php';

// Use PHPMailer namespaces AFTER require
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Check for existing username or email
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username OR email = :email");
    $stmt->execute(['username' => $username, 'email' => $email]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingUser) {
        $error = "Username or email already exists. Please choose another.";
    } else {
        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Generate a unique token for email confirmation
        $token = bin2hex(random_bytes(16));

        // Insert new user with token and is_confirmed = 0
        $stmt = $conn->prepare("INSERT INTO users (username, email, password, token, is_confirmed) VALUES (:username, :email, :password, :token, 0)");
        $stmt->execute([
            'username' => $username,
            'email' => $email,
            'password' => $hashedPassword,
            'token' => $token
        ]);

        // Send confirmation email using PHPMailer
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'miknelandex@gmail.com'; // Replace with your Gmail
            $mail->Password = 'duoy gyuw nogy wvai';        // Replace with Gmail App Password
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            // Recipients
            $mail->setFrom('miknelandex@gmail.com', 'Come Again Restaurant'); // Replace email
            $mail->addAddress($email, $username);

            // Content
            $mail->isHTML(true);
            $mail->Subject = 'Confirm Your Account - Come Again Restaurant';

            // Confirm link (fixed for your localhost port)
            $confirmLink = "http://localhost:8888/comeagain/confirm.php?email=" . urlencode($email) . "&token=" . $token;

            $mail->Body = "Hi $username,<br><br>Thank you for registering!<br>Please click the link below to confirm your account:<br><br>
                           <a href='$confirmLink'>$confirmLink</a><br><br>If you did not register, please ignore this email.";

            $mail->send();
            $success = "Registration successful! Please check your email to confirm your account.";
        } catch (Exception $e) {
            $error = "Registration successful, but failed to send confirmation email. Mailer Error: {$mail->ErrorInfo}";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Register - Come Again Restaurant</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 0; background:#F1FAEE; color:#FF5722; }
header { background:#FF5722; color:#fff; text-align:center; padding:30px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.3); }
section { max-width:400px; margin:50px auto; padding:30px; background:#fff8e1; border-radius:10px; box-shadow:2px 4px 6px rgba(0,0,0,0.3); }
h2 { text-align:center; margin-bottom:20px; }
input[type=text], input[type=email], input[type=password] { 
    width:100%; padding:10px; margin:10px 0; border-radius:5px; border:1px solid #FF5722; 
}
button { 
    width:100%; padding:12px; background:#FF5722; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;
    transition:0.2s; 
}
button:hover { background:#e64a19; }
.error { color:red; text-align:center; margin-bottom:10px; }
.success { color:green; text-align:center; margin-bottom:10px; }
a { display:block; text-align:center; margin-top:15px; color:#FF5722; text-decoration:none; }
a:hover { text-decoration:underline; }
</style>
</head>
<body>

<header>
<h1>COME AGAIN RESTAURANT</h1>
<p>Register to order your favorite dishes!</p>
</header>

<section>
<h2>Create Account</h2>

<?php 
if($error) echo "<p class='error'>$error</p>"; 
if($success) echo "<p class='success'>$success</p>";
?>

<form method="POST">
    <input type="text" name="username" placeholder="Username" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Register</button>
</form>

<a href="login.php">Already have an account? Login</a>
</section>

</body>
</html>
