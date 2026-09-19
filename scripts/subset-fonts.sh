#!/usr/bin/env bash
# Prepares the brand typefaces for the web:
#   1. narrows Archivo's wdth axis to 105-112, the only widths the brand book
#      uses (~35% smaller than shipping the full 62-125 range)
#   2. subsets both families to the Hungarian character set
#
# Axes kept: Archivo wght 100-900 + wdth 105-112 (titles sit at 110-112);
#            Hanken Grotesk wght 100-900 (lead 200, body/small 300).
#
# Fontsource splits by unicode block, so both files per family are processed:
#   *-latin      Basic Latin + Latin-1 (a-z, á é í ó ö ú ü) + punctuation
#   *-latin-ext  Latin Extended-A, which is where Ő ő Ű ű live
set -euo pipefail
cd "$(dirname "$0")/.."

LATIN="U+0020-007E,U+00A0-00FF,U+2010-2015,U+2018-201F,U+2026,U+2039-203A,U+20AC"
LATIN_EXT="U+0100-017F"
A="node_modules/@fontsource-variable/archivo/files"
H="node_modules/@fontsource-variable/hanken-grotesk/files"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

narrow () { # in out  — restrict Archivo's width axis
  python3 - "$1" "$2" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
f = instancer.instantiateVariableFont(TTFont(sys.argv[1]), {"wdth": (105, 112)},
                                      inplace=False, updateFontNames=False)
f.flavor = "woff2"; f.save(sys.argv[2])
PY
}

subset () { # in out unicodes
  pyftsubset "$1" --output-file="$2" --flavor=woff2 \
    --layout-features='kern,liga,calt,tnum' \
    --unicodes="$3" --no-hinting --desubroutinize --drop-tables+=DSIG
}

mkdir -p public/fonts; rm -f public/fonts/*.woff2

narrow "$A/archivo-latin-wdth-normal.woff2"     "$TMP/a-latin.woff2"
narrow "$A/archivo-latin-ext-wdth-normal.woff2" "$TMP/a-latin-ext.woff2"

subset "$TMP/a-latin.woff2"     public/fonts/archivo-latin.woff2     "$LATIN"
subset "$TMP/a-latin-ext.woff2" public/fonts/archivo-latin-ext.woff2 "$LATIN_EXT"
subset "$H/hanken-grotesk-latin-wght-normal.woff2"     public/fonts/hanken-latin.woff2     "$LATIN"
subset "$H/hanken-grotesk-latin-ext-wght-normal.woff2" public/fonts/hanken-latin-ext.woff2 "$LATIN_EXT"

du -ch public/fonts/*.woff2 | tail -1
