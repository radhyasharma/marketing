<?php
$title = 'Dashboard';
require_once __DIR__ . '/../includes/admin-header.php';

$pricing = load_pricing();
$blogs   = load_blogs();
$totalItems = 0;
foreach ($pricing['categories'] as $c) $totalItems += count($c['items'] ?? []);
$totalPosts = count($blogs['posts']);

$lastPost = null;
foreach ($blogs['posts'] as $p) {
    if (!$lastPost || strtotime($p['date'] ?? '') > strtotime($lastPost['date'] ?? '0')) $lastPost = $p;
}
?>

<div class="kpi-grid">
  <div class="kpi">
    <div class="kpi-label">Pricing Categories</div>
    <div class="kpi-value"><?= count($pricing['categories']) ?></div>
    <div class="kpi-sub">Currency: <?= e($pricing['currency_symbol'] ?? '₹') ?> (<?= e($pricing['currency'] ?? 'INR') ?>)</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Pricing Items</div>
    <div class="kpi-value"><?= $totalItems ?></div>
    <div class="kpi-sub">Across all categories</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Journal Posts</div>
    <div class="kpi-value"><?= $totalPosts ?></div>
    <div class="kpi-sub"><?= $lastPost ? 'Last: ' . e($lastPost['date']) : 'No posts yet' ?></div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Site Status</div>
    <div class="kpi-value" style="font-size: 1.6rem; font-family: 'Inter', sans-serif">Live</div>
    <div class="kpi-sub"><a href="../index.html" target="_blank" style="color:var(--gold)">Open homepage ↗</a></div>
  </div>
</div>

<div class="card">
  <h2>Quick actions</h2>
  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px">
    <a href="pricing.php" class="btn btn-primary btn-arrow">Edit Pricing</a>
    <a href="blogs.php" class="btn btn-ghost">Manage Posts</a>
    <a href="blogs.php?action=new" class="btn btn-ghost">+ New Post</a>
  </div>
</div>

<div class="card">
  <h2>Recent posts</h2>
  <?php if (empty($blogs['posts'])): ?>
    <p style="color: var(--text-mute)">No posts yet. <a href="blogs.php?action=new" style="color:var(--gold)">Write your first one →</a></p>
  <?php else:
    $recent = $blogs['posts'];
    usort($recent, fn($a,$b) => strtotime($b['date'] ?? '0') - strtotime($a['date'] ?? '0'));
    $recent = array_slice($recent, 0, 5);
  ?>
    <table class="adm-table">
      <thead><tr><th>Title</th><th>Author</th><th>Date</th><th></th></tr></thead>
      <tbody>
        <?php foreach ($recent as $p): ?>
          <tr>
            <td><strong><?= e($p['title']) ?></strong></td>
            <td><?= e($p['author'] ?? '—') ?></td>
            <td><?= e($p['date'] ?? '—') ?></td>
            <td class="actions">
              <a href="blogs.php?action=edit&amp;id=<?= (int)$p['id'] ?>" class="btn btn-ghost btn-sm">Edit</a>
              <a href="../post.html?slug=<?= urlencode($p['slug']) ?>" target="_blank" class="btn btn-ghost btn-sm">View ↗</a>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
