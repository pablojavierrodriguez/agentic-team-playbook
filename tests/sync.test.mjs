import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { classifyLocalFile, findOrphanedFiles } from '../scripts/sync-playbook.mjs';

/**
 * The canonicity decision table. These are the cases that determine whether a
 * user's edits survive a sync, so they are pinned explicitly.
 */
describe('classifyLocalFile', () => {
  test('a file byte-identical to what we installed is managed', () => {
    assert.equal(classifyLocalFile({
      localHash: 'aaa', knownHash: 'aaa', wasCustomization: false,
    }), 'managed');
  });

  test('a file that diverged from what we installed is a customization', () => {
    assert.equal(classifyLocalFile({
      localHash: 'bbb', knownHash: 'aaa', wasCustomization: false,
    }), 'customization');
  });

  test('a previously recorded customization stays a customization', () => {
    assert.equal(classifyLocalFile({
      localHash: 'bbb', knownHash: 'bbb', wasCustomization: true,
    }), 'customization');
  });

  test('with no baseline the verdict is unknown and needs evidence', () => {
    assert.equal(classifyLocalFile({
      localHash: 'aaa', knownHash: undefined, wasCustomization: false,
    }), 'unknown');
  });

  test('a recorded customization wins even when its hash matches the baseline', () => {
    // Regression guard: recording the local hash of a protected file used to
    // make the next sync treat it as managed and overwrite it silently.
    assert.equal(classifyLocalFile({
      localHash: 'aaa', knownHash: 'aaa', wasCustomization: true,
    }), 'customization');
  });
});

describe('findOrphanedFiles', () => {
  const makeProject = (files) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'playbook-orphans-'));
    for (const [rel, content] of Object.entries(files)) {
      const abs = path.join(dir, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content, 'utf8');
    }
    return dir;
  };

  test('reports framework files that are no longer in the plan', () => {
    const dir = makeProject({
      '.agents/TEAM_PLAYBOOK.md': 'x',
      '.agents/skills/principal-engineer/SKILL.md': 'x',
      '.agents/skills/legacy-vertical/SKILL.md': 'x',
      'README.md': 'not ours',
    });

    const orphans = findOrphanedFiles(dir, [
      '.agents/TEAM_PLAYBOOK.md',
      '.agents/skills/principal-engineer/SKILL.md',
    ]);

    assert.deepEqual(orphans, ['.agents/skills/legacy-vertical/SKILL.md']);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('returns nothing for a project without .agents', () => {
    const dir = makeProject({ 'main.go': 'package main' });
    assert.deepEqual(findOrphanedFiles(dir, []), []);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('never reports files outside .agents', () => {
    const dir = makeProject({ '.agents/STATE_MACHINE.md': 'x', 'docs/notes.md': 'x' });
    assert.deepEqual(findOrphanedFiles(dir, ['.agents/STATE_MACHINE.md']), []);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});