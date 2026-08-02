# lighthouse-md

Run a Google PageSpeed Insights (Lighthouse) audit on any URL and get a **`CLAUDE.md` brief your coding agent can act on directly**: every failing audit with prescriptive fixes, the ranked offenders behind each one, third-party impact, main-thread breakdown, and a do-not-regress list of the audits you currently pass.

```bash
npx lighthouse-md https://example.com
```

That writes a `CLAUDE.md` to your current directory. Open your repo with Claude Code (or any coding agent that reads context files) and say: *"read CLAUDE.md and fix the failing audits."*

No install, no signup. Prefer a browser? The same engine runs at **[lighthouse-md.com](https://lighthouse-md.com)**.

## Why a CLAUDE.md instead of a raw Lighthouse report?

Raw Lighthouse JSON is ~800 KB of nested audit objects; the HTML report is built for humans clicking through accordions. Neither is what a coding agent needs. An agent needs:

- **Which audits failed**, with the category score impact
- **The specific offenders** (this bundle, this image, this stylesheet) so the fix targets real files
- **A prescriptive one-line fix per audit**, so the agent starts from the right approach instead of rediscovering it
- **The throttling profile and metric values**, so "verify the fix" means something
- **A do-not-regress list**: generating a fix is the easy half; generating a fix that does not regress adjacent audits is the hard half

`lighthouse-md` does that transformation in one step.

## Usage

```bash
# default: mobile strategy, writes ./CLAUDE.md
npx lighthouse-md https://example.com

# desktop audit, print to stdout
npx lighthouse-md https://example.com --strategy desktop --stdout

# with your own (free) PageSpeed API key for higher quota
PAGESPEED_API_KEY=xxx npx lighthouse-md https://example.com
```

| Option | Meaning |
|---|---|
| `--strategy <mobile\|desktop>` | Lighthouse strategy. Default `mobile` (the one Google ranks with). |
| `--key <API_KEY>` | PageSpeed API key. Also read from `PAGESPEED_API_KEY`. Optional but recommended: keyless requests use a small shared quota that is often exhausted. Get a free key [here](https://developers.google.com/speed/docs/insights/v5/get-started). |
| `--out <file>` | Output path. Default `./CLAUDE.md`. |
| `--stdout` | Print the brief instead of writing a file. |

## What the brief contains

- Current scores for Performance, Accessibility, Best Practices, SEO
- Core Web Vitals and lab metrics with the throttling profile used
- Every failing audit: what it measures, measured value, estimated savings, ranked offenders, and a prescriptive fix
- Third-party code impact and main-thread work breakdown
- Stack-pack guidance when Lighthouse detects your framework
- A "do not regress" list of currently passing audits

## How does it work?

One request to the public [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/about) (the hosted Lighthouse that powers pagespeed.web.dev), then a pure transformation of the response into agent-ready markdown. Your URL goes to Google's API and nowhere else. No telemetry, no accounts.

## Fix guides

Each failing audit in the brief links to a plain-English fix guide with code examples, from the [Lighthouse audits explained](https://lighthouse-md.com/audits/) library: [LCP](https://lighthouse-md.com/audits/largest-contentful-paint), [CLS](https://lighthouse-md.com/audits/cumulative-layout-shift), [TBT](https://lighthouse-md.com/audits/total-blocking-time), [render-blocking resources](https://lighthouse-md.com/audits/render-blocking-resources), [unused JavaScript](https://lighthouse-md.com/audits/reduce-unused-javascript), [canonical tags](https://lighthouse-md.com/audits/canonical-tag), and more.

## Data: how bad is web performance in the wild?

We ran this exact pipeline over **269 live Shopify and DTC storefronts** in July 2026. Median mobile Performance score: **48**. Median LCP: **10.0 seconds**. Not one recognizable brand cracked 50. Full study with charts and methodology: [Mobile Lighthouse performance across 269 Shopify stores](https://lighthouse-md.com/reports/shopify-lighthouse-performance-2026). The dataset is in [`data/shopify-lighthouse-2026.csv`](data/shopify-lighthouse-2026.csv) (CC BY 4.0).

## Related

- **Web app:** [lighthouse-md.com](https://lighthouse-md.com) · paste a URL, copy the brief, or open Claude Code with one click
- **Chrome extension:** [audit the active tab](https://chromewebstore.google.com/search/lighthouse-md) in one click
- **Audit library:** [lighthouse-md.com/audits](https://lighthouse-md.com/audits/) · every guide also served as raw `.md` for agents

## License

[MIT](LICENSE). The Shopify study dataset is CC BY 4.0 (attribution: lighthouse-md.com).
