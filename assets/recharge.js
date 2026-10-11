/* Citizens Bank: mobile recharge
   Steps: 1 Details (number -> operator -> amount or pack -> pay from) -> 2 Review -> 3 OTP -> 4 Success.
   Operator detection uses Bangladeshi prefixes; packs and limits are dummy data. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return "৳" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  var OPS = {
    gp: { name: "Grameenphone", short: "GP", color: "#19aaf8" },
    robi: { name: "Robi", short: "R", color: "#e1262d" },
    airtel: { name: "Airtel", short: "A", color: "#d4000f" },
    bl: { name: "Banglalink", short: "BL", color: "#f47b20" },
    teletalk: { name: "Teletalk", short: "TT", color: "#00a651" }
  };
  // 017/013 GP, 018 Robi, 016 Airtel, 019/014 Banglalink, 015 Teletalk
  var PREFIX = { "17": "gp", "13": "gp", "18": "robi", "16": "airtel", "19": "bl", "14": "bl", "15": "teletalk" };
  var PACKS = {
    internet: [["1 GB", "3 days", 49], ["5 GB", "7 days", 199], ["15 GB", "30 days", 449], ["30 GB", "30 days", 699], ["Unlimited social", "7 days", 99]],
    minutes:  [["50 minutes", "7 days", 49], ["150 minutes", "15 days", 129], ["300 minutes", "30 days", 249], ["700 minutes", "30 days", 499]],
    bundle:   [["3 GB + 100 min", "7 days", 179], ["10 GB + 300 min", "30 days", 599], ["25 GB + 600 min", "30 days", 899]]
  };

  $$("[data-op]").forEach(function (el) { var o = OPS[el.dataset.op]; el.style.background = o.color; el.textContent = o.short; });

  // ---------- amount in words ----------
  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""); }
  function three(n) { var h = Math.floor(n / 100), r = n % 100; return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : ""); }
  function words(n) {
    n = Math.floor(n); if (!n) return "";
    var parts = [], l = Math.floor(n / 1e5); n %= 1e5; var t = Math.floor(n / 1e3); n %= 1e3;
    if (l) parts.push(two(l) + " Lakh"); if (t) parts.push(two(t) + " Thousand"); if (n) parts.push(three(n));
    return "Taka " + parts.join(" ") + " Only";
  }

  // ---------- state ----------
  var mobile = $("#mobile"), amountIn = $("#amount"), pack = null, packTab = "internet", opManual = false;
  function segVal(id) { return $("#" + id + " button.on").dataset.v; }
  function digits() { return mobile.value.replace(/\D/g, ""); }
  function op() { var r = $('input[name="op"]:checked'); return r ? r.value : null; }
  function isPack() { return segVal("rType") === "pack"; }
  function amount() { return isPack() ? (pack ? pack.price : 0) : (parseInt(amountIn.value.replace(/\D/g, ""), 10) || 0); }

  // ---------- segmented controls ----------
  $$(".seg").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      $$("button", seg).forEach(function (x) { x.classList.toggle("on", x === b); });
      if (seg.id === "rType") $$("[data-rpane]").forEach(function (p) { p.classList.toggle("on", p.dataset.rpane === b.dataset.v); });
      if (seg.id === "connType") { var post = b.dataset.v === "Postpaid"; $('#rType [data-v="pack"]').hidden = post; if (post && isPack()) $('#rType [data-v="amount"]').click(); }
      clearErrs(); update();
    });
  });

  // ---------- number + operator ----------
  function setNumber(v) {
    var d = v.replace(/\D/g, "").replace(/^(880|0)/, "").slice(0, 10);
    mobile.value = d.length > 4 ? d.slice(0, 4) + "-" + d.slice(4) : d;
    detect();
  }
  function detect() {
    var d = digits(), guess = d.length >= 2 ? PREFIX[d.slice(0, 2)] : null;
    if (guess && !opManual) { $('input[name="op"][value="' + guess + '"]').checked = true; }
    if (!d.length) { opManual = false; $$('input[name="op"]').forEach(function (r) { r.checked = false; }); }
    $("#opHint").textContent = guess ? "Detected " + OPS[guess].name + (opManual && op() !== guess ? " · you chose " + OPS[op()].name : "") : d.length >= 2 ? "Unknown prefix, choose the operator" : "Operator is detected automatically";
    paintOpChip();
    if (d.length >= 2 && !op()) showOps(true);   // unknown prefix: let the user pick
    if (!d.length) showOps(false);
    renderPacks(); update();
  }
  // detected operator sits inside the number field; the pencil opens the full operator list
  var opChip = $("#opChip"), opsPicker = $("#opsPicker");
  function paintOpChip() {
    var o = op() && OPS[op()];
    opChip.hidden = !o;
    if (o) { var l = $("#opChipLogo"); l.style.background = o.color; l.textContent = o.short; $("#opChipName").textContent = o.name; }
  }
  function showOps(v) { opsPicker.hidden = !v; opChip.setAttribute("aria-expanded", v ? "true" : "false"); opChip.classList.toggle("on", v); }
  opChip.addEventListener("click", function () { showOps(opsPicker.hidden); });
  mobile.addEventListener("input", function () { setNumber(mobile.value); clearErrs(); });
  mobile.addEventListener("paste", function (e) { e.preventDefault(); setNumber((e.clipboardData.getData("text") || "")); });
  $$('input[name="op"]').forEach(function (r) { r.addEventListener("change", function () { opManual = true; detect(); clearErrs(); showOps(false); }); });
  $$(".snum").forEach(function (b) { b.addEventListener("click", function () { opManual = false; setNumber(b.dataset.no); clearErrs(); mobile.focus(); }); });

  // ---------- amount ----------
  amountIn.addEventListener("input", function () { var v = amountIn.value.replace(/\D/g, "").slice(0, 5); amountIn.value = v ? (+v).toLocaleString("en-IN") : ""; clearErrs(); update(); });
  $$("[data-rpane=amount] .chips button").forEach(function (b) {
    b.addEventListener("click", function () { amountIn.value = (+b.dataset.amt).toLocaleString("en-IN"); clearErrs(); update(); });
  });

  // ---------- packs ----------
  function renderPacks() {
    var o = OPS[op()] ;
    $("#packs").innerHTML = PACKS[packTab].map(function (p, i) {
      var id = packTab + i, on = pack && pack.id === id;
      return '<button type="button" class="pack' + (on ? " on" : "") + '" data-id="' + id + '" data-i="' + i + '">' +
        '<span class="pack-main"><b>' + p[0] + "</b><small>Validity " + p[1] + (o ? " · " + o.name : "") + "</small></span>" +
        '<span class="pack-price">৳' + p[2] + "</span></button>";
    }).join("");
  }
  $("#packTabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("#packTabs button").forEach(function (x) { x.classList.toggle("on", x === b); });
    packTab = b.dataset.pt; renderPacks();
  });
  $("#packs").addEventListener("click", function (e) {
    var b = e.target.closest(".pack"); if (!b) return;
    var p = PACKS[packTab][+b.dataset.i];
    pack = { id: b.dataset.id, name: p[0], validity: p[1], price: p[2], kind: packTab };
    renderPacks(); clearErrs(); update();
  });

  // ---------- pay from ----------
  window.cbAccountPicker($("#fromSelect"));
  function fromAcc() { var r = $('input[name="from"]:checked'); return { name: r.dataset.name, no: r.dataset.no, bal: +r.dataset.bal, kind: r.dataset.kind }; }
  document.addEventListener("change", function (e) { if (e.target.name === "from") { clearErrs(); update(); } });

  function update() {
    $("#words").textContent = isPack() ? "" : words(amount());
  }

  // ---------- validation ----------
  function err(id, msg) {
    var el = $(id); el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' + msg;
    el.classList.add("show");
  }
  function clearErrs() { $$(".err").forEach(function (e) { e.classList.remove("show"); }); $$(".invalid").forEach(function (f) { f.classList.remove("invalid"); }); }
  function validate() {
    clearErrs();
    var ok = true, d = digits(), a = amount(), post = segVal("connType") === "Postpaid";
    if (!/^1[3-9]\d{8}$/.test(d)) { err("#mobErr", "Enter a valid 11-digit mobile number."); $('[data-f="mobile"]').classList.add("invalid"); ok = false; }
    if (!op()) { err("#opErr", "Choose the mobile operator."); showOps(true); ok = false; }
    if (isPack()) { if (!pack) { err("#packErr", "Choose a pack to continue."); ok = false; } }
    else if (a < 20) { err("#amtErr", "Minimum recharge is ৳20."); $(".amount-in").classList.add("invalid"); ok = false; }
    else if (!post && a > 1000) { err("#amtErr", "Prepaid recharge is limited to ৳1,000 at a time."); $(".amount-in").classList.add("invalid"); ok = false; }
    else if (post && a > 10000) { err("#amtErr", "Postpaid payment is limited to ৳10,000 at a time."); $(".amount-in").classList.add("invalid"); ok = false; }
    var f = fromAcc();
    if (ok && a > f.bal) { err("#balErr", "Insufficient " + (f.kind === "card" ? "card limit" : "balance") + ". Available " + fmt(f.bal) + "."); ok = false; }
    if (!ok) { var e = $(".err.show"); if (e) e.scrollIntoView({ behavior: "smooth", block: "center" }); }
    return ok;
  }

  // ---------- steps ----------
  var current = 1;
  // step 3 (Verify) is the OTP pop-up, so only the stepper moves for it
  function mark(step) {
    $$(".stepper li").forEach(function (li) {
      var n = +li.dataset.step, last = step === 4;
      li.classList.toggle("on", n === step && !last); li.classList.toggle("done", n < step || last);
    });
  }
  function go(step) {
    current = step;
    $$(".ft-step").forEach(function (s) { s.classList.toggle("on", +s.dataset.step === step); });
    mark(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function rows() {
    var o = OPS[op()], r = [["Mobile number", "+880 " + mobile.value], ["Operator", o.name], ["Connection", segVal("connType")]];
    if (isPack()) r.push(["Pack", pack.name], ["Validity", pack.validity], ["Pack type", pack.kind[0].toUpperCase() + pack.kind.slice(1)]);
    else r.push(["Recharge type", "Talk-time / balance"]);
    r.push(["Charge", "Free"]);
    return r;
  }
  $("#toReview").addEventListener("click", function () {
    if (!validate()) return;
    var f = fromAcc(), a = amount();
    $("#rAmt").textContent = fmt(a); $("#rWords").textContent = words(a);
    $("#rFromName").textContent = f.name; $("#rFromNo").textContent = f.no;
    $("#rNo").textContent = "+880 " + mobile.value; $("#rOp").textContent = OPS[op()].name; $("#rConn").textContent = segVal("connType");
    $("#rList").innerHTML = rows().map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + x[1] + "</dd></div>"; }).join("") +
      '<div class="total"><dt>Total payable</dt><dd>' + fmt(a) + "</dd></div>";
    $("#agree").checked = false; $("#toOtp").disabled = true;
    go(2);
  });
  $("#agree").addEventListener("change", function () { $("#toOtp").disabled = !this.checked; });
  $$("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { go(current - 1); }); });
  $("#toOtp").addEventListener("click", openOtp);

  // ---------- verify: OTP pop-up ----------
  function openOtp() {
    mark(3);
    cb.otp({
      title: "Verify recharge",
      verifyText: "Verify & Recharge",
      summary: '<div class="otp-sum"><span>You are recharging</span><b>' + fmt(amount()) + "</b><small>+880 " + cb.esc(mobile.value) + " · " + OPS[op()].name + "</small></div>",
      message: "Enter the 6-digit code sent to <b>+880 17•• ••••89</b> and <b>s••••l@gmail.com</b>",
      note: "Never share this code. Citizens Bank will never ask for it.",
      onCancel: function () { mark(2); },
      onSuccess: function () { mark(4); success(); }
    });
  }

  // ---------- done: success pop-up ----------
  function success() {
    var f = fromAcc(), a = amount(), now = new Date();
    var id = "CBR" + now.getFullYear().toString().slice(2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + Math.floor(100000 + Math.random() * 899999);
    var r = rows();
    r.unshift(["Date & time", now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })]);
    r.push(["Paid from", f.name + " · " + f.no]);
    if (cb.saveReceipt) cb.saveReceipt({ title: "Recharge Successful", amount: fmt(a), txnId: id, rows: r, type: "Mobile recharge" });
    cb.success({
      title: "Recharge Successful",
      message: "<b>" + cb.esc(isPack() ? pack.name + " pack" : fmt(a) + " talk-time") + "</b> sent to <b>+880 " + cb.esc(mobile.value) + "</b>",
      amount: fmt(a),
      ref: { label: "Transaction ID", value: id },
      rows: r.concat([["Total paid", fmt(a), { total: true }]]),
      buttons: [
        { text: "Download receipt", icon: "download", href: "receipt.html" },
        { text: "Recharge again", icon: "plus", href: location.pathname },
        { text: "Back to dashboard", href: "index.html", primary: true }
      ]
    });
  }

  // recent recharges: repeat fills number + amount
  $$(".upcoming .up-pay").forEach(function (b) {
    b.addEventListener("click", function () {
      opManual = false; setNumber(b.dataset.no);
      if (isPack()) $('#rType [data-v="amount"]').click();
      amountIn.value = (+b.dataset.amt).toLocaleString("en-IN"); clearErrs(); update();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  renderPacks(); update();
})();
