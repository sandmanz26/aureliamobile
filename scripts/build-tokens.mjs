#!/usr/bin/env node
// Reads design-tokens/figma-export.json (the raw Figma variable snapshot)
// and generates src/styles/tokens.css — a Tailwind v4 `@theme` block.
//
// This is the ONLY file that should be hand-edited when tokens change.
// Everything under src/styles/tokens.css is generated — re-run this script
// after re-syncing figma-export.json from Figma, never edit tokens.css by hand.
//
// Usage: npm run build:tokens

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const raw = JSON.parse(readFileSync(path.join(root, 'design-tokens/figma-export.json'), 'utf-8'));
const c = raw.collections;

const lines = [];
lines.push('/**');
lines.push(' * GENERATED FILE — do not edit by hand.');
lines.push(' * Source: design-tokens/figma-export.json');
lines.push(' * Regenerate: npm run build:tokens');
lines.push(' *');
lines.push(' * Variable names mirror the Figma variable paths 1:1 (slashes -> hyphens)');
lines.push(' * so a designer renaming/adding a Figma variable maps directly to a');
lines.push(' * predictable CSS custom property here — no manual code changes needed');
lines.push(' * beyond re-running this script.');
lines.push(' */');
lines.push('@import "tailwindcss";');
lines.push('');
lines.push('@theme {');

// ---- Colors: raw hue ramps (Aurelia Brand) ----
lines.push('  /* Aurelia Brand — raw hue ramps */');
for (const [hue, shades] of Object.entries(c['Aurelia Brand'])) {
  if (typeof shades === 'string') { lines.push(`  --color-${hue}: ${shades};`); continue; }
  for (const [shade, hex] of Object.entries(shades)) {
    lines.push(`  --color-${hue}-${shade}: ${hex};`);
  }
}
lines.push('');

// ---- Colors: role ramps (Aurelia Primitives) ----
lines.push('  /* Aurelia Primitives — role ramps (primary/neutral/danger/warning/info/success) */');
for (const [role, shades] of Object.entries(c['Aurelia Primitives'])) {
  if (role === 'base') {
    for (const [name, hex] of Object.entries(shades)) lines.push(`  --color-base-${name}: ${hex};`);
    continue;
  }
  for (const [shade, hex] of Object.entries(shades)) {
    lines.push(`  --color-${role}-${shade}: ${hex};`);
  }
}
lines.push('');

// ---- Colors: semantic tokens (Aurelia Semantic) ----
lines.push('  /* Aurelia Semantic — role-based tokens consumed by components */');
function flattenSemantic(obj, prefix) {
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}-${key}` : key;
    if (typeof val === 'string') {
      lines.push(`  --color-${path}: ${val};`);
    } else {
      flattenSemantic(val, path);
    }
  }
}
flattenSemantic(c['Aurelia Semantic'], '');
lines.push('');

// ---- Numbers: spacing scale drives Tailwind's multiplier ----
lines.push('  /* Aurelia Numbers — spacing base unit set to 1px so p-2/m-16/gap-24 etc.');
lines.push('     map 1:1 to Figma spacing/2, spacing/16, spacing/24 ... */');
lines.push('  --spacing: 1px;');
lines.push('');
lines.push('  /* radius scale */');
for (const [name, val] of Object.entries(c['Aurelia Numbers'].radius)) {
  const px = name === 'full' ? '9999px' : `${val}px`;
  lines.push(`  --radius-${name}: ${px};`);
}
lines.push('');
lines.push('  /* size scale (icons/avatars/touch targets) */');
for (const [name, val] of Object.entries(c['Aurelia Numbers'].size)) {
  lines.push(`  --size-${name}: ${val}px;`);
}
lines.push('');

// ---- Typography ----
lines.push('  /* Aurelia Typography */');
lines.push(`  --font-sans: "${c['Aurelia Typography']['font-family'].base}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`);
for (const [name, val] of Object.entries(c['Aurelia Typography']['font-weight'])) {
  lines.push(`  --font-weight-${name}: ${val};`);
}
for (const [name, val] of Object.entries(c['Aurelia Typography']['letter-spacing'])) {
  lines.push(`  --tracking-${name}: ${val}px;`);
}
for (const [size, { fontSize, lineHeight }] of Object.entries(c['Aurelia Typography'].scale)) {
  lines.push(`  --text-${size}: ${fontSize}px;`);
  lines.push(`  --text-${size}--line-height: ${lineHeight}px;`);
}
lines.push('}');
lines.push('');

// ---- Named text styles as component classes (font-family+size+line-height+weight bundles) ----
lines.push('/* Named type-scale utilities mirroring the Aurelia/* Figma text styles.');
lines.push('   Usage: className="text-style-title-large" */');
for (const [name, { size, weight }] of Object.entries(c['Aurelia Typography'].textStyles)) {
  lines.push(`.text-style-${name} {`);
  lines.push(`  font-family: var(--font-sans);`);
  lines.push(`  font-size: var(--text-${size});`);
  lines.push(`  line-height: var(--text-${size}--line-height);`);
  lines.push(`  font-weight: var(--font-weight-${weight});`);
  lines.push('}');
}
lines.push('');

const output = lines.join('\n');
writeFileSync(path.join(root, 'src/styles/tokens.css'), output);
console.log(`Wrote src/styles/tokens.css (${output.split('\n').length} lines)`);
