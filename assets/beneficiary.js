/* Citizens Bank: add beneficiary (Own Bank / Other Bank / MFS / Credit Card)
   Type comes from the URL hash (#own, #other, #mfs, #card). All data is dummy;
   saved beneficiaries are kept in this browser only. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TYPES = {
    own:   { label: "Own Bank", desc: "Add a Citizens Bank account. Transfers are instant and free.", pay: "fund-transfer-own.html", payText: "Transfer now" },
    other: { label: "Other Bank", desc: "Add an account at another bank in Bangladesh for NPSB, BEFTN or RTGS transfers.", pay: "fund-transfer-other.html", payText: "Transfer now" },
    mfs:   { label: "MFS", desc: "Add a bKash, Nagad, Rocket or Upay wallet to send money from your account.", pay: "index.html", payText: "Send money" },
    card:  { label: "Credit Card", desc: "Add a credit card to pay its bill directly from your account.", pay: "index.html", payText: "Pay card bill" }
  };
  // ---------- saved beneficiaries (browser only) ----------
  var SEED = [
    { type: "own", name: "Anoy Islam", sub: "0012-0456-8812 · Banani", nick: "Cousin" },
    { type: "own", name: "Nusrat Jahan", sub: "0012-0991-3307 · Gulshan", nick: "Sister" },
    { type: "own", name: "Tanvir Hasan", sub: "0031-0144-5520 · Uttara", nick: "" },
    { type: "own", name: "Rafiq Ahmed", sub: "0045-0718-2264 · Dhanmondi", nick: "Landlord" },
    { type: "own", name: "Sadia Karim", sub: "0012-0502-1189 · Motijheel", nick: "" },
    { type: "other", name: "Mahmudul Hasan", sub: "Dutch-Bangla Bank · 1051-1003-44217", nick: "Office" },
    { type: "other", name: "Farhana Akter", sub: "BRAC Bank · 2205-6600-1182", nick: "" },
    { type: "other", name: "Kamal Traders", sub: "The City Bank · 1401-2209-7710", nick: "Supplier" },
    { type: "other", name: "Shirin Sultana", sub: "Eastern Bank · Dhanmondi · 0091-7720-3348", nick: "" },
    { type: "other", kind: "card", name: "Arif Chowdhury", sub: "BRAC Bank · VISA · 4319 •••• •••• 2290", nick: "Card" },
    { type: "own", kind: "card", name: "Nusrat Jahan", sub: "4512 •••• •••• 5512 · Debit Card", nick: "Card" },
    { type: "mfs", name: "Rahima Begum", sub: "bKash · +880 1711-234567", nick: "Mother" },
    { type: "mfs", name: "Jamal Uddin", sub: "Nagad · +880 1819-876543", nick: "Driver" },
    { type: "card", name: "Syed Foysal", sub: "Citizens Bank · VISA •••• 4421", nick: "My card" },
    { type: "card", name: "Syed Foysal", sub: "BRAC Bank · MASTERCARD •••• 9087", nick: "" }
  ];
  var KEY = "citizens-beneficiaries", saved;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!Array.isArray(saved)) saved = SEED.slice();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} }

  var type = "own";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------- type switching ----------
  function setType(t) {
    if (!TYPES[t]) t = "own";
    type = t;
    $$(".btype-btn").forEach(function (b) { b.classList.toggle("on", b.dataset.type === t); b.setAttribute("aria-selected", b.dataset.type === t); });
    $$(".bform").forEach(function (f) { f.classList.toggle("on", f.dataset.type === t); });
    $("#crumbType").textContent = TYPES[t].label;
    $("#typeDesc").textContent = TYPES[t].desc;
    if (location.hash !== "#" + t) history.replaceState(null, "", "#" + t);
    clearErrors(); go(1);
  }
  $$(".btype-btn").forEach(function (b) { b.addEventListener("click", function () { setType(b.dataset.type); }); });
  window.addEventListener("hashchange", function () {
    $$(".modal.open").forEach(function (m) { m.classList.remove("open"); });
    setType(location.hash.slice(1));
  });

  // ---------- steps ----------
  function go(step) {
    $$(".ft-step").forEach(function (s) { s.classList.toggle("on", +s.dataset.step === step); });
    if (step !== 1) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- segmented controls ----------
  $$(".bform .seg").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      $$("button", seg).forEach(function (x) { x.classList.toggle("on", x === b); });
      seg.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  function segVal(id) { var b = $("#" + id + " button.on"); return b ? b.dataset.v : ""; }

  // ---------- own bank: verify ----------
  var ownVerified = null;
  $("#ownAcc").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, ""); ownVerified = null; $("#ownVerified").hidden = true;
  });
  $("#ownVerify").addEventListener("click", function () {
    var btn = this, no = $("#ownAcc").value;
    if (no.length !== 13) { setErr("ownAcc", "Enter the full 13-digit account number"); return; }
    clearErr("ownAcc"); btn.textContent = "Checking…";
    setTimeout(function () {
      btn.textContent = "Verify";
      ownVerified = { name: "MD. RAHIM UDDIN", branch: "Motijheel Branch", no: no.replace(/(\d{4})(\d{4})(\d{5})/, "$1-$2-$3") };
      $("#ownVerified b").textContent = ownVerified.name;
      $("#ownVerified span").textContent = "Citizens Bank · " + ownVerified.branch;
      $("#ownVerified").hidden = false;
    }, 700);
  });

  // ---------- other bank: branches ----------
  var BRANCHES = {
    "Dutch-Bangla Bank": [["Gulshan", "090261725"], ["Motijheel", "090274538"], ["Dhanmondi", "090260834"]],
    "BRAC Bank": [["Gulshan", "060261726"], ["Banani", "060260435"], ["Uttara", "060264638"]],
    "The City Bank": [["Principal Office", "225274531"], ["Gulshan", "225261729"]],
    "Eastern Bank": [["Principal", "095274530"], ["Dhanmondi", "095260836"]],
    "Islami Bank Bangladesh": [["Local Office", "125274535"], ["Mirpur", "125262941"]],
    "Sonali Bank": [["Local Office", "200274535"], ["Ramna", "200275020"]],
    "Prime Bank": [["Motijheel", "170274530"], ["Gulshan", "170261726"]],
    "Mutual Trust Bank": [["Dilkusha", "145274532"], ["Banani", "145260436"]]
  };
  $("#oBank").addEventListener("change", function () {
    var list = BRANCHES[this.value] || [];
    $("#oBranch").innerHTML = '<option value="">Select branch</option>' + list.map(function (b) { return '<option value="' + b[1] + '">' + b[0] + "</option>"; }).join("");
    $("#oBranch").disabled = !list.length;
    $("#oRouting").innerHTML = "Routing number: <b>—</b>";
  });
  $("#oBranch").addEventListener("change", function () { $("#oRouting").innerHTML = "Routing number: <b>" + (this.value || "—") + "</b>"; });
  $("#oAcc").addEventListener("input", function () { this.value = this.value.replace(/\D/g, ""); });

  // ---------- MFS ----------
  $("#mNo").addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").replace(/^0/, "").slice(0, 10);
    this.value = d.length > 4 ? d.slice(0, 4) + "-" + d.slice(4) : d;
  });

  // ---------- credit card (live preview) ----------
  function brand(n) {
    if (/^4/.test(n)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(n)) return "MASTERCARD";
    if (/^3[47]/.test(n)) return "AMEX";
    return "CARD";
  }
  function luhn(n) {
    var sum = 0, alt = false;
    for (var i = n.length - 1; i >= 0; i--) { var d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; }
    return sum % 10 === 0;
  }
  function ccUpdate() {
    var n = $("#cNo").value.replace(/\D/g, "");
    var masked = (n + "•".repeat(Math.max(0, 16 - n.length))).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    $("#ccNo").textContent = masked;
    $("#ccBrand").textContent = brand(n);
    $("#ccName").textContent = ($("#cName").value.trim() || "Your name").toUpperCase();
    $("#ccNick").textContent = $("#cNick").value.trim() || "—";
    var other = segVal("cIssuer") === "other";
    $("#ccBank").textContent = other ? ($("#cBank").value || "Other bank") : "Citizens Bank";
    $("#ccPreview").classList.toggle("other", other);
  }
  $("#cNo").addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 16);
    this.value = d.replace(/(.{4})/g, "$1 ").trim(); ccUpdate();
  });
  ["cName", "cNick"].forEach(function (id) { $("#" + id).addEventListener("input", ccUpdate); });
  $("#cBank").addEventListener("change", ccUpdate);
  $("#cIssuer").addEventListener("change", function () { $("#cBankFld").hidden = segVal("cIssuer") !== "other"; ccUpdate(); });

  // ---------- validation ----------
  function setErr(id, msg) {
    var f = $('[data-f="' + id + '"]'); if (!f) return;
    f.classList.add("invalid");
    var e = $(".ferr", f); if (!e) { e = document.createElement("span"); e.className = "ferr"; f.appendChild(e); }
    e.textContent = msg;
  }
  function clearErr(id) { var f = $('[data-f="' + id + '"]'); if (f) { f.classList.remove("invalid"); var e = $(".ferr", f); if (e) e.remove(); } }
  function clearErrors() { $$(".fld.invalid").forEach(function (f) { clearErr(f.dataset.f); }); }
  document.addEventListener("input", function (e) { var f = e.target.closest(".fld.invalid"); if (f) clearErr(f.dataset.f); });
  document.addEventListener("change", function (e) { var f = e.target.closest(".fld.invalid"); if (f) clearErr(f.dataset.f); });
  var val = function (id) { return $("#" + id).value.trim(); };
  var emailOk = function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  function collect() {
    clearErrors();
    var ok = true, bad = function (id, m) { setErr(id, m); ok = false; }, d;
    if (type === "own") {
      if (!ownVerified) bad("ownAcc", val("ownAcc").length === 13 ? "Tap Verify to confirm the account holder" : "Enter and verify a 13-digit account number");
      if (!val("ownNick")) bad("ownNick", "Add a nickname");
      if (!emailOk(val("ownEmail"))) bad("ownEmail", "Enter a valid email");
      if (ok) d = { name: ownVerified.name, sub: ownVerified.no + " · " + ownVerified.branch.replace(" Branch", ""), nick: val("ownNick"),
        rows: [["Bank", "Citizens Bank"], ["Account number", ownVerified.no], ["Branch", ownVerified.branch]] };
    }
    if (type === "other") {
      if (!val("oBank")) bad("oBank", "Select a bank");
      if (!val("oBranch")) bad("oBranch", "Select a branch");
      if (val("oAcc").length < 8) bad("oAcc", "Enter a valid account number");
      if (val("oName").length < 3) bad("oName", "Enter the account holder's name");
      if (!val("oNick")) bad("oNick", "Add a nickname");
      if (!emailOk(val("oEmail"))) bad("oEmail", "Enter a valid email");
      if (ok) {
        var br = $("#oBranch").options[$("#oBranch").selectedIndex].text;
        d = { name: val("oName"), sub: val("oBank") + " · " + val("oAcc"), nick: val("oNick"), kind: segVal("oAccType") === "Card" ? "card" : "account",
          rows: [["Bank", val("oBank")], ["Branch", br], ["Routing number", val("oBranch")], ["Account type", segVal("oAccType")], ["Account number", val("oAcc")]] };
      }
    }
    if (type === "mfs") {
      var no = val("mNo").replace(/\D/g, "");
      if (!/^1[3-9]\d{8}$/.test(no)) bad("mNo", "Enter a valid 11-digit mobile number");
      if (val("mName").length < 3) bad("mName", "Enter the wallet holder's name");
      if (!val("mNick")) bad("mNick", "Add a nickname");
      if (!emailOk(val("mEmail"))) bad("mEmail", "Enter a valid email");
      if (ok) {
        var p = $('input[name="prov"]:checked').value, num = "+880 " + val("mNo");
        d = { name: val("mName"), sub: p + " · " + num, nick: val("mNick"),
          rows: [["Provider", p], ["Wallet type", segVal("mType")], ["Mobile number", num]] };
      }
    }
    if (type === "card") {
      var cn = val("cNo").replace(/\D/g, ""), other = segVal("cIssuer") === "other";
      if (other && !val("cBank")) bad("cBank", "Select the issuing bank");
      if (cn.length < 15 || !luhn(cn)) bad("cNo", "Enter a valid card number");
      if (val("cName").length < 3) bad("cName", "Enter the name on the card");
      if (!val("cNick")) bad("cNick", "Add a nickname");
      if (!emailOk(val("cEmail"))) bad("cEmail", "Enter a valid email");
      if (ok) {
        var bank = other ? val("cBank") : "Citizens Bank";
        d = { name: val("cName"), sub: bank + " · " + brand(cn) + " •••• " + cn.slice(-4), nick: val("cNick"),
          rows: [["Issuer", bank], ["Card", brand(cn) + " •••• " + cn.slice(-4)]] };
      }
    }
    if (!ok) { var f = $(".fld.invalid"); if (f) f.scrollIntoView({ behavior: "smooth", block: "center" }); return null; }
    d.type = type;
    return d;
  }

  var pending = null;
  $("#saveBtn").addEventListener("click", function () {
    pending = collect(); if (!pending) return;
    openOtp();
  });

  // ---------- verify: OTP pop-up ----------
  function openOtp() {
    cb.otp({
      title: "Verify it's you",
      verifyText: "Verify & Add",
      summary: '<div class="otp-sum"><span>Adding beneficiary</span><b>' + esc(pending.name) + "</b><small>" + esc(pending.sub) + "</small></div>",
      message: "Enter the 6-digit code sent to <b>+880 17•• ••••89</b>",
      note: "Never share this code. Citizens Bank will never ask for it.",
      onSuccess: function () {
        saved.forEach(function (b) { delete b.fresh; });
        saved.unshift({ type: pending.type, kind: pending.kind || "account", name: pending.name, sub: pending.sub, nick: pending.nick, fresh: true });
        persist(); success(pending);
      }
    });
  }

  // ---------- done: success pop-up ----------
  function success(d) {
    var t = TYPES[d.type];
    var rows = [["Beneficiary name", d.name], ["Nickname", d.nick]].concat(d.rows);
    rows.push(["Added on", new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })]);
    rows.push(["Status", '<span class="status-pill">Active · Cooling period 24h</span>', { html: true }]);
    cb.success({
      title: "Beneficiary Added",
      message: "<b>" + esc(d.nick || d.name) + "</b> is now in your " + t.label + " beneficiaries",
      rows: rows,
      buttons: [
        { text: "Add another", icon: "plus", onClick: addAnother },
        { text: "Back to dashboard", href: "index.html" },
        { text: t.payText, href: t.pay, primary: true }
      ]
    });
  }
  function addAnother() {
    $$(".bform.on").forEach(function (f) { f.reset(); });
    ownVerified = null; $("#ownVerified").hidden = true; $("#cBankFld").hidden = segVal("cIssuer") !== "other";
    ccUpdate(); go(1);
  }

  setType(location.hash.slice(1));
  ccUpdate();
})();
