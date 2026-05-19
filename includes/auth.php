<?php
/**
 * LS Dry Cleaners — Admin auth
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/data.php';

function admin_credentials(): array {
    $a = load_json(ADMIN_FILE);
    return [
        'username' => $a['username'] ?? 'admin',
        'hash'     => $a['password_hash'] ?? '',
    ];
}

function admin_login(string $user, string $pass): bool {
    $c = admin_credentials();
    if (!hash_equals($c['username'], $user)) return false;
    if (empty($c['hash'])) return false;
    if (!password_verify($pass, $c['hash'])) return false;
    session_regenerate_id(true);
    $_SESSION['admin'] = $user;
    return true;
}

function admin_logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function require_admin(): void {
    if (empty($_SESSION['admin'])) {
        header('Location: index.php');
        exit;
    }
}
