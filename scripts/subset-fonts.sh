#!/usr/bin/env bash
# Subsets the variable fonts to the glyphs a Hungarian site actually needs,
# keeping the full wght axis so every weight still comes from one file.
#
# Fontsource splits by unicode block, so we subset BOTH source files per family:
#   *-latin      → Basic Latin + Latin-1 Supplement (a-z, á é í ó ö ú ü, ×, ·)
#                  and general punctuation (– — … „ ” → €)
#   *-latin-ext  → Latin Extended-A, which is where Ő ő Ű ű live
# Two @font-face rules per family then split them by unicode-range, so a
# browser fetches only the blocks a given page actually uses.
set -euo pipefail
cd "$(dirname "$0")/.."

LATIN="U+0020-007E,U+00A0-00FF,U+2010-2015,U+2018-201F,U+2026,U+2039-203A,U+20AC,U+2192"
LATIN_EXT="U+0100-017F"

SRC_A="node_modules/@fontsource-variable/archivo/files"
SRC_I="node_modules/@fontsource-variable/inter/files"

subset () { # $1=in $2=out $3=unicodes
  pyftsubset "$1" \
    --output-file="$2" \
    --flavor=woff2 \
    --layout-features='kern,liga,calt,tnum,cv05,cv11,ss01' \
    --unicodes="$3" \
    --no-hinting --desubroutinize --drop-tables+=DSIG
}

subset "$SRC_A/archivo-latin-wght-normal.woff2"     public/fonts/archivo-latin.woff2     "$LATIN"
subset "$SRC_A/archivo-latin-ext-wght-normal.woff2" public/fonts/archivo-latin-ext.woff2 "$LATIN_EXT"
subset "$SRC_I/inter-latin-wght-normal.woff2"       public/fonts/inter-latin.woff2       "$LATIN"
subset "$SRC_I/inter-latin-ext-wght-normal.woff2"   public/fonts/inter-latin-ext.woff2   "$LATIN_EXT"

rm -f public/fonts/archivo-hu.woff2 public/fonts/inter-hu.woff2
ls -la public/fonts/
