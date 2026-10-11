/* Citizens Bank: bill payment
   Steps: 1 Details (category -> biller -> customer no.) -> 2 Review -> 3 OTP -> 4 Success.
   All billers and bills are dummy data. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return "৳" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var parseAmt = function (v) { return parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0; };

  // ---------- data ----------
  var CATS = {
    electricity: { label: "Electricity", field: "Customer / meter number", ph: "e.g. 1234 5678 9012", help: "Printed on the top of your bill or meter card" },
    gas:         { label: "Gas", field: "Customer code", ph: "e.g. 2201-44-7781", help: "Found on your gas bill" },
    water:       { label: "Water", field: "Account number", ph: "e.g. 10-2244-889", help: "WASA account number on your bill" },
    internet:    { label: "Internet", field: "User / customer ID", ph: "e.g. L3-0098812", help: "Your broadband login or customer ID" },
    mobile:      { label: "Mobile Postpaid", field: "Mobile number", ph: "01XXXXXXXXX", help: "Postpaid number registered in your name" },
    tv:          { label: "TV & Cable", field: "Subscriber ID", ph: "e.g. 8801-2233", help: "Shown on your set-top box or smart card" },
    education:   { label: "Education", field: "Student ID", ph: "e.g. 2021-1-60-045", help: "Fees for the current semester will be fetched" },
    insurance:   { label: "Insurance", field: "Policy number", ph: "e.g. PL-55102938", help: "Premium due for the current period" }
  };
  var BILLERS = [
    ["desco", "DESCO", "electricity", "Dhaka Electric Supply", "#0369a1", true],
    ["dpdc", "DPDC", "electricity", "Dhaka Power Distribution", "#b45309", true],
    ["breb", "BREB", "electricity", "Palli Bidyut (Rural)", "#15803d", true],
    ["nesco", "NESCO", "electricity", "Northern Electricity", "#7c3aed", true],
    ["wzpdcl", "WZPDCL", "electricity", "West Zone Power", "#be123c", true],
    ["bpdb", "BPDB", "electricity", "Power Development Board", "#0f766e", false],
    ["titas", "Titas Gas", "gas", "Dhaka & surroundings", "#ea580c"],
    ["bakhrabad", "Bakhrabad Gas", "gas", "Cumilla & Chattogram", "#0891b2"],
    ["karnaphuli", "Karnaphuli Gas", "gas", "Chattogram", "#4d7c0f"],
    ["jalalabad", "Jalalabad Gas", "gas", "Sylhet", "#9333ea"],
    ["dwasa", "Dhaka WASA", "water", "Dhaka", "#0284c7"],
    ["cwasa", "Chattogram WASA", "water", "Chattogram", "#0d9488"],
    ["kwasa", "Khulna WASA", "water", "Khulna", "#2563eb"],
    ["link3", "Link3", "internet", "Broadband", "#dc2626"],
    ["amber", "Amber IT", "internet", "Broadband", "#d97706"],
    ["carnival", "Carnival", "internet", "Broadband", "#db2777"],
    ["btcl", "BTCL", "internet", "Broadband & landline", "#1d4ed8"],
    ["gp", "Grameenphone", "mobile", "Postpaid", "#0ea5e9"],
    ["robi", "Robi", "mobile", "Postpaid", "#dc2626"],
    ["bl", "Banglalink", "mobile", "Postpaid", "#f97316"],
    ["teletalk", "Teletalk", "mobile", "Postpaid", "#16a34a"],
    ["akash", "Akash DTH", "tv", "Satellite TV", "#2563eb"],
    ["bengal", "Bengal Digital", "tv", "Cable TV", "#7c3aed"],
    ["du", "University of Dhaka", "education", "Semester fees", "#1e3a8a"],
    ["nsu", "North South University", "education", "Tuition fees", "#1d4ed8"],
    ["bracu", "BRAC University", "education", "Tuition fees", "#0f766e"],
    ["metlife", "MetLife", "insurance", "Life insurance premium", "#0369a1"],
    ["pragati", "Pragati Life", "insurance", "Life insurance premium", "#15803d"],
    ["delta", "Delta Life", "insurance", "Life insurance premium", "#b91c1c"]
  ].map(function (b) { return { id: b[0], name: b[1], cat: b[2], sub: b[3], color: b[4], prepaid: !!b[5] }; });
  var byId = {}; BILLERS.forEach(function (b) { byId[b.id] = b; });

  function logo(el, id) {
    var b = byId[id]; if (!b) return;
    el.style.background = b.color;
    el.textContent = b.name.replace(/[^A-Za-z]/g, "").slice(0, b.name.length > 6 ? 1 : 2).toUpperCase();
  }
  $$("[data-logo]").forEach(function (el) { logo(el, el.dataset.logo); });

  // ---------- amount in words (lakh / crore) ----------
  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""); }
  function three(n) { var h = Math.floor(n / 100), r = n % 100; return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : ""); }
  function words(num) {
    var n = Math.floor(num), p = Math.round((num - n) * 100); if (!n && !p) return "";
    var parts = [], c = Math.floor(n / 1e7); n %= 1e7; var l = Math.floor(n / 1e5); n %= 1e5; var t = Math.floor(n / 1e3); n %= 1e3;
    if (c) parts.push(three(c) + " Crore"); if (l) parts.push(two(l) + " Lakh"); if (t) parts.push(two(t) + " Thousand"); if (n) parts.push(three(n));
    return "Taka " + (parts.join(" ") || "Zero") + (p ? " and " + two(p) + " Paisa" : "") + " Only";
  }

  // ---------- state ----------
  var cat = null, biller = null, bill = null;
  var meterSeg = $("#meterType"), custNo = $("#custNo"), amountIn = $("#amount");
  function prepaid() { return biller && biller.prepaid && $("button.on", meterSeg).dataset.v === "prepaid"; }

  // ---------- step 1: category -> biller ----------
  function chooseCat(c) {
    cat = c;
    $$(".cat").forEach(function (b) { b.classList.toggle("on", b.dataset.cat === c); });
    $("#billerBlock").hidden = false;
    $("#billerTitle").textContent = "Select " + CATS[c].label.toLowerCase() + " biller";
    $("#billerSearch").value = "";
    renderBillers();
  }
  function renderBillers() {
    var q = $("#billerSearch").value.trim().toLowerCase();
    var list = BILLERS.filter(function (b) { return b.cat === cat && (!q || (b.name + b.sub).toLowerCase().indexOf(q) > -1); });
    $("#billerCount").textContent = list.length + " billers";
    $("#billerGrid").innerHTML = list.map(function (b) {
      return '<button type="button" class="biller' + (biller && biller.id === b.id ? " on" : "") + '" data-id="' + b.id + '"><span class="blogo" data-logo="' + b.id + '"></span>' +
        '<span><b>' + b.name + "</b><small>" + b.sub + (b.prepaid ? " · Prepaid & postpaid" : "") + "</small></span></button>";
    }).join("") || '<div class="saved-empty">No biller found</div>';
    $$("#billerGrid [data-logo]").forEach(function (el) { logo(el, el.dataset.logo); });
  }
  $$(".cat").forEach(function (b) { b.addEventListener("click", function () { chooseCat(b.dataset.cat); }); });
  $("#billerSearch").addEventListener("input", renderBillers);
  $("#billerGrid").addEventListener("click", function (e) { var b = e.target.closest(".biller"); if (b) chooseBiller(b.dataset.id); });

  function chooseBiller(id, acc) {
    biller = byId[id]; bill = null;
    if (cat !== biller.cat) chooseCat(biller.cat);
    renderBillers();
    $("#billerBlock").hidden = true;
    $("#detailsBlock").hidden = false;
    logo($("#bhLogo"), id);
    $("#bhName").textContent = biller.name;
    $("#bhCat").textContent = CATS[biller.cat].label + " · " + biller.sub;
    meterSeg.hidden = !biller.prepaid;
    $$("button", meterSeg).forEach(function (x, i) { x.classList.toggle("on", i === 0); });
    var c = CATS[biller.cat];
    $("#custLabel").textContent = c.field; custNo.placeholder = c.ph; $("#custHelp").textContent = c.help;
    custNo.value = acc || "";
    $("#saveBiller").checked = false;
    $("#saveBiller").closest(".check").hidden = !!acc;
    resetBill(); clearErrs();
    $("#detailsBlock").scrollIntoView({ behavior: "smooth", block: "center" });
    if (acc) fetchBill();
    else setTimeout(function () { custNo.focus(); }, 350);
  }
  $("#changeBiller").addEventListener("click", function () {
    $("#detailsBlock").hidden = true; $("#billerBlock").hidden = false; biller = null; bill = null; renderBillers(); update();
  });
  $$(".sbiller, .up-pay").forEach(function (b) { b.addEventListener("click", function () { chooseBiller(b.dataset.biller, b.dataset.acc); }); });

  meterSeg.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", meterSeg).forEach(function (x) { x.classList.toggle("on", x === b); });
    resetBill();
  });

  function resetBill() {
    bill = null;
    lastFetchedCust = "";
    $("#billCard").hidden = true;
    $("#prepaidBox").hidden = !prepaid();
    var spin = $("#custSpin"); if (spin) spin.hidden = true;
    if (amountIn) amountIn.value = "";
    update();
  }
  custNo.addEventListener("input", function () {
    if (bill) { bill = null; lastFetchedCust = ""; $("#billCard").hidden = true; }
    clearErrs();
    update();
  });
  custNo.addEventListener("blur", function () {
    if (!prepaid() && biller) {
      var v = custNo.value.replace(/\s/g, "");
      if (v.length >= 6) {
        fetchBill();
      } else if (v.length > 0) {
        err("#custErr", "Enter a valid " + CATS[biller.cat].field.toLowerCase() + ".");
        $('[data-f="custNo"]').classList.add("invalid");
      }
    }
  });
  custNo.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !prepaid()) {
      e.preventDefault();
      custNo.blur();
    }
  });

  // ---------- fetch bill (dummy) ----------
  // saved / upcoming bills return the amount shown in the "Upcoming bills" card
  var KNOWN = { "desco|123456789012": 1840, "link3|L3-0098812": 1500, "titas|2201-44-7781": 1080, "gp|01711234567": 1265.5 };
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000; return h; }
  var fetching = false, lastFetchedCust = "";
  function fetchBill(onDone) {
    if (fetching || prepaid() || !biller) return;
    var v = custNo.value.replace(/\s/g, "");
    if (v.length < 6) {
      err("#custErr", "Enter a valid " + CATS[biller.cat].field.toLowerCase() + ".");
      $('[data-f="custNo"]').classList.add("invalid");
      return;
    }
    if (bill && lastFetchedCust === v) {
      if (typeof onDone === "function") onDone(bill);
      return;
    }
    fetching = true;
    clearErrs();
    var spin = $("#custSpin"); if (spin) spin.hidden = false;
    setTimeout(function () {
      fetching = false;
      if (spin) spin.hidden = true;
      lastFetchedCust = v;
      var h = hash(v + biller.id), base = 600 + (h % 3200) + (h % 7) * 0.25, late = h % 5 === 0 ? 50 : 0;
      var known = KNOWN[biller.id + "|" + v]; if (known) { base = known; late = 0; }
      if (biller.cat === "education") base = 38000 + (h % 20) * 1000;
      if (biller.cat === "insurance") base = 4500 + (h % 10) * 500;
      bill = { month: biller.cat === "education" ? "Fall 2026" : "September 2026", due: late ? "Overdue" : "Due 15 Oct 2026",
        name: "SYED FOYSAL", no: "BL" + (100000 + h), base: base, late: late, amount: base + late };
      $("#bMonth").textContent = bill.month;
      $("#bDue").textContent = bill.due; $("#bDue").classList.toggle("over", !!late);
      $("#bAmt").textContent = fmt(bill.amount);
      $("#bName").textContent = bill.name; $("#bNo").textContent = bill.no;
      $("#bBase").textContent = fmt(bill.base); $("#bLate").textContent = late ? fmt(late) : "None";
      $("#billCard").hidden = false;
      update();
      if (typeof onDone === "function") onDone(bill);
    }, 600);
  }

  // ---------- prepaid amount ----------
  if (amountIn) {
    amountIn.addEventListener("input", function () {
      var v = amountIn.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); amountIn.value = v; clearErrs(); update();
    });
    amountIn.addEventListener("blur", function () { var a = parseAmt(amountIn.value); amountIn.value = a ? a.toLocaleString("en-US", { maximumFractionDigits: 2 }) : ""; });
    amountIn.addEventListener("focus", function () { amountIn.value = amountIn.value.replace(/,/g, ""); });
    $$("#prepaidBox .chips button").forEach(function (b) {
      b.addEventListener("click", function () { amountIn.value = (+b.dataset.amt).toLocaleString("en-US"); clearErrs(); update(); });
    });
  }

  // ---------- pay from ----------
  window.cbAccountPicker($("#fromSelect"));
  function fromAcc() {
    var r = $('input[name="from"]:checked');
    return { name: r.dataset.name, no: r.dataset.no, bal: +r.dataset.bal, kind: r.dataset.kind };
  }
  document.addEventListener("change", function (e) { if (e.target.name === "from") { clearErrs(); update(); } });

  function amount() { return prepaid() ? parseAmt(amountIn.value) : bill ? bill.amount : 0; }
  function update() {
    if (amountIn) $("#words").textContent = words(parseAmt(amountIn.value));
  }

  // ---------- validation ----------
  function err(id, msg) {
    var el = $(id); el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' + msg;
    el.classList.add("show");
  }
  function clearErrs() { $$(".err").forEach(function (e) { e.classList.remove("show"); }); $$(".fld.invalid").forEach(function (f) { f.classList.remove("invalid"); }); $(".amount-in") && $(".amount-in").classList.remove("invalid"); }
  function validate() {
    clearErrs();
    if (!biller) { $("#billerBlock").hidden = false; err("#billerErr", cat ? "Select a biller to continue." : "Choose a category and biller to continue."); if (!cat) { $("#billerBlock").hidden = true; err("#balErr", "Choose a category and biller to continue."); } return false; }
    if (custNo.value.replace(/\s/g, "").length < 6) { err("#custErr", "Enter a valid " + CATS[biller.cat].field.toLowerCase() + "."); $('[data-f="custNo"]').classList.add("invalid"); return false; }
    if (prepaid()) {
      var a = parseAmt(amountIn.value);
      if (a < 100) { err("#amtErr", "Minimum recharge is ৳100."); $(".amount-in").classList.add("invalid"); return false; }
    } else if (!bill) {
      err("#custErr", "Enter a valid " + CATS[biller.cat].field.toLowerCase() + " to load bill details.");
      $('[data-f="custNo"]').classList.add("invalid");
      return false;
    }
    var f = fromAcc();
    if (amount() > f.bal) { err("#balErr", "Insufficient " + (f.kind === "card" ? "card limit" : "balance") + " in " + f.name + ". Available " + fmt(f.bal) + "."); return false; }
    return true;
  }

  // ---------- steps ----------
  var current = 1;
  function go(step) {
    current = step;
    $$(".ft-step").forEach(function (s) { s.classList.toggle("on", +s.dataset.step === step); });
    $$(".stepper li").forEach(function (li) {
      var n = +li.dataset.step, last = step === 4;
      li.classList.toggle("on", n === step && !last); li.classList.toggle("done", n < step || last);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === 3) startOtp();
  }
  function rows() {
    var r = [["Category", CATS[biller.cat].label], ["Biller", biller.name], [CATS[biller.cat].field, custNo.value]];
    if (prepaid()) r.push(["Type", "Prepaid recharge"]);
    else r.push(["Customer name", bill.name], ["Bill number", bill.no], ["Bill period", bill.month], ["Bill amount", fmt(bill.base)], ["Late fee", bill.late ? fmt(bill.late) : "None"]);
    r.push(["Charge", "Free"]);
    return r;
  }
  function proceedToReview() {
    if (!validate()) { var e = $(".err.show"); if (e) e.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    var f = fromAcc(), a = amount();
    $("#rAmt").textContent = fmt(a); $("#rWords").textContent = words(a);
    $("#rFromName").textContent = f.name; $("#rFromNo").textContent = f.no;
    $("#rBiller").textContent = biller.name; $("#rCust").textContent = custNo.value; $("#rCat").textContent = CATS[biller.cat].label;
    $("#rList").innerHTML = rows().map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + x[1] + "</dd></div>"; }).join("") +
      '<div class="total"><dt>Total payable</dt><dd>' + fmt(a) + "</dd></div>";
    $("#agree").checked = false; $("#toOtp").disabled = true;
    go(2);
  }

  $("#toReview").addEventListener("click", function () {
    if (fetching) {
      var waitInt = setInterval(function () {
        if (!fetching) {
          clearInterval(waitInt);
          if (bill) proceedToReview();
          else validate();
        }
      }, 50);
      return;
    }
    if (!bill && !prepaid() && custNo.value.replace(/\s/g, "").length >= 6 && biller) {
      fetchBill(function () {
        proceedToReview();
      });
      return;
    }
    proceedToReview();
  });
  $("#agree").addEventListener("change", function () { $("#toOtp").disabled = !this.checked; });
  $$("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { go(current - 1); }); });
  $("#toOtp").addEventListener("click", function () { go(3); });

  // ---------- OTP ----------
  var boxes = $$(".otp input"), timerId, verifyOtp = $("#verifyOtp");
  function otpVal() { return boxes.map(function (b) { return b.value; }).join(""); }
  function otpState() { boxes.forEach(function (b) { b.classList.toggle("filled", !!b.value); }); verifyOtp.disabled = otpVal().length !== 6; }
  boxes.forEach(function (b, i) {
    b.addEventListener("input", function () { b.value = b.value.replace(/\D/g, "").slice(-1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); otpState(); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !b.value && boxes[i - 1]) { boxes[i - 1].focus(); boxes[i - 1].value = ""; otpState(); }
      if (e.key === "Enter" && !verifyOtp.disabled) verifyOtp.click();
    });
    b.addEventListener("paste", function (e) {
      var d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); if (!d) return;
      e.preventDefault(); boxes.forEach(function (x, k) { x.value = d[k] || ""; }); (boxes[d.length] || boxes[5]).focus(); otpState();
    });
  });
  function startOtp() {
    boxes.forEach(function (b) { b.value = ""; }); otpState(); setTimeout(function () { boxes[0].focus(); }, 300);
    var left = 120, resend = $("#resend"); clearInterval(timerId);
    var tick = function () {
      var m = Math.floor(left / 60), s = left % 60;
      resend.textContent = left > 0 ? "Resend in 0" + m + ":" + (s < 10 ? "0" : "") + s : "Resend code";
      resend.disabled = left > 0; if (left-- <= 0) clearInterval(timerId);
    };
    tick(); timerId = setInterval(tick, 1000);
  }
  $("#resend").addEventListener("click", function () { startOtp(); window.cbToast("A new code has been sent"); });
  verifyOtp.addEventListener("click", function () {
    if (otpVal() === "000000") {
      $(".otp").classList.add("shake"); setTimeout(function () { $(".otp").classList.remove("shake"); }, 400);
      window.cbToast("Incorrect code. Please try again."); return;
    }
    verifyOtp.classList.add("loading"); verifyOtp.textContent = "Processing";
    setTimeout(function () { verifyOtp.classList.remove("loading"); verifyOtp.textContent = "Verify & Pay"; clearInterval(timerId); success(); go(4); }, 1300);
  });

  // ---------- success ----------
  function success() {
    var f = fromAcc(), a = amount(), now = new Date();
    var id = "CBP" + now.getFullYear().toString().slice(2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + Math.floor(100000 + Math.random() * 899999);
    $("#okBiller").textContent = biller.name; $("#okAmt").textContent = fmt(a); $("#okId").textContent = id;
    var tok = $("#tokenBox");
    tok.hidden = !prepaid();
    if (prepaid()) {
      var t = ""; for (var i = 0; i < 20; i++) t += Math.floor(Math.random() * 10);
      $("#okToken").textContent = t.replace(/(\d{4})(?=\d)/g, "$1-");
    }
    var r = rows();
    r.unshift(["Date & time", now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })]);
    r.push(["Paid from", f.name + " · " + f.no]);
    $("#okList").innerHTML = r.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + x[1] + "</dd></div>"; }).join("") +
      '<div class="total"><dt>Total paid</dt><dd>' + fmt(a) + "</dd></div>";
    if ($("#saveBiller").checked) window.cbToast(biller.name + " saved to your billers");
  }
  function copy(text, msg) { try { navigator.clipboard.writeText(text); } catch (e) {} window.cbToast(msg); }
  $("#copyId").addEventListener("click", function () { copy($("#okId").textContent, "Transaction ID copied"); });
  $("#copyToken").addEventListener("click", function () { copy($("#okToken").textContent.replace(/-/g, ""), "Token copied"); });
  $("#printReceipt").addEventListener("click", function () { window.print(); });
  $("#newBill").addEventListener("click", function () { location.href = location.pathname; });

  // deep link: bill-pay.html#desco=123456789012 or #electricity
  var h = decodeURIComponent(location.hash.slice(1));
  if (h) { var p = h.split("="); if (byId[p[0]]) chooseBiller(p[0], p[1]); else if (CATS[p[0]]) chooseCat(p[0]); }
  update();
})();
