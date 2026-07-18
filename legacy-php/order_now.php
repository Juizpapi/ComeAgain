<?php
session_start();
require 'db.php'; // Database connection

// Redirect if not logged in
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

// Fetch foods from DB
$stmt = $conn->prepare("SELECT * FROM foods ORDER BY category, name");
$stmt->execute();
$foods = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Group foods by category
$grouped = [];
foreach($foods as $food){
    $grouped[$food['category']][] = $food;
}

// Calculate cart count
$cart_count = 0;
if(isset($_SESSION['cart'])){
    foreach($_SESSION['cart'] as $item){
        $cart_count += $item['quantity'];
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Now - Come Again Restaurant</title>
<style>
body { font-family: Arial, sans-serif; margin:0; padding:0; }
header { background:#F1FAEE; color:#FF5722; text-align:center; padding:30px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.3);}
section { padding:40px 20px; margin:20px 10px; border-radius:10px; }
.orange-bg { background:#FF5722; color:#F1FAEE; }
.flex-container { display:flex; flex-wrap:wrap; gap:20px; }
.food-card { background:#fff8e1; color:#FF6600; padding:15px; border-radius:8px; box-shadow:2px 4px 6px rgba(0,0,0,0.3); flex:1; min-width:200px; position:relative; }
.order-btn { background:#fff8e1; color:#FF6600; padding:12px 25px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:10px; box-shadow:2px 4px 6px rgba(0,0,0,0.3); transition:0.2s;}
.order-btn:hover { background:#ffe8b3; transform:translateY(-2px); }
.addon { display:block; margin:5px 0; }
#cart-badge { display:inline-block; background:#FF6600; color:#fff; font-weight:bold; padding:2px 8px; border-radius:50%; font-size:0.9em; vertical-align:super; transition:0.3s; }
.cart-animate { animation: bounceCart 0.4s ease; }
@keyframes bounceCart { 0% {transform:scale(1);} 30%{transform:scale(1.4);} 60%{transform:scale(0.9);} 100%{transform:scale(1);} }
#cart-toast { position: fixed; top:20px; right:20px; background:#FF6600; color:#fff; padding:14px 22px; border-radius:8px; font-weight:bold; box-shadow:0 6px 12px rgba(0,0,0,0.3); opacity:0; transform:translateY(-20px); transition:0.4s ease; z-index:9999;}
#cart-toast.show { opacity:1; transform:translateY(0); }
footer { background:#F1FAEE; color:#FF5722; text-align:center; padding:20px; font-weight:bold; box-shadow:0 -4px 6px rgba(0,0,0,0.2); margin-top:30px;}
@media(max-width:768px){ .flex-container{flex-direction:column;} }
</style>
</head>
<body>

<header>
<h1>COME AGAIN RESTAURANT</h1>
<p>Our food is sensational... <strong>COME~AGAIN</strong> soon!</p>
<?php if(isset($_SESSION['user'])): ?>
<div style="margin-top:10px;">
👋 Welcome, <?php echo $_SESSION['user']; ?> &nbsp;|&nbsp;
🛒 <a href="cart.php" style="color:#FF5722; text-decoration:none;">Cart <span id="cart-badge"><?php echo $cart_count; ?></span></a> &nbsp;|&nbsp;
<a href="index.php" style="color:#FF5722; text-decoration:none;">Home</a>
<?php if($_SESSION['user']==='admin'): ?>
&nbsp;|&nbsp;<a href="admin_orders.php" style="background:#fff8e1; color:#FF6600; padding:8px 15px; border-radius:5px; text-decoration:none;">Admin Orders</a>
&nbsp;|&nbsp;<a href="admin_foods.php" style="background:#fff8e1; color:#FF6600; padding:8px 15px; border-radius:5px; text-decoration:none;">Admin Foods</a>
<?php endif; ?>
&nbsp;|&nbsp;<a href="logout.php" style="color:#FF5722; text-decoration:none;">Logout</a>
</div>
<?php endif; ?>
</header>

<section class="orange-bg">
<div style="text-align:center; margin-bottom:20px;">
    <input type="text" id="food-search" placeholder="Search for food..." 
           style="padding:10px; width:80%; max-width:400px; border-radius:8px; border:1px solid #ccc; font-size:1em;">
</div>



<h2 style="text-align:center;">Order Now</h2>

<?php foreach($grouped as $category => $items): ?>
<h3 style="margin-top:20px;"><?php echo $category; ?></h3>
<div class="flex-container">
<?php foreach($items as $food): ?>
<div class="food-card">
<h4><?php echo $food['name']; ?> - ₦<?php echo $food['price']; ?></h4>
<?php if(!empty($food['recommended'])): ?>
<p><strong>Recommended:</strong> <?php echo $food['recommended']; ?></p>
<?php endif; ?>

<form class="add-to-cart-form">
<input type="hidden" name="id" value="<?php echo $food['id']; ?>">
<input type="hidden" name="name" value="<?php echo $food['name']; ?>">
<input type="hidden" name="price" value="<?php echo $food['price']; ?>">
<label>Qty:</label>
<input type="number" name="quantity" value="1" min="1" style="width:60px; padding:5px;">

<?php if(in_array($category,['Rice','Swallow'])): ?>
<div><strong>Add-ons:</strong>
<?php 
$addons = ['Plantain'=>200, 'Salad'=>150, 'Chicken'=>500, 'Turkey'=>800, 'Meat'=>600, 'Pomo'=>400];
foreach($addons as $name=>$price): ?>
<label class="addon"><input type="checkbox" name="addons[]" value="<?php echo $name; ?>"> <?php echo $name; ?> (₦<?php echo $price; ?>)</label>
<?php endforeach; ?>
</div>
<?php endif; ?>

<button type="submit" class="order-btn">Add to Cart</button>
</form>
</div>
<?php endforeach; ?>
</div>
<?php endforeach; ?>
</section>

<footer>
© 2025 Come Again Restaurant
</footer>

<!-- Toast -->
<div id="cart-toast">✅ Added to cart</div>

<script>
// Live Add to Cart
document.querySelectorAll('.add-to-cart-form').forEach(form => {
    form.addEventListener('submit', function(e){
        e.preventDefault();
        const formData = new FormData(form);

        fetch('add-to-cart.php', {
            method:'POST',
            body: formData
        })
        .then(res=>res.text())
        .then(()=>{

            // Update cart count
            fetch('cart_count.php')
            .then(res=>res.text())
            .then(count=>{
                const badge = document.getElementById('cart-badge');
                badge.textContent = count;
                badge.classList.remove('cart-animate');
                void badge.offsetWidth;
                badge.classList.add('cart-animate');
            });

            // Show toast
            const toast = document.getElementById('cart-toast');
            toast.classList.add('show');
            setTimeout(()=> toast.classList.remove('show'),2000);
        });
    });
});

// Live food search
document.getElementById('food-search').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    document.querySelectorAll('.food-card').forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        if(name.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });

    // Also hide category headers if no food items are visible under them
    document.querySelectorAll('.flex-container').forEach(container => {
        const visibleItems = Array.from(container.children).some(card => card.style.display !== 'none');
        container.previousElementSibling.style.display = visibleItems ? '' : 'none';
        container.style.display = visibleItems ? 'flex' : 'none';
    });
});

</script>

</body>
</html>
