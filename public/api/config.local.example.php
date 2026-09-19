<?php
/**
 * Copy to config.local.php ON THE SERVER and fill in.
 * config.local.php is gitignored — never commit real credentials.
 */
return [
    'to'        => 'info@brandmuhely.hu',
    'from'      => 'no-reply@brandmuhely.hu',
    'from_name' => 'Brandműhely weboldal',
    'subject'   => 'Új üzenet a brandmuhely.hu oldalról',

    // ---- SMTP: strongly recommended ---------------------------------------
    // brandmuhely.hu uses Google Workspace for mail, so the domain's SPF record
    // authorises Google — not Rackhost — to send as @brandmuhely.hu. Without
    // SMTP, form notifications are sent by the Rackhost server, fail SPF, and
    // typically land in spam. Sending through Google fixes that completely.
    //
    // Generate an App Password (2-Step Verification must be on):
    //   https://myaccount.google.com/apppasswords
    'smtp_host'   => 'smtp.gmail.com',
    'smtp_port'   => 587,
    'smtp_user'   => 'info@brandmuhely.hu',
    'smtp_pass'   => 'xxxx xxxx xxxx xxxx',   // 16-character App Password
    'smtp_secure' => 'tls',
];
