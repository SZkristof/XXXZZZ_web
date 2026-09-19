#!/usr/bin/env bash
#
# End-to-end test of the PHP contact handler against a built dist/.
# Requires php on PATH.  Usage:  npm run verify:form
#
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
PORT=8907
PASS=0; FAIL=0

cleanup() { kill "${PID:-}" 2>/dev/null; rm -rf "$TMP"; }
trap cleanup EXIT

[ -d "$ROOT/dist" ] || { echo "dist/ missing — run npm run build first."; exit 1; }
mkdir -p "$TMP"; cp -r "$ROOT/dist" "$TMP/web"

php -S "127.0.0.1:$PORT" -t "$TMP/web" >/dev/null 2>&1 &
PID=$!
for _ in $(seq 1 30); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 0.3; done

B="http://127.0.0.1:$PORT/api/contact.php"
LOCKS="${TMPDIR:-/tmp}/bm_*"

check() { # name, expected_code, curl args...
  local name="$1" want="$2"; shift 2
  rm -f $LOCKS
  local got; got=$(curl -sS -o "$TMP/body" -w "%{http_code}" "$@" "$B")
  if [ "$got" = "$want" ]; then printf '  ✓ %-38s %s\n' "$name" "$got"; PASS=$((PASS+1))
  else printf '  ✗ %-38s got %s, want %s — %s\n' "$name" "$got" "$want" "$(head -c 70 "$TMP/body")"; FAIL=$((FAIL+1)); fi
}

echo "Contact form handler"
check "GET rejected"            405 -X GET
check "honeypot silently accepted" 200 -X POST -d "website=bot&name=x&email=a@b.hu&message=hi&privacy=1"
check "missing name rejected"   400 -X POST -d "email=a@b.hu&message=hi&privacy=1"
check "invalid e-mail rejected" 400 -X POST -d "name=T&email=notanemail&message=hi&privacy=1"
check "consent required"        400 -X POST -d "name=T&email=a@b.hu&message=hi"

# Mail cannot send in CI, so a valid post answers 500 — the CSV row is still
# written, which is the behaviour that matters.
rm -f $LOCKS
curl -sS -o /dev/null -X POST -d "name=Teszt Elek" -d "email=teszt@pelda.hu" \
  -d "phone=+36301234567" -d "company=Pelda Kft" -d "platform=Meta Ads" \
  --data-urlencode "message=Érdekelne a képzés, hogyan tovább?" -d "privacy=1" "$B"
rm -f $LOCKS
curl -sS -o /dev/null -X POST --data-urlencode $'name=Evil\r\nBcc: attacker@evil.com' \
  -d "email=a@b.hu" -d "message=masodik" -d "privacy=1" "$B"

# Rate limit: second post with the lock left in place must be refused.
got=$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
  -d "name=T3&email=t3@p.hu&message=m&privacy=1" "$B")
if [ "$got" = "429" ]; then printf '  ✓ %-38s 429\n' "rate limit enforced"; PASS=$((PASS+1))
else printf '  ✗ %-38s got %s, want 429\n' "rate limit enforced" "$got"; FAIL=$((FAIL+1)); fi

echo
echo "Lead storage"
CSV="$TMP/_private/leads.csv"
ok() { if [ "$1" = "1" ]; then printf '  ✓ %s\n' "$2"; PASS=$((PASS+1)); else printf '  ✗ %s\n' "$2"; FAIL=$((FAIL+1)); fi; }

[ -f "$CSV" ] && ok 1 "CSV written outside the web root" || ok 0 "CSV written outside the web root"
[ -f "$TMP/_private/.htaccess" ] && ok 1 "deny-all guard created" || ok 0 "deny-all guard created"
[ ! -e "$TMP/web/_private" ] && ok 1 "nothing written inside the web root" || ok 0 "nothing written inside the web root"

if [ -f "$CSV" ]; then
  h=$(grep -c '^datum,nev' "$CSV" || true)
  [ "$h" = "1" ] && ok 1 "header row written exactly once" || ok 0 "header row written $h times"
  grep -q 'Érdekelne a képzés, hogyan tovább?' "$CSV" && ok 1 "Hungarian accents preserved" || ok 0 "Hungarian accents preserved"
  grep -q 'Evil Bcc: attacker@evil.com' "$CSV" && ok 1 "CRLF collapsed, no header injection" || ok 0 "CRLF collapsed, no header injection"
  # Two stored leads expected: the honeypot post is deliberately not stored,
  # and the third is refused by the rate limiter.
  rows=$(tail -n +2 "$CSV" | grep -c '^"20') || true
  [ "$rows" = "2" ] && ok 1 "one line per lead, honeypot not stored" || ok 0 "one line per lead (got $rows, want 2)"
fi

# --- Fallback: simulate a host whose open_basedir jails PHP inside the web
# root, so the preferred store above it cannot be created. The lead must still
# land somewhere guarded rather than being lost.
echo
echo "Lead storage fallback (open_basedir-style jail)"
kill "$PID" 2>/dev/null; sleep 0.3
# The jail must live OUTSIDE the system temp dir: open_basedir has to allow
# /tmp for the rate-limit lock, so a jail inside /tmp would not be a jail.
JAIL="$ROOT/.verify-jail"; rm -rf "$JAIL"; mkdir -p "$JAIL"
cp -r "$ROOT/dist" "$JAIL/web"
php -S "127.0.0.1:$((PORT+1))" -t "$JAIL/web" \
  -d open_basedir="$JAIL/web:${TMPDIR:-/tmp}" >/dev/null 2>&1 &
PID=$!
for _ in $(seq 1 30); do curl -sf -o /dev/null "http://127.0.0.1:$((PORT+1))/" && break; sleep 0.3; done
rm -f $LOCKS
code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST -d "name=Jail Teszt" \
  -d "email=jail@pelda.hu" -d "message=fallback" -d "privacy=1" \
  "http://127.0.0.1:$((PORT+1))/api/contact.php")
FB="$JAIL/web/api/_leads/leads.csv"
[ -f "$FB" ] && ok 1 "lead stored in the in-root fallback" || ok 0 "lead stored in the in-root fallback"
[ -f "$JAIL/web/api/_leads/.htaccess" ] && ok 1 "fallback carries a deny-all guard" || ok 0 "fallback carries a deny-all guard"
if [ -f "$FB" ]; then
  grep -q "jail@pelda.hu" "$FB" && ok 1 "fallback row is complete" || ok 0 "fallback row is complete"
fi
# 500 is expected (no mail server here), but the message must say it was saved.
[ "$code" = "500" ] && ok 1 "reports mail failure, not silent success" || ok 0 "reports mail failure (got $code)"
rm -rf "$JAIL"

echo
if [ "$FAIL" -eq 0 ]; then echo "All $PASS form checks passed."; else echo "$FAIL of $((PASS+FAIL)) checks FAILED."; exit 1; fi
