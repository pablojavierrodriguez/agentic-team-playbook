#!/usr/bin/env node

'use strict';

/**
 * scripts/audit-ux-code.cjs
 *
 * Generic static UX / ergonomics auditor.
 *
 * This file is only an ENGINE. All detection knowledge lives in
 * scripts/ux-rules.json, which is the single source of truth shared with
 * .agents/skills/code-level-ux-auditor/SKILL.md.
 *
 * Design constraints:
 *  - Stack agnostic. Rules that depend on a library (date-fns, framer-motion)
 *    declare `requires.deps` and are skipped when the dependency is absent.
 *  - Project agnostic. No file names, no project names, no hardcoded paths.
 *  - Never crashes on a missing source directory or a non-JS project.
 *
 * Usage:
 *   node scripts/audit-ux-code.cjs [options]
 *
 * Options:
 *   --src <dir>        Source directory to scan (default: auto-detect)
 *   --config <file>    Config file (default: .uxaudit.json in project root)
 *   --strict           Exit 1 on WARNING as well as ERROR
 *   --format <fmt>     human (default) | json
 *   --list-rules       Print the rule catalog and exit
 *   --rule <ID>        Only run this rule (repeatable)
 *   --quiet            Only print the summary
 *   --help             Print usage
 *
 * Exit codes:
 *   0  no blocking findings (or nothing to scan)
 *   1  blocking findings present
 *   2  fatal error (bad config, unreadable rules file)
 */

const fs = require('fs');
const path = require('path');

// ROOT is the project being audited. When the script is synced into a target
// repo it lands in <target>/scripts/, so __dirname/.. is already correct.
// AUDIT_UX_ROOT allows pointing the auditor at another project explicitly.
const ROOT = process.env.AUDIT_UX_ROOT
  ? path.resolve(process.env.AUDIT_UX_ROOT)
  : path.resolve(__dirname, '..');
const RULES_PATH = path.join(__dirname, 'ux-rules.json');
const CONFIG_NAME = '.uxaudit.json';

const SEVERITY_ORDER = ['ERROR', 'WARNING', 'INFO'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next',
  '.turbo', '.svelte-kit', '.cache', 'vendor', '__tests__', '__mocks__',
  '__snapshots__', 'storybook', 'stories', 'e2e', 'cypress',
]);
const SKIP_FILE_PATTERN = /(\.test\.|\.spec\.|\.stories\.|\.d\.ts$|^\.env)/;

const OUTPUT_FORMAT = process.argv.includes('--format')
  ? process.argv[process.argv.indexOf('--format') + 1]
  : 'human';

function fatal(message) {
  if (OUTPUT_FORMAT === 'json') {
    console.log(JSON.stringify({ error: message, findings: [] }, null, 2));
  } else {
    console.error(`\n❌ audit-ux: ${message}\n`);
  }
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    src: null,
    config: null,
    strict: false,
    format: 'human',
    listRules: false,
    rules: [],
    quiet: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--src': opts.src = argv[++i]; break;
      case '--config': opts.config = argv[++i]; break;
      case '--strict': opts.strict = true; break;
      case '--format': opts.format = argv[++i]; break;
      case '--list-rules': opts.listRules = true; break;
      case '--rule': opts.rules.push(argv[++i]); break;
      case '--quiet': opts.quiet = true; break;
      case '--help':
      case '-h': opts.help = true; break;
      default:
        if (arg.startsWith('--')) fatal(`Unknown option: ${arg}`);
    }
  }

  if (!['human', 'json'].includes(opts.format)) {
    fatal(`Unknown --format "${opts.format}". Expected "human" or "json".`);
  }

  return opts;
}

function loadRules() {
  let raw;
  try {
    raw = fs.readFileSync(RULES_PATH, 'utf8');
  } catch {
    fatal(`Cannot read the rule catalog at ${RULES_PATH}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    fatal(`Rule catalog is not valid JSON: ${err.message}`);
  }

  if (!Array.isArray(parsed.rules) || parsed.rules.length === 0) {
    fatal('Rule catalog contains no rules.');
  }

  const seen = new Set();
  for (const rule of parsed.rules) {
    for (const field of ['id', 'title', 'severity', 'message']) {
      if (!rule[field]) fatal(`Rule is missing required field "${field}": ${JSON.stringify(rule)}`);
    }
    if (!SEVERITY_ORDER.includes(rule.severity)) {
      fatal(`Rule ${rule.id} has invalid severity "${rule.severity}".`);
    }
    if (seen.has(rule.id)) fatal(`Duplicate rule id: ${rule.id}`);
    seen.add(rule.id);
  }

  return { version: parsed.version || 1, rules: parsed.rules };
}

function loadConfig(opts) {
  const configPath = opts.config
    ? path.resolve(ROOT, opts.config)
    : path.join(ROOT, CONFIG_NAME);

  if (!fs.existsSync(configPath)) return { configPath, config: {} };

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return { configPath, config: config || {} };
  } catch (err) {
    fatal(`Config file ${configPath} is not valid JSON: ${err.message}`);
  }
}

function detectSourceDir(explicit, config) {
  if (explicit) {
    const resolved = path.resolve(ROOT, explicit);
    if (!fs.existsSync(resolved)) fatal(`--src directory does not exist: ${resolved}`);
    return resolved;
  }

  if (config.src) {
    const resolved = path.resolve(ROOT, config.src);
    if (!fs.existsSync(resolved)) fatal(`Config "src" directory does not exist: ${resolved}`);
    return resolved;
  }

  for (const candidate of ['src', 'app', 'frontend', 'web', 'client']) {
    const resolved = path.join(ROOT, candidate);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) return resolved;
  }

  return null;
}

function loadDependencies() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) return new Set();

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]);
  } catch {
    return new Set();
  }
}

function collectFiles(dir, out = [], unreadable = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    unreadable.push({ dir, error: err.message });
    return out;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectFiles(full, out, unreadable);
    } else if (SCAN_EXTENSIONS.includes(path.extname(entry.name))) {
      if (SKIP_FILE_PATTERN.test(entry.name)) continue;
      out.push(full);
    }
  }

  return out;
}

/** Returns '*' for a blanket suppression or the list of suppressed rule ids. */
function readSuppression(line) {
  const match = line.match(/ux-audit-ignore\s*([A-Z]+-\d+)?/);
  if (!match) return null;
  return match[1] || '*';
}

function buildWindow(lines, index, radius) {
  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length, index + radius + 1);
  return lines.slice(start, end).join('\n');
}

const TAG_OPEN = /<[A-Za-z][\w.]*/g;

/**
 * Groups lines into logical units.
 *
 * A JSX element whose attributes span several lines must be matched as ONE
 * unit, otherwise an escape hatch like inputMode="decimal" sitting on the next
 * line is invisible and the rule reports a false positive. That formatting is
 * what every formatter produces, so line-by-line matching is not enough.
 *
 * A unit keeps growing while it holds more JSX tag openings than tag closes.
 * Comparison and arrow operators contribute no tag opening, so ordinary
 * statements always close their own unit and are never over-merged.
 */
function buildUnits(lines) {
  const units = [];
  let current = null;

  lines.forEach((line, index) => {
    if (!current) {
      current = { startLine: index + 1, parts: [line] };
    } else {
      current.parts.push(line);
    }

    const text = current.parts.join('\n');
    const opens = (text.match(TAG_OPEN) || []).length;
    const closes = (text.match(/>/g) || []).length;

    if (opens <= closes) {
      current.text = text;
      units.push(current);
      current = null;
    }
  });

  if (current) {
    current.text = current.parts.join('\n');
    units.push(current);
  }

  return units;
}

function ruleAppliesToProject(rule, relPath, deps) {
  const check = rule.check || {};

  if ((check.unlessFile || []).some((token) => relPath.includes(token))) return false;

  const required = rule.requires && rule.requires.deps;
  if (required && required.length && !required.some((dep) => deps.has(dep))) return false;

  return true;
}

function lineMatches(rule, unit, lines, unitIndex, content) {
  const check = rule.check || {};
  const text = unit.text;

  const anyIn = (list) => list.some((token) => text.includes(token));
  const anyContent = (list) => list.some((token) => content.includes(token));

  if (!(check.line || []).some((token) => text.includes(token))) return false;
  if ((check.alsoLine || []).length && !anyIn(check.alsoLine)) return false;
  if (anyIn(check.unlessLine || [])) return false;
  if (anyContent(check.unlessContent || [])) return false;
  if ((check.needsContent || []).length && !anyContent(check.needsContent)) return false;

  const radius = typeof check.window === 'number' ? check.window : 6;
  if ((check.nearby || []).length || (check.unlessNearby || []).length) {
    const window = buildWindow(lines, unit.startLine - 1, radius);
    if ((check.nearby || []).length && !(check.nearby || []).some((t) => window.includes(t))) return false;
    if ((check.unlessNearby || []).some((t) => window.includes(t))) return false;
  }

  return true;
}

function auditFile(filePath, rules, deps, disabledRules) {
  const findings = [];
  const relPath = path.relative(ROOT, filePath);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { findings, error: err.message };
  }

  const lines = content.split('\n');
  const units = buildUnits(lines);

  for (const rule of rules) {
    if (disabledRules.has(rule.id)) continue;
    if (!ruleAppliesToProject(rule, relPath, deps)) continue;

    for (let i = 0; i < units.length; i += 1) {
      const unit = units[i];
      const suppression = unit.parts.map(readSuppression).find(Boolean);
      if (suppression === '*') continue;
      if (suppression === rule.id) continue;

      if (!lineMatches(rule, unit, lines, i, content)) continue;

      findings.push({
        rule: rule.id,
        title: rule.title,
        severity: rule.severity,
        file: relPath,
        line: unit.startLine,
        message: rule.message,
        fix: rule.fix || null,
        snippet: unit.parts[0].trim().slice(0, 160),
      });
      break; // one finding per rule per file keeps the report actionable
    }
  }

  return { findings, error: null };
}

function printHuman(report, opts) {
  const { findings, summary, srcDir, rulesVersion } = report;

  if (!opts.quiet) {
    console.log('');
    console.log('=====================================================');
    console.log('Static UX & Mobile Ergonomics Auditor');
    console.log(`rules v${rulesVersion}  ·  ${summary.total} finding(s)  ·  ${srcDir}`);
    console.log('=====================================================');
    console.log('');
  }

  if (findings.length === 0) {
    if (!opts.quiet) {
      console.log('✅ No static UX anti-patterns detected.');
      console.log('');
    }
    return;
  }

  const icons = { ERROR: '❌', WARNING: '⚠️ ', INFO: 'ℹ️ ' };

  for (const finding of findings) {
    console.log(`${icons[finding.severity]} [${finding.rule}] ${finding.file}:${finding.line}`);
    console.log(`   ${finding.message}`);
    if (finding.fix) console.log(`   fix: ${finding.fix}`);
    console.log('');
  }

  console.log('=====================================================');
  console.log(
    `Summary: ${summary.ERROR} error(s), ${summary.WARNING} warning(s), ${summary.INFO} suggestion(s).`,
  );
  console.log('=====================================================');
  console.log('');
}

function printJson(report) {
  console.log(JSON.stringify({
    rulesVersion: report.rulesVersion,
    src: report.srcDir,
    summary: report.summary,
    findings: report.findings,
  }, null, 2));
}

function printRuleCatalog(catalog) {
  console.log('');
  console.log(`Rule catalog v${catalog.version} — ${catalog.rules.length} signatures`);
  console.log('');
  for (const rule of catalog.rules) {
    const gated = rule.requires && rule.requires.deps
      ? ` [requires: ${rule.requires.deps.join(' | ')}]`
      : ' [stack agnostic]';
    console.log(`${rule.severity.padEnd(7)} ${rule.id}  ${rule.title}${gated}`);
    console.log(`        signature: ${rule.signature}`);
    console.log(`        fix: ${rule.fix}`);
    console.log('');
  }
}

function printUsage() {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^\/\*\*?/, '').replace(/^ \* ?/gm, ''));
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    printUsage();
    return;
  }

  const catalog = loadRules();

  if (opts.listRules) {
    printRuleCatalog(catalog);
    return;
  }

  const { config } = loadConfig(opts);

  const unknown = opts.rules.filter((id) => !catalog.rules.some((rule) => rule.id === id));
  if (unknown.length) fatal(`Unknown rule id requested with --rule: ${unknown.join(', ')}`);

  const disabledRules = new Set(config.disableRules || []);

  const activeRules = opts.rules.length
    ? catalog.rules.filter((rule) => opts.rules.includes(rule.id))
    : catalog.rules;

  const srcDir = detectSourceDir(opts.src, config);

  if (!srcDir) {
    if (opts.format === 'json') {
      printJson({ rulesVersion: catalog.version, srcDir: null, summary: { total: 0, ERROR: 0, WARNING: 0, INFO: 0 }, findings: [] });
    } else if (!opts.quiet) {
      console.log('');
      console.log('ℹ️  No JavaScript/TypeScript source directory found (looked for src, app, frontend, web, client).');
      console.log('   Nothing to audit. Pass --src <dir> to point the auditor somewhere else.');
      console.log('');
    }
    return;
  }

  const deps = loadDependencies();
  const files = [];
  const unreadable = [];
  collectFiles(srcDir, files, unreadable);

  const findings = [];
  for (const file of files) {
    const result = auditFile(file, activeRules, deps, disabledRules);
    findings.push(...result.findings);
  }

  const severityRank = { ERROR: 0, WARNING: 1, INFO: 2 };
  findings.sort((a, b) => (
    severityRank[a.severity] - severityRank[b.severity]
    || a.file.localeCompare(b.file)
    || a.line - b.line
    || a.rule.localeCompare(b.rule)
  ));

  const summary = { total: findings.length, ERROR: 0, WARNING: 0, INFO: 0 };
  for (const finding of findings) summary[finding.severity] += 1;

  const report = {
    rulesVersion: catalog.version,
    srcDir: path.relative(ROOT, srcDir) || '.',
    summary,
    findings,
  };

  if (opts.format === 'json') printJson(report);
  else printHuman(report, opts);

  if (opts.format !== 'json' && !opts.quiet && unreadable.length) {
    console.log(`⚠️  ${unreadable.length} directory(ies) could not be read and were skipped.`);
    console.log('');
  }

  const blocked = summary.ERROR > 0 || (opts.strict && summary.WARNING > 0);
  if (blocked) {
    if (opts.format === 'json') process.exitCode = 1;
    else {
      console.error(`⛔ audit-ux failed: ${summary.ERROR} error(s)${opts.strict ? `, ${summary.WARNING} warning(s)` : ''}.`);
      process.exitCode = 1;
    }
  }
}

main();