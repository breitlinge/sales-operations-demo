# Sales Operations Demo

**A practical view of pipeline, follow-up and activity using entirely fictional data.**

Prepared as a portfolio prototype for Edmund Breitling. The purpose is to show how sales-operations questions can become a simple, usable workflow.

## The business problem

A pipeline total alone does not explain what the team should do next. Owners need to see which opportunities lack a next step, which follow-ups are overdue, and how recent activity relates to those opportunities.

This demonstration brings those views together without connecting to a CRM or exposing customer information.

## Explore it

Open `index.html` in a modern browser, or serve this folder locally:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit `http://localhost:8000`. No installation is required to run the demo. Stop the server with Ctrl+C.

Try this two-minute walkthrough:

1. Compare open pipeline with weighted pipeline.
2. Filter by owner or expected close period. See the metrics and opportunities change together.
3. Open **Account 01**, update its next step and due date, and save the temporary edit.
4. Look at Recent activity to see the change recorded in the demonstration.
5. Switch between List and Cards, export the filtered fictional pipeline, then reset the demo.

## What works

- Search across accounts, opportunities, industries and acquisition sources
- Owner, stage and expected-close filters
- Open value, illustrative weighted value, overdue actions and closed-won value
- Pipeline stage chart and prioritized overdue/missing/due-today actions
- List and card views
- Opportunity stage and follow-up editing in memory
- Activity history and a separate activity-date filter
- Filtered CSV export with formula-like text escaped
- Reset confirmation, dialog cancellation and keyboard-accessible controls
- Responsive layout with narrow-screen styles

## Deliberate boundaries

All twelve accounts, three owners, activities, dates and dollar amounts are invented. Data starts from the same fixed demo date, **November 5, 2026**, so the examples and tests stay repeatable.

There is no authentication, CRM connection, email sending, database, analytics tracker or durable browser storage. Edits reset when the page reloads. Do not enter real customer or confidential information. The page's security policy blocks application network connections, but that does not turn a public static page into a secure CRM.

This is newly created demonstration code. It is not a copy, export or public version of any employer's production system. No historical business results or revenue impact are claimed.

## Metric definitions

| Metric | Definition |
|---|---|
| Open pipeline | Sum of opportunity amount, excluding Won and Lost |
| Weighted pipeline | Sum of each open opportunity amount × its illustrative stage weight, rounded per record |
| Overdue next steps | Open opportunities with a due date earlier than the fixed demo date |
| Missing next steps | Open opportunities missing either the action text or due date |
| Closed-won value | Sum of amounts for Won opportunities in the current filters |

Stage weights: Discovery 15%, Qualified 35%, Proposal 60%, Negotiation 80%, Won 100%, Lost 0%. These are illustrative assumptions, not calibrated probabilities or a prediction model.

Expected-close periods filter opportunities by expected close date, not creation date. This also determines which opportunities' activities are shown. The activity-date filter then narrows those activities separately. Weeks run Monday through Sunday, all date handling uses UTC, and every amount is USD. There is no currency conversion.

Baseline checks: 12 opportunities, 9 open, **$350,000** open value, **$200,600** weighted open value, 3 overdue next steps, 1 missing next step and **$80,000** closed-won value. These are synthetic fixture totals, not professional accomplishments.

## Project structure

```text
index.html                 Page structure and accessibility hooks
assets/styles.css          Responsive design
assets/data.js             Invented sample records
assets/metrics.js          Pure filtering, metric and CSV functions
assets/app.js              Interface and temporary state
tests/metrics.test.cjs     Dependency-free calculation tests
tests/interface.test.cjs   Application-state checks using a minimal DOM stub
tests/browser.test.cjs     Optional browser interaction checks
docs/CASE-STUDY.md          Business framing and design decisions
docs/AI-WORKFLOW.md         Synthetic AI-assisted workflow example
docs/VALIDATION.md          Checks, limitations and review checklist
```

## Checks

Node.js 20+ is needed only for the checks:

```sh
npm run check
```

This runs JavaScript syntax checks and seventeen tests: ten calculation/data tests and seven application-state checks using a minimal DOM stub. The latter exercise event handlers and rendering decisions, not browser layout or accessibility. No npm packages are required.

Optional browser interaction checks use Playwright (a development tool, not an app dependency):

```sh
npm install --no-save playwright@1.62.1
npx playwright install chromium
npm run test:ui
```

If Chromium is already installed, set `CHROMIUM_PATH` to its executable path. The test uses an isolated browser and a temporary local HTTP server; it does not use a signed-in profile.

See [validation notes](docs/VALIDATION.md) for what has actually been run. A supplied test script does not mean that the test passed.

## Attribution and role

This project was prepared for Edmund's business-focused portfolio in response to his request for a safe demonstration of dashboard work. AI assisted with code, documentation and initial verification. The business framing is informed by sales and partnership operations priorities; it is not evidence that Edmund personally authored every line or has reviewed every design choice. Personal review is required before presenting it as finished portfolio work.

## Hosting and licensing

The application is static and can be hosted on GitHub Pages. No build step is needed: the site entry point is the repository-root `index.html`, with relative asset paths. Publishing a repository or Pages site is a separate decision. No repository or deployment is created by this package.

No open-source license has been selected. Choose a license deliberately before encouraging code reuse. No third-party packages, fonts or image assets are bundled into the application.
