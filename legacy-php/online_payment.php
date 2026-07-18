<?php
session_start();

// User must have cart
if(!isset($_SESSION['cart']) || count($_SESSION['cart']) == 0){
    header('Location: index.php');
    exit();
}

// Get delivery fee from POST (default 0)
$delivery_fee = isset($_POST['delivery_fee']) ? floatval($_POST['delivery_fee']) : 0;

// Calculate total including delivery
$total = 0;
foreach($_SESSION['cart'] as $item){
    $subtotal = $item['price'] * $item['quantity'];

    // Include addons if present
    if(isset($item['addons']) && is_array($item['addons'])){
        $addon_prices = ['Plantain'=>200, 'Salad'=>150, 'Chicken'=>500, 'Turkey'=>800, 'Meat'=>600, 'Pomo'=>400];
        foreach($item['addons'] as $addon){
            if(isset($addon_prices[$addon])){
                $subtotal += $addon_prices[$addon] * $item['quantity'];
            }
        }
    }

    $total += $subtotal;
}

// Add delivery fee
$total += $delivery_fee;

// Convert to kobo
$amount_kobo = $total * 100;

// Your Paystack public key
$paystack_public_key = "pk_test_e7f6c164904ad0f37812c917cb5dadd67106d387";
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Online Payment - Come Again Restaurant</title>
<style>
body { font-family: Arial, sans-serif; margin:0; padding:0; background:#fff8e1; }
.container { max-width:600px; margin:50px auto; padding:20px; background:#FF5722; color:#fff; border-radius:10px; text-align:center; }
.pay-btn { background:#fff; color:#FF5722; padding:12px 25px; text-decoration:none; font-weight:bold; border-radius:8px; display:block; margin:20px auto; width:80%; cursor:pointer; }
.pay-btn:hover { background:#ffe8b3; }
</style>
</head>
<body>

<div class="container">
<h1>Online Payment</h1>
<p>Total Amount (including delivery): ₦<?php echo number_format($total); ?></p>
<p>Click the button below to proceed with payment:</p>

<form method="post" action="online_payment.php">
    <input type="hidden" name="delivery_fee" value="<?php echo $delivery_fee; ?>">
</form>

<button id="payBtn" class="pay-btn">Pay Now</button>

<!-- Back button -->
<a href="cart.php" style="color:#fff; text-decoration:underline; display:block; margin-top:20px;">
    ⬅ Back to Cart
</a>

<script src="https://js.paystack.co/v1/inline.js"></script>
<script>
document.getElementById('payBtn').onclick = function () {

    var handler = PaystackPop.setup({
        key: "<?php echo $paystack_public_key; ?>",
        email: "<?php echo $_SESSION['email'] ?? 'customer@example.com'; ?>",
        amount: <?php echo $amount_kobo; ?>,
        currency: "NGN",

        callback: function(response){
            window.location = "verify_payment.php?reference=" + response.reference + "&delivery_fee=<?php echo $delivery_fee; ?>";
        },

        onClose: function(){
            alert("Payment Window Closed");
        }
    });

    handler.openIframe();
};
</script>

</body>
</html>
