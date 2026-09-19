# PHPMailer (vendored)

Version **6.9.3**, from https://github.com/PHPMailer/PHPMailer/tree/v6.9.3/src

Only the three files needed for SMTP sending are included. Vendored rather than
installed with Composer because Rackhost shared hosting has no Composer step —
the deploy is a plain file upload.

Upgrading: replace the three files from the matching upstream tag and re-run
`php -l` on each.

SHA-256 as vendored:
```
cbdd444f5514cfd0636fce6df9b69630076a0ace4667ccd4da8dfd665634d9d8  PHPMailer.php
0c55c416e779bcfced26893ede9a391f527eacef5b61d0cf751d19713d171eb7  SMTP.php
22ab858ae438d98f58f41f38ad2191d1b0d59570aebea0463a7948cfae1021b7  Exception.php
```
