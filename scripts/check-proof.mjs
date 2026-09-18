/** Blocks a production build while invented testimonials are still in place. */
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/data/proof.ts', import.meta.url), 'utf8');
const isPlaceholder = /PROOF_IS_PLACEHOLDER\s*=\s*true/.test(src);

if (isPlaceholder) {
  console.error(
    '\n\x1b[41m\x1b[97m  ÉLES BUILD LEÁLLÍTVA  \x1b[0m\n\n' +
      '  A src/data/proof.ts még kitalált vélemény- és eredményadatokat tartalmaz.\n' +
      '  Kitalált vélemények publikálása Magyarországon jogszabálysértő.\n\n' +
      '  Cseréld valós adatokra, majd állítsd: PROOF_IS_PLACEHOLDER = false\n',
  );
  process.exit(1);
}
console.log('✓ Proof data is real — production build allowed.');
