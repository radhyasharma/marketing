<?php
$title = 'Pricing';
require_once __DIR__ . '/../includes/admin-header.php';

$pricing = load_pricing();

// Handle save
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) {
        flash('error', 'Session expired. Please retry.');
        header('Location: pricing.php'); exit;
    }

    $action = $_POST['action'] ?? 'save_all';

    if ($action === 'save_all') {
        $pricing['currency']        = trim($_POST['currency'] ?? 'INR');
        $pricing['currency_symbol'] = trim($_POST['currency_symbol'] ?? '₹');
        $pricing['note']            = trim($_POST['note'] ?? '');

        $newCats = [];
        $cats = $_POST['cat'] ?? [];
        foreach ($cats as $cidx => $cat) {
            if (empty($cat['name'])) continue;
            $items = [];
            foreach ($cat['items'] ?? [] as $it) {
                if (empty($it['name'])) continue;
                $items[] = [
                    'name'      => trim($it['name']),
                    'dry_clean' => $it['dry_clean'] === '' ? null : (int)$it['dry_clean'],
                    'wash_iron' => $it['wash_iron'] === '' ? null : (int)$it['wash_iron'],
                    'iron_only' => $it['iron_only'] === '' ? null : (int)$it['iron_only'],
                ];
            }
            $newCats[] = [
                'id'    => slugify($cat['id'] ?? $cat['name']),
                'name'  => trim($cat['name']),
                'icon'  => trim($cat['icon'] ?? ''),
                'items' => $items,
            ];
        }
        $pricing['categories'] = $newCats;

        if (save_pricing($pricing)) flash('success', 'Pricing updated. Live on site.');
        else flash('error', 'Could not save. Check folder permissions on /data/.');

        header('Location: pricing.php'); exit;
    }

    if ($action === 'add_cat') {
        $pricing['categories'][] = [
            'id' => 'new-' . substr((string)time(), -4),
            'name' => 'New Category',
            'icon' => '',
            'items' => []
        ];
        save_pricing($pricing);
        flash('info', 'Category added. Edit and save below.');
        header('Location: pricing.php'); exit;
    }

    if ($action === 'delete_cat') {
        $idx = (int)($_POST['idx'] ?? -1);
        if (isset($pricing['categories'][$idx])) {
            array_splice($pricing['categories'], $idx, 1);
            save_pricing($pricing);
            flash('success', 'Category removed.');
        }
        header('Location: pricing.php'); exit;
    }
}
?>

<form method="post" action="">
  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
  <input type="hidden" name="action" value="save_all">

  <div class="card">
    <h2>Global settings</h2>
    <div class="form-stack" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
      <div class="form-group">
        <label>Currency code</label>
        <input type="text" name="currency" value="<?= e($pricing['currency'] ?? 'INR') ?>" placeholder="INR">
      </div>
      <div class="form-group">
        <label>Currency symbol</label>
        <input type="text" name="currency_symbol" value="<?= e($pricing['currency_symbol'] ?? '₹') ?>" placeholder="₹">
      </div>
    </div>
    <div class="form-group">
      <label>Pricing note (shown below tables)</label>
      <input type="text" name="note" value="<?= e($pricing['note'] ?? '') ?>">
    </div>
  </div>

  <?php foreach ($pricing['categories'] as $cidx => $cat): ?>
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px">
        <h2 style="margin: 0">Category: <?= e($cat['name']) ?></h2>
        <button type="button" class="btn btn-danger btn-sm" onclick="if(confirm('Delete this category?')){deleteCategory(<?= $cidx ?>)}">Delete</button>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; margin-bottom: 20px">
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="cat[<?= $cidx ?>][name]" value="<?= e($cat['name']) ?>" required>
        </div>
        <div class="form-group">
          <label>ID (URL-safe)</label>
          <input type="text" name="cat[<?= $cidx ?>][id]" value="<?= e($cat['id']) ?>">
        </div>
        <div class="form-group">
          <label>Icon</label>
          <input type="text" name="cat[<?= $cidx ?>][icon]" value="<?= e($cat['icon'] ?? '') ?>">
        </div>
      </div>

      <div class="row-cells" style="background: transparent; border: none; font-weight: 500; color: var(--text-mute); font-size: .78rem; text-transform: uppercase; letter-spacing: .14em">
        <div>Item Name</div>
        <div>Dry Clean</div>
        <div>Wash &amp; Iron</div>
        <div>Iron Only</div>
        <div></div>
      </div>

      <div id="items-<?= $cidx ?>">
      <?php foreach ($cat['items'] as $iidx => $item): ?>
        <div class="row-cells">
          <input type="text" name="cat[<?= $cidx ?>][items][<?= $iidx ?>][name]" value="<?= e($item['name']) ?>" placeholder="Item name">
          <input type="number" min="0" step="1" name="cat[<?= $cidx ?>][items][<?= $iidx ?>][dry_clean]" value="<?= $item['dry_clean'] ?? '' ?>" placeholder="—">
          <input type="number" min="0" step="1" name="cat[<?= $cidx ?>][items][<?= $iidx ?>][wash_iron]" value="<?= $item['wash_iron'] ?? '' ?>" placeholder="—">
          <input type="number" min="0" step="1" name="cat[<?= $cidx ?>][items][<?= $iidx ?>][iron_only]" value="<?= $item['iron_only'] ?? '' ?>" placeholder="—">
          <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
        </div>
      <?php endforeach; ?>
      </div>

      <button type="button" class="btn btn-ghost btn-sm" onclick="addItem(<?= $cidx ?>, <?= count($cat['items']) ?>)">+ Add Item</button>
    </div>
  <?php endforeach; ?>

  <div class="form-actions" style="border: none; padding-top: 0">
    <button type="button" class="btn btn-ghost" onclick="addCategory()">+ Add Category</button>
    <button type="submit" class="btn btn-primary btn-arrow">Save All Changes</button>
  </div>
</form>

<form id="addCatForm" method="post" action="" style="display: none">
  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
  <input type="hidden" name="action" value="add_cat">
</form>
<form id="delCatForm" method="post" action="" style="display: none">
  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
  <input type="hidden" name="action" value="delete_cat">
  <input type="hidden" name="idx" id="delCatIdx" value="">
</form>

<script>
  function addCategory() { document.getElementById('addCatForm').submit(); }
  function deleteCategory(idx) {
    document.getElementById('delCatIdx').value = idx;
    document.getElementById('delCatForm').submit();
  }
  function addItem(cidx, count) {
    const el = document.createElement('div');
    el.className = 'row-cells';
    el.innerHTML = `
      <input type="text" name="cat[${cidx}][items][${count}][name]" placeholder="Item name">
      <input type="number" min="0" step="1" name="cat[${cidx}][items][${count}][dry_clean]" placeholder="—">
      <input type="number" min="0" step="1" name="cat[${cidx}][items][${count}][wash_iron]" placeholder="—">
      <input type="number" min="0" step="1" name="cat[${cidx}][items][${count}][iron_only]" placeholder="—">
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
    `;
    document.getElementById('items-' + cidx).appendChild(el);
  }
</script>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
