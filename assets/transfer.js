/* Citizens Bank: fund transfer flow (Own Bank / Other Bank / MFS)
   Steps: 1 Details -> 2 Review -> 3 OTP -> 4 Success.
   <body data-transfer="own|other|mfs"> selects the variant. All data is dummy. */
(function () {
  var type = document.body.dataset.transfer;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var fmt = function (n) { return "৳" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var parseAmt = function (v) { return parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0; };

  // ---------- amount in words (Bangladeshi lakh / crore system) ----------
  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""); }
  function three(n) { var h = Math.floor(n / 100), r = n % 100; return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : ""); }
  function words(num) {
    var n = Math.floor(num), p = Math.round((num - n) * 100);
    if (!n && !p) return "";
    var parts = [], crore = Math.floor(n / 1e7); n %= 1e7;
    var lakh = Math.floor(n / 1e5); n %= 1e5;
    var thou = Math.floor(n / 1e3); n %= 1e3;
    if (crore) parts.push((crore > 999 ? words(crore).replace(/^Taka |\sOnly$/g, "") : three(crore)) + " Crore");
    if (lakh) parts.push(two(lakh) + " Lakh");
    if (thou) parts.push(two(thou) + " Thousand");
    if (n) parts.push(three(n));
    var out = "Taka " + (parts.join(" ") || "Zero");
    if (p) out += " and " + two(p) + " Paisa";
    return out + " Only";
  }

  // ---------- stepper ----------
  var current = 1;
  // steps 1-2 are page sections; 3 (Verify) and 4 (Done) are pop-ups, so only the stepper moves
  function mark(step) {
    $$(".stepper li").forEach(function (li) {
      var n = +li.dataset.step;
      var last = step === 4;
      li.classList.toggle("on", n === step && !last);
      li.classList.toggle("done", n < step || last);
    });
  }
  function go(step) {
    current = step;
    $$(".ft-step").forEach(function (s) { s.classList.toggle("on", +s.dataset.step === step); });
    mark(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- tabs ----------
  $$(".seg").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      $$("button", seg).forEach(function (x) { x.classList.toggle("on", x === b); });
      var scope = seg.parentElement;
      $$(".tab-pane", scope).forEach(function (p) { p.classList.toggle("on", p.dataset.pane === b.dataset.tab); });
      update();
    });
  });

  // ---------- beneficiary search ----------
  var benSearch = $("#benSearch");
  if (benSearch) benSearch.addEventListener("input", function () {
    var q = benSearch.value.trim().toLowerCase(), shown = 0;
    $$('[data-pane="ben"] .ben').forEach(function (b) {
      var hit = !b.classList.contains("kind-off") && b.textContent.toLowerCase().indexOf(q) > -1;
      b.style.display = hit ? "" : "none"; if (hit) shown++;
    });
    $('[data-pane="ben"] .empty-note').style.display = shown || !q ? "none" : "block";
  });

  // ---------- "Transfer from" account picker (shared, see app.js) ----------
  if ($("#fromSelect")) window.cbAccountPicker($("#fromSelect"));

  // ---------- "Transfer to" beneficiary picker (shared, see app.js) ----------
  if ($("#toSelect")) window.cbBeneficiaryPicker($("#toSelect"));

  // ---------- saved beneficiaries (shared with the Add Beneficiary page) ----------
  // Transfers are only allowed to saved beneficiaries; new ones are added on beneficiary-add.html.
  (function loadSaved() {
    var list = $('[data-pane="ben"] .ben-list'); if (!list || type === "mfs") return;
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem("citizens-beneficiaries")); } catch (e) {}
    if (Array.isArray(stored)) {
      var COLORS = ["#93212a", "#0ea5e9", "#f97316", "#16a34a", "#6366f1", "#db2777", "#0f766e"];
      var esc = function (v) { return String(v).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
      var mine = stored.filter(function (b) { return b.type === type; });
      $$(".ben", list).forEach(function (el) { el.remove(); });
      var html = mine.map(function (b, i) {
        var parts = b.sub.split(" · ");
        var no = type === "own" ? parts[0] : parts[parts.length - 1];
        var bank = type === "own" ? "Citizens · " + (parts[1] || "") : parts.slice(0, -1).join(" · ");
        var ini = b.name.split(" ").slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
        var kind = b.kind || (/••••/.test(b.sub) ? "card" : "account");
        return '<label class="ben" data-kind="' + kind + '"><input type="radio" name="to" data-name="' + esc(b.name) + '" data-no="' + esc(no) + '" data-bank="' + esc(bank) + '" data-kind="' + kind + '">' +
          '<span class="av" style="background:' + COLORS[i % COLORS.length] + '">' + ini + "</span>" +
          '<span class="ben-t"><b>' + esc(b.name) + "</b><span>" + esc(no) + " · " + esc(bank) + "</span></span>" +
          (b.fresh ? '<span class="tag new">New</span>' : b.nick ? '<span class="tag">' + esc(b.nick) + "</span>" : "") +
          '<span class="radio"></span></label>';
      }).join("");
      list.insertAdjacentHTML("afterbegin", html);
      var toBox = $("#toSelect");
      if (toBox && toBox._paintTo) toBox._paintTo();
    }
  })();

  // ---------- transfer type (account / card on each side) ----------
  var ttype = $("#ttype");
  var TT_LABEL = { "account-account": "Account to Account", "account-card": "Account to Card", "card-card": "Card to Card", "card-account": "Card to Account" };
  // only NPSB (Other Bank) lets you pick a type; everything else is account to account
  function npsb() { var m = $('input[name="method"]:checked'); return !!ttype && !!m && m.value === "npsb"; }
  function ttVal() { return npsb() ? ttype.value : "account-account"; }
  function kinds() { var p = ttVal().split("-"); return { from: p[0], to: p[1] }; }
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
  function ttLabel() { return type === "mfs" ? "Account to MFS" : TT_LABEL[ttVal()]; }
  function applyType() {
    var k = kinds();
    if (ttype) {
      $("#ttypeBlock").hidden = !npsb();
      $("#flowFrom").textContent = cap(k.from); $("#flowTo").textContent = cap(k.to);
    }

    // source: accounts or cards
    var box = $("#fromSelect"), rows = $$(".acc-row", box), first = null, cur = $('input[name="from"]:checked');
    rows.forEach(function (r) { var off = r.dataset.kind !== k.from; r.classList.toggle("kind-off", off); if (!off && !first) first = r; });
    $$(".acc-group", box).forEach(function (g) { g.classList.toggle("kind-off", g.dataset.kind !== k.from); });
    if (!cur || cur.dataset.kind !== k.from) {
      var def = $(".acc-row.is-default:not(.kind-off) input", box) || (first && $("input", first));
      if (def) def.checked = true;
    }
    var n = rows.filter(function (r) { return !r.classList.contains("kind-off"); }).length;
    $("#fromCount").textContent = n + (k.from === "card" ? " cards" : " accounts");
    box._filter(); box._paint();

    // destination: beneficiaries of the matching kind
    var pane = $('[data-pane="ben"]'), list = $(".ben-list", pane), shown = 0;
    $$(".ben", list).forEach(function (b) {
      var off = b.dataset.kind !== k.to; b.classList.toggle("kind-off", off);
      if (off) { var i = $("input", b); if (i.checked) i.checked = false; } else shown++;
    });
    list.classList.toggle("is-empty", !shown);
    var none = $(".none-txt", list); if (none) none.textContent = "You have no saved " + (k.to === "card" ? "card" : "account") + " beneficiaries yet.";
    if (benSearch) { benSearch.value = ""; benSearch.dispatchEvent(new Event("input")); }
    var mineTab = $('.seg [data-tab="mine"]');
    if (mineTab) {
      mineTab.hidden = k.to === "card";
      if (k.to === "card" && mineTab.classList.contains("on")) $('.seg [data-tab="ben"]').click();
    }
    var toBox = $("#toSelect");
    if (toBox && toBox._paintTo) toBox._paintTo();
    paintToCount();

    update();
    syncRemarks();
  }
  function paintToCount() {
    var toCount = $("#toCount"); if (!toCount) return;
    var nTo = $$(".tab-pane.on .ben:not(.kind-off)", $("#toSelect")).length;
    toCount.textContent = nTo + (kinds().to === "card" ? " cards" : type === "mfs" ? (nTo === 1 ? " wallet" : " wallets") : dest() === "own" ? " accounts" : " beneficiaries");
  }
  if (ttype) ttype.addEventListener("change", applyType);
  $$('input[name="method"]').forEach(function (m) { m.addEventListener("change", applyType); });

  // ---------- read form state ----------
  function fromAcc() {
    var r = $('input[name="from"]:checked'); if (!r) return null;
    return { id: r.value, name: r.dataset.name, no: r.dataset.no, bal: +r.dataset.bal, kind: r.dataset.kind };
  }
  function method() {
    var r = $('input[name="method"]:checked'); if (!r) return null;
    return { id: r.value, name: r.dataset.label, fee: +r.dataset.fee, min: +r.dataset.min || 0, max: +r.dataset.max || Infinity, eta: r.dataset.eta };
  }
  function toAcc() {
    var r = $('input[name="to"]:checked'); if (!r) return null;
    return { name: r.dataset.name, no: r.dataset.no, bank: r.dataset.bank };
  }
  function charges(amount) {
    if (type === "own" || type === "mfs") return { fee: 0, vat: 0 };
    var m = method(); var fee = m && amount ? m.fee : 0;
    return { fee: fee, vat: Math.round(fee * 0.15 * 100) / 100 };
  }

  // ---------- live update ----------
  var amountIn = $("#amount");
  function update() {
    var f = fromAcc(), a = parseAmt(amountIn.value);
    var limitLbl = $('input[name="from"]:checked') && $('input[name="from"]:checked').dataset.branch === "Available limit" ? "Available limit " : "Available ";
    $("#availHint").innerHTML = f ? limitLbl + '<span class="num">' + fmt(f.bal) + "</span>" : "";
    $("#words").textContent = words(a);
  }
  document.addEventListener("input", function (e) { if (e.target.closest(".ft-main")) update(); });
  document.addEventListener("change", function (e) { if (e.target.closest(".ft-main")) update(); });

  // amount: keep it numeric, format on blur
  amountIn.addEventListener("input", function () {
    var v = amountIn.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    var p = v.split("."); if (p[1]) v = p[0] + "." + p[1].slice(0, 2);
    amountIn.value = v;
    $(".amount-in").classList.remove("invalid"); $("#amtErr").classList.remove("show");
  });
  amountIn.addEventListener("blur", function () {
    var a = parseAmt(amountIn.value); amountIn.value = a ? a.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "";
  });
  amountIn.addEventListener("focus", function () { amountIn.value = amountIn.value.replace(/,/g, ""); });
  $$(".chips button").forEach(function (b) {
    b.addEventListener("click", function () {
      amountIn.value = (+b.dataset.amt).toLocaleString("en-IN");
      $(".amount-in").classList.remove("invalid"); $("#amtErr").classList.remove("show");
      update();
    });
  });

  // ---------- remarks ----------
  var rem = $("#remarks");
  var userEditedRemarks = false;
  var DEFAULT_REMARKS = ["NPSB Transfer", "BEFTN Transfer", "RTGS Transfer", "Other Bank Transfer", "Own Bank Transfer", "Own Account Transfer", "bKash Transfer", "Nagad Transfer", "TapTap Transfer", "Upay Transfer", "Rocket Transfer"];

  function defaultRemark() {
    if (type === "own") return dest() === "own" ? "Own Account Transfer" : "Own Bank Transfer";
    if (type === "mfs") return provName() + " Transfer";
    var m = method();
    if (m && m.name) return m.name + " Transfer";
    return "Other Bank Transfer";
  }

  function updateRemCount() {
    var cnt = $("#remCount");
    if (rem && cnt) cnt.textContent = rem.value.length + "/50";
  }

  function syncRemarks() {
    if (!rem) return;
    var cur = rem.value.trim();
    if (!userEditedRemarks || !cur || DEFAULT_REMARKS.indexOf(cur) > -1) {
      rem.value = defaultRemark();
      updateRemCount();
    }
  }

  if (rem) {
    if (!rem.value) rem.value = defaultRemark();
    updateRemCount();
    // typing over the auto-filled remark (e.g. "Own Bank Transfer") replaces it instead of appending
    rem.addEventListener("beforeinput", function (e) {
      if (!e.cancelable || DEFAULT_REMARKS.indexOf(rem.value) < 0) return;
      e.preventDefault();
      var t = e.inputType.indexOf("insert") === 0 ? (e.data != null ? e.data : e.dataTransfer ? e.dataTransfer.getData("text/plain") : "") : "";
      rem.value = t.replace(/\s+/g, " ").slice(0, 50);
      rem.dispatchEvent(new Event("input", { bubbles: true }));
    });
    rem.addEventListener("input", function () {
      userEditedRemarks = true;
      updateRemCount();
    });
  }

  // ---------- validation ----------
  function showErr(id, msg) {
    var el = $(id); el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' + msg;
    el.classList.add("show");
  }
  function validate() {
    var ok = true, f = fromAcc(), t = toAcc(), a = parseAmt(amountIn.value), c = charges(a), m = method();
    $$(".err").forEach(function (e) { e.classList.remove("show"); });
    $(".amount-in").classList.remove("invalid");
    var toTrig = $("#toTrigger"); if (toTrig) toTrig.classList.remove("invalid");
    if (!t) {
      showErr("#toErr", type === "mfs" ? "Choose a wallet to send to." : dest() === "own" ? "Choose an account to transfer to." : "Choose a beneficiary to transfer to.");
      if (toTrig) toTrig.classList.add("invalid");
      ok = false;
    }
    if (type === "other" && !m) { showErr("#methodErr", "Select a transfer method."); ok = false; }
    var amtMsg = "";
    if (!a) amtMsg = "Enter an amount to transfer.";
    else if (a + c.fee + c.vat > f.bal) amtMsg = "Insufficient " + (f.kind === "card" ? "card limit" : "balance") + ". Available " + fmt(f.bal) + ".";
    else if (m && a < m.min) amtMsg = m.name + " requires a minimum of " + fmt(m.min) + ".";
    else if (m && a > m.max) amtMsg = m.name + " allows up to " + fmt(m.max) + " per transaction.";
    if (amtMsg) { showErr("#amtErr", amtMsg); $(".amount-in").classList.add("invalid"); ok = false; }
    if (!ok) {
      var first = $(".err.show"); if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }

  // ---------- review ----------
  function fillReview() {
    var f = fromAcc(), t = toAcc(), a = parseAmt(amountIn.value), c = charges(a), m = method();
    $("#rAmt").textContent = fmt(a);
    $("#rWords").textContent = words(a);
    $("#rFromName").textContent = f.name; $("#rFromNo").textContent = f.no;
    $("#rToName").textContent = t.name; $("#rToNo").textContent = t.no; $("#rToBank").textContent = t.bank;
    var rows = [["Transfer type", ttLabel()]];
    if (m) rows.push(["Transfer method", m.name + " · " + m.eta]);
    if (rem.value.trim()) rows.push(["Remarks", rem.value.trim()]);
    rows.push(["Transfer amount", fmt(a)]);
    rows.push(["Charge", c.fee ? fmt(c.fee) : "Free"]);
    if (type === "other") rows.push(["VAT (15%)", fmt(c.vat)]);
    $("#rList").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") +
      '<div class="total"><dt>Total debit</dt><dd>' + fmt(a + c.fee + c.vat) + "</dd></div>";
  }

  $("#toReview").addEventListener("click", function () { if (validate()) { fillReview(); go(2); } });
  $$("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { go(current - 1); }); });
  $("#toOtp").addEventListener("click", openOtp);

  // ---------- verify: OTP pop-up ----------
  function openOtp() {
    var t = toAcc(), a = parseAmt(amountIn.value);
    mark(3);
    cb.otp({
      title: "Verify transfer",
      verifyText: "Verify & Transfer",
      summary: '<div class="otp-sum"><b>' + fmt(a) + '</b><small>to ' + cb.esc(t.name) + ' · ' + cb.esc(t.no) + '</small></div>',
      message: "Code sent to <b>+880 17•• ••••89</b> &amp; <b>s••••l@gmail.com</b>",
      onCancel: function () { mark(2); },
      onSuccess: function () { mark(4); showSuccess(); }
    });
  }

  // ---------- done: success pop-up ----------
  function showSuccess() {
    var f = fromAcc(), t = toAcc(), a = parseAmt(amountIn.value), c = charges(a), m = method();
    var now = new Date();
    var id = "CBL" + now.getFullYear().toString().slice(2) + String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") + Math.floor(100000 + Math.random() * 899999);
    var when = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " +
      now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    var rows = [["Date & time", when], ["Transfer type", ttLabel()], ["From", f.name + " · " + f.no], ["To", t.name + " · " + t.no], [type === "mfs" ? "Provider" : "Bank", t.bank]];
    if (m) rows.push(["Method", m.name + (m.id === "beftn" ? " · Settles next working day" : "")]);
    if (rem.value.trim()) rows.push(["Remarks", rem.value.trim()]);
    rows.push(["Amount", fmt(a)], ["Charge + VAT", fmt(c.fee + c.vat)]);

    if (window.cb && cb.saveReceipt) {
      cb.saveReceipt({
        title: "Transfer Successful",
        amount: fmt(a),
        txnId: id,
        rows: rows,
        type: ttLabel()
      });
    }

    cb.success({
      title: "Transfer Successful",
      message: "Your money is on its way to <b>" + cb.esc(t.name) + "</b>",
      amount: fmt(a),
      ref: { label: "Transaction ID", value: id },
      rows: rows.concat([["Total debited", fmt(a + c.fee + c.vat), { total: true }]]),
      buttons: [
        { text: "Download receipt", icon: "download", href: "receipt.html" },
        { text: "New transfer", icon: "plus", onClick: function () { location.reload(); } },
        { text: "Back to dashboard", href: "index.html", primary: true }
      ]
    });
  }

  // ---------- own bank: "Own account" / "Other account" cards pick what "Transfer to" lists ----------
  function dest() { var d = $('input[name="dest"]:checked'); return d ? d.value : "other"; }
  var WALLET = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>';
  // own accounts = the "Transfer from" accounts, minus the one being debited
  function paintMine() {
    var list = $('[data-pane="mine"] .ben-list'); if (!list) return;
    var cur = $('input[name="to"]:checked', list), curNo = cur ? cur.dataset.no : "";
    var from = $('input[name="from"]:checked'), fromNo = from ? from.dataset.no : "";
    $$(".ben", list).forEach(function (el) { el.remove(); });
    list.insertAdjacentHTML("afterbegin", $$('#fromSelect .acc-row[data-kind="account"] input[name="from"]').filter(function (r) { return r.dataset.no !== fromNo; }).map(function (r) {
      var d = r.dataset;
      return '<label class="ben"><input type="radio" name="to" data-name="' + cb.esc(d.name) + '" data-no="' + cb.esc(d.no) + '" data-bank="Citizens · ' + cb.esc(d.branch || "") + '"' + (d.no === curNo ? " checked" : "") + ">" +
        '<span class="av" style="background:linear-gradient(135deg,#0f2a44,#2f7fa3)">' + WALLET + "</span>" +
        '<span class="ben-t"><b>' + cb.esc(d.name) + "</b><span>" + cb.esc(d.no) + " · " + cb.esc(d.type || "") + "</span></span>" +
        '<span class="radio"></span></label>';
    }).join(""));
  }
  function applyDest() {
    var box = $("#toSelect"); if (!box || !$('input[name="dest"]')) return;
    var own = dest() === "own", pane = own ? "mine" : "ben";
    box.dataset.dest = own ? "own" : "other";
    $$(".tab-pane", box).forEach(function (p) { p.classList.toggle("on", p.dataset.pane === pane); });
    $$('input[name="to"]:checked', box).forEach(function (i) { if (!i.closest('[data-pane="' + pane + '"]')) i.checked = false; });
    $(".ben-menu", box).setAttribute("aria-label", own ? "Choose account" : "Choose beneficiary");
    if (benSearch) { benSearch.value = ""; if (box._filterTo) box._filterTo(); }
    $("#toErr").classList.remove("show");
    box._paintTo(); paintToCount(); update(); syncRemarks();
  }
  if ($('input[name="dest"]')) {
    paintMine();
    $$('input[name="dest"]').forEach(function (d) { d.addEventListener("change", applyDest); });
    $("#fromSelect").addEventListener("change", function (e) {
      if (e.target.name !== "from") return;
      paintMine(); $("#toSelect")._paintTo(); paintToCount(); update();
    });
  }

  // ---------- MFS: provider cards pick which saved wallets "Transfer to" lists ----------
  function prov() { var p = $('input[name="prov"]:checked'); return p ? p.value : ""; }
  function provName() { var p = $('input[name="prov"]:checked'); return p ? p.dataset.label : "MFS"; }
  function provOf(name) { var n = String(name).toLowerCase(); return n.indexOf("bkash") > -1 ? "bkash" : n.indexOf("nagad") > -1 ? "nagad" : n.indexOf("tap") === 0 ? "tap" : n.indexOf("upay") > -1 ? "upay" : n.indexOf("rocket") > -1 ? "rocket" : ""; }
  var MFS_LOGO = { bkash: "bkash", nagad: "nagad", tap: "taptap", upay: "upay", rocket: "rocket" };
  function walletNo(v) { var d = String(v).replace(/\D/g, "").slice(-10); return d.length === 10 ? "+880 " + d.slice(0, 4) + "-" + d.slice(4) : String(v); }
  // saved wallets: ones added on beneficiary-add.html (#mfs) plus the dummy MFS beneficiaries, de-duplicated by number
  function wallets() {
    var out = [], seen = {};
    function add(name, provider, no, nick) {
      var key = String(no).replace(/\D/g, "").slice(-10); if (!key || seen[key]) return; seen[key] = 1;
      out.push({ name: name, provider: provider === "Tap" ? "TapTap" : provider, no: walletNo(no), nick: nick || "", p: provOf(provider) });
    }
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem("citizens-beneficiaries")); } catch (e) {}
    (Array.isArray(stored) ? stored : []).forEach(function (b) {
      if (b.type !== "mfs") return; var parts = String(b.sub).split(" · "); add(b.name, parts[0], parts[1] || "", b.nick);
    });
    ((window.CB_DATA || {}).beneficiaries || []).forEach(function (b) { if (b.group === 3) add(b.name, b.bank, b.acc, b.nick); });
    return out;
  }
  function paintWallets() {
    var box = $("#toSelect"), list = $('[data-pane="ben"] .ben-list', box); if (!list) return;
    var cur = $('input[name="to"]:checked', list), curNo = cur ? cur.dataset.no : "", p = prov();
    $$(".ben", list).forEach(function (el) { el.remove(); });
    var mine = wallets().filter(function (w) { return w.p === p; });
    list.insertAdjacentHTML("afterbegin", mine.map(function (w) {
      return '<label class="ben" data-kind="account"><input type="radio" name="to" data-kind="account" data-name="' + cb.esc(w.name) + '" data-no="' + cb.esc(w.no) + '" data-bank="' + cb.esc(w.provider) + '"' + (w.no === curNo ? " checked" : "") + ">" +
        '<span class="av av-logo"><img src="assets/img/mfs/' + MFS_LOGO[w.p] + '.png" alt="' + cb.esc(w.provider) + '"></span>' +
        '<span class="ben-t"><b>' + cb.esc(w.name) + "</b><span>" + cb.esc(w.no) + " · " + cb.esc(w.provider) + "</span></span>" +
        (w.nick ? '<span class="tag">' + cb.esc(w.nick) + "</span>" : "") + '<span class="radio"></span></label>';
    }).join(""));
    list.classList.toggle("is-empty", !mine.length);
    $(".none-txt", list).textContent = "You have no saved " + provName() + " wallets yet.";
    if (benSearch) { benSearch.value = ""; if (box._filterTo) box._filterTo(); }
    $("#toErr").classList.remove("show");
    box._paintTo(); paintToCount(); update(); syncRemarks();
  }

  applyType();
  applyDest();
  if (type === "mfs") {
    $("#toSelect").dataset.dest = "mfs";
    $$('input[name="prov"]').forEach(function (r) { r.addEventListener("change", paintWallets); });
    paintWallets();
  }

  // ?beneficiary=<id> (from beneficiaries.html) preselects that payee
  (function preselect() {
    var m = /[?&]beneficiary=([^&]+)/.exec(location.search); if (!m) return;
    var b = ((window.CB_DATA || {}).beneficiaries || []).filter(function (x) { return x.id === decodeURIComponent(m[1]); })[0];
    if (!b) return;
    if (type === "mfs") { var pv = $('input[name="prov"][value="' + provOf(b.bank) + '"]'); if (pv && !pv.checked) { pv.checked = true; paintWallets(); } }
    var r = $$('[data-pane="ben"] input[name="to"]').filter(function (el) { return el.dataset.name === b.name || (el.dataset.no || "").indexOf(b.acc) > -1; })[0];
    if (r) {
      var other = $('input[name="dest"][value="other"]');
      if (other && !other.checked) { other.checked = true; applyDest(); }
      r.checked = true;
      r.click();
      var toBox = $("#toSelect");
      if (toBox && toBox._paintTo) toBox._paintTo();
      update();
    }
  })();
})();
