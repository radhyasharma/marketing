<?php
/**
 * LS Dry Cleaners — App Config
 */
declare(strict_types=1);

define('APP_NAME', 'LS Dry Cleaners');
define('APP_ROOT', dirname(__DIR__));
define('DATA_DIR', APP_ROOT . '/data');
define('PRICING_FILE', DATA_DIR . '/pricing.json');
define('BLOGS_FILE',   DATA_DIR . '/blogs.json');
define('ADMIN_FILE',   DATA_DIR . '/admin.json');

session_start([
    'name' => 'lsadmin',
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'use_strict_mode' => true,
]);

// CSRF helpers
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['csrf'];
}
function csrf_check(?string $t): bool {
    return !empty($t) && hash_equals($_SESSION['csrf'] ?? '', $t);
}

// Tiny escape
function e(?string $s): string {
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

// Flash messages
function flash(string $type, string $msg): void {
    $_SESSION['flash'][] = ['type' => $type, 'msg' => $msg];
}
function flush_flashes(): array {
    $f = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $f;
}
