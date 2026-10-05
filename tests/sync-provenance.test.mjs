import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { findCanonicalProvenance } from '../scripts/sync-playbook.mjs';

const realFetch = globalThis.fetch;

afterEach(() => { globalThis.fetch = realFetch; });

/**
 * Builds a fake GitHub: /commits?path= returns the revision list, and
 * raw.githubusercontent returns the content that existed at each revision.
 */
function stubGitHub({ revisions, blobs }) {
  const calls = [];
  globalThis.fetch = async (url) => {
    const target = String(url);
    calls.push(target);

    if (target.includes('/commits?path=')) {
      const body = revisions.map((sha) => ({ sha }));
      return { ok: true, status: 200, json: async () => body };
    }
    const sha = target.match(/\/([0-9a-f]{7,40})\//)?.[1];
    const content = sha ? blobs[sha] : undefined;
    if (content === undefined) return { ok: false, status: 404, statusText: 'Not Found' };
    return { ok: true, status: 200, text: async () => content };
  };
  return calls;
}

describe('findCanonicalProvenance', () => {
  test('recognises an older canonical revision and names the commit', async () => {
    const local = 'v1 content';
    const calls = stubGitHub({
      revisions: ['aaaaaaa', 'bbbbbbb'],
      blobs: { bbbbbbb: 'v2 content', aaaaaaa: local },
    });

    const result = await findCanonicalProvenance('o/r', '.agents/skills/x/SKILL.md', local);

    assert.equal(result.status, 'canonical');
    assert.equal(result.sha, 'aaaaaaa', 'must report which published revision matched');
    assert.equal(calls.length, 2, 'history call plus the one fetch that matched; it stops there');
  });

  test('reports custom when no published revision matches', async () => {
    const calls = stubGitHub({
      revisions: ['aaaaaaa', 'bbbbbbb'],
      blobs: { aaaaaaa: 'v1', bbbbbbb: 'v2' },
    });

    const result = await findCanonicalProvenance('o/r', '.agents/skills/x/SKILL.md', 'hand edited');

    assert.equal(result.status, 'custom');
    assert.equal(calls.length, 3);
  });

  test('fails safe to unknown when the history API is unavailable', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 503, statusText: 'Service Unavailable' });

    const result = await findCanonicalProvenance('o/r', '.agents/skills/x/SKILL.md', 'anything');

    assert.equal(result.status, 'unknown');
    assert.match(result.reason, /history unavailable/);
  });

  test('fails safe to unknown when the request budget runs out', async () => {
    stubGitHub({
      revisions: ['aaaaaaa', 'bbbbbbb', 'ccccccc'],
      blobs: { aaaaaaa: 'a', bbbbbbb: 'b', ccccccc: 'c' },
    });

    // budget of 1 covers the history call, leaving none for content fetches
    const budget = { take: () => true, remaining: 0 };
    let left = 1;
    const capped = { take: () => (left > 0 ? (left -= 1, true) : false), remaining: 0 };

    const result = await findCanonicalProvenance('o/r', '.agents/skills/x/SKILL.md', 'local', capped);

    assert.equal(result.status, 'unknown');
    assert.match(result.reason, /budget exhausted/);
    assert.ok(budget);
  });

  test('skips revisions whose blob no longer exists', async () => {
    stubGitHub({
      revisions: ['aaaaaaa', 'bbbbbbb'],
      blobs: { bbbbbbb: 'current content' },
    });

    const result = await findCanonicalProvenance('o/r', '.agents/skills/x/SKILL.md', 'local copy');

    assert.equal(result.status, 'custom', 'a 404 on one revision is not a match');
  });
});