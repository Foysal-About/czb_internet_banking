/* Citizens Bank: fund transfer flow (Own Bank / Other Bank)
   Steps: 1 Details -> 2 Review -> 3 OTP -> 4 Success.
   <body data-transfer="own|other"> selects the variant. All data is dummy. */
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
  function go(step) {
    current = step;
    $$(".ft-step").forEach(function (s) { s.classList.toggle("on", +s.dataset.step === step); });
    $$(".stepper li").forEach(function (li) {
      var n = +li.dataset.step;
      var last = step === 4;
      li.classList.toggle("on", n === step && !last);
      li.classList.toggle("done", n < step || last);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === 3) startOtp();
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
    var list = $('[data-pane="ben"] .ben-list'); if (!list) return;
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
    var toCount = $("#toCount");
    if (toCount) {
      var nTo = $$(".ben:not(.kind-off)", $("#toSelect")).length;
      toCount.textContent = nTo + (k.to === "card" ? " cards" : " beneficiaries");
    }

    update();
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
    if (type === "own") return { fee: 0, vat: 0 };
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
    var a = parseAmt(amountIn.value); amountIn.value = a ? a.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "";
  });
  amountIn.addEventListener("focus", function () { amountIn.value = amountIn.value.replace(/,/g, ""); });
  $$(".chips button").forEach(function (b) {
    b.addEventListener("click", function () {
      amountIn.value = (+b.dataset.amt).toLocaleString("en-US");
      $(".amount-in").classList.remove("invalid"); $("#amtErr").classList.remove("show");
      update();
    });
  });

  var rem = $("#remarks");
  if (rem) rem.addEventListener("input", function () { $("#remCount").textContent = rem.value.length + "/50"; });

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
      showErr("#toErr", "Choose a beneficiary to transfer to.");
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
    var rows = [["Transfer type", TT_LABEL[ttVal()]]];
    if (m) rows.push(["Transfer method", m.name + " · " + m.eta]);
    if (rem.value.trim()) rows.push(["Remarks", rem.value.trim()]);
    rows.push(["Transfer amount", fmt(a)]);
    rows.push(["Charge", c.fee ? fmt(c.fee) : "Free"]);
    if (type === "other") rows.push(["VAT (15%)", fmt(c.vat)]);
    $("#rList").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") +
      '<div class="total"><dt>Total debit</dt><dd>' + fmt(a + c.fee + c.vat) + "</dd></div>";
    $("#agree").checked = false; $("#toOtp").disabled = true;
  }
  $("#agree").addEventListener("change", function () { $("#toOtp").disabled = !this.checked; });

  $("#toReview").addEventListener("click", function () { if (validate()) { fillReview(); go(2); } });
  $$("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { go(current - 1); }); });
  $("#toOtp").addEventListener("click", function () { go(3); });

  // ---------- OTP ----------
  var boxes = $$(".otp input"), timerId, verifyOtp = $("#verifyOtp");
  function otpVal() { return boxes.map(function (b) { return b.value; }).join(""); }
  function otpState() {
    boxes.forEach(function (b) { b.classList.toggle("filled", !!b.value); });
    verifyOtp.disabled = otpVal().length !== 6;
  }
  boxes.forEach(function (b, i) {
    b.addEventListener("input", function () {
      b.value = b.value.replace(/\D/g, "").slice(-1);
      if (b.value && boxes[i + 1]) boxes[i + 1].focus();
      otpState();
    });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !b.value && boxes[i - 1]) { boxes[i - 1].focus(); boxes[i - 1].value = ""; otpState(); }
      if (e.key === "ArrowLeft" && boxes[i - 1]) boxes[i - 1].focus();
      if (e.key === "ArrowRight" && boxes[i + 1]) boxes[i + 1].focus();
      if (e.key === "Enter" && !verifyOtp.disabled) verifyOtp.click();
    });
    b.addEventListener("paste", function (e) {
      var d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
      if (!d) return; e.preventDefault();
      boxes.forEach(function (x, k) { x.value = d[k] || ""; });
      (boxes[d.length] || boxes[5]).focus(); otpState();
    });
  });
  function startOtp() {
    boxes.forEach(function (b) { b.value = ""; }); otpState();
    setTimeout(function () { boxes[0].focus(); }, 300);
    var left = 120, resend = $("#resend");
    clearInterval(timerId);
    resend.disabled = true;
    var tick = function () {
      var m = Math.floor(left / 60), s = left % 60;
      resend.textContent = left > 0 ? "Resend in 0" + m + ":" + (s < 10 ? "0" : "") + s : "Resend code";
      resend.disabled = left > 0;
      if (left-- <= 0) clearInterval(timerId);
    };
    tick(); timerId = setInterval(tick, 1000);
  }
  $("#resend").addEventListener("click", function () { startOtp(); window.cbToast("A new code has been sent"); });

  verifyOtp.addEventListener("click", function () {
    if (otpVal() === "000000") { // demo: 000000 shows the wrong-code state
      $(".otp").classList.add("shake"); setTimeout(function () { $(".otp").classList.remove("shake"); }, 400);
      window.cbToast("Incorrect code. Please try again."); return;
    }
    verifyOtp.classList.add("loading"); verifyOtp.textContent = "Processing";
    setTimeout(function () {
      verifyOtp.classList.remove("loading"); verifyOtp.textContent = "Verify & Transfer";
      clearInterval(timerId); fillSuccess(); go(4);
    }, 1400);
  });

  // ---------- success ----------
  function fillSuccess() {
    var f = fromAcc(), t = toAcc(), a = parseAmt(amountIn.value), c = charges(a), m = method();
    var now = new Date();
    var id = "CBL" + now.getFullYear().toString().slice(2) + String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") + Math.floor(100000 + Math.random() * 899999);
    var when = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " +
      now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    $("#okAmt").textContent = fmt(a);
    $("#okTo").textContent = t.name;
    $("#okId").textContent = id;
    var rows = [["Date & time", when], ["Transfer type", TT_LABEL[ttVal()]], ["From", f.name + " · " + f.no], ["To", t.name + " · " + t.no], ["Bank", t.bank]];
    if (m) rows.push(["Method", m.name + (m.id === "beftn" ? " · Settles next working day" : "")]);
    if (rem.value.trim()) rows.push(["Remarks", rem.value.trim()]);
    rows.push(["Amount", fmt(a)], ["Charge + VAT", fmt(c.fee + c.vat)]);
    $("#okList").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") +
      '<div class="total"><dt>Total debited</dt><dd>' + fmt(a + c.fee + c.vat) + "</dd></div>";

    if (window.cb && cb.saveReceipt) {
      cb.saveReceipt({
        title: "Transfer Successful",
        amount: fmt(a),
        txnId: id,
        rows: rows,
        type: TT_LABEL[ttVal()]
      });
    }
  }
  $("#copyId").addEventListener("click", function () {
    var v = $("#okId").textContent;
    try { navigator.clipboard.writeText(v); } catch (e) {}
    window.cbToast("Transaction ID copied");
  });
  $("#printReceipt").addEventListener("click", function () {
    location.href = "receipt.html";
  });
  $("#newTransfer").addEventListener("click", function () { location.reload(); });

  applyType();

  // ?beneficiary=<id> (from beneficiaries.html) preselects that payee
  (function preselect() {
    var m = /[?&]beneficiary=([^&]+)/.exec(location.search); if (!m) return;
    var b = ((window.CB_DATA || {}).beneficiaries || []).filter(function (x) { return x.id === decodeURIComponent(m[1]); })[0];
    if (!b) return;
    var r = $$('[data-pane="ben"] input[name="to"]').filter(function (el) { return el.dataset.name === b.name || (el.dataset.no || "").indexOf(b.acc) > -1; })[0];
    if (r) {
      r.checked = true;
      r.click();
      var toBox = $("#toSelect");
      if (toBox && toBox._paintTo) toBox._paintTo();
      update();
    }
  })();
})();
