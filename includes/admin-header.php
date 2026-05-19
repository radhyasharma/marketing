<?php
/** Shared admin layout header */
require_once __DIR__ . '/auth.php';
require_admin();
$current = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($title ?? 'Admin') ?> — LS Dry Cleaners</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body">
  <aside class="admin-sidebar">
    <a href="../index.html" class="brand" style="margin-bottom: 32px">
      <span class="brand-mark">LS</span><span>LS Admin</span>
    </a>
    <nav class="admin-nav">
      <a href="dashboard.php"  class="<?= $current === 'dashboard.php' ? 'active' : '' ?>">Dashboard</a>
      <a href="pricing.php"    class="<?= $current === 'pricing.php'   ? 'active' : '' ?>">Pricing</a>
      <a href="blogs.php"      class="<?= $current === 'blogs.php'     ? 'active' : '' ?>">Journal Posts</a>
      <a href="../index.html" target="_blank">↗ View Site</a>
    </nav>
    <a href="logout.php" class="admin-logout">Sign out</a>
  </aside>

  <main class="admin-main">
    <header class="admin-topbar">
      <div>
        <div style="font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:var(--text-mute)">Admin</div>
        <h1 style="font-size:1.8rem;margin-top:4px"><?= e($title ?? 'Dashboard') ?></h1>
      </div>
      <div style="color:var(--text-mute);font-size:.88rem">
        Signed in as <strong style="color:var(--gold)"><?= e($_SESSION['admin']) ?></strong>
      </div>
    </header>

    <?php foreach (flush_flashes() as $f): ?>
      <div class="flash flash-<?= e($f['type']) ?>"><?= e($f['msg']) ?></div>
    <?php endforeach; ?>
