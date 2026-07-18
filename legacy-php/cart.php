<?php
session_start();

// Initialize cart if not set
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Function to calculate subtotal including addons
function calc_subtotal($item) {
    $subtotal = $item['price'] * $item['quantity'];
    if(isset($item['addons']) && is_array($item['addons'])){
        $addon_prices = ['Plantain'=>200, 'Salad'=>150, 'Chicken'=>500, 'Turkey'=>800, 'Meat'=>600, 'Pomo'=>400];
        foreach($item['addons'] as $addon){
            if(isset($addon_prices[$addon])){
                $subtotal += $addon_prices[$addon] * $item['quantity'];
            }
        }
    }
    return $subtotal;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Your Cart - Come Again Restaurant</title>
<style>
body { font-family: Arial, sans-serif; margin:0; padding:0; background:#fff8e1; }
.container { max-width:800px; margin:50px auto; padding:20px; background:#FF5722; color:#fff; border-radius:10px; }
h2 { text-align:center; margin-bottom:20px; }
table { width:100%; border-collapse:collapse; margin-bottom:20px; background:#fff; color:#333; border-radius:8px; overflow:hidden; }
th, td { padding:12px; text-align:left; border-bottom:1px solid #ddd; }
th { background:#FF9800; color:#fff; }
.total { font-weight:bold; }
.empty { background:#fff; color:#333; padding:20px; text-align:center; border-radius:8px; }
a.button, button.remove-btn, button.qty-btn, button.checkout-btn { display:inline-block; padding:8px 15px; background:#fff; color:#FF5722; text-decoration:none; border-radius:8px; font-weight:bold; margin:2px; cursor:pointer; border:none; }
a.button:hover, button.remove-btn:hover, button.qty-btn:hover, button.checkout-btn:hover { background:#ffe8b3; }
.qty-controls { display:flex; align-items:center; }
.qty-controls input { width:50px; text-align:center; margin:0 5px; padding:5px; border-radius:5px; border:1px solid #ccc; }
#cart-toast { position: fixed; top:20px; right:20px; background:#FF6600; color:#fff; padding:14px 22px; border-radius:8px; font-weight:bold; box-shadow:0 6px 12px rgba(0,0,0,0.3); opacity:0; transform: translateY(-20px); transition:0.4s ease; z-index:9999; }
#cart-toast.show { opacity:1; transform:translateY(0); }
#cart-badge { display:inline-block; background:#FF6600; color:#fff; font-weight:bold; padding:2px 8px; border-radius:50%; font-size:0.9em; vertical-align:super; }
</style>
</head>
<body>

<div class="container">
<h2>Your Cart</h2>

<?php if (empty($_SESSION['cart'])): ?>
    <div class="empty">
        <p>Your cart is empty.</p>
        <a href="order_now.php" class="button">⬅ Continue Ordering</a>
    </div>
<?php else: ?>

<table id="cart-table">
<tr>
    <th>Food</th>
    <th>Add-ons</th>
    <th>Price</th>
    <th>Quantity</th>
    <th>Subtotal</th>
    <th>Action</th>
</tr>

<?php
$total = 0;
foreach ($_SESSION['cart'] as $index => $item):
    $subtotal = calc_subtotal($item);
    $total += $subtotal;
?>
<tr data-index="<?= $index ?>">
    <td><?= htmlspecialchars($item['name']) ?></td>
    <td><?= isset($item['addons']) ? implode(', ', $item['addons']) : '—' ?></td>
    <td>₦<?= number_format($item['price'], 2) ?></td>
    <td>
        <div class="qty-controls">
            <button class="qty-btn" data-action="decrease" data-index="<?= $index ?>">-</button>
            <input type="text" value="<?= (int)$item['quantity'] ?>" readonly>
            <button class="qty-btn" data-action="increase" data-index="<?= $index ?>">+</button>
        </div>
    </td>
    <td class="subtotal">₦<?= number_format($subtotal, 2) ?></td>
    <td>
        <button class="remove-btn" data-index="<?= $index ?>">Remove</button>
    </td>
</tr>
<?php endforeach; ?>

<tr>
    <td colspan="4" class="total">Total</td>
    <td class="total" id="total-price">₦<?= number_format($total, 2) ?></td>
    <td></td>
</tr>
</table>

<!-- Delivery Section -->
<div id="delivery-section" style="margin:20px auto; max-width:800px; background:#fff8e1; padding:20px; border-radius:10px; box-shadow:2px 4px 8px rgba(0,0,0,0.2); color:#FF5722; font-weight:bold; text-align:center;">
    <label for="location" style="display:block; margin-bottom:10px; font-size:1.1em;">Select Your Location:</label>
    <select id="location" name="location" style="padding:8px 12px; border-radius:5px; border:1px solid #FF5722; font-weight:bold; font-size:1em;">
        <option value="agege" data-fee="1000">Agege - ₦1000</option>
        <option value="ajeromi" data-fee="800">Ajeromi-Ifelodun - ₦800</option>
        <option value="alimosho" data-fee="1000">Alimosho - ₦1000</option>
        <!-- add other locations as needed -->
    </select>

    <div style="margin-top:15px; font-size:1.2em;">
        <p>Delivery Fee: ₦<span id="delivery-fee">0</span></p>
        <p>Total (including delivery): ₦<span id="total-with-delivery">0</span></p>
    </div>
</div>

<!-- Checkout Buttons -->
<form id="checkout-form" action="checkout.php" method="POST" style="text-align:center; margin-top:15px;">
    <input type="hidden" name="delivery_fee" id="delivery_fee_input" value="0">
    <button type="submit" name="method" value="COD" class="checkout-btn">Cash on Delivery</button>
</form>

<form id="online-form" action="online_payment.php" method="POST" style="text-align:center; margin-top:10px;">
    <input type="hidden" name="delivery_fee" id="delivery_fee_input_online" value="0">
    <button type="submit" class="checkout-btn">Pay Online</button>
</form>

<div id="cart-toast">✅ Action completed</div>
<?php endif; ?>

</div>

<script>
// Toast helper
function showToast(msg){
    const toast = document.getElementById('cart-toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),2000);
}

// Update total including delivery
function updateTotal(){
    let total = 0;
    document.querySelectorAll('tr[data-index]').forEach(row=>{
        const subtotal = parseFloat(row.querySelector('.subtotal').textContent.replace(/₦|,/g,'')) || 0;
        total += subtotal;
    });

    const select = document.getElementById('location');
    const fee = parseFloat(select.selectedOptions[0].dataset.fee) || 0;

    document.getElementById('delivery-fee').textContent = fee.toLocaleString();
    document.getElementById('total-with-delivery').textContent = (total + fee).toLocaleString();
    document.getElementById('total-price').textContent = '₦' + total.toLocaleString();

    document.getElementById('delivery_fee_input').value = fee;
    document.getElementById('delivery_fee_input_online').value = fee;

    // Show empty message if cart empty
    if(total === 0){
        document.querySelector('.container').innerHTML = `
            <div class="empty">
                <p>Your cart is empty.</p>
                <a href="index.php#order-now" class="button">⬅ Continue Ordering</a>
            </div>
        `;
    }
}

// Remove item
document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        fetch('remove_item.php', {
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:'index='+index
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                const row = document.querySelector('tr[data-index="'+index+'"]');
                if(row) row.remove();
                showToast('✅ Item removed');
                updateTotal();
            }
        });
    });
});

// Update quantity buttons
document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        const action = btn.getAttribute('data-action');

        fetch('update_cart.php', {
            method: 'POST',
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            body: 'index='+index+'&action='+action
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                const row = document.querySelector('tr[data-index="'+index+'"]');
                row.querySelector('input').value = data.quantity;
                row.querySelector('.subtotal').textContent = '₦' + parseFloat(data.subtotal).toLocaleString();
                showToast('✅ Quantity updated');
                updateTotal();
            }
        });
    });
});

// Update total when location changes
document.getElementById('location').addEventListener('change', updateTotal);

// Initial calculation
updateTotal();
</script>


</body>
</html>
