<?php
/**
 * Contact form handler for Rackhost (PHP shared hosting).
 *
 * Runs on your own server, so no visitor data ever leaves the EU — a cleaner
 * GDPR position than any third-party form service.
 *
 * Setup: edit config.local.php (see config.local.example.php) with the
 * recipient address. Never commit real credentials.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ---------------------------------------------------------------- config ----
$config = [
    'to'        => 'info@brandmuhely.hu',
    'from'      => 'no-reply@brandmuhely.hu', // must be on YOUR domain or mail is rejected
    'subject'   => 'Új üzenet a brandmuhely.hu oldalról',
    'log_csv'   => __DIR__ . '/../_private/leads.csv',
    'rate_dir'  => sys_get_temp_dir(),
    'rate_secs' => 60,   // one submission per minute per IP
];
$local = __DIR__ . '/config.local.php';
if (is_readable($local)) {
    $config = array_merge($config, (array) require $local);
}

function fail(string $msg, int $code = 400): never
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function ok(): never
{
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

/** Strips CR/LF so a submitted value can never inject extra mail headers. */
function header_safe(string $v): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v));
}

function clean(string $v, int $max): string
{
    return mb_substr(trim(strip_tags($v)), 0, $max, 'UTF-8');
}

// ----------------------------------------------------------------- guards ---
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Csak POST kérés engedélyezett.', 405);
}

// Honeypot — bots fill the hidden field, humans never see it. Answer 200 so
// the bot believes it succeeded and does not retry.
if (!empty($_POST['website'])) {
    ok();
}

// Simple per-IP rate limit.
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$lock = $config['rate_dir'] . '/bm_' . hash('sha256', $ip);
if (is_file($lock) && (time() - filemtime($lock)) < $config['rate_secs']) {
    fail('Túl gyakori küldés. Próbáld újra egy perc múlva.', 429);
}
@touch($lock);

// ------------------------------------------------------------- validation ---
$name    = clean((string) ($_POST['name'] ?? ''), 120);
$email   = clean((string) ($_POST['email'] ?? ''), 180);
$phone   = clean((string) ($_POST['phone'] ?? ''), 40);
$company = clean((string) ($_POST['company'] ?? ''), 160);
$platform= clean((string) ($_POST['platform'] ?? ''), 60);
$message = clean((string) ($_POST['message'] ?? ''), 4000);
$privacy = !empty($_POST['privacy']);

if ($name === '' || $message === '') {
    fail('Hiányzó kötelező mező.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Érvénytelen e-mail cím.');
}
if (!$privacy) {
    fail('Az adatkezelési tájékoztató elfogadása kötelező.');
}

// ------------------------------------------------------------------ store ---
// CSV lives outside the web root so it is never directly downloadable.
$dir = dirname($config['log_csv']);
if (!is_dir($dir)) {
    @mkdir($dir, 0750, true);
}
if ($fh = @fopen($config['log_csv'], 'a')) {
    if (flock($fh, LOCK_EX)) {
        if (ftell($fh) === 0) {
            fputcsv($fh, ['datum', 'nev', 'email', 'telefon', 'ceg', 'platform', 'uzenet']);
        }
        fputcsv($fh, [
            date('Y-m-d H:i:s'), $name, $email, $phone, $company, $platform, $message,
        ]);
        flock($fh, LOCK_UN);
    }
    fclose($fh);
}

// ------------------------------------------------------------------- mail ---
$body = "Új üzenet a weboldalról\n"
      . str_repeat('-', 40) . "\n"
      . "Név:      {$name}\n"
      . "E-mail:   {$email}\n"
      . "Telefon:  " . ($phone !== '' ? $phone : '—') . "\n"
      . "Cég:      " . ($company !== '' ? $company : '—') . "\n"
      . "Platform: " . ($platform !== '' ? $platform : '—') . "\n"
      . str_repeat('-', 40) . "\n\n"
      . $message . "\n\n"
      . "Küldve: " . date('Y-m-d H:i:s') . "\n";

$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    // From must stay on your own domain for SPF/DKIM to pass.
    'From: ' . header_safe($config['from']),
    'Reply-To: ' . header_safe($email),
    'X-Mailer: brandmuhely-form',
]);

$subject = '=?UTF-8?B?' . base64_encode($config['subject'] . ' — ' . $name) . '?=';
$sent = @mail($config['to'], $subject, $body, $headers, '-f' . $config['from']);

if (!$sent) {
    // The CSV row is already written, so the lead is not lost.
    fail('Az e-mail küldés nem sikerült, de az üzenetet elmentettük.', 500);
}

ok();
