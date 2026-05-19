<?php
$title = 'Journal';
require_once __DIR__ . '/../includes/admin-header.php';

$blogs = load_blogs();
$action = $_GET['action'] ?? 'list';
$id     = (int)($_GET['id'] ?? 0);

// ===== Save (create / update) =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? null)) {
        flash('error', 'Session expired. Please retry.');
        header('Location: blogs.php'); exit;
    }

    $op = $_POST['op'] ?? '';

    if ($op === 'save') {
        $postId = (int)($_POST['id'] ?? 0);
        $data = [
            'id'      => $postId ?: next_blog_id($blogs),
            'slug'    => slugify($_POST['slug'] ?? '') ?: slugify($_POST['title'] ?? 'post'),
            'title'   => trim($_POST['title'] ?? ''),
            'excerpt' => trim($_POST['excerpt'] ?? ''),
            'cover'   => trim($_POST['cover'] ?? ''),
            'author'  => trim($_POST['author'] ?? ''),
            'date'    => trim($_POST['date'] ?? date('Y-m-d')),
            'tags'    => array_values(array_filter(array_map('trim', explode(',', $_POST['tags'] ?? '')))),
            'content' => $_POST['content'] ?? '',
        ];

        // Replace existing or append
        $found = false;
        foreach ($blogs['posts'] as $i => $p) {
            if ((int)$p['id'] === (int)$data['id']) {
                $blogs['posts'][$i] = $data;
                $found = true;
                break;
            }
        }
        if (!$found) $blogs['posts'][] = $data;

        if (save_blogs($blogs)) flash('success', 'Post saved.');
        else flash('error', 'Could not save. Check folder permissions.');

        header('Location: blogs.php'); exit;
    }

    if ($op === 'delete') {
        $delId = (int)($_POST['id'] ?? 0);
        $blogs['posts'] = array_values(array_filter($blogs['posts'], fn($p) => (int)$p['id'] !== $delId));
        save_blogs($blogs);
        flash('success', 'Post deleted.');
        header('Location: blogs.php'); exit;
    }
}

// ===== Render =====
if ($action === 'new' || $action === 'edit'):
    $editing = null;
    if ($action === 'edit') {
        foreach ($blogs['posts'] as $p) if ((int)$p['id'] === $id) { $editing = $p; break; }
    }
    $editing = $editing ?? [
        'id' => 0, 'slug' => '', 'title' => '', 'excerpt' => '', 'cover' => '',
        'author' => '', 'date' => date('Y-m-d'), 'tags' => [], 'content' => ''
    ];
?>

<div class="card">
  <form method="post" action="" class="form-stack">
    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="op" value="save">
    <input type="hidden" name="id" value="<?= (int)$editing['id'] ?>">

    <div class="form-group">
      <label>Title</label>
      <input type="text" name="title" required value="<?= e($editing['title']) ?>" placeholder="Article title">
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px">
      <div class="form-group">
        <label>Slug (URL)</label>
        <input type="text" name="slug" value="<?= e($editing['slug']) ?>" placeholder="auto-generated if blank">
      </div>
      <div class="form-group">
        <label>Author</label>
        <input type="text" name="author" value="<?= e($editing['author']) ?>" placeholder="Author name">
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" name="date" value="<?= e($editing['date']) ?>">
      </div>
    </div>

    <div class="form-group">
      <label>Cover image URL</label>
      <input type="url" name="cover" value="<?= e($editing['cover']) ?>" placeholder="https://…">
    </div>

    <div class="form-group">
      <label>Tags (comma separated)</label>
      <input type="text" name="tags" value="<?= e(implode(', ', $editing['tags'] ?? [])) ?>" placeholder="silk, stains, tips">
    </div>

    <div class="form-group">
      <label>Excerpt</label>
      <textarea name="excerpt" rows="3" placeholder="Short summary shown in listing"><?= e($editing['excerpt']) ?></textarea>
    </div>

    <div class="form-group">
      <label>Content (HTML allowed: &lt;p&gt; &lt;h2&gt; &lt;ul&gt; &lt;ol&gt; &lt;li&gt; &lt;strong&gt; &lt;a&gt;)</label>
      <textarea name="content" rows="16" style="font-family: 'SF Mono', Menlo, monospace; font-size: 0.88rem"><?= e($editing['content']) ?></textarea>
    </div>

    <div class="form-actions">
      <a href="blogs.php" class="btn btn-ghost">Cancel</a>
      <button type="submit" class="btn btn-primary btn-arrow">
        <?= $editing['id'] ? 'Update Post' : 'Publish Post' ?>
      </button>
    </div>
  </form>
</div>

<?php else:  // list view
    $posts = $blogs['posts'];
    usort($posts, fn($a,$b) => strtotime($b['date'] ?? '0') - strtotime($a['date'] ?? '0'));
?>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
  <p style="color: var(--text-mute)"><?= count($posts) ?> post<?= count($posts) === 1 ? '' : 's' ?></p>
  <a href="blogs.php?action=new" class="btn btn-primary btn-arrow">+ New Post</a>
</div>

<?php if (empty($posts)): ?>
  <div class="card" style="text-align: center; padding: 60px 30px">
    <p style="color: var(--text-mute); margin-bottom: 20px">No posts yet.</p>
    <a href="blogs.php?action=new" class="btn btn-primary btn-arrow">Write the first post</a>
  </div>
<?php else: ?>
  <div class="card" style="padding: 0; overflow: hidden">
    <table class="adm-table">
      <thead>
        <tr><th>Title</th><th>Author</th><th>Date</th><th>Tags</th><th></th></tr>
      </thead>
      <tbody>
        <?php foreach ($posts as $p): ?>
          <tr>
            <td>
              <strong style="color: var(--text)"><?= e($p['title']) ?></strong>
              <div style="font-size: .82rem; color: var(--text-dim); margin-top: 4px">/<?= e($p['slug']) ?></div>
            </td>
            <td><?= e($p['author'] ?? '—') ?></td>
            <td><?= e($p['date'] ?? '—') ?></td>
            <td><span style="font-size: .78rem; color: var(--gold)"><?= e(implode(', ', $p['tags'] ?? [])) ?></span></td>
            <td class="actions">
              <a href="blogs.php?action=edit&amp;id=<?= (int)$p['id'] ?>" class="btn btn-ghost btn-sm">Edit</a>
              <a href="../post.html?slug=<?= urlencode($p['slug']) ?>" target="_blank" class="btn btn-ghost btn-sm">↗</a>
              <form method="post" style="display: inline" onsubmit="return confirm('Delete this post permanently?')">
                <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="op" value="delete">
                <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
                <button type="submit" class="btn btn-danger btn-sm">Delete</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
<?php endif; ?>

<?php endif; ?>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
