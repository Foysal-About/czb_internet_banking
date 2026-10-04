# Citizens FAST portal — front-end conventions

Design-only build of the Citizens FAST internet banking portal (mirrors the mobile app spec).
No API calls: every screen runs on dummy data from `assets/data.js`.

## Files

| File | What it holds |
|---|---|
| `assets/app.css` | Design tokens (`:root`), shell, and the shared component kit. **Do not add page-specific CSS here.** |
| `assets/css/<area>.css` | Page/area styles (one file per area, e.g. `accounts.css`). Use tokens only — never raw hex. |
| `assets/data.js` | `window.CB_DATA`: user, accounts, cards, beneficiaries, MFS, banks/branches, transactions. |
| `assets/app.js` | Shell (sidebar, top bar, session, notifications, user menu) + `window.cb` component kit. |
| `assets/js/<page>.js` | Page logic. Wrap in an IIFE, use `cb.$` / `cb.$$`. |

## Page skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Statement · Citizens FAST</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-20 -60 651 558'%3E%3Cpath fill='%238b1c1c' d='M219 0L375 156 339 192 219 73 73 219 219 365 277 309 313 345 219 438 0 219Z M458 130L611 283 458 436 193 171 228 135 458 364 538 284 458 204 404 257 368 221Z'/%3E%3C/svg%3E">
<script>try{document.documentElement.setAttribute("data-theme",localStorage.getItem("citizens-theme")==="dark"?"dark":"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/app.css">
<link rel="stylesheet" href="assets/css/accounts.css">
</head>
<body data-page="statement">
<div class="app">
  <main class="main">
    <header class="topbar">
      <div class="greeting page-title">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Dashboard</a><span data-icon="chevR" data-size="12"></span><span>Accounts</span><span data-icon="chevR" data-size="12"></span><b>Statement</b></nav>
        <h1>Statement</h1>
      </div>
    </header>
    <!-- page content -->
  </main>
</div>
<script src="assets/data.js"></script>
<script src="assets/app.js"></script>
<script src="assets/js/statement.js"></script>
</body>
</html>
```

`data-page` must match the menu ids in `app.js` (`MENU` / `DISCOVER`) so the sidebar highlights.
Public (pre-login) pages use `<body data-shell="public">` and their own layout (no `.app` sidebar).

## Shared CSS classes (in app.css)

- Layout: `.card`, `.two-col` (content + 340px side), `.grid-auto`, `.ft-layout`/`.ft-main`/`.ft-side` (form + sticky summary)
- Page: `.page-head`, `.section-title`, `.card-head` (h3 + link), `.card-title`, `.muted`
- Buttons: `.btn-pri`, `.btn-sec`, `.btn-danger`, `.btn-gold`, `.btn-link`, `.btn-ghost`, `.btn-sm`, `.icon-only`
- Forms: `.fld` (label + input/select/textarea), `.form-grid` (2 cols; `.full` spans), `.in-group`, `.pass-in` + `<button data-toggle-pass>`,
  `.amount-in` (+ `.words`, `.chips`), `.seg` (segmented), `.check`, `.switch`, `.file-drop`, `.err` (+`.show`), `.fld.invalid`, `.ferr`
- Flow: `.stepper` + `.ft-step[data-step]`, `.review-hero`, `.party`, `.kv` (review rows; `.total`), `.success` + `.tick`, `.txn-id`
- Data: `.dtable` (+`.r`, `.amt-cr`, `.amt-dr`, `tr.clickable`), `.chip.ok|fail|pending|info`, `.kv-grid` (dt/dd), `.tabs` (underline tabs)
- States: `.empty-state` (+`.es-ic`), `.soon-card`/`.soon-pill`, `.alert-bar(.warn|.danger)`, `.skel` (skeleton)
- Lists: `.list-card` > `.list-row` (`.lr-ic`, `.lr-t`)
- Receipt: `.receipt-card` > `.rc-head`, `.rc-body`, `.rc-amt`, `.rc-rows`

## `window.cb` kit

| Call | Use |
|---|---|
| `cb.icon(name, size, stroke)` | Lucide SVG string. Names: see `I` in app.js. Or `<span data-icon="name" data-size="16">` |
| `cb.fmt(n)` / `cb.fmtPaisa(p)` / `cb.toPaisa(v)` | `৳12,480.00`. Money math in integer paisa. |
| `cb.mask(acc)` → `ACC **1234`, `cb.date()` → `01-Oct-2026`, `cb.dt()` → `01-Oct-2026 \| 03:14 PM`, `cb.words(n)`, `cb.txnId(prefix)` |
| `cb.valid.account/mobile/email/card(v)` | Spec §4.4 rules |
| `cb.select(el, {items, placeholder, footer, onChange, search})` | Searchable select/combobox. Items: `cb.accountItems(5)` (debit), `cb.accountItems(6)`, `cb.cardItems()`, `cb.beneficiaryItems(group, type)` |
| `cb.amount(el, {chips, whole, max})` | Wires an `.amount-in` (+ sibling `.words`, `.chips`). Returns `{paisa(), set(n)}` |
| `cb.authCards(el, {title})` | SMS / Email auth method radio cards → `{get()}` |
| `cb.otp({message, onSuccess, onCancel})` | Centred OTP modal (6 digits, 85 s countdown, resend gated). `000000` = wrong code demo. |
| `cb.confirm({title, message, ok, danger})` → Promise<bool> · `cb.done({title, message})` · `cb.dialog({...})` | Dialogs |
| `cb.toast(msg, "success"|"error")` | Toast |
| `cb.tabs(tablistEl, onChange)` | `[data-tab]` buttons ↔ `[data-pane]` panes inside `[data-tabs-scope]`. Auto-inits `[data-tabs]`. |
| `cb.step(rootEl, n)` | Stepper flows |
| `cb.saveReceipt({title, amount, rows, txnId})` then `location.href="receipt.html"` | Shared receipt page |
| `cb.logout()` / `[data-logout]`, `[data-copy="text"]`, `[data-soon="Feature"]` | Behaviours |

## Rules from the spec

- Brand tokens only (`--primary`, `--card-grad`, `--acc-czb/-other/-mfs`, `--mfs-*`, `--gold`). Light + dark both work.
- Amounts: ৳ prefix, max 2 decimals, quick chips. Account numbers masked `ACC **1234` in lists; full number on review/receipt.
- Request/transaction flow: form → review (auth cards) → `cb.otp` → success → receipt. Back must not re-enter a finished flow.
- Errors: sentence copy, never raw text. Empty states with **Retry** for first-load failures.
- Content is capped at 1200px. Pages must work at 390px width (no horizontal scroll).
