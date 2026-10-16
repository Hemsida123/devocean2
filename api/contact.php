<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Robots-Tag: noindex, nofollow');

function respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(int $status, string $message): void {
    respond($status, ['ok' => false, 'message' => $message]);
}
function field(string $key, int $maximum, bool $required = false): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $maximum || !preg_match('//u', $value)) {
        fail(422, 'Please check your form details and try again.');
    }
    $value = trim($value);
    if (($required && $value === '') || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
        fail(422, 'Please complete your name, email and message.');
    }
    return $value;
}

try {
    $config = require __DIR__ . '/config.php';
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if (!in_array($method, ['GET', 'POST'], true)) {
        header('Allow: GET, POST');
        fail(405, 'This request method is not supported.');
    }
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000 || !empty($_FILES)) {
        fail(413, 'The message is too large. Please shorten it and try again.');
    }
    if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
        fail(403, 'Please open the form on the Devocean website.');
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($method === 'POST' && !in_array($origin, $config['allowed_origins'], true)) {
        fail(403, 'Please open the form on the Devocean website, then try again.');
    }
    session_name('devocean_enquiry');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true, 'samesite' => 'Lax',
    ]);
    if (!session_start()) {
        fail(503, 'Online sending is temporarily unavailable. Please email us or use WhatsApp.');
    }
    if ($method === 'GET') {
        if (empty($_SESSION['csrf']) || ($_SESSION['csrf_expires'] ?? 0) < time()) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            $_SESSION['csrf_expires'] = time() + 3600;
        }
        respond(200, ['ok' => true, 'token' => $_SESSION['csrf']]);
    }
    $token = field('csrf', 64, true);
    if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $token) || ($_SESSION['csrf_expires'] ?? 0) < time()) {
        fail(403, 'Your form session expired. Please try sending again.');
    }
    if (field('company_website', 200) !== '') {
        fail(422, 'This enquiry could not be submitted. Please contact us directly.');
    }
    $name = field('name', 400, true);
    $email = field('email', 200, true);
    $experience = field('experience', 560, true);
    $date = field('date', 10);
    $message = field('message', 12000, true);
    $requestId = field('request_id', 64, true);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email . $name . $experience) || !preg_match('/^[a-f0-9]{32}$/D', $requestId)) {
        fail(422, 'Please check your name and email address.');
    }
    if ($date !== '') {
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        if (!$parsed || $parsed->format('Y-m-d') !== $date) {
            fail(422, 'Please enter a valid travel date or leave it empty.');
        }
    }
    if (!empty($_SESSION['sent'][$requestId])) {
        respond(200, ['ok' => true]); // A retry never sends the same request twice.
    }
    if (!filter_var($config['sender'], FILTER_VALIDATE_EMAIL) || !filter_var($config['recipient'], FILTER_VALIDATE_EMAIL)) {
        fail(503, 'Online sending is temporarily unavailable. Please email us or use WhatsApp.');
    }

    // Locked, private abuse counters outside the public website. No message content.
    $directory = sys_get_temp_dir() . '/devocean-form-' . substr(hash('sha256', __DIR__), 0, 20);
    if (is_link($directory) || (!is_dir($directory) && !mkdir($directory, 0700, true))) {
        fail(503, 'Online sending is temporarily unavailable. Please contact us directly.');
    }
    $stateFile = $directory . '/limits.json';
    if (is_link($stateFile)) { fail(503, 'Online sending is temporarily unavailable.'); }
    $lock = fopen($stateFile, 'c+');
    if (!$lock || !flock($lock, LOCK_EX)) { fail(503, 'Please try again in a moment.'); }
    chmod($stateFile, 0600);
    $raw = stream_get_contents($lock, 1048577);
    $state = $raw === '' ? [] : json_decode($raw, true);
    if (!is_array($state) || strlen($raw) > 1048576) { fail(503, 'Please contact us directly while online sending is unavailable.'); }
    $now = time();
    foreach ($state as $key => $times) {
        $state[$key] = array_values(array_filter($times, static function ($time) use ($now) { return $time > $now - 86400; }));
        if (!$state[$key]) { unset($state[$key]); }
    }
    $ip = hash('sha256', __DIR__ . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $attempts = $state[$ip] ?? [];
    $global = $state['global'] ?? [];
    $recent = array_filter($attempts, static function ($time) use ($now) { return $time > $now - 3600; });
    $globalRecent = array_filter($global, static function ($time) use ($now) { return $time > $now - 3600; });
    if (count($recent) >= 5 || count($attempts) >= 15 || count($globalRecent) >= 100 || count($global) >= 500 || ($attempts && end($attempts) > $now - 30)) {
        header('Retry-After: 60');
        fail(429, 'Too many attempts. Please wait a little, or contact us by email or WhatsApp.');
    }
    $state[$ip][] = $now;
    $state['global'][] = $now;
    $encoded = json_encode($state);
    rewind($lock);
    if (!ftruncate($lock, 0) || fwrite($lock, $encoded) !== strlen($encoded) || !fflush($lock)) {
        fail(503, 'Online sending is temporarily unavailable. Please contact us directly.');
    }
    flock($lock, LOCK_UN);
    fclose($lock);

    $body = "New dive enquiry from the Devocean website\r\n\r\n"
        . "Name: $name\r\nEmail: $email\r\nExperience: $experience\r\nTravel date: "
        . ($date ?: 'Flexible / to confirm') . "\r\n\r\n$message\r\n\r\n"
        . "This is an enquiry, not a confirmed reservation.\r\nReference: $requestId\r\n";
    $headers = [
        'From' => 'Devocean website <' . $config['sender'] . '>',
        'Reply-To' => $email,
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => 'quoted-printable',
    ];
    if (!function_exists('mail') || !mail($config['recipient'], 'New dive enquiry - Devocean Divers', quoted_printable_encode($body), $headers)) {
        fail(503, 'Your enquiry could not be sent. Your details are still here. Please email us or use WhatsApp.');
    }
    $_SESSION['sent'][$requestId] = $now;
    $_SESSION['sent'] = array_slice($_SESSION['sent'], -20, null, true);
    respond(200, ['ok' => true]); // Accepted by the host's mail system; not a delivery receipt.
} catch (Throwable $error) {
    fail(503, 'Online sending is temporarily unavailable. Please email us or use WhatsApp.');
}
