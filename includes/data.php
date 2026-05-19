<?php
/**
 * LS Dry Cleaners — JSON data layer
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function load_json(string $path): array {
    if (!is_file($path)) return [];
    $raw = file_get_contents($path);
    if ($raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function save_json(string $path, array $data): bool {
    if (!is_dir(dirname($path))) {
        @mkdir(dirname($path), 0775, true);
    }
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;
    // Atomic write
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return rename($tmp, $path);
}

// Pricing helpers
function load_pricing(): array {
    $d = load_json(PRICING_FILE);
    if (!isset($d['categories']) || !is_array($d['categories'])) {
        $d = ['currency' => 'INR', 'currency_symbol' => '₹', 'note' => '', 'categories' => []];
    }
    return $d;
}
function save_pricing(array $d): bool {
    return save_json(PRICING_FILE, $d);
}

// Blog helpers
function load_blogs(): array {
    $d = load_json(BLOGS_FILE);
    if (!isset($d['posts']) || !is_array($d['posts'])) {
        $d = ['posts' => []];
    }
    return $d;
}
function save_blogs(array $d): bool {
    return save_json(BLOGS_FILE, $d);
}
function next_blog_id(array $blogs): int {
    $max = 0;
    foreach ($blogs['posts'] as $p) {
        if (!empty($p['id']) && (int)$p['id'] > $max) $max = (int)$p['id'];
    }
    return $max + 1;
}
function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('~[^a-z0-9]+~', '-', $s) ?? '';
    return trim($s, '-');
}
