<?php
session_start();
require 'db.php'; // <-- Add this line so $conn exists

$pending_orders_count = 0;
if (isset($_SESSION['user']) && $_SESSION['user'] === 'admin') {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM orders WHERE status='pending'");
    $stmt->execute();
    $pending_orders_count = $stmt->fetchColumn();
}


// Redirect to login if user is not logged in
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

// Calculate initial cart count
$cart_count = 0;
if (isset($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $item) {
        $cart_count += $item['quantity'];
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>COME AGAIN RESTAURANT</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
header { background-color: #F1FAEE; color: #FF5722; text-align: center; padding: 30px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.3);} 
section { padding: 40px 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: 20px 10px; border-radius: 10px; }
.orange-bg { background-color: #FF5722; color: #F1FAEE; }
.white-bg { background-color: #F1FAEE; color: #FF5722; }
ul { list-style-type:none; padding-left:0; }
li { margin:10px 0; font-size:1.1em; padding:8px; border-radius:5px; transition:0.3s; }
.order-btn { background:#fff8e1; color:#FF6600; padding:12px 25px; border:none; border-radius:8px; display:inline-block; margin-top:10px; font-weight:bold; box-shadow:2px 4px 6px rgba(0,0,0,0.3); transition:0.2s;} 
.order-btn:hover { background:#ffe8b3; transform:translateY(-2px); }
.slideshow-container { position:relative; max-width:80%; margin:20px auto; border-radius:10px; overflow:hidden; }
.mySlides { display:none; }
.mySlides img { width:100%; border-radius:10px; }
.prev, .next { cursor:pointer; position:absolute; top:50%; padding:16px; margin-top:-22px; color:#F1FAEE; font-weight:bold; font-size:24px; background:rgba(0,0,0,0.3); border-radius:3px; }
.next { right:0; }
footer { background:#F1FAEE; color:#FF5722; text-align:center; padding:20px; font-weight:bold; box-shadow:0 -4px 6px rgba(0,0,0,0.2); }
.container { max-width:800px; margin:50px auto; padding:20px; background:#FF5722; color:#fff; border-radius:10px; }
table { width:100%; border-collapse:collapse; margin-bottom:20px; }
th, td { padding:12px; text-align:center; border-bottom:1px solid #fff; }
.checkout-btn { background:#fff; color:#FF5722; padding:12px 25px; text-decoration:none; font-weight:bold; border-radius:8px; }
.checkout-btn:hover { background:#ffe8b3; }
.remove-btn { background:#FF6600; color:#fff; padding:5px 10px; border:none; border-radius:5px; cursor:pointer; }
.remove-btn:hover { background:#e65c00; }

/* Live cart badge */
#cart-badge {
    display:inline-block;
    background:#FF6600;
    color:#fff;
    font-weight:bold;
    padding:2px 8px;
    border-radius:50%;
    margin-left:5px;
    font-size:0.9em;
    vertical-align:super;
    transition:0.3s;
}

/* Cart bounce animation */
@keyframes cartBounce {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.4); }
    60%  { transform: scale(0.9); }
    100% { transform: scale(1); }
}

/* Glow effect */
.cart-animate {
    animation: cartBounce 0.4s ease;
    box-shadow: 0 0 10px rgba(255, 102, 0, 0.9);
}

/* Toast popup */
#cart-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #FF6600;
    color: #fff;
    padding: 14px 22px;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
    opacity: 0;
    transform: translateY(-20px);
    transition: 0.4s ease;
    z-index: 9999;
}

#cart-toast.show {
    opacity: 1;
    transform: translateY(0);
}

/* Floating +1 animation */
.floating-plus {
    position: absolute;
    color: #FF6600;
    font-weight: bold;
    font-size: 18px;
    animation: floatUp 1s ease forwards;
    pointer-events: none;
}

@keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-40px); }
}

/* Flex layout for Contact + Social section */
.flex-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap; /* optional for mobile */
}

.contact, .social {
    width: 48%;
}

.social {
    text-align: right; /* keeps 'Follow Us' on the right side */
}

.fade {
    animation: fadeEffect 1s;
}

@keyframes fadeEffect {
    from { opacity: 0.4; }
    to { opacity: 1; }
}

.mySlides:first-child {
    display: block;
}

</style>
</head>
<body>
   
<header>
<h1>COME AGAIN RESTAURANT</h1>
<p>Our food is sensational... <strong>COME~AGAIN</strong> soon!</p>
</header>

<?php
if (isset($_SESSION['user'])) {
    echo "
    <div style='
        text-align:center;
        margin:12px auto;
        padding:10px;
        background:#F1FAEE;
        color:#FF5722;
        font-weight:bold;
        box-shadow:0 2px 4px rgba(0,0,0,0.2);
    '>
        👋 Welcome, {$_SESSION['user']} &nbsp;|&nbsp;
        📦 <a href='order_history.php' style='color:#FF5722; text-decoration:none;'>My Orders</a> &nbsp;|&nbsp;
        🛒 <a href='cart.php' style='color:#FF5722; text-decoration:none;'>Cart <span id='cart-badge'>{$cart_count}</span></a>";

    // ✅ Admin button with icon and style
    if ($_SESSION['user'] === 'admin') {
    echo " &nbsp;|&nbsp; 
    <a href='admin_orders.php' style='
        background:#fff8e1; 
        color:#FF6600; 
        padding:12px 25px; 
        border:none; 
        border-radius:8px; 
        display:inline-block; 
        font-weight:bold; 
        box-shadow:2px 4px 6px rgba(0,0,0,0.3); 
        text-decoration:none; 
        position:relative; 
        transition:0.2s;
    ' onmouseover=\"this.style.background='#ffe8b3'\" onmouseout=\"this.style.background='#fff8e1'\">
        🛠 Admin Panel
        <span id='admin-badge' style='
            position:absolute;
            top:-6px;
            right:-6px;
            background:#FF6600;
            color:#fff;
            font-size:0.9em;
            font-weight:bold;
            padding:2px 6px;
            border-radius:50%;
            display:none;
        '>0</span>
    </a>";

    echo " &nbsp;|&nbsp; 
    <a href='admin_foods.php' style='
           background:#fff8e1; 
           color:#FF6600; 
           padding:12px 25px; 
           border:none; 
           border-radius:8px; 
           display:inline-block; 
           font-weight:bold; 
           box-shadow:2px 4px 6px rgba(0,0,0,0.3); 
           text-decoration:none; 
           transition:0.2s;
'   onmouseover=\"this.style.background='#ffe8b3'\" onmouseout=\"this.style.background='#fff8e1'\">
    🍽 Manage Foods
</a>";

}
 echo " &nbsp;|&nbsp;
        🚪 <a href='logout.php' style='color:#FF5722; text-decoration:none;'>Logout</a>
    </div>
    ";
}

    

 else {
    echo "
    <div style='
        text-align:center;
        margin:12px auto;
        padding:10px;
        background:#F1FAEE;
        color:#FF5722;
        font-weight:bold;
        box-shadow:0 2px 4px rgba(0,0,0,0.2);
    '>
        🔐 <a href='login.php' style='color:#FF5722; text-decoration:none;'>Login</a> &nbsp;|&nbsp;
        ✍️ <a href='register.php' style='color:#FF5722; text-decoration:none;'>Register</a>
    </div>
    ";
}
?>

<section class="orange-bg">
<h3 style="text-align:center;">Delicious dishes await you!</h3>
<div class="slideshow-container">
<div class="mySlides fade"><img src="african dish.png" alt="nigerian dish"></div>
<div class="mySlides fade"><img src="spaghetti.png" alt="spaghetti"></div>
<div class="mySlides fade"><img src="fried rice and chicken.png" alt="fried rice"></div>
<div class="mySlides fade"><img src="jollof rice and meat.png" alt="jollof rice"></div>
<div class="mySlides fade"><img src="egusi.png" alt="egusi soup"></div>
<a class="prev" onclick="plusSlides(-1)">&#10094;</a>
<a class="next" onclick="plusSlides(1)">&#10095;</a>
</div>
</section>

<section class="white-bg">
<h2 style="text-align:center;"> Some of the food we have:</h2>
<p style="text-align:center;">Rice, Spaghetti, Native soups, Pepper soup</p>
</section>

<section class="orange-bg">
  <div style="display:flex; justify-content:space-between; width:100%;">

    <!-- LEFT SIDE: MENU -->
    <div style="width:48%;">
      <h2>MENU</h2>
      <ul>
        <li>RICE: Jollof, Fried, Coconut, White</li>
        <li>SPAGHETTI: Jollof, White, Fried</li>
        <li>SOUP: Egusi, Vegetables, Ewedu, Afang</li>
        <li>SWALLOW: Eba, Fufu, Semo, Wheat</li>
        <li>PEPPER SOUP: Cow meat, Goat meat, Fish, Bush meat, Pomo</li>
      </ul>
    </div>

    <!-- RIGHT SIDE: ORDER -->
    <div style="width:48%;">
      <h2>ORDER</h2>

      <h3>RICE</h3>
      <p>Jollof / Fried / White rice with chicken, vegetables and plantain.</p>
      <a href="order_now.php" class="order-btn">Order Now</a>

      <h3>SWALLOW</h3>
      <p>Semo / Eba / Fufu served with rich egusi soup and assorted meats.</p>
      <a href="order_now.php" class="order-btn">Order Now</a>
    </div>

  </div>
</section>

<section class="white-bg">
<div class="flex-container">
<div class="contact">
<h2>Contact Us</h2>
<p>Email: <a href="mailto:Comeagainfoods@gmail.com">comeagainfoods@gmail.com</a></p>
<p>Phone: <a href="tel:+2341234567890">+2341234567890</a></p>
<p>Address: 343 Arabambi Close, Lagos, Nigeria</p>
</div>
<div class="social">
<h2>Follow Us</h2>
<p>This content stays on the right.</p>
<a href="https://facebook.com">Facebook</a> |
<a href="https://instagram.com">Instagram</a> |
<a href="https://twitter.com">Twitter</a>
</div>
</div>
</section>

<footer>© 2025 Come Again Restaurant</footer>

<script>
document.addEventListener('DOMContentLoaded', function () {

    let slideIndex = 0;
    let slides = document.getElementsByClassName("mySlides");

    if (slides.length === 0) return; // safety check

    showSlides();

    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }

        slides[slideIndex - 1].style.display = "block";
        setTimeout(showSlides, 5000);
    }

    window.plusSlides = function (n) {
        slideIndex += n;
        if (slideIndex > slides.length) slideIndex = 1;
        if (slideIndex < 1) slideIndex = slides.length;

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slides[slideIndex - 1].style.display = "block";
    };

});
</script>

<script>
// ✅ Live Cart Update + Toast + +1 animation
document.querySelectorAll('.add-to-cart-form').forEach(form => {
    form.addEventListener('submit', function(e){
        e.preventDefault();

        const formData = new FormData(form);
        const button = form.querySelector('.order-btn');

        fetch('add-to-cart.php', {
            method: 'POST',
            body: formData
        })
        .then(() => {

            // 🔄 Update cart count
            fetch('cart_count.php')
            .then(res => res.text())
            .then(count => {
                const badge = document.getElementById('cart-badge');
                badge.textContent = count;

                // 🛒 Cart bounce animation
                badge.classList.remove('cart-animate');
                void badge.offsetWidth;
                badge.classList.add('cart-animate');
            });

            // 🛎️ SHOW TOAST
            const toast = document.getElementById('cart-toast');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);

            // ➕ Floating +1 animation
            const plus = document.createElement('div');
            plus.textContent = '+1';
            plus.className = 'floating-plus';

            const rect = button.getBoundingClientRect();
            plus.style.left = rect.left + rect.width / 2 + 'px';
            plus.style.top = rect.top + window.scrollY + 'px';

            document.body.appendChild(plus);
            setTimeout(() => plus.remove(), 1000);
        })
        .catch(err => console.error(err));
    });

</script>

<script>
    document.addEventListener('DOMContentLoaded', function () {

    function updateAdminBadge() {
        fetch('admin_pending_count.php')
            .then(res => res.text())
            .then(count => {
                const badge = document.getElementById('admin-badge');
                if (!badge) return;

                count = parseInt(count);
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            })
            .catch(err => console.error(err));
    }

    updateAdminBadge();
    setInterval(updateAdminBadge, 5000);

});
</script>


<!-- Added to cart popup -->
<div id="cart-toast">✅ Added to cart</div>


</body>
</html>
