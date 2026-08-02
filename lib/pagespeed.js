// Vendored from https://github.com/bkocdur/pagespeed-wrapper lib/pagespeed.js
// (the engine behind https://lighthouse-md.com). Keep the two in sync when audits change.

const SUGGESTIONS = {
  'render-blocking-resources': 'Defer or async non-critical CSS/JS; inline critical CSS.',
  'unused-css-rules': 'Remove unused CSS or split per-route; consider PurgeCSS/Tailwind JIT.',
  'unused-javascript': 'Code-split, tree-shake, or lazy-load the listed bundles.',
  'uses-responsive-images': 'Serve appropriately sized images via srcset/sizes or a CDN.',
  'offscreen-images': 'Add `loading="lazy"` to below-the-fold images.',
  'modern-image-formats': 'Serve WebP/AVIF with fallback.',
  'uses-optimized-images': 'Compress images; use a build-time image optimizer.',
  'uses-text-compression': 'Enable gzip/brotli at the server/CDN.',
  'uses-rel-preconnect': 'Add `<link rel="preconnect">` for critical third-party origins.',
  'uses-long-cache-ttl': 'Set far-future Cache-Control on static assets; fingerprint filenames.',
  'efficient-animated-content': 'Replace GIFs with MP4/WebM video.',
  'duplicated-javascript': 'Deduplicate shared modules in your bundler config.',
  'legacy-javascript': 'Ship modern JS to modern browsers (module/nomodule or browserslist).',
  'total-byte-weight': 'Reduce total page weight by splitting bundles and compressing assets.',
  'dom-size': 'Reduce DOM nodes; virtualize long lists.',
  'mainthread-work-breakdown': 'Reduce JS execution time; move work to web workers if needed.',
  'bootup-time': 'Trim JS payloads and defer non-critical scripts.',
  'third-party-summary': 'Audit and remove or defer expensive third-party scripts.',
  'largest-contentful-paint-element': 'Preload the LCP image/font and avoid lazy-loading it.',
  'layout-shift-elements': 'Reserve space (width/height or aspect-ratio) for images, ads, embeds.',
  'cumulative-layout-shift': 'Set explicit dimensions on media; avoid inserting content above existing content.',
  'font-display': 'Add `font-display: swap` to @font-face rules.',
  'preload-lcp-image': 'Add `<link rel="preload" as="image">` for the LCP image.',
  'server-response-time': 'Reduce TTFB (cache, CDN, faster backend).',
  'redirects': 'Eliminate chained redirects.',
  'image-alt': 'Add meaningful `alt` attributes to all images.',
  'label': 'Associate every form input with a `<label>`.',
  'color-contrast': 'Increase foreground/background contrast to meet WCAG AA.',
  'meta-description': 'Add a `<meta name="description">` tag.',
  'document-title': 'Provide a unique, descriptive `<title>`.',
  'is-on-https': 'Serve the site over HTTPS.',
  'tap-targets': 'Increase tap target size to ≥ 48x48 px.',
  'viewport': 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
  'heading-order': 'Use heading levels in order (h1 → h2 → h3). Do not skip levels.',
  'landmark-one-main': 'Wrap the primary content in a `<main>` element so screen readers can jump to it.',
  'html-has-lang': 'Add a `lang` attribute to the `<html>` element (e.g. `<html lang="en">`).',
  'html-lang-valid': 'Use a valid BCP 47 language code in the `lang` attribute on `<html>`.',
  'link-name': 'Give every `<a>` discernible text or an `aria-label`. Avoid empty links.',
  'button-name': 'Provide an accessible name for every `<button>` (text content or `aria-label`).',
  'aria-allowed-attr': 'Remove ARIA attributes that are not allowed on this role/element.',
  'aria-required-attr': 'Add the ARIA attributes required for the role you specified.',
  'aria-valid-attr-value': 'Fix invalid ARIA attribute values (check role/state spec).',
  'duplicate-id-aria': 'Make every `id` referenced by ARIA unique on the page.',
  'list': 'Ensure `<ul>`/`<ol>` only contain `<li>` (and allowed script/template) children.',
  'listitem': 'Wrap `<li>` elements inside a parent `<ul>` or `<ol>`.',
  'frame-title': 'Add a `title` attribute to every `<iframe>`.',
  'image-redundant-alt': 'Remove redundant alt text (e.g. "image of...").',
  'no-document-write': 'Replace `document.write` with DOM insertion or async script loading.',
  'errors-in-console': 'Resolve the JS errors logged to the console at load.',
  'inspector-issues': 'Open Chrome DevTools → Issues panel and resolve each entry.',
  'csp-xss': 'Define a strict Content-Security-Policy header.',
  'meta-viewport': 'Set `<meta name="viewport" content="width=device-width, initial-scale=1">` and avoid `user-scalable=no`.',
  'crawlable-anchors': 'Use real `<a href="...">` for navigation, not click handlers on non-links.',
  'robots-txt': 'Make `/robots.txt` valid and reachable.',
  'hreflang': 'Use valid `hreflang` values on `<link rel="alternate">` tags.',
  'canonical': 'Provide a single, valid `<link rel="canonical">`.',
  'http-status-code': 'Return a successful (2xx) HTTP status for the page.',
  'link-text': 'Replace generic anchor text ("click here", "learn more") with descriptive text.',
  'max-potential-fid': 'Break up long-running JavaScript tasks (>50 ms). Defer or async non-critical scripts, code-split heavy modules, and move expensive work to a Web Worker or `requestIdleCallback`.',
  'interactive': 'Reduce Time to Interactive: ship less JavaScript on initial load, defer third-party scripts, and avoid blocking the main thread during hydration.',
  'speed-index': 'Improve perceived load speed: inline critical CSS, preload the LCP image/font, and defer below-the-fold content.',
  'first-contentful-paint': 'Reduce time to first paint: minimize render-blocking CSS/JS, use a CDN, enable server compression, and improve server TTFB.',
  'largest-contentful-paint': 'Optimize the LCP element: preload it, use a modern image format, eliminate render-blocking resources, and improve server response time.',
  'total-blocking-time': 'Reduce main-thread blocking: split long tasks, lazy-load JS, remove unused dependencies, and avoid synchronous third-party scripts.',
  'first-meaningful-paint': 'Defer non-critical resources, inline critical CSS, and serve the smallest possible HTML for first paint.',
  'estimated-input-latency': 'Reduce JS execution time on the main thread; split long tasks into smaller chunks.',
  'network-rtt': 'Use a CDN or edge function close to your users; consolidate origins to reduce DNS/TLS handshakes.',
  'network-server-latency': 'Reduce backend response time: cache, scale, or move compute closer to the edge.',
  'main-thread-tasks': 'Profile in DevTools Performance panel and split or defer the longest tasks.',
  'diagnostics': 'Diagnostic audit: review the Lighthouse Treemap for guidance.',
  'resource-summary': 'Review total resource counts and bytes; reduce or defer the heaviest categories.',
  'metrics': 'Metric snapshot — see the individual metric audits for specific fixes.',
  // Lighthouse 12+ "insight" audits (successors to the legacy opportunity audits above).
  'cache-insight': 'Set far-future Cache-Control on static assets; fingerprint filenames.',
  'cls-culprits-insight': 'Reserve space (width/height or aspect-ratio) for images, ads, embeds; avoid inserting content above existing content.',
  'document-latency-insight': 'Reduce document request latency: eliminate redirects, improve server TTFB, enable text compression.',
  'dom-size-insight': 'Reduce DOM nodes; virtualize long lists.',
  'duplicated-javascript-insight': 'Deduplicate shared modules in your bundler config.',
  'font-display-insight': 'Add `font-display: swap` to @font-face rules.',
  'forced-reflow-insight': 'Avoid reading layout properties (offsetWidth, getBoundingClientRect) right after DOM writes; batch reads and writes.',
  'image-delivery-insight': 'Compress and resize images, serve WebP/AVIF, and lazy-load below-the-fold images.',
  'inp-breakdown-insight': 'Reduce input handler and rendering work; break up long main-thread tasks.',
  'interaction-to-next-paint-insight': 'Reduce input handler and rendering work; break up long main-thread tasks.',
  'lcp-breakdown-insight': 'Find the slowest LCP phase (TTFB, load delay, load time, render delay) and optimize that phase.',
  'lcp-discovery-insight': 'Make the LCP image discoverable in the initial HTML; preload it and never lazy-load it.',
  'legacy-javascript-insight': 'Ship modern JS to modern browsers (module/nomodule or browserslist).',
  'modern-http-insight': 'Serve resources over HTTP/2 or HTTP/3.',
  'network-dependency-tree-insight': 'Flatten critical request chains: preconnect to key origins, preload critical requests, defer the rest.',
  'render-blocking-insight': 'Defer or async non-critical CSS/JS; inline critical CSS.',
  'third-parties-insight': 'Audit and remove or defer expensive third-party scripts.',
  'viewport-insight': 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">` and avoid `user-scalable=no`.',
};

function suggestAction(id) {
  return SUGGESTIONS[id] || `No prescriptive fix mapped for this audit. Open the full Lighthouse report on PageSpeed Insights for details, or share the URL with Claude Code so it can investigate the audit (\`${id}\`) in context.`;
}

function flattenItem(it) {
  const o = {};
  for (const k of Object.keys(it)) {
    const v = it[k];
    if (v == null) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      if (v === '' || v === 0) continue;
      o[k] = v;
    } else if (typeof v === 'object') {
      if (v.url) o[k] = v.url;
      else if (v.type === 'node') {
        const sel = v.selector || '';
        const snip = v.snippet || '';
        const label = v.nodeLabel || '';
        if (snip && (sel.length < 8 || sel === 'html' || sel === 'body')) o[k] = snip;
        else if (sel) o[k] = sel;
        else if (snip) o[k] = snip;
        else if (label) o[k] = label;
        if (snip && o[k] !== snip) o[k + 'Snippet'] = snip;
        if (label && o[k] !== label) o[k + 'Label'] = label;
      }
      else if (v.selector) o[k] = v.selector;
      else if (v.snippet) o[k] = v.snippet;
      else if (v.nodeLabel) o[k] = v.nodeLabel;
      else if (typeof v.text === 'string') o[k] = v.text;
    }
  }
  return o;
}

function summarizeDetails(details) {
  if (!details) return null;
  if (details.type === 'opportunity' || details.type === 'table') {
    const items = (details.items || []).slice(0, 8).map(flattenItem).filter(it => Object.keys(it).length);
    return { type: details.type, items, overallSavingsMs: details.overallSavingsMs, overallSavingsBytes: details.overallSavingsBytes };
  }
  return null;
}

function extractSummary(data, url, strategy) {
  const lh = data.lighthouseResult || {};
  const cats = lh.categories || {};
  const audits = lh.audits || {};

  const scores = {};
  for (const key of Object.keys(cats)) {
    scores[cats[key].title] = cats[key].score == null ? null : Math.round(cats[key].score * 100);
  }

  const failingAudits = [];
  const passingAudits = [];
  const seen = new Set();
  for (const catKey of Object.keys(cats)) {
    const cat = cats[catKey];
    if (!cat.auditRefs) continue;
    for (const ref of cat.auditRefs) {
      const audit = audits[ref.id];
      if (!audit) continue;
      const score = audit.score;
      if (score === null || score === undefined) continue;
      if (seen.has(audit.id)) continue;
      seen.add(audit.id);
      if (score < 0.9) {
        failingAudits.push({
          category: cat.title,
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score,
          displayValue: audit.displayValue || '',
          numericValue: audit.numericValue,
          metricSavings: audit.metricSavings,
          warnings: audit.warnings || [],
          details: summarizeDetails(audit.details),
          suggestion: suggestAction(audit.id),
        });
      } else {
        passingAudits.push({ id: audit.id, title: audit.title, category: cat.title, score });
      }
    }
  }

  failingAudits.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));

  const metrics = {};
  ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','interactive']
    .forEach(id => { if (audits[id]) metrics[audits[id].title] = audits[id].displayValue; });

  const cfg = lh.configSettings || {};
  const env = lh.environment || {};
  const screen = cfg.screenEmulation || {};
  const throttling = cfg.throttling || {};

  const environment = {
    formFactor: cfg.formFactor || strategy,
    userAgent: cfg.emulatedUserAgent || env.networkUserAgent || '',
    hostUserAgent: env.hostUserAgent || '',
    viewport: screen.width && screen.height ? `${screen.width}x${screen.height} @${screen.deviceScaleFactor || 1}x` : '',
    throttlingMethod: cfg.throttlingMethod || '',
    throttling: throttling.rttMs ? {
      rttMs: throttling.rttMs,
      throughputKbps: throttling.throughputKbps,
      cpuSlowdownMultiplier: throttling.cpuSlowdownMultiplier,
    } : null,
    benchmarkIndex: env.benchmarkIndex || null,
  };

  const richDetails = {
    lighthouseVersion: lh.lighthouseVersion,
    requestedUrl: lh.requestedUrl,
    finalUrl: lh.finalDisplayedUrl || lh.finalUrl,
    runWarnings: lh.runWarnings || [],
    stackPacks: (lh.stackPacks || []).map(sp => ({
      id: sp.id, title: sp.title, iconDataURL: undefined,
      descriptions: sp.descriptions || {},
    })),
    resourceSummary: extractAuditItems(audits['resource-summary']),
    thirdPartySummary: extractAuditItems(audits['third-party-summary']),
    mainThreadBreakdown: extractAuditItems(audits['mainthread-work-breakdown']),
    bootupTime: extractAuditItems(audits['bootup-time']),
    diagnostics: extractAuditItems(audits['diagnostics']),
    networkRequestsCount: (audits['network-requests']?.details?.items || []).length,
  };

  return {
    url,
    strategy,
    fetchedAt: new Date().toISOString(),
    scores,
    metrics,
    failingAudits,
    passingAudits,
    environment,
    richDetails,
  };
}

function extractAuditItems(audit) {
  if (!audit || !audit.details || !audit.details.items) return null;
  return {
    title: audit.title,
    displayValue: audit.displayValue || '',
    items: audit.details.items.slice(0, 12).map(flattenItem).filter(it => Object.keys(it).length),
  };
}

function pickLabel(it) {
  return it.url || it.source || it.selector || it.snippet || it.nodeLabel || it.node || it.label || it.statistic || it.name || '';
}

function pickExtras(it) {
  const skip = new Set(['url','source','selector','snippet','nodeLabel','node','label','statistic','name']);
  const parts = [];
  for (const [k, v] of Object.entries(it)) {
    if (skip.has(k)) continue;
    if (k === 'wastedBytes' || k === 'totalBytes') parts.push(`${k}=${Math.round(v/1024)}KB`);
    else if (k === 'wastedMs' || k === 'duration') parts.push(`${k}=${Math.round(v)}ms`);
    else parts.push(`${k}=${v}`);
  }
  return parts.join(', ');
}

function truncate(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

function buildClaudeMd(s) {
  const lines = [];
  const env = s.environment || {};
  const rd = s.richDetails || {};

  lines.push(`# CLAUDE.md · PageSpeed Fix Plan`);
  lines.push('');
  lines.push(`**Target URL:** ${s.url}`);
  if (rd.finalUrl && rd.finalUrl !== s.url) lines.push(`**Final URL (after redirects):** ${rd.finalUrl}`);
  lines.push(`**Strategy:** ${s.strategy}`);
  lines.push(`**Generated:** ${s.fetchedAt}`);
  if (rd.lighthouseVersion) lines.push(`**Lighthouse version:** ${rd.lighthouseVersion}`);
  lines.push('');

  lines.push(`## Goal`);
  lines.push(`You are working in this repository, which serves the page at \`${s.url}\`. Your job is to apply code changes that resolve the failing Lighthouse audits below and raise the category scores. Make minimal, surgical changes. Do not regress any currently passing audit (listed at the bottom). Verify with the developer after each major change.`);
  lines.push('');

  lines.push(`## Test environment`);
  lines.push(`Lighthouse ran with the following emulation. Optimize for these conditions when reasoning about thresholds.`);
  if (env.formFactor) lines.push(`- **Form factor:** ${env.formFactor}`);
  if (env.viewport) lines.push(`- **Viewport:** ${env.viewport}`);
  if (env.userAgent) lines.push(`- **User agent:** ${truncate(env.userAgent, 160)}`);
  if (env.throttlingMethod) lines.push(`- **Throttling method:** ${env.throttlingMethod}`);
  if (env.throttling) {
    const t = env.throttling;
    lines.push(`- **Network throttling:** RTT ${t.rttMs} ms, throughput ${t.throughputKbps} Kbps`);
    lines.push(`- **CPU slowdown:** ${t.cpuSlowdownMultiplier}×`);
  }
  if (env.benchmarkIndex) lines.push(`- **Host benchmark index:** ${env.benchmarkIndex}`);
  lines.push('');

  lines.push(`## Current scores`);
  for (const [k, v] of Object.entries(s.scores)) lines.push(`- **${k}:** ${v ?? 'n/a'}`);
  lines.push('');

  lines.push(`## Core Web Vitals / metrics`);
  for (const [k, v] of Object.entries(s.metrics)) lines.push(`- ${k}: ${v}`);
  lines.push('');

  if (rd.runWarnings && rd.runWarnings.length) {
    lines.push(`## Run warnings`);
    lines.push(`Lighthouse flagged these problems while measuring. Resolve them so future runs are reliable.`);
    for (const w of rd.runWarnings) lines.push(`- ${w}`);
    lines.push('');
  }

  if (rd.resourceSummary && rd.resourceSummary.items.length) {
    lines.push(`## Resource breakdown`);
    lines.push(`What the page actually shipped, by resource type.`);
    lines.push('');
    lines.push(`| Type | Requests | Bytes |`);
    lines.push(`|---|---|---|`);
    for (const it of rd.resourceSummary.items) {
      const label = it.label || it.resourceType || it.statistic || '?';
      const req = it.requestCount ?? '';
      const bytes = it.transferSize != null ? `${Math.round(it.transferSize / 1024)} KB` : '';
      lines.push(`| ${label} | ${req} | ${bytes} |`);
    }
    lines.push('');
  }

  if (rd.thirdPartySummary && rd.thirdPartySummary.items.length) {
    lines.push(`## Third-party impact`);
    lines.push(`External entities and what they cost. Defer, replace, or remove the worst offenders.`);
    lines.push('');
    lines.push(`| Entity | Transfer | Main-thread time | Blocking time |`);
    lines.push(`|---|---|---|---|`);
    for (const it of rd.thirdPartySummary.items) {
      const entity = it.entity || it.url || '?';
      const tx = it.transferSize != null ? `${Math.round(it.transferSize / 1024)} KB` : '';
      const mt = it.mainThreadTime != null ? `${Math.round(it.mainThreadTime)} ms` : '';
      const bt = it.blockingTime != null ? `${Math.round(it.blockingTime)} ms` : '';
      lines.push(`| ${truncate(entity, 60)} | ${tx} | ${mt} | ${bt} |`);
    }
    lines.push('');
  }

  if (rd.mainThreadBreakdown && rd.mainThreadBreakdown.items.length) {
    lines.push(`## Main-thread time breakdown`);
    lines.push(`Where the main thread spent its time during page load.`);
    lines.push('');
    lines.push(`| Category | Duration |`);
    lines.push(`|---|---|`);
    for (const it of rd.mainThreadBreakdown.items) {
      const label = it.groupLabel || it.group || '?';
      const dur = it.duration != null ? `${Math.round(it.duration)} ms` : '';
      lines.push(`| ${label} | ${dur} |`);
    }
    lines.push('');
  }

  if (rd.bootupTime && rd.bootupTime.items.length) {
    lines.push(`## JavaScript bootup time (top scripts)`);
    lines.push('');
    lines.push(`| Script | Total | Eval | Parse/compile |`);
    lines.push(`|---|---|---|---|`);
    for (const it of rd.bootupTime.items.slice(0, 8)) {
      const u = it.url || '?';
      lines.push(`| \`${truncate(u, 80)}\` | ${Math.round(it.total || 0)} ms | ${Math.round(it.scripting || 0)} ms | ${Math.round(it.scriptParseCompile || 0)} ms |`);
    }
    lines.push('');
  }

  if (rd.diagnostics && rd.diagnostics.items.length) {
    const d = rd.diagnostics.items[0] || {};
    lines.push(`## Page diagnostics`);
    const facts = [];
    if (d.numRequests != null) facts.push(`- Requests: ${d.numRequests}`);
    if (d.numScripts != null) facts.push(`- Scripts: ${d.numScripts}`);
    if (d.numStylesheets != null) facts.push(`- Stylesheets: ${d.numStylesheets}`);
    if (d.numFonts != null) facts.push(`- Fonts: ${d.numFonts}`);
    if (d.numTasks != null) facts.push(`- Main-thread tasks: ${d.numTasks}`);
    if (d.numTasksOver50ms != null) facts.push(`- Long tasks (>50ms): ${d.numTasksOver50ms}`);
    if (d.totalByteWeight != null) facts.push(`- Total transferred: ${Math.round(d.totalByteWeight / 1024)} KB`);
    if (d.maxRtt != null) facts.push(`- Max RTT: ${Math.round(d.maxRtt)} ms`);
    if (d.maxServerLatency != null) facts.push(`- Max server latency: ${Math.round(d.maxServerLatency)} ms`);
    if (d.mainDocumentTransferSize != null) facts.push(`- Main document transfer: ${Math.round(d.mainDocumentTransferSize / 1024)} KB`);
    if (rd.networkRequestsCount) facts.push(`- Total network requests: ${rd.networkRequestsCount}`);
    lines.push(...facts);
    lines.push('');
  }

  if (rd.stackPacks && rd.stackPacks.length) {
    lines.push(`## Detected tech stack`);
    lines.push(`Lighthouse detected the following stack(s). Apply stack-specific best practices when relevant.`);
    for (const sp of rd.stackPacks) {
      lines.push(`- **${sp.title}** (${sp.id})`);
    }
    lines.push('');
  }

  lines.push(`## Workflow`);
  lines.push(`1. Identify which files in this repo render \`${s.url}\` (templates, components, build config, server middleware).`);
  lines.push(`2. For each failing audit below, locate the offending code or asset, then apply the suggested fix.`);
  lines.push(`3. Cross-check against the *Test environment* section — fixes should hold under that throttling.`);
  lines.push(`4. After each fix, re-run the build and (if possible) re-run a local Lighthouse pass.`);
  lines.push(`5. Group commits by audit category. Do not bundle unrelated refactors.`);
  lines.push(`6. Do not regress any audit listed under *Currently passing*.`);
  lines.push('');

  lines.push(`## Failing audits (${s.failingAudits.length})`);
  lines.push('');
  const byCat = {};
  for (const a of s.failingAudits) (byCat[a.category] ||= []).push(a);
  for (const cat of Object.keys(byCat)) {
    lines.push(`### ${cat}`);
    lines.push('');
    for (const a of byCat[cat]) {
      const pct = a.score == null ? '?' : Math.round(a.score * 100);
      lines.push(`#### [${pct}] ${a.title} \`(${a.id})\``);
      if (a.displayValue) lines.push(`- **Measured:** ${a.displayValue}`);
      if (a.description) lines.push(`- **Why:** ${a.description.replace(/\n/g, ' ')}`);
      if (a.warnings && a.warnings.length) lines.push(`- **Warnings:** ${a.warnings.join(' · ')}`);
      // stack pack guidance for this audit
      if (rd.stackPacks && rd.stackPacks.length) {
        for (const sp of rd.stackPacks) {
          const tip = sp.descriptions && sp.descriptions[a.id];
          if (tip) lines.push(`- **${sp.title} guidance:** ${tip.replace(/\n/g, ' ')}`);
        }
      }
      if (a.details && a.details.items && a.details.items.length) {
        const rendered = [];
        for (const it of a.details.items) {
          const label = pickLabel(it);
          const extras = pickExtras(it);
          if (!label && !extras) continue;
          rendered.push(`  - ${label ? '`' + truncate(label, 140) + '`' : ''}${label && extras ? ' · ' : ''}${extras}`);
        }
        if (rendered.length) {
          lines.push(`- **Top offenders:**`);
          lines.push(...rendered);
        }
        if (a.details.overallSavingsMs) lines.push(`- **Potential savings:** ${Math.round(a.details.overallSavingsMs)} ms`);
        if (a.details.overallSavingsBytes) lines.push(`- **Potential savings:** ${Math.round(a.details.overallSavingsBytes / 1024)} KB`);
      }
      lines.push(`- **Action:** ${a.suggestion || suggestAction(a.id)}`);
      lines.push('');
    }
  }

  if (s.passingAudits && s.passingAudits.length) {
    lines.push(`## Currently passing (${s.passingAudits.length}) — DO NOT BREAK`);
    lines.push(`These audits are already passing. Verify they still pass after your changes.`);
    lines.push('');
    const byCatP = {};
    for (const a of s.passingAudits) (byCatP[a.category] ||= []).push(a);
    for (const cat of Object.keys(byCatP)) {
      lines.push(`<details><summary><strong>${cat}</strong> (${byCatP[cat].length})</summary>`);
      lines.push('');
      for (const a of byCatP[cat]) lines.push(`- \`${a.id}\` — ${a.title}`);
      lines.push('');
      lines.push(`</details>`);
      lines.push('');
    }
  }

  lines.push(`## Verification`);
  lines.push(`- Re-run PageSpeed Insights against \`${s.url}\` (strategy: ${s.strategy}) after deploy.`);
  lines.push(`- Confirm each failing audit moves to passing (score ≥ 0.9).`);
  lines.push(`- Confirm no audit listed under *Currently passing* regresses.`);
  lines.push(`- For any metric-style audit (LCP, TBT, CLS, etc.), measure on the same form factor and throttling profile listed in *Test environment*.`);
  return lines.join('\n');
}

async function runPageSpeed({ url, strategy = 'mobile', apiKey }) {
  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
  const params = new URLSearchParams();
  params.append('url', url);
  if (apiKey) params.append('key', apiKey); // keyless works but the shared quota is small and often exhausted
  params.append('strategy', strategy);
  categories.forEach(c => params.append('category', c));
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;
  const r = await fetch(apiUrl);
  const data = await r.json();
  if (!r.ok) {
    const err = new Error(data.error?.message || 'PageSpeed API error');
    err.status = r.status;
    err.details = data;
    throw err;
  }
  return extractSummary(data, url, strategy);
}

module.exports = { runPageSpeed, buildClaudeMd, extractSummary };
