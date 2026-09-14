#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const file = process.argv[2];
if (!file || process.argv.includes('--help')) {
  console.error('Uso: node scripts/migrate-legacy.mjs <snapshot.json> [--dry-run]');
  process.exit(file ? 0 : 2);
}

const raw = await readFile(file, 'utf8');
const envelope = JSON.parse(raw);
const data = envelope?.schemaVersion === 1 && envelope.data ? envelope.data : envelope;
const operators = data?.operadores && typeof data.operadores === 'object' ? data.operadores : {};
const matches = Array.isArray(data?.partidas) ? data.partidas : [];
const digest = createHash('sha256').update(raw).digest('hex');
const result = {
  dryRun: process.argv.includes('--dry-run'), sourceSchemaVersion: envelope?.schemaVersion ?? null,
  sourceDigest: digest, operatorCount: Object.keys(operators).length, matchCount: matches.length,
  unsupported: { snapshots: 'legacy source has none', answerEvents: 'legacy source has none' },
};
console.log(JSON.stringify(result, null, 2));
