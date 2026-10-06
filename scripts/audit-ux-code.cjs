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
 *   --update-baseline  Rewrite the accepted-observations snapshot and exit
 *   --help             Print usage
 *
 * Exit codes:
 *   0  no blocking findings (or nothing to scan)
 *   1  blocking findings present
 *   2  fatal error (bad config, unreadable rules file)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ROOT is the project being audited. When the script is synced into a target
// repo it lands in <target>/scripts/, so __dirname/.. is already correct.
// AUDIT_UX_ROOT allows pointing the auditor at another project explicitly.
const ROOT = process.env.AUDIT_UX_ROOT
  ? path.resolve(process.env.AUDIT_UX_ROOT)
  : path.resolve(__dirname, '..');
const RULES_PATH = path.join(__dirname, 'ux-rules.json');
const CONFIG_NAME = '.uxaudit.json';
const BASELINE_NAME = 'audit-ux-baseline.json';
const BASELINE_VERSION = 1;

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
    updateBaseline: false,
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
      case '--update-baseline': opts.updateBaseline = true; break;
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

/** Normalizes a path to forward slashes so glob matching is OS independent. */
function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

/**
 * Compiles the `exclude` patterns of .uxaudit.json into matchers.
 *
 * Supports the glob subset that is meaningful for source paths: `**` (any depth,
 * including none), `*` (any run of chars except a separator) and `?`. Patterns are
 * resolved relative to ROOT so a project can exclude `src/legacy/**` regardless of
 * the directory the auditor was pointed at with --src.
 */
function compileExcludes(patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) return [];

  return patterns.map((pattern) => {
    const normalized = String(pattern).replace(/\\/g, '/').replace(/^\.\//, '');

    // A pattern matches both as written (`src/legacy/**`, relative to ROOT)
    // and at any depth (`**/src/legacy/**`), so authors never have to guess
    // whether a path is anchored to the project root or to a nested folder.
    const anchors = normalized.startsWith('/')
      ? [normalized.slice(1)]
      : [normalized, `**/${normalized}`];

    return {
      pattern: normalized,
      regexp: new RegExp(`^(?:${anchors.map(globToRegExpSource).join('|')})$`),
    };
  });
}

function globToRegExpSource(glob) {
  return glob
    .split('')
    .reduce((acc, char, index, chars) => {
      if (char === '*') {
        if (chars[index + 1] === '*') return `${acc}.*`;
        return `${acc}[^/]*`;
      }
      if (char === '?') return `${acc}[^/]`;
      if (char === '/') return `${acc}/`;
      return acc + char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }, '');
}

function isExcluded(relPath, excludes) {
  return excludes.some(({ regexp }) => regexp.test(relPath));
}

/** Drops excluded files before auditing so their paths never reach the report. */
function applyExcludes(files, excludes) {
  if (excludes.length === 0) return files;

  return files.filter((file) => !isExcluded(toPosixPath(path.relative(ROOT, file)), excludes));
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
 * Classifies the tags a chunk of text opens, closes and self-closes.
 *
 * The three kinds have to be told apart for nesting depth to mean anything:
 *
 *     <button onClick={save}>     open       depth +1
 *       <Icon />                  self-close depth  0   <- must NOT close the parent
 *       <span>Guardar</span>      open + close      0
 *     </button>                   close      depth -1
 *
 * Counting bare `>` characters instead cannot tell a self-closing child from a
 * parent with children, so `<button>` and its contents end up in different units
 * and any rule asking for "the content of this element" sees an empty string.
 */
function countTagKinds(text) {
  const open = (text.match(TAG_OPEN) || []).length;
  const close = (text.match(/<\/[A-Za-z][\w.]*\s*>/g) || []).length;
  const self = (text.match(/\/>/g) || []).length;
  return { open, close, self };
}

/**
 * Offset of the `>` that terminates the opening tag at `from`, or -1.
 *
 * Scanning is needed because several `>` characters are not terminators: an arrow
 * (`=>`), a comparison (`a > b`), a generic (`Array<string>`) and anything inside
 * a string or an attribute expression. A multiline opening tag ends wherever its
 * real terminator sits, which is what tells the attribute lines from the children.
 */
function findTagEnd(text, from) {
  let i = from;
  while (i < text.length) {
    const ch = text[i];

    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i += 1;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i += 1;
        i += 1;
      }
      i += 1;
      continue;
    }

    if (ch === '{') {
      let depth = 0;
      while (i < text.length) {
        if (text[i] === '{') depth += 1;
        else if (text[i] === '}') {
          depth -= 1;
          if (depth === 0) {
            i += 1;
            break;
          }
        }
        i += 1;
      }
      continue;
    }

    if (ch === '=' && text[i + 1] === '>') {
      i += 2;
      continue;
    }

    if (ch === '>') {
      return i;
    }

    i += 1;
  }

  return -1;
}

/**
 * Removes `{...}` expression containers, respecting nesting and quotes.
 *
 * A JSX expression renders whatever it evaluates to, not its own source, so the
 * source cannot be read as visible text.
 */
function stripExpressions(source) {
  let out = '';
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i += 1;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i += 1;
        i += 1;
      }
      i += 1;
      continue;
    }

    if (ch === '{') {
      let depth = 0;
      while (i < source.length) {
        if (source[i] === '{') depth += 1;
        else if (source[i] === '}') {
          depth -= 1;
          if (depth === 0) {
            i += 1;
            break;
          }
        }
        i += 1;
      }
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

/**
 * Groups lines into JSX elements.
 *
 * Every element produces one unit carrying two granularities:
 *
 *   `text`       the opening tag and its attributes only. Rules that look for a
 *                signature (`line`, `alsoLine`, `unlessLine`) match here, so a
 *                finding points at the element that actually carries the
 *                problem instead of at the outermost wrapper.
 *
 *   `scopeText`  the element plus every descendant. Rules that ask about
 *                content (`needsContent`, `unlessContent`) match here, which is
 *                what makes "this button contains an icon" a question that can
 *                actually be answered.
 *
 * Nesting is tracked so a self-closing child does not end its parent, and
 * statements outside JSX become their own units so they never over-merge.
 */
function buildUnits(lines) {
  const units = [];
  const allFrames = [];
  const text = lines.join('\n');
  const stack = [];

  const lineStarts = [];
  let acc = 0;
  for (const line of lines) {
    lineStarts.push(acc);
    acc += line.length + 1;
  }

  const lineOf = (pos) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };

  const closeFrame = (frame, endLine, spanEnd, closeAt) => {
    frame.endLine = endLine;
    frame.spanEnd = spanEnd;
    frame.closeAt = closeAt;

    const start = Math.min(frame.startLine, endLine);
    const unit = {
      startLine: start + 1,
      headEndLine: frame.headEndLine,
      endLine: Math.max(start, endLine) + 1,
      parts: lines.slice(frame.startLine, frame.headEndLine + 1),
      // The opening tag itself, not the physical line. Several elements often
      // share one line, and a self-closing `<Icon />` sitting next to a `<button`
      // must not inherit the button's signature and be reported as one.
      text: text.slice(frame.at, frame.tagEnd + 1),
      scopeText: lines.slice(start, Math.max(start, endLine) + 1).join('\n'),
      isElement: true,
      spanStart: frame.at,
      spanEnd,
    };

    units.push(unit);
    allFrames.push(frame);
    frame.unit = unit;
    if (frame.parent) frame.parent.children.push(frame);
    return unit;
  };

  let i = 0;

  while (i < text.length) {
    const at = text.indexOf('<', i);
    if (at === -1) break;

    // A `<` that cannot start a tag is a comparison or a generic.
    const next = text[at + 1];
    if (!next || !/[A-Za-z/>]/.test(next)) {
      i = at + 1;
      continue;
    }

    const tagEnd = findTagEnd(text, at);
    if (tagEnd === -1) {
      i = at + 1;
      continue;
    }

    const tagText = text.slice(at, tagEnd + 1);
    const headEndLine = lineOf(tagEnd);

    if (tagText.startsWith('</')) {
      const name = (tagText.match(/^<\/\s*([A-Za-z][\w.]*)?/) || [])[1] || '';
      // A fragment close (`</>`) has no name and closes whatever is innermost.
      const index = name
        ? stack.map((frame) => frame.name).lastIndexOf(name)
        : stack.length - 1;

      if (index !== -1) {
        // Anything still open above the match is markup the author left
        // unbalanced. It is closed here rather than dropped, so an unclosed
        // element never swallows the rest of the file and never hides a finding.
        for (let n = stack.length - 1; n > index; n -= 1) {
          closeFrame(stack[n], headEndLine, at - 1, at);
        }

        const frame = stack[index];
        stack.length = index;
        closeFrame(frame, headEndLine, tagEnd, at);
      }

      i = tagEnd + 1;
      continue;
    }

    const name = (tagText.match(/^<\s*([A-Za-z][\w.]*)/) || [])[1] || '';
    const parent = stack.length ? stack[stack.length - 1] : null;
    const frame = {
      name,
      startLine: lineOf(at),
      headEndLine,
      at,
      tagEnd,
      parent,
      children: [],
    };

    if (/\/>\s*$/.test(tagText)) {
      closeFrame(frame, headEndLine, tagEnd, tagEnd + 1);
    } else {
      stack.push(frame);
    }

    i = tagEnd + 1;
  }

  // Unbalanced markup must not swallow the rest of the file.
  while (stack.length) {
    const frame = stack.pop();
    closeFrame(frame, lineOf(text.length - 1), text.length - 1, text.length);
  }

  // An element's own content: its source minus the source of every nested
  // element. Without this level a wrapper inherits its child's signature — a
  // `<div>` around `<span>{format(date, "MMMM")}</span>` would report the date
  // leak and point at the wrapper instead of the element rendering the value.
  for (const frame of allFrames) {
    const segments = [];
    let cursor = frame.tagEnd + 1;

    for (const child of frame.children) {
      if (child.at > cursor) segments.push(text.slice(cursor, child.at));
      cursor = Math.max(cursor, child.spanEnd + 1);
    }
    if (frame.closeAt > cursor) segments.push(text.slice(cursor, frame.closeAt));

    frame.unit.ownContent =
      text.slice(frame.at, frame.tagEnd + 1) + segments.join('') + text.slice(frame.closeAt, frame.spanEnd + 1);

    // Renderable text: what a user actually reads. Attributes are excluded by
    // construction, nested elements are excluded by the segments above, and
    // `{...}` expressions are dropped because they render nothing on their own.
    //
    // This is computed from offsets rather than stripped with a regex on purpose.
    // `/<[^>]*>/g` cannot tell a tag terminator from the `>` of an arrow, so
    // `<button onClick={() => go()}>` would leave `go()}` behind and make an
    // icon-only button look like it has a visible label.
    frame.unit.textContent = stripExpressions(segments.join(''));
  }

  // Statements outside JSX are units too, so line-based rules still see them.
  const covered = new Set();
  for (const unit of units) {
    for (let n = unit.startLine; n <= unit.endLine; n += 1) covered.add(n);
  }
  // `covered` holds 1-based line numbers, matching the units.
  for (let n = 0; n < lines.length; n += 1) {
    if (covered.has(n + 1) || !lines[n].trim()) continue;
    units.push({
      startLine: n + 1,
      headEndLine: n,
      endLine: n + 1,
      parts: [lines[n]],
      text: lines[n],
      scopeText: lines[n],
      isElement: false,
    });
  }

  units.sort((a, b) => a.startLine - b.startLine || a.endLine - b.endLine);
  return units;
}

function ruleAppliesToProject(rule, relPath, deps) {
  const check = rule.check || {};

  if ((check.unlessFile || []).some((token) => relPath.includes(token))) return false;

  const required = rule.requires && rule.requires.deps;
  if (required && required.length && !required.some((dep) => deps.has(dep))) return false;

  return true;
}

/**
 * Whether an element renders any visible text.
 *
 * This is what separates an icon-only button from a labelled one, and a token
 * list cannot express it: `<button><span>Guardar</span></button>` is accessible
 * because the user sees "Guardar", and no `aria-*` attribute is involved. The
 * escapes an attribute list can hold never cover that case.
 *
 * `textContent` is derived from parse offsets rather than stripped from the raw
 * source, so an arrow function inside an attribute cannot be mistaken for a label.
 */
function hasVisibleText(unit) {
  if (typeof unit.textContent === 'string') return unit.textContent.trim().length > 0;
  return false;
}

/**
 * Decides whether a rule matches one element unit.
 *
 * The unit carries two granularities and each check kind reads the right one:
 *
 *   `line`, `alsoLine`, `unlessLine`  →  `unit.text`, the opening tag and its
 *       attributes. A signature belongs to the element that carries it, and a
 *       finding should point at that element rather than at its wrapper.
 *
 *   `needsContent`, `unlessContent`  →  `unit.scopeText`, the element plus every
 *       descendant. "Does this button contain an icon?" is a question about the
 *       subtree, so evaluating it against the whole file — as an earlier version
 *       did — made one `Icon` declaration turn every button in the file into an
 *       icon-only button.
 *
 * `unlessVisibleText` reads that same subtree but semantically, for rules about
 * whether a control exposes a name to the user.
 *
 * `nearby` and `unlessNearby` keep reading a line window, which is inherently
 * positional.
 */
function lineMatches(rule, unit, lines, unitIndex, content) {
  const check = rule.check || {};
  const text = unit.text;
  const scope = unit.scopeText;

  const anyIn = (list) => list.some((token) => text.includes(token));
  const anyInScope = (list) => list.some((token) => scope.includes(token));

  if (!(check.line || []).some((token) => text.includes(token))
      && !(check.alsoContent || []).some((token) => (unit.ownContent || scope).includes(token))) return false;
  if ((check.alsoLine || []).length && !anyIn(check.alsoLine)) return false;
  if (anyIn(check.unlessLine || [])) return false;
  if (anyInScope(check.unlessContent || [])) return false;
  if ((check.needsContent || []).length && !anyInScope(check.needsContent)) return false;
  if (check.unlessVisibleText && hasVisibleText(unit)) return false;

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
    baseline: report.baseline,
    findings: report.findings,
  }, null, 2));
}

/**
 * Stable identity for an observation, used to match findings against a baseline.
 *
 * Rule, file and a digest of the offending source. Line numbers are excluded on
 * purpose: inserting an import above a violation must not invalidate the whole
 * snapshot.
 */
function fingerprint(finding) {
  const normalized = (finding.snippet || finding.message || '').replace(/\s+/g, ' ').trim();
  const digest = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12);
  return `${finding.rule}|${finding.file}|${digest}`;
}

function loadBaseline() {
  const file = path.join(ROOT, BASELINE_NAME);
  if (!fs.existsSync(file)) return { version: BASELINE_VERSION, entries: {} };

  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (parsed.version !== BASELINE_VERSION) {
      console.warn(
        `⚠️  Baseline is v${parsed.version}, this auditor expects v${BASELINE_VERSION}. ` +
        `Regenerate it with: npm run audit:ux -- --update-baseline`,
      );
      return { version: BASELINE_VERSION, entries: {} };
    }
    return parsed;
  } catch (err) {
    fatal(`Cannot read ${BASELINE_NAME}: ${err.message}`);
  }

  return { version: BASELINE_VERSION, entries: {} };
}

function writeBaseline(findings) {
  const entries = {};
  for (const finding of findings) {
    const key = fingerprint(finding);
    entries[key] = (entries[key] || 0) + 1;
  }

  const payload = {
    version: BASELINE_VERSION,
    description:
      'Observations already reviewed. WARNING and INFO only; ERROR is never absorbed.',
    entries,
  };

  fs.writeFileSync(path.join(ROOT, BASELINE_NAME), `${JSON.stringify(payload, null, 2)}\n`);
  return entries;
}

/**
 * Splits findings into accepted-by-baseline and new.
 *
 * Occurrences are counted with multiplicity, so a fifth instance of something the
 * snapshot accepted four times is reported as new. ERROR never enters this path:
 * a severity that blocks the build cannot be silenced by a snapshot.
 */
function diffAgainstBaseline(all) {
  const baseline = loadBaseline();
  const counts = new Map(Object.entries(baseline.entries || {}));
  const regressions = new Set();

  for (const finding of all) {
    if (finding.severity === 'ERROR') {
      regressions.add(finding);
      continue;
    }

    const key = fingerprint(finding);
    const left = counts.get(key) || 0;
    if (left > 0) counts.set(key, left - 1);
    else regressions.add(finding);
  }

  return { baseline, keys: regressions };
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
  const excludes = compileExcludes(config.exclude);
  const files = [];
  const unreadable = [];
  collectFiles(srcDir, files, unreadable);
  const scannedFiles = applyExcludes(files, excludes);

  const findings = [];
  for (const file of scannedFiles) {
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

  // A snapshot of already-reviewed observations lets a project adopt the
  // auditor on a codebase that already carries hundreds of findings, without
  // either silencing the gate or drowning in noise nobody will ever read.
  const { keys: accepted } = diffAgainstBaseline(findings);

  if (opts.updateBaseline) {
    const entries = writeBaseline(findings.filter((f) => f.severity !== 'ERROR'));
    const total = Object.values(entries).reduce((sum, n) => sum + n, 0);

    if (opts.format === 'json') {
      printJson({
        rulesVersion: catalog.version,
        src: srcDir,
        baseline: { file: BASELINE_NAME, signatures: Object.keys(entries).length },
        findings: [],
      });
    } else if (!opts.quiet) {
      console.log('');
      console.log(`✅ Baseline written: ${BASELINE_NAME} (${total} observation(s), ${Object.keys(entries).length} unique signature(s)).`);
      console.log('   Run `npm run audit:ux` again to see only what is new.');
      console.log('');
    }
    return;
  }

  const reported = findings.filter((f) => accepted.has(f));
  const absorbed = findings.length - reported.length;

  const finalSummary = { total: reported.length, ERROR: 0, WARNING: 0, INFO: 0 };
  for (const finding of reported) finalSummary[finding.severity] += 1;

  const report = {
    rulesVersion: catalog.version,
    srcDir: path.relative(ROOT, srcDir) || '.',
    summary: finalSummary,
    findings: reported,
    baseline: absorbed > 0 ? { absorbed } : undefined,
  };

  if (opts.format === 'json') printJson(report);
  else {
    printHuman(report, opts);
    if (absorbed > 0 && !opts.quiet) {
      console.log(`ℹ️  ${absorbed} observation(s) matched the accepted baseline in ${BASELINE_NAME}.`);
      console.log('');
    }
  }

  if (opts.format !== 'json' && !opts.quiet && unreadable.length) {
    console.log(`⚠️  ${unreadable.length} directory(ies) could not be read and were skipped.`);
    console.log('');
  }

  const blocked = finalSummary.ERROR > 0 || (opts.strict && finalSummary.WARNING > 0);
  if (blocked) {
    if (opts.format === 'json') process.exitCode = 1;
    else {
      console.error(`⛔ audit-ux failed: ${finalSummary.ERROR} error(s)${opts.strict ? `, ${finalSummary.WARNING} warning(s)` : ''}.`);
      process.exitCode = 1;
    }
  }
}

main();