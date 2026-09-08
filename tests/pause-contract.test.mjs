import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcePath = new URL('../Arquivos_Diversos/nuclear-challenge-app.tsx', import.meta.url);

test('the React game declares and renders the pause flow', async () => {
  const source = await readFile(sourcePath, 'utf8');

  assert.match(source, /const PauseButton/);
  assert.match(source, /const pauseGame = \(\) => \{ stopAlm\(\); stopGei\(\); setMode\('pause'\); \}/);
  assert.match(source, /const resumeGame = \(\) => \{ setMode\('play'\); \}/);
  assert.match(source, /<PauseButton onClick=\{pauseGame\} \/>/);
  assert.match(source, /mode === 'pause'/);
});

test('pausing is excluded from result persistence', async () => {
  const source = await readFile(sourcePath, 'utf8');

  assert.match(source, /mode === 'win' \|\| mode === 'lose' \|\| mode === 'quit'/);
  assert.doesNotMatch(source, /mode === 'pause'\) saveResult/);
});
