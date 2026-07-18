<?php
session_start();
require 'db.php';

// Only allow admin access
if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'admin') {
    header('Location: index.php');
    exit;
}

// Fetch orders (filtered by status if set via GET)
$status_filter = isset($_GET['status']) ? $_GET['status'] : 'all';
$sql = "
    SELECT o.id, o.user_id, u.username, o.total_amount, o.status, o.items, o.payment_method, o.created_at
    FROM orders o
    JOIN users u ON o.user_id = u.id
";
if(in_array($status_filter, ['pending','completed','cancelled'])){
    $sql .= " WHERE o.status = :status";
}
$sql .= " ORDER BY o.created_at DESC";

$stmt = $conn->prepare($sql);
if(isset($status_filter) && $status_filter !== 'all' && in_array($status_filter, ['pending','completed','cancelled'])){
    $stmt->execute(['status'=>$status_filter]);
}else{
    $stmt->execute();
}
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Orders</title>
<style>
body { font-family: Arial, sans-serif; background:#F1FAEE; margin:0; padding:0; }
header { background:#FF5722; color:#fff; padding:25px; text-align:center; font-size:1.5em; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.3);}
.container { max-width:1000px; margin:30px auto; padding:0 20px; }
.filter { margin-bottom:20px; }
.filter label { font-weight:bold; margin-right:10px; }
.filter select { padding:6px 10px; border-radius:5px; border:1px solid #ccc; }
.order-card { background:#fff; border-radius:10px; padding:20px; margin-bottom:20px; box-shadow: 2px 4px 8px rgba(0,0,0,0.2); }
.order-card h3 { margin-top:0; color:#FF5722; }
.order-details { display:flex; flex-wrap:wrap; justify-content:space-between; margin-top:10px; }
.order-details div { width:48%; margin-bottom:10px; }
.items-list { background:#fff3e0; padding:10px; border-radius:8px; }
.status { font-weight:bold; padding:4px 10px; border-radius:5px; display:inline-block; }
.status-pending { background:#FFCC80; color:#FF5722; }
.status-completed { background:#C8E6C9; color:green; }
.status-cancelled { background:#FFCDD2; color:red; }
.status-btn { padding:5px 12px; margin-top:5px; border:none; border-radius:5px; cursor:pointer; font-weight:bold; }
.status-btn.complete { background:#4CAF50; color:#fff; }
.status-btn.cancel { background:#F44336; color:#fff; }
.status-btn:hover { opacity:0.85; }
@media(max-width:700px){ .order-details div { width:100%; } }
.toast { 
    position: fixed; 
    top: 20px; 
    right: 20px; 
    background: #ffffff;          /* white background */
    color: #000000;               /* black text */
    padding: 12px 20px; 
    border-radius: 8px; 
    font-weight: bold; 
    box-shadow: 0 4px 8px rgba(0,0,0,0.3); /* subtle shadow for visibility */
    border: 1px solid #ccc;       /* thin border to stand out */
    opacity: 0; 
    transform: translateY(-20px); 
    transition: 0.4s ease; 
    z-index: 9999; 
}
.toast.show {
    opacity: 1; 
    transform: translateY(0); 
}

.toast.show { opacity:1; transform:translateY(0); }

/* Order card left border colors by status */
.order-card[data-status="pending"] { border-left: 6px solid #FF5722; }
.order-card[data-status="completed"] { border-left: 6px solid green; }
.order-card[data-status="cancelled"] { border-left: 6px solid red; }

/* ===== WEBSITE ROW DESIGN (ADMIN ORDERS) ===== */

/* ORANGE ROW (like homepage cards) */
.row-orange {
    background: #FF5722;
    color: #fff;
}

.row-orange h3 {
    color: #fff;
}

.row-orange .items-list {
    background: rgba(255,255,255,0.15);
    color: #fff;
}

.row-orange strong {
    color: #fff;
}

.row-orange .status {
    color: #333;
}

/* WHITE ROW */
.row-white {
    background: #ffffff;
    color: #333;
}

/* Keep shadows consistent */
.row-orange,
.row-white {
    border-radius: 10px;
    padding: 20px;
}

/* Preserve status left borders */
.row-orange[data-status="pending"] { border-left: 6px solid #fff; }
.row-orange[data-status="completed"] { border-left: 6px solid #C8E6C9; }
.row-orange[data-status="cancelled"] { border-left: 6px solid #FFCDD2; }

/* FIX: allow clicking inside order cards */
.order-card {
    position: relative;
    z-index: 1;
}

.order-details,
.items-list,
.status-btn {
    position: relative;
    z-index: 2;
    pointer-events: auto;
}
/* FIX BUTTON CLICKABILITY */
.status-btn {
    cursor: pointer;
    pointer-events: auto;
    position: relative;
    z-index: 5; /* above any overlapping elements */
}


</style>
</head>
<body>
<header>Admin: All Orders</header>
<div class="container">

<!-- Filter Dropdown -->
<div class="filter">
<label for="statusFilter">Filter by status:</label>
<select id="statusFilter">
    <option value="all" <?= $status_filter==='all' ? 'selected' : '' ?>>All</option>
    <option value="pending" <?= $status_filter==='pending' ? 'selected' : '' ?>>Pending</option>
    <option value="completed" <?= $status_filter==='completed' ? 'selected' : '' ?>>Completed</option>
    <option value="cancelled" <?= $status_filter==='cancelled' ? 'selected' : '' ?>>Cancelled</option>
</select>
</div>

<div id="orders-container">
<?php $row = 1; foreach($orders as $order): ?>

<div class="order-card 
    <?= ($row % 2 === 1) ? 'row-orange' : 'row-white' ?>"
    data-order-id="<?= $order['id'] ?>"
    data-status="<?= strtolower($order['status']) ?>">

    <div class="order-details">
        <!-- Left column: Items -->
        <div>
            <strong>Items:</strong>
            <div class="items-list">
                <?php
                $items = json_decode($order['items'], true);
                if($items) {
                    foreach($items as $item) {
                        echo htmlspecialchars($item['name']) . " x " . $item['quantity'] . "<br>";
                    }
                }
                ?>
            </div>
        </div>

        <!-- Right column: Customer + Total + Payment + Status -->
        <div>
            <strong>Customer:</strong> <?= htmlspecialchars($order['username']); ?><br>
            <strong>Total:</strong> ₦<?= number_format($order['total_amount'], 2) ?><br>
            <strong>Payment:</strong> <?= htmlspecialchars($order['payment_method']) ?><br>
            <strong>Status:</strong>
            <span class="status status-<?= strtolower($order['status']) ?>"><?= ucfirst($order['status']) ?></span><br>

            <!-- Status Update Buttons -->
            <?php if(strtolower(trim($order['status'])) === 'pending'): ?>
              <button class="status-btn complete">Mark Completed</button>
              <button class="status-btn cancel">Cancel Order</button>
            <?php endif; ?>
  

            <br><strong>Date:</strong> <?= $order['created_at'] ?>
        </div>
    </div>
</div>
<?php $row++; ?>

<?php endforeach; ?>
</div>


<!-- Toast notification -->
<div class="toast" id="toast-msg"></div>


<script>
// Delegated click listener for status buttons
document.addEventListener('click', function(e) {
    if (!e.target.classList.contains('status-btn')) return;

    const btn = e.target;
    const card = btn.closest('.order-card');
    const orderId = card.getAttribute('data-order-id');
    const newStatus = btn.classList.contains('complete') ? 'completed' : 'cancelled';

    fetch('update_order_status.php', {
        method: 'POST',
        headers: { 'Content-Type':'application/x-www-form-urlencoded' },
        body: 'order_id=' + orderId + '&status=' + newStatus
    })
    .then(res => res.text())
    .then(msg => {
        // Update status visually
        const statusSpan = card.querySelector('.status');
        statusSpan.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        statusSpan.className = 'status status-' + newStatus;

        // Update left border color
        card.setAttribute('data-status', newStatus);

        // Remove buttons once action is taken
        card.querySelectorAll('.status-btn').forEach(b => b.remove());

        // Show toast notification
        const toast = document.getElementById('toast-msg');
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    })
    .catch(err => console.error(err));
});

// Filter dropdown listener
document.getElementById('statusFilter').addEventListener('change', function() {
    const status = this.value;

    fetch('admin_orders.php?status=' + status, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(res => res.text())
    .then(html => {
        // Replace orders container with new filtered HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newOrders = doc.getElementById('orders-container').innerHTML;
        document.getElementById('orders-container').innerHTML = newOrders;
        // No need to reattach listeners because we use delegated listener
    })
    .catch(err => console.error(err));
});
</script>


</body>
</html>
