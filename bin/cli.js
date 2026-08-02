#!/usr/bin/env node
// lighthouse-md: run a Google PageSpeed Insights (Lighthouse) audit on a URL
// and write a CLAUDE.md brief that a coding agent can act on directly.

const fs = require('fs');
const path = require('path');
const { runPageSpeed, buildClaudeMd } = require('../lib/pagespeed');

const pkg = require('../package.json');

const HELP = `lighthouse-md v${pkg.version}
Turn a PageSpeed Insights audit into a CLAUDE.md brief for your coding agent.

Usage:
  lighthouse-md <url> [options]

Options:
  --strategy <mobile|desktop>  Lighthouse strategy (default: mobile)
  --key <API_KEY>              PageSpeed API key (or set PAGESPEED_API_KEY).
                               Optional but recommended: the keyless
                               shared quota is small and often exhausted.
  --out <file>                 Output file (default: ./CLAUDE.md)
  --stdout                     Print to stdout instead of writing a file
  -h, --help                   Show this help
  -v, --version                Show version

Examples:
  npx lighthouse-md https://example.com
  npx lighthouse-md https://example.com --strategy desktop --stdout
  PAGESPEED_API_KEY=xxx lighthouse-md https://example.com --out audits/CLAUDE.md

Web version (no install): https://lighthouse-md.com
`;

function parseArgs(argv) {
  const args = { strategy: 'mobile', out: 'CLAUDE.md', stdout: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--strategy') args.strategy = argv[++i];
    else if (a === '--key') args.key = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--stdout') args.stdout = true;
    else if (a === '-h' || a === '--help') args.help = true;
    else if (a === '-v' || a === '--version') args.version = true;
    else rest.push(a);
  }
  args.url = rest[0];
  return args;
}

(async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) { console.log(pkg.version); return; }
  if (args.help || !args.url) { console.log(HELP); process.exit(args.url ? 0 : 1); }

  if (!/^https?:\/\//i.test(args.url)) args.url = 'https://' + args.url;
  if (!['mobile', 'desktop'].includes(args.strategy)) {
    console.error(`Invalid --strategy "${args.strategy}" (use mobile or desktop).`);
    process.exit(1);
  }

  const apiKey = args.key || process.env.PAGESPEED_API_KEY || '';
  console.error(`Auditing ${args.url} (${args.strategy})${apiKey ? '' : ' · keyless (shared quota, may 429)'} ...`);

  let summary;
  try {
    summary = await runPageSpeed({ url: args.url, strategy: args.strategy, apiKey });
  } catch (e) {
    console.error(`PageSpeed API error${e.status ? ' (' + e.status + ')' : ''}: ${e.message}`);
    if (e.status === 429) console.error('Keyless quota exhausted. Pass --key or set PAGESPEED_API_KEY (free at https://developers.google.com/speed/docs/insights/v5/get-started).');
    process.exit(1);
  }

  const md = buildClaudeMd(summary);

  if (args.stdout) {
    console.log(md);
  } else {
    const outPath = path.resolve(args.out);
    fs.writeFileSync(outPath, md);
    const s = summary.scores || {};
    console.error(`Scores · perf ${s['Performance'] ?? '?'} · a11y ${s['Accessibility'] ?? '?'} · best-practices ${s['Best Practices'] ?? '?'} · seo ${s['SEO'] ?? '?'}`);
    console.error(`Wrote ${outPath}`);
    console.error(`Next: open your repo with Claude Code and say "read ${path.basename(outPath)} and fix the failing audits".`);
  }
})();
