/* Transaction history (spec §8.3) + Payment history. Dummy data; rows open receipt.html. */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc, D = window.CB_DATA;
  var TODAY = "2026-10-01", PAGE = 10;
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transfer types per tab (spec: FT {3,24-26,30-32,66,70}, Mobile {48}, Bill Pay = the rest)
  var TYPES = {
    ft: [[3, "Own Account Transfer"], [24, "EFT"], [25, "RTGS"], [26, "NPSB"], [30, "Account to Card"], [31, "Card to Card"], [32, "Card to Account"], [66, "Beneficiary Transfer"], [70, "Citizens Account Transfer"]],
    mb: [[48, "MFS Transfer"]],
    bp: [[11, "Electricity Bill"], [12, "Water Bill"], [13, "Gas Bill"], [14, "Internet Bill"], [15, "Credit Card Bill"], [16, "Mobile Recharge"]]
  };
  var PAYEES = {
    3: ["Savings Account", "Salary Account", "Joint Savings"], 24: ["Mahmudul Hasan", "Farhana Akter", "Kamal Traders"], 25: ["Kamal Traders", "Mahmudul Hasan"],
    26: ["Farhana Akter", "Mahmudul Hasan", "Kamal Traders"], 30: ["VISA •••• 2290", "Mastercard •••• 6612"], 31: ["Citizens Platinum •••• 4421", "Citizens Gold •••• 0918"],
    32: ["General Account"], 66: ["Anoy Islam", "Nusrat Jahan", "Rafiq Ahmed"], 70: ["Anoy Islam", "Nusrat Jahan"],
    48: ["Rahima Begum (bKash)", "Jamal Uddin (Nagad)", "Sumi Akter (Tap)"],
    11: ["DESCO Prepaid", "DPDC Postpaid"], 12: ["Dhaka WASA"], 13: ["Titas Gas"], 14: ["Link3 Internet", "Carnival Internet"], 15: ["Citizens Platinum •••• 4421"], 16: ["01711234567", "01819876543", "01912445566"]
  };
  var DEBIT = (D.accounts || []).filter(function (a) { return a.types.indexOf(5) > -1; });

  // deterministic pseudo-random so the demo looks the same on every load
  function rng(seed) { var s = seed; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function show(i) { var p = i.split("-"); return p[2] + "-" + MON[+p[1] - 1] + "-" + p[0]; }
  var CACHE = {};
  function rowsFor(tab, id, label) {
    var k = id; if (CACHE[k]) return CACHE[k];
    var r = rng(id * 97 + 13), n = id === 48 ? 26 : 12 + (id % 7) * 3, base = new Date(2026, 9, 1), out = [], day = 0;
    for (var i = 0; i < n; i++) {
      day += 1 + Math.floor(r() * 11);
      var d = new Date(base.getTime() - day * 86400000), acc = DEBIT[Math.floor(r() * DEBIT.length)];
      var big = id === 25 ? 100000 : id === 16 ? 50 : id === 48 ? 300 : 120;
      var amt = Math.round((big + r() * big * 14) / 10) * 10 + (r() < .3 ? 0.5 : 0);
      if (id === 16) amt = [50, 100, 150, 200, 300, 500][Math.floor(r() * 6)];
      var pays = PAYEES[id], fee = tab === "ft" && id !== 3 ? (id === 25 ? 50 : 10) : 0;
      out.push({ tab: tab, typeId: id, type: label, acc: acc, iso: iso(d), to: pays[Math.floor(r() * pays.length)], amount: amt, fee: fee,
        txn: "CZB" + (26000000 + id * 1000 + i * 37 + Math.floor(r() * 30)) });
    }
    out.sort(function (a, b) { return a.iso < b.iso ? 1 : -1; });
    return (CACHE[k] = out);
  }
  function pool(tab) {
    var all = [];
    TYPES[tab].forEach(function (t) { all = all.concat(rowsFor(tab, t[0], t[1])); });
    return all;
  }

  function receiptOf(r) {
    var rows = [["Transaction ID", r.txn], ["Date", show(r.iso)], ["From", r.acc.product + " (" + r.acc.no + ")"], ["Receiver", r.to], ["Type", r.type], ["Amount", cb.fmt(r.amount)]];
    if (r.fee) rows.push(["Charge + VAT", cb.fmt(r.fee)]);
    rows.push(["Total debited", cb.fmt(r.amount + r.fee)]);
    cb.saveReceipt({ title: "Successful", amount: cb.fmt(r.amount), txnId: r.txn, rows: rows, type: r.type, date: show(r.iso), back: "history.html" + (location.hash || "") });
    location.href = "receipt.html";
  }

  function csv(rows, name) {
    var q = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
    var body = ["Date,Transaction ID,Type,From account,To,Amount (BDT)"].concat(rows.map(function (r) {
      return [show(r.iso), r.txn, r.type, r.acc.no, r.to, r.amount.toFixed(2)].map(q).join(",");
    })).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" }));
    a.download = name + ".csv"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    cb.toast("CSV exported", "success");
  }

  // One list controller per pane: its own filters and its own paging
  function mount(root, cfg) {
    var k = cfg.key, st = { type: null, acc: "", seg: cfg.segs ? cfg.segs[0][0] : null, shown: PAGE, rows: [] };
    var h = '<div class="card hx-filters"><div class="hx-grid">';
    if (cfg.types) h += '<div class="fld hx-type"><label>Transfer type <span class="req">*</span></label><div id="' + k + 'Type"></div></div>';
    if (cfg.source) h += '<div class="fld hx-type"><label>Source account <i>Optional</i></label><div id="' + k + 'Src"></div></div>';
    h += '<div class="fld" id="' + k + 'FromF"><label for="' + k + 'From">From date <span class="req">*</span></label><input type="date" id="' + k + 'From" max="' + TODAY + '"></div>' +
      '<div class="fld" id="' + k + 'ToF"><label for="' + k + 'To">To date <span class="req">*</span></label><input type="date" id="' + k + 'To" max="' + TODAY + '"></div></div>' +
      '<p class="ferr" id="' + k + 'Err" role="alert" hidden>The From date must not be after the To date.</p></div>' +
      '<div class="card hx-result"><div class="hx-bar"><div><h3 class="card-title" id="' + k + 'Title">Transactions</h3><small class="muted" id="' + k + 'Count"></small></div>' +
      '<button type="button" class="btn-sec btn-sm" id="' + k + 'Csv" disabled>' + cb.icon("download", 15) + 'Export CSV</button></div>' +
      '<div id="' + k + 'Body"></div></div>';
    root.innerHTML = h;
    var from = $("#" + k + "From"), to = $("#" + k + "To"), body = $("#" + k + "Body"), err = $("#" + k + "Err"), csvBtn = $("#" + k + "Csv");

    if (cfg.types) cb.select($("#" + k + "Type"), { placeholder: "Select transfer type", searchPlaceholder: "Search transfer type",
      items: cfg.types.map(function (t) { return { value: t[0], title: t[1], sub: "Type " + t[0] }; }),
      onChange: function (it) { st.type = it.value; run(); } });
    if (cfg.source) cb.select($("#" + k + "Src"), { placeholder: "All accounts", searchPlaceholder: "Search accounts", value: "",
      items: [{ value: "", title: "All accounts" }].concat(cb.accountItems(5)),
      onChange: function (it) { st.acc = it.value; run(); } });

    if (cfg.segs) {
      var seg = document.createElement("div"); seg.className = "seg hx-seg"; seg.setAttribute("role", "group");
      seg.innerHTML = cfg.segs.map(function (s, i) { return '<button type="button" class="' + (i ? "" : "on") + '" data-seg="' + s[0] + '">' + s[1] + '</button>'; }).join("");
      root.insertBefore(seg, root.firstChild);
      seg.addEventListener("click", function (e) {
        var b = e.target.closest("[data-seg]"); if (!b) return;
        $$("button", seg).forEach(function (x) { x.classList.toggle("on", x === b); }); st.seg = b.dataset.seg; run();
      });
    }

    function msg(ic, t, p) { body.innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon(ic, 24) + '</div><b>' + t + '</b><p>' + p + '</p></div>'; }
    function setCount(t) { $("#" + k + "Count").textContent = t; }

    function run() {
      st.shown = PAGE; st.rows = [];
      var bad = from.value && to.value && from.value > to.value;
      $("#" + k + "FromF").classList.toggle("invalid", !!bad); $("#" + k + "ToF").classList.toggle("invalid", !!bad); err.hidden = !bad;
      csvBtn.disabled = true; setCount("");
      if (bad) return msg("alert", "Check your dates", "Correct the date range to see transactions.");
      if (!from.value || !to.value || (cfg.types && st.type == null)) {
        return msg("filter", cfg.types ? "Choose a transaction type, then a From and To date" : "Choose a From and To date", "Your transactions will appear here once all required filters are set.");
      }
      var src = cfg.types ? rowsFor(k, st.type, cfg.types.filter(function (t) { return t[0] === st.type; })[0][1]) : cfg.pool(st.seg);
      st.rows = src.filter(function (r) { return r.iso >= from.value && r.iso <= to.value && (!st.acc || r.acc.id === st.acc); });
      if (!st.rows.length) return msg("inbox", "No transactions in this period.", "Try a wider date range" + (cfg.types ? " or another transfer type." : "."));
      csvBtn.disabled = false; draw();
    }

    function draw() {
      var vis = st.rows.slice(0, st.shown);
      setCount("Showing " + vis.length + " of " + st.rows.length);
      body.innerHTML = '<div class="table-wrap"><table class="dtable hx-table"><thead><tr><th>Date</th><th>Type</th><th>From account</th><th>To</th><th class="r">Amount</th><th class="hx-go"></th></tr></thead><tbody>' +
        vis.map(function (r, i) {
          return '<tr class="clickable" tabindex="0" role="link" data-i="' + i + '" aria-label="Open receipt ' + esc(r.txn) + '">' +
            '<td class="hx-date num">' + show(r.iso) + '</td><td class="hx-ty"><span class="chip info plain">' + esc(r.type) + '</span></td>' +
            '<td class="hx-from"><b>' + esc(r.acc.product) + '</b><small>' + cb.mask(r.acc.no) + '</small></td>' +
            '<td class="hx-to">' + esc(r.to) + '<small class="num">' + esc(r.txn) + '</small></td>' +
            '<td class="r num hx-amt amt-dr"><b>' + cb.fmt(r.amount) + '</b></td><td class="hx-go">' + cb.icon("chevR", 16) + '</td></tr>';
        }).join("") + '</tbody></table></div>' +
        (st.rows.length > st.shown ? '<div class="hx-more"><button type="button" class="btn-sec" id="' + k + 'More">Show more</button></div>' : "");
      var more = $("#" + k + "More");
      if (more) more.addEventListener("click", function () { st.shown += PAGE; draw(); var rs = $$("tbody tr", body); if (rs[st.shown - PAGE]) rs[st.shown - PAGE].focus({ preventScroll: true }); });
    }
    function open(tr) { if (tr) receiptOf(st.rows[+tr.dataset.i]); }
    body.addEventListener("click", function (e) { open(e.target.closest("tr.clickable")); });
    body.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.matches("tr.clickable")) { e.preventDefault(); open(e.target); } });
    from.addEventListener("change", run); to.addEventListener("change", run);
    csvBtn.addEventListener("click", function () { csv(st.rows, "history_" + k + "_" + from.value + "_" + to.value); });
    run();
  }

  mount($("#hxFt"), { key: "ft", types: TYPES.ft });
  mount($("#hxBp"), { key: "bp", types: TYPES.bp });
  mount($("#hxMb"), { key: "mb", types: TYPES.mb });
  mount($("#hxPay"), { key: "py", source: true, segs: [["1", "Transfers"], ["2", "Bill Pay"]],
    pool: function (s) { return s === "1" ? pool("ft").concat(pool("mb")).sort(srt) : pool("bp").sort(srt); } });
  function srt(a, b) { return a.iso < b.iso ? 1 : -1; }

  // view switch: Transaction history | Payment history
  var views = $("#hxViews");
  function view(v) {
    $$("button", views).forEach(function (b) { b.classList.toggle("on", b.dataset.view === v); b.setAttribute("aria-selected", b.dataset.view === v); });
    $("#hxTxn").hidden = v !== "txn"; $("#hxPayWrap").hidden = v !== "pay";
    $("#hxH1").textContent = v === "pay" ? "Payment History" : "Transaction History";
    var crumb = $("#hxCrumb"); if (crumb) crumb.textContent = $("#hxH1").textContent;
    try { history.replaceState(null, "", v === "pay" ? "#payment" : location.pathname); } catch (e) {}
  }
  views.addEventListener("click", function (e) { var b = e.target.closest("[data-view]"); if (b) view(b.dataset.view); });
  view(location.hash === "#payment" ? "pay" : "txn");
  cb.tabs($("#hxTabs"));
})();
