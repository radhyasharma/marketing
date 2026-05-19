<?php
require_once __DIR__ . '/../includes/auth.php';

if (!empty($_SESSION['admin'])) {
    header('Location: dashboard.php');
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) {
        $error = 'Session expired. Please try again.';
    } else {
        $u = trim($_POST['username'] ?? '');
        $p = (string)($_POST['password'] ?? '');
        if (admin_login($u, $p)) {
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Invalid credentials.';
            usleep(500000); // small delay against brute force
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Sign In — LS Dry Cleaners</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="admin.css">
</head>
<body>
  <div class="login-shell">
    <form class="login-card" method="post" action="">
      <a href="../index.html" class="brand">
        <span class="brand-mark">LS</span><span>LS Dry Cleaners</span>
      </a>
      <h1>Admin Sign In</h1>
      <p class="sub">Manage pricing &amp; journal content</p>

      <?php if ($error): ?>
        <div class="flash flash-error"><?= e($error) ?></div>
      <?php endif; ?>

      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">

      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required autofocus autocomplete="username">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>

      <button type="submit" class="btn btn-primary btn-arrow">Sign In</button>

      <p class="hint">Default credentials: <code style="color:var(--gold)">admin / lsadmin2026</code><br>Change in <code>data/admin.json</code></p>
    </form>
  </div>
</body>
</html>
