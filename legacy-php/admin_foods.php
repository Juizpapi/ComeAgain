<?php
session_start();
require 'db.php';

// Only admin
if (!isset($_SESSION['user']) || $_SESSION['user'] !== 'admin') {
    header('Location: login.php');
    exit;
}

// Handle Add/Edit/Delete
$available_addons = ['Plantain', 'Salad', 'Chicken', 'Pomo', 'Turkey'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $addons = isset($_POST['addons']) ? implode(',', $_POST['addons']) : '';
    
    if (isset($_POST['add_food'])) {
        $stmt = $conn->prepare("INSERT INTO foods (name, price, category, recommended, addons) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$_POST['name'], $_POST['price'], $_POST['category'], $_POST['recommended'], $addons]);
    } elseif (isset($_POST['edit_food'])) {
        $stmt = $conn->prepare("UPDATE foods SET name=?, price=?, category=?, recommended=?, addons=? WHERE id=?");
        $stmt->execute([$_POST['name'], $_POST['price'], $_POST['category'], $_POST['recommended'], $addons, $_POST['id']]);
    } elseif (isset($_POST['delete_food'])) {
        $stmt = $conn->prepare("DELETE FROM foods WHERE id=?");
        $stmt->execute([$_POST['id']]);
    }
    header('Location: admin_foods.php');
    exit;
}

// Fetch all foods
$stmt = $conn->prepare("SELECT * FROM foods ORDER BY category, name");
$stmt->execute();
$foods = $stmt->fetchAll(PDO::FETCH_ASSOC);

$categories = ['Rice', 'Soup', 'Swallow', 'Pepper Soup', 'Side'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Foods - Come Again Restaurant</title>
<style>
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background: #F1FAEE;
}

/* Header (same as index.php) */
header {
    background-color: #F1FAEE;
    color: #FF5722;
    text-align: center;
    padding: 30px;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

header p {
    margin-top: 8px;
    font-weight: normal;
}

/* Page container */
.admin-container {
    max-width: 1100px;
    margin: 40px auto;
    padding: 20px;
}

/* Card sections */
.admin-card {
    background: #FF5722;
    color: #fff;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 6px 12px rgba(0,0,0,0.25);
}

.admin-card h2 {
    margin-top: 0;
    text-align: center;
}

/* Forms */
input, select {
    width: 100%;
    padding: 10px;
    margin: 8px 0 12px;
    border-radius: 6px;
    border: none;
}

label {
    font-weight: bold;
}

/* Buttons */
button, .nav-btn {
    background: #fff8e1;
    color: #FF6600;
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    margin: 5px 2px;
    box-shadow: 2px 4px 6px rgba(0,0,0,0.3);
    transition: 0.2s;
}

button:hover, .nav-btn:hover {
    background: #ffe8b3;
    transform: translateY(-1px);
}

.delete-btn {
    background: #F44336;
    color: #fff;
}

.delete-btn:hover {
    background: #d32f2f;
}

/* Table */
table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    color: #333;
    border-radius: 10px;
    overflow: hidden;
}

th {
    background: #FF9800;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.9em;
}


th, td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
}

tr:hover {
    background: #fff8e1;
}

/* Footer */
footer {
    background:#F1FAEE;
    color:#FF5722;
    text-align:center;
    padding:20px;
    font-weight:bold;
    box-shadow:0 -4px 6px rgba(0,0,0,0.2);
}

/* Serial number styling */
.serial-cell {
    font-weight: bold;
    color: #FF5722;
    background: #fff3e0;
    text-align: center;
    width: 50px;
    border-right: 2px solid #FF9800;
}

/* Zebra striping for table rows */
table tr:nth-child(even) {
    background: #fffdf7;
}

table tr:nth-child(odd) {
    background: #ffffff;
}

/* Add-ons checkbox group */
.addons-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 0.85em;
}

.addons-group label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: normal;
}

.edit-btn {
    background: #4CAF50;
    color: #fff;
}

.edit-btn:hover {
    background: #43a047;
}

/* Table inputs clean look */
.table-input {
    width: 100%;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid #ddd;
    font-size: 0.9em;
}

/* Bigger name input */
.name-input {
    font-weight: bold;
    font-size: 1em;
}

/* Header alignment fix */
thead th {
    text-align: left;
    padding: 14px;
}

/* Keep rows neat */
tbody td {
    vertical-align: top;
}

/* FULL ROW BRANDING (like homepage) */
.row-orange td {
    background: #FF5722;
    color: #fff;
}

.row-orange input,
.row-orange select {
    background: #fff;
    color: #333;
}

.row-orange .addons-group label {
    color: #fff;
}

.row-orange .edit-btn {
    background: #4CAF50;
    color: #fff;
}

.row-orange .delete-btn {
    background: #F44336;
    color: #fff;
}

/* WHITE ROW */
.row-white td {
    background: #ffffff;
    color: #333;
}

/* Keep serial readable */
.row-orange .serial-cell {
    background: #E64A19;
    color: #fff;
}

.row-white .serial-cell {
    background: #fff;
    color: #FF5722;
}


</style>

</head>
<body>
<header>
    <h1>🍽 Admin Foods</h1>
    <p>Manage menu items, prices and add-ons</p>

    <div style="margin-top:15px;">
        <a href="index.php" class="nav-btn">🏠 Home</a>
        <a href="admin_orders.php" class="nav-btn">📦 Orders</a>
        <a href="logout.php" class="nav-btn">🚪 Logout</a>
    </div>
</header>>
<div class="admin-container">

   <div class="admin-card">
    <h2>Add New Food</h2>
    <form method="POST">
      <input type="text" name="name" placeholder="Food Name" required>
      <input type="number" name="price" placeholder="Price (₦)" required>
     <select name="category" required>
<option value="">Select Category</option>
<?php foreach($categories as $cat): ?>
<option value="<?php echo $cat; ?>"><?php echo $cat; ?></option>
<?php endforeach; ?> </select>
     <input type="text" name="recommended" placeholder="Recommended with (optional)">

    <h4>Select Add-ons:</h4>
<?php foreach($available_addons as $addon): ?>
    <label><input type="checkbox" name="addons[]" value="<?php echo $addon; ?>"> <?php echo $addon; ?></label>&nbsp;
<?php endforeach; ?>

     <br><button type="submit" name="add_food" class="add-btn">Add Food</button>
    </form>
   </div>

   <div class="admin-card">
    <h2 style="margin-top:40px;">Current Foods</h2>
    <table>
    <thead>
        <tr>
            <th style="width:60px;">#</th>
            <th>Name</th>
            <th style="width:110px;">Price</th>
            <th style="width:140px;">Category</th>
            <th>Recommended</th>
            <th>Add-ons</th>
            <th style="width:140px;">Actions</th>
        </tr>
    </thead>

    <tbody>
    <?php $serial = 1; foreach($foods as $food): 
        $food_addons = explode(',', $food['addons']);
    ?>
        <tr data-id="<?php echo $food['id']; ?>"
            class="<?php echo ($serial % 2 == 0) ? 'row-white' : 'row-orange'; ?>">


            <!-- SERIAL NUMBER -->
            <td class="serial-cell <?php echo ($serial % 2 == 0) ? 'serial-white' : 'serial-orange'; ?>">
                <?php echo $serial; ?>
            </td>

            <!-- EDIT FORM START -->
            <form class="edit-food-form">
                <input type="hidden" name="id" value="<?php echo $food['id']; ?>">
                <input type="hidden" name="edit_food" value="1">

                <!-- NAME -->
                <td>
                    <input type="text" name="name"
                        value="<?php echo $food['name']; ?>"
                        required class="table-input name-input">
                </td>

                <!-- PRICE -->
                <td>
                    <input type="number" name="price"
                        value="<?php echo $food['price']; ?>"
                        required class="table-input">
                </td>

                <!-- CATEGORY -->
                <td>
                    <select name="category" required class="table-input">
                        <?php foreach($categories as $cat): ?>
                        <option value="<?php echo $cat; ?>" <?php if($food['category']==$cat) echo 'selected'; ?>>
                            <?php echo $cat; ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </td>

                <!-- RECOMMENDED -->
                <td>
                    <input type="text" name="recommended"
                        value="<?php echo $food['recommended']; ?>"
                        class="table-input">
                </td>

                <!-- ADDONS -->
                <td>
                    <div class="addons-group">
                        <?php foreach($available_addons as $addon): ?>
                            <label>
                                <input type="checkbox" name="addons[]" value="<?php echo $addon; ?>"
                                <?php if(in_array($addon, $food_addons)) echo 'checked'; ?>>
                                <?php echo $addon; ?>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </td>

                <!-- ACTIONS -->
                <td>
                    <button type="submit" class="edit-btn">Save</button>
            </form>

                    <form method="POST" style="margin-top:6px;">
                        <input type="hidden" name="id" value="<?php echo $food['id']; ?>">
                        <button type="submit" name="delete_food"
                            class="delete-btn"
                            onclick="return confirm('Delete this food?')">
                            Delete
                        </button>
                    </form>
                </td>
        </tr>
    <?php $serial++; endforeach; ?>
    </tbody>
</table>

   </div>

</div>

<div id="save-toast" style="
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    opacity: 0;
    transform: translateY(-20px);
    transition: 0.4s ease;
    z-index: 9999;
">Saved successfully ✅</div> 

<script>
// Handle edit form via AJAX
document.querySelectorAll('.edit-food-form').forEach(form => {
    form.addEventListener('submit', function(e){
        e.preventDefault(); // prevent page reload

        const formData = new FormData(form);

        fetch('admin_foods_save.php', { // we will create this file
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(response => {
            // Show toast
            const toast = document.getElementById('save-toast');
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
            }, 2000);
        })
        .catch(err => console.error(err));
    });
});
</script>



<footer>
© 2025 Come Again Restaurant
</footer>
</body>
</html>
