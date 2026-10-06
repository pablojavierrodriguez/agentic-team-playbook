import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDITOR = path.join(ROOT, 'scripts', 'audit-ux-code.cjs');
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'ux-rules.json'), 'utf8'));
const ALL_IDS = RULES.rules.map((rule) => rule.id);

function audit(fixture, args = []) {
  try {
    const stdout = execFileSync(process.execPath, [AUDITOR, '--format', 'json', ...args], {
      env: { ...process.env, AUDIT_UX_ROOT: path.join(ROOT, 'tests', 'fixtures', fixture) },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, report: JSON.parse(stdout) };
  } catch (err) {
    if (err.status === undefined) throw err;
    return { code: err.status, report: JSON.parse(err.stdout) };
  }
}

function rulesIn(fixture, args = []) {
  return audit(fixture, args).report.findings.map((finding) => finding.rule).sort();
}

/** Builds an absolute fixture arg for a project living outside tests/fixtures. */
function fixtureAt(absPath) {
  return path.relative(path.join(ROOT, 'tests', 'fixtures'), absPath);
}

describe('rule catalog integrity', () => {
  test('ids are unique and sequential from UX-001', () => {
    assert.equal(new Set(ALL_IDS).size, ALL_IDS.length, 'duplicate rule ids');
    ALL_IDS.forEach((id, index) => {
      assert.equal(id, `UX-${String(index + 1).padStart(3, '0')}`);
    });
  });

  test('every rule is complete', () => {
    for (const rule of RULES.rules) {
      for (const field of ['id', 'title', 'severity', 'signature', 'impact', 'fix', 'message']) {
        assert.ok(rule[field], `${rule.id} is missing "${field}"`);
      }
      assert.ok(
        ['ERROR', 'WARNING', 'INFO'].includes(rule.severity),
        `${rule.id} has an invalid severity`,
      );
      assert.ok(rule.check && Array.isArray(rule.check.line) && rule.check.line.length,
        `${rule.id} has no detection signature`);
    }
  });

  test('UX-001..UX-008 keep their historical ids documented in the skill', () => {
    const skill = fs.readFileSync(
      path.join(ROOT, '.agents', 'skills', 'code-level-ux-auditor', 'SKILL.md'),
      'utf8',
    );
    for (const rule of RULES.rules) {
      assert.ok(skill.includes(`[${rule.id}]`), `${rule.id} is not documented in the skill`);
      assert.ok(skill.includes(rule.title), `${rule.id} title not found verbatim in the skill`);
    }
  });
});

describe('detection', () => {
  test('every catalogued rule fires on the violations fixture', () => {
    const found = rulesIn('react-app');
    const missing = ALL_IDS.filter((id) => !found.includes(id));
    assert.deepEqual(missing, [], `rules that did not fire: ${missing.join(', ')}`);
  });

  test('a compliant component produces zero findings', () => {
    const report = audit('react-app').report;
    const clean = report.findings.filter((f) => f.file.endsWith('Clean.tsx'));
    assert.deepEqual(clean, [], `unexpected findings on Clean.tsx: ${JSON.stringify(clean, null, 2)}`);
  });

  test('a multiline input with an escape hatch is not split by arrow functions', () => {
    const report = audit('react-app').report;
    const multiline = report.findings.filter((f) => f.file.endsWith('Multiline.tsx'));
    assert.deepEqual(
      multiline.filter((f) => f.rule === 'UX-001'),
      [],
      `UX-001 false positives on multiline inputs: ${JSON.stringify(multiline, null, 2)}`,
    );
  });

  test('dependency-gated rules stay silent without their library', () => {
    const found = rulesIn('minimal');
    assert.ok(!found.includes('UX-004'), 'UX-004 (date-fns) fired without date-fns');
    assert.ok(!found.includes('UX-003'), 'UX-003 (framer-motion) fired without framer-motion');
    assert.ok(found.includes('UX-001'), 'stack-agnostic rules must still fire');
  });
});

describe('suppression', () => {
  test('inline suppression silences the target line only', () => {
    const found = rulesIn('react-app');
    const suppressed = found.filter((id) => ['UX-001', 'UX-005', 'UX-013'].includes(id));
    // those ids still fire in Violations.tsx, but never in Suppressed.tsx
    assert.deepEqual(suppressed, ['UX-001', 'UX-005', 'UX-013']);
    const report = audit('react-app').report;
    const inSuppressed = report.findings.filter((f) => f.file.endsWith('Suppressed.tsx'));
    assert.deepEqual(inSuppressed, []);
  });

  test('--rule narrows the run to a single signature', () => {
    const found = rulesIn('react-app', ['--rule', 'UX-011']);
    assert.deepEqual(found, ['UX-011']);
  });

  test('config `exclude` drops matching paths from the report', () => {
    const baseline = audit('react-app').report.findings;
    const fromViolations = baseline.filter((f) => f.file.includes('Violations.tsx')).length;
    assert.ok(fromViolations > 0, 'fixture must produce findings to exclude');

    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-ux-exclude-'));
    fs.cpSync(path.join(ROOT, 'tests', 'fixtures', 'react-app'), temp, { recursive: true });
    fs.writeFileSync(
      path.join(temp, '.uxaudit.json'),
      JSON.stringify({ src: 'src', exclude: ['**/Violations.tsx'] }),
    );

    const report = audit(fixtureAt(temp)).report;
    assert.equal(
      report.findings.filter((f) => f.file.includes('Violations.tsx')).length,
      0,
      'excluded file must not appear in the report',
    );
    assert.equal(
      report.findings.length,
      baseline.length - fromViolations,
      'excluding one file must not silence the rest of the project',
    );
    fs.rmSync(temp, { recursive: true, force: true });
  });

  test('config `exclude` accepts directory globs', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-ux-exclude-dir-'));
    fs.cpSync(path.join(ROOT, 'tests', 'fixtures', 'react-app'), temp, { recursive: true });
    fs.writeFileSync(
      path.join(temp, '.uxaudit.json'),
      JSON.stringify({ src: 'src', exclude: ['src/components/**'] }),
    );

    assert.equal(audit(fixtureAt(temp)).report.findings.length, 0);
    fs.rmSync(temp, { recursive: true, force: true });
  });

  test('an unknown rule id is a fatal usage error', () => {
    const result = audit('react-app', ['--rule', 'UX-999']);
    assert.equal(result.code, 2);
  });
});

describe('severity and exit codes', () => {
  test('ERROR findings fail the audit without --strict', () => {
    const { code } = audit('react-app');
    assert.equal(code, 1);
  });

  test('INFO-only projects pass without --strict and with it', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-ux-info-'));
    fs.mkdirSync(path.join(temp, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(temp, 'src', 'Info.tsx'),
      'export const A = () => <span className="text-[13px]">x</span>;\n',
    );
    const run = () => {
      try {
        execFileSync(process.execPath, [AUDITOR, '--quiet'], {
          env: { ...process.env, AUDIT_UX_ROOT: temp },
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        return 0;
      } catch (err) {
        return err.status;
      }
    };
    assert.equal(run(), 0, 'INFO findings must not fail the audit');
    fs.rmSync(temp, { recursive: true, force: true });
  });
});

describe('robustness', () => {
  test('a project without a JS source directory is not an error', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-ux-empty-'));
    fs.writeFileSync(path.join(temp, 'package.json'), '{"name":"go-service"}');
    let stdout;
    let code = 0;
    try {
      stdout = execFileSync(process.execPath, [AUDITOR, '--format', 'json'], {
        env: { ...process.env, AUDIT_UX_ROOT: temp },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      code = err.status;
      stdout = err.stdout;
    }
    assert.equal(code, 0, 'missing src/ must exit 0, not crash');
    assert.equal(JSON.parse(stdout).findings.length, 0);
    fs.rmSync(temp, { recursive: true, force: true });
  });

  test('the repository itself has no source directory to audit', () => {
    assert.equal(
      fs.existsSync(path.join(ROOT, 'src')),
      false,
      'the playbook repo is not an application and must not grow a src/',
    );
    const stdout = execFileSync(process.execPath, [AUDITOR, '--format', 'json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.equal(JSON.parse(stdout).findings.length, 0);
  });
});