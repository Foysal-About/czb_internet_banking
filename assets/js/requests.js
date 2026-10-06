/* Request status (spec §16): table, status colours by keyword, detail drawer, filter + search, empty state + Retry */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc;
  var REQ = [
    { id: "CBO2610018841", type: "Cheque book order", icon: "book", status: "In Progress", date: "01-Oct-2026 | 10:12 AM", sum: "25 Leaf Current Cheque Book", tl: 2, details: [["Account", "General Account"], ["Account number", "0012034571340"], ["Cheque book", "25 Leaf Current Cheque Book"], ["Total charges (TK)", "৳175.00"], ["Delivery branch", "Gulshan Branch"]] },
    { id: "CSP2609290452", type: "Stop cheque", icon: "ban", status: "Approved", date: "29-Sep-2026 | 03:40 PM", sum: "Cheque 001115", tl: 3, details: [["Account", "General Account"], ["Cheque number", "001115"], ["Cheque amount", "৳25,000.00"], ["Reason", "Cheque lost in transit"]] },
    { id: "CPP2609220377", type: "Positive pay", icon: "shieldCheck", status: "Completed", date: "22-Sep-2026 | 11:05 AM", sum: "Cheque 002210 to Rafiq Ahmed", tl: 3, details: [["Account", "Salary Account"], ["Cheque number", "002210"], ["Cheque amount", "৳8,750.00"], ["Start date", "22-Sep-2026"], ["End date", "30-Sep-2026"], ["Beneficiary name", "Rafiq Ahmed"]] },
    { id: "CTD2609150219", type: "Tax document upload", icon: "fileUp", status: "Under Review", date: "15-Sep-2026 | 09:30 AM", sum: "TIN Certificate", tl: 2, details: [["Document type", "TIN Certificate"], ["TIN Number", "123456789012"], ["Issue Date", "01-Jan-2026"], ["File", "tin-certificate.pdf"]] },
    { id: "CDP2609080133", type: "Transaction dispute", icon: "alert", status: "Rejected", date: "08-Sep-2026 | 02:18 PM", sum: "ATM withdrawal ৳5,000.00", tl: 3, failed: true, note: "The transaction matches ATM records, so no refund is due. Contact your branch if you have more evidence.", details: [["Account", "Savings Account"], ["Dispute type", "ATM withdrawal"], ["Transaction date", "05-Sep-2026"], ["Disputed amount", "৳5,000.00"], ["Narration", "Cash was not dispensed but my account was debited."]] },
    { id: "CMP2608300091", type: "Complain", icon: "message", status: "Resolved", date: "30-Aug-2026 | 04:55 PM", sum: "Charges and fees", tl: 3, details: [["Account", "General Account"], ["Subject", "Charges and fees"], ["Description", "An annual fee was charged twice."]] },
    { id: "CTD2608120044", type: "Tax document upload", icon: "fileUp", status: "Pending", date: "12-Aug-2026 | 12:01 PM", sum: "Income Tax Return Acknowledgement", tl: 1, details: [["Document type", "Income Tax Return Acknowledgement"], ["Assessment Year", "2026-2027"], ["File", "return-ack.pdf"]] },
    { id: "CBO2607040012", type: "Cheque book order", icon: "book", status: "Cancelled", date: "04-Jul-2026 | 10:44 AM", sum: "50 Leaf Current Cheque Book", tl: 3, failed: true, note: "You cancelled this order before it was processed.", details: [["Account", "Salary Account"], ["Cheque book", "50 Leaf Current Cheque Book"], ["Delivery branch", "Uttara Branch"]] }
  ];
  /* requests raised in this browser session (RF.log) come first */
  try {
    (JSON.parse(sessionStorage.getItem("cb-requests") || "[]")).forEach(function (r) {
      REQ.unshift({ id: r.id, type: r.type, icon: r.icon, status: r.status, date: r.date, sum: (r.details[0] ? r.details[0][1] : ""), tl: 1, details: r.details, fresh: true });
    });
  } catch (e) {}

  /* spec §16: green process/approve/complete/success · red declin/reject/fail/cancel · amber progress/pending/review · grey other */
  function tone(s) {
    s = String(s).toLowerCase();
    if (/process|approve|complete|success|resolv/.test(s)) return "ok";
    if (/declin|reject|fail|cancel/.test(s)) return "fail";
    if (/progress|pending|review/.test(s)) return "pending";
    return "plain";
  }
  var GROUPS = [["All", null], ["Completed", "ok"], ["In progress", "pending"], ["Rejected", "fail"], ["Other", "plain"]];
  var state = { group: "All", q: "", from: "", to: "", loading: false, error: false };
  var body = $("#rqBody"), chipsEl = $("#rqChips"), search = $("#rqSearch"), from = $("#rqFrom"), to = $("#rqTo"), clear = $("#rqClear");
  var qs = location.search; if (/state=error/.test(qs)) state.error = true; if (/state=empty/.test(qs)) REQ.length = 0;

  function isoOf(d) { var m = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }, p = d.split(" ")[0].split("-"); return p[2] + "-" + String(m[p[1]]).padStart(2, "0") + "-" + p[0]; }
  function filtered() {
    return REQ.filter(function (r) {
      var t = tone(r.status), g = GROUPS.filter(function (x) { return x[0] === state.group; })[0][1];
      if (g && t !== g) return false;
      var iso = isoOf(r.date);
      if (state.from && iso < state.from) return false;
      if (state.to && iso > state.to) return false;
      return !state.q || (r.type + " " + r.id + " " + r.sum + " " + r.status).toLowerCase().indexOf(state.q) > -1;
    });
  }
  function paintChips() {
    chipsEl.innerHTML = GROUPS.map(function (g) {
      var n = REQ.filter(function (r) { return !g[1] || tone(r.status) === g[1]; }).length;
      return '<button type="button" data-g="' + g[0] + '" class="' + (g[0] === state.group ? "on" : "") + '" aria-pressed="' + (g[0] === state.group) + '">' + g[0] + "<i>" + n + "</i></button>";
    }).join("");
  }
  function skeleton() {
    body.innerHTML = '<div style="display:grid;gap:14px;padding:6px 0">' + Array(5).join('<div class="skel" style="height:44px"></div>') + "</div>";
  }
  function paint() {
    paintChips();
    clear.hidden = !(state.group !== "All" || state.q || state.from || state.to);
    if (state.loading) { skeleton(); $("#rqCount").textContent = "Loading requests"; return; }
    if (state.error) {
      body.innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon("alert", 26) + '</div><b>We could not load your requests</b><p>Check your connection and try again.</p><button type="button" class="btn-pri btn-sm" data-retry>Retry</button></div>';
      $("#rqCount").textContent = ""; return;
    }
    var r = filtered();
    $("#rqCount").textContent = r.length + " of " + REQ.length + " requests";
    if (!r.length) {
      body.innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon("clipboard", 26) + '</div><b>No requests found</b><p>' + (REQ.length ? "Nothing matches these filters." : "Requests you raise will show up here.") + '</p><button type="button" class="btn-sec btn-sm" data-retry>Retry</button></div>';
      return;
    }
    body.innerHTML = '<table class="dtable rq-table"><thead><tr><th>Request</th><th>Date</th><th>Reference</th><th>Status</th><th></th></tr></thead><tbody>' + r.map(function (x) {
      return '<tr class="clickable" tabindex="0" data-id="' + x.id + '" aria-label="Open ' + esc(x.type) + ' ' + x.id + '"><td class="rq-c-type"><div class="rq-type"><span class="rq-ic">' + cb.icon(x.icon, 18) + "</span><div><b>" + esc(x.type) + "</b><small>" + esc(x.sum) + '</small></div></div></td><td class="rq-c-date num">' + x.date.split(" | ")[0] + '</td><td class="rq-c-ref"><span class="rq-ref">' + x.id + '</span></td><td class="rq-c-status"><span class="chip ' + tone(x.status) + '">' + esc(x.status) + '</span></td><td class="rq-go">' + cb.icon("chevR", 16) + "</td></tr>";
    }).join("") + "</tbody></table>";
  }
  function load() {
    state.loading = true; paint();
    setTimeout(function () { state.loading = false; state.error = false; paint(); }, 600);
  }

  /* events */
  chipsEl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; state.group = b.dataset.g; paint(); });
  search.addEventListener("input", function () { state.q = search.value.trim().toLowerCase(); paint(); });
  from.addEventListener("change", function () { state.from = from.value; paint(); });
  to.addEventListener("change", function () { state.to = to.value; paint(); });
  clear.addEventListener("click", function () { state.group = "All"; state.q = state.from = state.to = ""; search.value = from.value = to.value = ""; paint(); });
  body.addEventListener("click", function (e) {
    if (e.target.closest("[data-retry]")) { load(); return; }
    var tr = e.target.closest("tr.clickable"); if (tr) openDrawer(tr.dataset.id, tr);
  });
  body.addEventListener("keydown", function (e) {
    var tr = e.target.closest && e.target.closest("tr.clickable");
    if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openDrawer(tr.dataset.id, tr); }
  });

  /* new request menu */
  var nw = $("#rqNew"), nwb = $("#rqNewBtn");
  nwb.addEventListener("click", function (e) { e.stopPropagation(); var o = nw.classList.toggle("open"); nwb.setAttribute("aria-expanded", o); });
  document.addEventListener("click", function (e) { if (!nw.contains(e.target)) { nw.classList.remove("open"); nwb.setAttribute("aria-expanded", "false"); } });

  /* drawer */
  var drawer = $("#rqDrawer"), panel = $("#dPanel"), opener = null;
  var STEPS = ["Submitted", "Under review", "Completed"];
  function timeline(r) {
    var t = tone(r.status), cur = r.tl || 1;
    return '<ol class="rq-tl">' + STEPS.map(function (s, i) {
      var n = i + 1, cls = r.failed && n === cur ? "failed" : n < cur || (n === cur && t === "ok") ? "done" : n === cur ? "current" : "upcoming";
      var label = n === 3 && r.failed ? r.status : s, sub = n === 1 ? r.date : n === cur && cls !== "upcoming" ? r.status : "Waiting";
      return '<li class="' + cls + '"><span class="tl-dot">' + (cls === "done" ? cb.icon("check", 14, 3) : cls === "failed" ? cb.icon("x", 14, 3) : "") + '</span><span class="tl-t"><b>' + esc(label) + "</b><span>" + esc(sub) + "</span></span></li>";
    }).join("") + "</ol>";
  }
  function openDrawer(id, from) {
    var r = REQ.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    opener = from;
    panel.innerHTML = '<div class="rq-dh"><span class="rq-ic">' + cb.icon(r.icon, 22) + '</span><div><h2 id="dTitle">' + esc(r.type) + "</h2><p>Reference " + r.id + '</p><span class="chip ' + tone(r.status) + '">' + esc(r.status) + '</span></div><button type="button" class="rq-dx" data-close aria-label="Close details">' + cb.icon("x", 18) + "</button></div>" +
      '<div class="rq-db">' + (r.note ? '<div class="rq-note fail"><b>Note from the bank</b>' + esc(r.note) + "</div>" : "") +
      "<section><h3>Progress</h3>" + timeline(r) + "</section>" +
      "<section><h3>Request details</h3><dl class=\"kv\">" + r.details.map(function (d) { return "<div><dt>" + esc(d[0]) + "</dt><dd>" + esc(d[1]) + "</dd></div>"; }).join("") + "</dl></section></div>" +
      '<div class="rq-df"><button type="button" class="btn-sec" data-close>Close</button><a class="btn-pri" href="complain.html" style="display:inline-grid;place-items:center;text-decoration:none">Raise a complain</a></div>';
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
    setTimeout(function () { var x = $(".rq-dx", panel); if (x) x.focus(); }, 60);
  }
  function closeDrawer() {
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
    if (opener) opener.focus();
  }
  drawer.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeDrawer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  load();
})();
