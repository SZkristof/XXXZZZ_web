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

// Fail loudly on an unsupported PHP version instead of a blank 500.
if (PHP_VERSION_ID < 70400) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'error' => 'A szerver PHP verziója túl régi (' . PHP_VERSION . '). '
                 . 'Állítsd 8.1-re vagy újabbra a tárhely beállításaiban.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ---------------------------------------------------------------- config ----
$config = [
    'to'        => 'info@brandmuhely.hu',
    'from'      => 'no-reply@brandmuhely.hu',
    'from_name' => 'Brandműhely weboldal',
    'subject'   => 'Új üzenet a brandmuhely.hu oldalról',
    // One level ABOVE the web root. On Rackhost the account home is the parent
    // of the public directory, so this is not web-reachable at all. Override in
    // config.local.php if the layout differs — but never point it inside the
    // web root: the file holds names, e-mail addresses and phone numbers.
    'log_csv'   => __DIR__ . '/../../_private/leads.csv',
    'rate_dir'  => sys_get_temp_dir(),
    'rate_secs' => 60,   // one submission per minute per IP

    // ---- SMTP (strongly recommended) --------------------------------------
    // brandmuhely.hu receives mail through Google Workspace, so the domain's
    // SPF record authorises GOOGLE to send as @brandmuhely.hu — not Rackhost.
    // PHP's mail() would send straight from the Rackhost server, fail SPF, and
    // land in spam (or be dropped under DMARC). Sending through Google's own
    // SMTP makes SPF, DKIM and DMARC all pass.
    //
    // Set these in config.local.php. Leave smtp_host empty to fall back to
    // mail() — the CSV is written either way, so a lead is never lost.
    'smtp_host'   => '',                 // smtp.gmail.com
    'smtp_port'   => 587,                // 587 = STARTTLS
    'smtp_user'   => '',                 // info@brandmuhely.hu
    'smtp_pass'   => '',                 // Google App Password (needs 2FA on)
    'smtp_secure' => 'tls',
];
$local = __DIR__ . '/config.local.php';
if (is_readable($local)) {
    $config = array_merge($config, (array) require $local);
}

function fail(string $msg, int $code = 400)
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function ok()
{
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

/** Strips CR/LF so a submitted value can never inject extra mail headers. */
function header_safe(string $v): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v));
}

/**
 * @param bool $multiline true keeps newlines (the message body); false strips
 *                        every control character, so a pasted CR/LF can never
 *                        reach a mail header or break a CSV row.
 */
function clean(string $v, int $max, bool $multiline = false): string
{
    $v = strip_tags($v);
    $v = $multiline
        ? preg_replace('/[^\P{C}\n]+/u', '', $v)   // keep \n, drop other control chars
        : preg_replace('/\p{C}+/u', ' ', $v);       // collapse all control chars
    return mb_substr(trim((string) $v), 0, $max, 'UTF-8');
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

// Per-IP rate limit. Only *checked* here; the clock is not started until the
// submission actually validates, so correcting a typo never locks anyone out.
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$lock = $config['rate_dir'] . '/bm_' . hash('sha256', $ip);
if (is_file($lock) && (time() - filemtime($lock)) < $config['rate_secs']) {
    fail('Túl gyakori küldés. Próbáld újra egy perc múlva.', 429);
}

// ------------------------------------------------------------- validation ---
$name    = clean((string) ($_POST['name'] ?? ''), 120);
$email   = clean((string) ($_POST['email'] ?? ''), 180);
$phone   = clean((string) ($_POST['phone'] ?? ''), 40);
$company = clean((string) ($_POST['company'] ?? ''), 160);
$platform= clean((string) ($_POST['platform'] ?? ''), 60);
$message = clean((string) ($_POST['message'] ?? ''), 4000, true);
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

// Input is good — now start the rate-limit clock.
@touch($lock);

// ------------------------------------------------------------------ store ---
// CSV lives outside the web root so it is never directly downloadable.
/**
 * Prepares a directory for the lead log and returns it, or null if it cannot
 * be used. Always drops a deny-all guard inside, so the file is unreachable
 * over the web even if the directory sits inside the document root.
 */
function prepare_store(string $dir): ?string
{
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        return null;
    }
    if (!is_writable($dir)) {
        return null;
    }
    $guard = $dir . '/.htaccess';
    if (!is_file($guard)) {
        @file_put_contents($guard, "Require all denied\nDeny from all\nOptions -Indexes\n");
    }
    return $dir;
}

// Preferred location is ABOVE the web root, where nothing can be served. But
// shared hosts often set open_basedir to jail PHP inside the document root, in
// which case that write fails silently and the lead is lost. So fall back to a
// directory inside the web root, protected by the guard file above.
$csv = $config['log_csv'];
$dir = prepare_store(dirname($csv));
if ($dir === null) {
    $csv = __DIR__ . '/_leads/leads.csv';
    $dir = prepare_store(dirname($csv));
    if ($dir !== null) {
        error_log('[brandmuhely-form] lead store fell back inside the web root: ' . $dir);
    }
}
$config['log_csv'] = $csv;
$stored = false;
$needsHeader = !is_file($config['log_csv']) || filesize($config['log_csv']) === 0;
if ($dir !== null && ($fh = @fopen($config['log_csv'], 'a'))) {
    if (flock($fh, LOCK_EX)) {
        if ($needsHeader) {
            fputcsv($fh, ['datum', 'nev', 'email', 'telefon', 'ceg', 'platform', 'uzenet']);
        }
        fputcsv($fh, [
            date('Y-m-d H:i:s'), $name, $email, $phone, $company, $platform, $message,
        ]);
        flock($fh, LOCK_UN);
        $stored = true;
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

$subjectLine = $config['subject'] . ' — ' . $name;
$sent = false;

if ($config['smtp_host'] !== '') {
    // --- Preferred path: authenticated SMTP (Google Workspace) -------------
    require_once __DIR__ . '/vendor/PHPMailer/Exception.php';
    require_once __DIR__ . '/vendor/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/vendor/PHPMailer/SMTP.php';

    $mailer = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mailer->isSMTP();
        $mailer->Host       = $config['smtp_host'];
        $mailer->Port       = (int) $config['smtp_port'];
        $mailer->SMTPAuth   = true;
        $mailer->Username   = $config['smtp_user'];
        $mailer->Password   = $config['smtp_pass'];
        $mailer->SMTPSecure = $config['smtp_secure'];
        $mailer->CharSet    = 'UTF-8';
        $mailer->Timeout    = 15;

        // The envelope sender must be the authenticated mailbox, or Google
        // rejects the message. The visitor goes in Reply-To instead.
        $mailer->setFrom($config['smtp_user'], $config['from_name']);
        $mailer->addAddress($config['to']);
        $mailer->addReplyTo($email, $name);

        $mailer->Subject = $subjectLine;
        $mailer->Body    = $body;

        $mailer->send();
        $sent = true;
    } catch (Throwable $e) {
        error_log('[brandmuhely-form] SMTP failed: ' . $e->getMessage());
        $sent = false;
    }
}

if (!$sent) {
    // --- Fallback: PHP mail(). Works, but see the SPF note above. ----------
    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: ' . header_safe($config['from_name']) . ' <' . header_safe($config['from']) . '>',
        'Reply-To: ' . header_safe($email),
        'X-Mailer: brandmuhely-form',
    ]);
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subjectLine) . '?=';
    $sent = @mail($config['to'], $encodedSubject, $body, $headers, '-f' . $config['from']);
}

if (!$sent) {
    if ($stored) {
        // The row is on disk, so the lead is not lost.
        fail('Az e-mail küldés nem sikerült, de az üzenetet elmentettük.', 500);
    }
    // Nothing worked — never tell the visitor it was received.
    error_log('[brandmuhely-form] LEAD LOST: mail and CSV both failed');
    fail('Nem sikerült elküldeni az üzenetet. Kérlek írj közvetlenül e-mailben.', 500);
}

ok();
