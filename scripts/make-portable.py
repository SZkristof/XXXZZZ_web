#!/usr/bin/env python3
"""
Turns the absolute-path production build into a fully self-contained copy whose
links and assets are RELATIVE.

Why: the real site is served from a web root, so "/fonts/x.woff2" is correct
there. But that path is meaningless when the files are opened from disk or
hosted under a URL prefix. This rewrite makes the same build work in both
places — double-clickable locally, and publishable as a hosted preview.

Source dist/ is left untouched; output goes to preview/.
"""
import re, shutil, sys
from pathlib import Path

SRC = Path("dist")
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "preview")

if OUT.exists():
    shutil.rmtree(OUT)
shutil.copytree(SRC, OUT)

# Page routes the site links to, mapped to the file that actually serves them.
routes = {}
for html in OUT.rglob("*.html"):
    rel = html.relative_to(OUT)
    if rel.name == "index.html":
        route = "/" + str(rel.parent).replace("\\", "/")
        route = "/" if route in ("/.", "/") else route
    else:
        route = "/" + str(rel).replace("\\", "/")
    routes[route] = rel

ATTR = re.compile(r'((?:href|src|content)=")(/[^"#?]*)([^"]*)(")')

def rewrite(html_path: Path) -> int:
    depth = len(html_path.relative_to(OUT).parts) - 1
    up = "../" * depth if depth else "./"
    text = html_path.read_text(encoding="utf-8")
    n = 0

    def sub(m):
        nonlocal n
        pre, path, tail, post = m.groups()
        # Leave protocol-relative URLs and the canonical/og absolute URLs alone.
        if path.startswith("//"):
            return m.group(0)
        target = routes.get(path.rstrip("/") or "/") or routes.get(path)
        if target is not None:
            new = up + str(target).replace("\\", "/")
        else:
            asset = (OUT / path.lstrip("/"))
            if not asset.exists():
                return m.group(0)          # external or server-only (e.g. /api/…)
            new = up + path.lstrip("/")
        n += 1
        return f"{pre}{new}{tail}{post}"

    # Only rewrite inside <body>-relevant tags plus <head> assets; canonical and
    # og:url intentionally keep the production URL, so skip those two.
    text = re.sub(
        r'<link rel="canonical" href="[^"]*">|<meta property="og:url" content="[^"]*">',
        lambda m: m.group(0).replace('"', '\x00'), text)
    text = ATTR.sub(sub, text)
    text = text.replace('\x00', '"')

    html_path.write_text(text, encoding="utf-8")
    return n

total = sum(rewrite(p) for p in OUT.rglob("*.html"))
# The PHP endpoint cannot run in a static preview.
shutil.rmtree(OUT / "api", ignore_errors=True)
print(f"rewrote {total} references across {len(list(OUT.rglob('*.html')))} pages -> {OUT}/")
