/* Cards (spec section 13): list visuals, details, add card, more services, transactions. Design-only. */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc;
  var cards = (CB_DATA.cards || []).map(function (c) { return Object.assign({}, c); });
  var sel = 0;
  var MOBILE = CB_DATA.user.mobile;

  function last4(c) { return String(c.no).replace(/\D/g, "").slice(-4); }
  function kindClass(c) { return c.type === "Credit" ? (/gold/i.test(c.title) ? "k-gold" : "k-credit") : ""; }
  function visual(c, i) {
    return '<button type="button" role="option" class="cd-visual ' + kindClass(c) + (i === sel ? " on" : "") + '" data-i="' + i + '" aria-selected="' + (i === sel) + '">' +
      '<div class="cd-v-top"><span>' + esc(c.title) + '</span><b class="cd-net">' + esc(c.network) + "</b></div>" +
      '<div><div class="cd-chip"></div></div>' +
      '<div class="cd-v-no">**** **** **** ' + last4(c) + "</div>" +
      '<div class="cd-v-bot"><div><span>Card holder</span><b>' + esc(c.holder) + '</b></div><div><span>Expires</span><b>' + esc(c.expiry) + '</b></div><span class="cd-tag" style="opacity:1;text-transform:none;letter-spacing:0">' + esc(c.status) + "</span></div></button>";
  }
  function paintList() {
    $("#cdTrack").innerHTML = cards.map(visual).join("") +
      '<button type="button" class="cd-new" id="cdNew"><span class="es-ic">' + cb.icon("cardPlus", 22) + "</span><b>Add Card</b>Link a new account to CZB</button>";
  }

  function kv(rows) { return '<dl class="kv">' + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl>"; }
  function paintDetails() {
    var c = cards[sel], box = $("#cdDetails");
    if (!c) { box.innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon("card", 26) + "</div><b>No cards linked</b><p>Add a card to see its details here.</p></div>"; return; }
    var credit = c.type === "Credit", pct = credit ? Math.round((c.outstanding / c.limit) * 100) : 0, d = "—";
    var rows = [
      ["Card Number", esc(c.no)], ["Card Holder Name", esc(c.holder)], ["Card Type", esc(c.type + " · " + c.network)],
      ["Currency Type", esc(c.currency || "BDT")],
      ["Credit Limit (BDT)", credit ? cb.fmt(c.limit) : d], ["Available Credit Limit", credit ? cb.fmt(c.available) : d],
      ["Card Expiry Date", esc(c.expiry)], ["Statement Date", credit ? c.statementDate : d], ["Payment Due Date", credit ? c.dueDate : d],
      ["Minimum Payment Due", credit ? cb.fmt(c.minDue) : d], ["Outstanding Balance", credit ? cb.fmt(c.outstanding) : d],
      ["Mobile Number", esc(MOBILE)]
    ];
    box.innerHTML = '<div class="cd-det-top"><h3 class="card-title">Card details</h3><span class="chip ' + (c.status === "Active" ? "ok" : "fail") + '">' + esc(c.status) + "</span></div>" +
      (credit ? '<div class="cd-det-sum"><div><span>Available limit</span><b>' + cb.fmt(c.available) + '</b></div><div><span>Outstanding</span><b>' + cb.fmt(c.outstanding) + '</b></div><div><span>Minimum due</span><b>' + cb.fmt(c.minDue) + '</b></div></div><div class="cd-bar" role="img" aria-label="' + pct + ' percent of limit used"><i style="width:' + pct + '%"></i></div>'
        : '<p class="muted" style="margin:6px 0 14px">Debit card linked to account ' + esc(cb.mask(c.linked || "")) + ". Credit limit fields do not apply.</p>") + kv(rows);
  }

  /* ---- add card ---- */
  function showAdd(on) {
    $("#add").hidden = !on;
    if (on) { $("#add").scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(function () { $("#cdNo").focus({ preventScroll: true }); }, 250); }
    else if (location.hash === "#add") history.replaceState(null, "", location.pathname);
  }
  function ferr(k, m) { var e = $('[data-e="' + k + '"]'); e.textContent = m || ""; e.closest(".fld").classList.toggle("invalid", !!m); }
  $("#cdNo").addEventListener("input", function (e) { var d = e.target.value.replace(/\D/g, "").slice(0, 16); e.target.value = d.replace(/(.{4})/g, "$1 ").trim(); });
  $("#cdExp").addEventListener("input", function (e) { var d = e.target.value.replace(/\D/g, "").slice(0, 4); e.target.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; });
  $("#cdPin").addEventListener("input", function (e) { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });
  $("#cdAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var no = $("#cdNo").value.replace(/\D/g, ""), exp = $("#cdExp").value, pin = $("#cdPin").value, ok = true;
    ferr("no", ""); ferr("exp", ""); ferr("pin", "");
    if (!cb.valid.card(no)) { ferr("no", "Enter the 16-digit card number."); ok = false; }
    var m = /^(\d{2})\/(\d{2})$/.exec(exp);
    if (!m || +m[1] < 1 || +m[1] > 12) { ferr("exp", "Enter the expiry as MM/YY."); ok = false; }
    else if (2000 + +m[2] < 2026 || (2000 + +m[2] === 2026 && +m[1] < 10)) { ferr("exp", "This card has expired."); ok = false; }
    if (!/^\d{4}$/.test(pin)) { ferr("pin", "Enter your 4-digit card PIN."); ok = false; }
    if (!ok) return;
    if (cards.some(function (c) { return last4(c) === no.slice(-4); })) { ferr("no", "This card is already linked."); return; }
    cb.otp({ message: "Verify to link the card ending " + no.slice(-4), onSuccess: function () {
      cards.push({ id: "cn" + Date.now(), title: "Citizens Linked Card", type: "Debit", network: no[0] === "5" ? "Mastercard" : "VISA", no: no.slice(0, 4) + " •••• •••• " + no.slice(-4), expiry: exp, holder: CB_DATA.user.fullName.toUpperCase(), status: "Active", linked: "" });
      sel = cards.length - 1; $("#cdAddForm").reset(); showAdd(false); paintList(); paintDetails(); loadTx();
      cb.done({ title: "Card Added", message: "Your card ending " + no.slice(-4) + " is now linked to Citizens FAST." });
    } });
  });
  $("#cdAddClose").onclick = $("#cdAddCancel").onclick = function () { showAdd(false); };

  /* ---- more services ---- */
  function blockFlow() {
    var c = cards[sel]; if (!c) return;
    cb.dialog({
      title: "Block card", icon: "ban", tone: "danger", size: "sm",
      html: '<div class="cd-dlg"><p>Block <b>' + esc(c.title) + "</b> ending " + last4(c) + '. You can request a replacement afterwards.</p><div class="fld"><label for="blkR">Reason</label><select id="blkR"><option value="">Select a reason</option><option>Lost card</option><option>Stolen card</option><option>Suspicious activity</option><option>Temporary block</option></select><span class="ferr" id="blkE"></span></div></div>',
      buttons: [{ text: "Cancel", value: false }, { text: "Block card", danger: true, onClick: function (api) {
        var r = $("#blkR", api.el).value; if (!r) { $("#blkE", api.el).textContent = "Choose a reason to continue."; return false; }
        setTimeout(function () { cb.otp({ message: "Verify to block the card ending " + last4(c), onSuccess: function () {
          c.status = "Blocked"; paintList(); paintDetails();
          cb.done({ title: "Card Blocked", message: "Your card ending " + last4(c) + " has been blocked (" + esc(r.toLowerCase()) + ")." });
        } }); }, 230);
      } }]
    });
  }
  var SVC = [
    { t: "Block card", s: "Lost, stolen or paused", i: "ban", run: blockFlow },
    { t: "Card statement", s: "Download a statement", i: "sheet", run: function () { $("#cdTx").scrollIntoView({ behavior: "smooth" }); cb.toast("Pick a date range, then download"); } },
    { t: "Virtual prepaid card", s: "For online spending", i: "smartphone", soon: "Virtual prepaid card" },
    { t: "EMI conversion", s: "Split big purchases", i: "calculator", soon: "EMI" },
    { t: "Limit conversion", s: "Change card limits", i: "gauge", soon: "Limit conversion" },
    { t: "Foreign part", s: "Travel and overseas use", i: "globe", soon: "Foreign part" },
    { t: "Passport endorsement", s: "Update foreign quota", i: "idCard", soon: "Passport endorsement" },
    { t: "Service request", s: "Track your requests", i: "inbox", href: "requests.html" }
  ];
  $("#cdMore").innerHTML = SVC.map(function (s, i) {
    var inner = '<span class="ic">' + cb.icon(s.i, 18) + "</span>" + esc(s.t) + "<small>" + esc(s.s) + "</small>" + (s.soon ? '<span class="soon-pill">Soon</span>' : "");
    if (s.href) return '<a class="cd-svc" href="' + s.href + '">' + inner + "</a>";
    return '<button type="button" class="cd-svc" data-i="' + i + '"' + (s.soon ? ' data-soon="' + esc(s.soon) + '"' : "") + ">" + inner + "</button>";
  }).join("");
  $("#cdMore").addEventListener("click", function (e) { var b = e.target.closest("[data-i]"); if (b && SVC[+b.dataset.i].run) SVC[+b.dataset.i].run(); });

  /* ---- transactions ---- */
  var MERCH = [["Daraz Online", "Online"], ["Shwapno Superstore", "POS"], ["Pathao Ride", "Online"], ["Aarong Uttara", "POS"], ["Foodpanda", "Online"], ["Agora Gulshan", "POS"], ["Netflix", "Subscription"], ["Fuel - Meghna Petro", "POS"], ["ATM Withdrawal", "ATM"], ["Bata Banani", "POS"]];
  function txFor(c) {
    var seed = last4(c) | 0, out = [], base = new Date(2026, 9, 1);
    for (var i = 0; i < 18; i++) {
      var m = MERCH[(seed + i * 3) % MERCH.length], d = new Date(base.getTime() - (i * 2 + (seed % 3)) * 86400000);
      out.push({ d: d, desc: m[0], type: m[1], amt: -(((seed * (i + 7)) % 8900) + 240 + (i % 4) * 0.5) });
    }
    return out;
  }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function loadTx() {
    var c = cards[sel], body = $("#cdTxBody"), empty = $("#cdTxEmpty");
    var f = $("#cdFrom").value, t = $("#cdTo").value;
    if (f && t && f > t) { cb.toast("The From date must be before the To date", "error"); return; }
    var rows = c ? txFor(c).filter(function (x) { var k = iso(x.d); return (!f || k >= f) && (!t || k <= t); }) : [];
    empty.hidden = rows.length > 0; body.closest(".cd-tx-wrap").hidden = !rows.length;
    body.innerHTML = rows.map(function (x) { return "<tr><td>" + cb.date(x.d) + "</td><td><b>" + esc(x.desc) + '</b></td><td class="hide-m">' + x.type + '</td><td class="r amt-dr">-' + cb.fmt(-x.amt) + "</td></tr>"; }).join("");
  }
  $("#cdFrom").value = "2026-09-01"; $("#cdTo").value = "2026-10-01";
  $("#cdView").onclick = loadTx;
  $("#cdDl").onclick = function () { cb.toast("Statement download will be available soon"); };

  $("#cdTrack").addEventListener("click", function (e) {
    if (e.target.closest("#cdNew")) { showAdd(true); return; }
    var v = e.target.closest(".cd-visual"); if (!v) return;
    sel = +v.dataset.i; paintList(); paintDetails(); loadTx();
  });
  window.addEventListener("hashchange", function () { if (location.hash === "#add") showAdd(true); });

  paintList(); paintDetails(); loadTx();
  if (location.hash === "#add") showAdd(true);
})();
