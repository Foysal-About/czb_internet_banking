/* Products: type sections, cards, detail drawer with feature list. Dummy data (authStatus "A" only). */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc, ic = cb.icon;
  var TYPES = [
    { id: "deposit", label: "Deposit & Savings", icon: "piggy", items: [
      { t: "Citizens Savings Account", tag: "Popular", d: "Everyday savings with competitive interest and a free debit card.", rates: [["Rate", "4.50%"], ["Min. balance", "৳500"]], f: ["Interest calculated daily and credited half-yearly", "Free VISA debit card and internet banking", "Minimum opening deposit of ৳500", "Free statement through the portal", "Nominee facility available"], el: ["Bangladeshi residents aged 18 or above", "Minors through a guardian"], docs: ["Passport-size photo", "NID or birth certificate", "Nominee details"] },
      { t: "Monthly DPS", d: "Build a habit of saving with a fixed monthly installment and a guaranteed maturity amount.", rates: [["Rate", "7.00%"], ["Tenure", "1-10 yrs"]], f: ["Installments from ৳500 up to ৳50,000 per month", "Tenure of 1, 2, 3, 5 or 10 years", "Auto-debit from your Citizens account", "Loan facility up to 80% of the deposited amount", "Premature encashment allowed after 6 installments"], el: ["Existing Citizens account holders", "Age 18 or above"], docs: ["Account number", "Nominee details"] },
      { t: "Citizens FDR", tag: "Best rate", d: "Fixed deposit for 3, 6 or 12 months with interest paid at maturity or monthly.", rates: [["Rate", "7.25%"], ["Min.", "৳50,000"]], f: ["Choose 3, 6, 12 or 36 month tenure", "Interest at maturity or monthly credit", "Auto-renewal on request", "Lien-marked loan against FDR available", "Tax deducted at source as per law"], el: ["Individuals and institutions", "Valid TIN recommended"], docs: ["Account number", "TIN certificate"] },
      { t: "Salary Account", d: "Zero-balance account for employees of partner companies with extra perks.", rates: [["Min. balance", "৳0"], ["Fee", "Free"]], f: ["No minimum balance requirement", "Free ATM withdrawals at Citizens ATMs", "Salary-linked personal loan offers", "Priority service at branches"], el: ["Employees of partner organisations"], docs: ["Employment letter", "NID"] }
    ] },
    { id: "loan", label: "Loans", icon: "landmark", items: [
      { t: "Home Loan", tag: "Low EMI", d: "Finance your dream home with flexible tenure up to 25 years.", rates: [["From", "9.00%"], ["Tenure", "25 yrs"]], f: ["Up to 70% of property value", "Flexible tenure up to 25 years", "Part-prepayment without penalty after 1 year", "Top-up facility on existing loans"], el: ["Salaried or self-employed, 25-60 years", "Minimum monthly income ৳50,000"], docs: ["Property papers", "Income proof", "6-month bank statement"] },
      { t: "Personal Loan", d: "Quick personal finance for any need, no collateral required.", rates: [["From", "12.50%"], ["Up to", "৳10 lac"]], f: ["Up to ৳10,00,000 without collateral", "Tenure from 12 to 60 months", "Decision within 48 hours", "No hidden charges"], el: ["Salaried employees with 1+ year of service"], docs: ["Salary certificate", "3-month bank statement", "NID and TIN"] },
      { t: "Auto Loan", d: "Drive home a new or reconditioned car with easy installments.", rates: [["From", "10.50%"], ["Tenure", "5 yrs"]], f: ["Up to 70% of the vehicle price", "Tenure up to 5 years", "Quick processing with partner dealers"], el: ["Age 23-60", "Minimum monthly income ৳40,000"], docs: ["Proforma invoice", "Income proof", "NID and TIN"] }
    ] },
    { id: "card", label: "Cards", icon: "card", items: [
      { t: "Citizens VISA Debit", d: "Shop and withdraw cash locally and abroad with your Citizens account.", rates: [["Annual fee", "৳500"]], f: ["Accepted at ATMs and POS nationwide", "Contactless tap to pay", "Instant block and unblock in the portal", "Global acceptance with VISA"], el: ["Any Citizens account holder"], docs: ["Account number"] },
      { t: "Citizens Platinum Credit", tag: "Rewards", d: "Premium credit card with reward points, lounge access and easy EMI.", rates: [["Limit", "৳5 lac"], ["Interest-free", "45 days"]], f: ["Reward points on every purchase", "Complimentary airport lounge visits", "0% EMI with partner merchants", "Supplementary cards for family"], el: ["Age 21-65", "Minimum monthly income ৳60,000"], docs: ["Income proof", "NID and TIN", "Photograph"] },
      { t: "Prepaid Travel Card", d: "Load foreign currency and travel without carrying cash.", rates: [["Currencies", "USD, EUR, GBP"]], f: ["Reload through branch or portal", "Chip and PIN protected", "Works at ATMs abroad"], el: ["Valid passport and visa"], docs: ["Passport", "Visa copy", "Air ticket"] }
    ] },
    { id: "digital", label: "Digital Banking", icon: "smartphone", items: [
      { t: "Citizens FAST Internet Banking", tag: "New", d: "Transfer funds, pay bills and manage accounts from any browser.", rates: [["Fee", "Free"]], f: ["Fund transfer: own, CZB, other banks, MFS", "Bill payment and mobile recharge", "Statements and receipts as PDF", "Two-step verification with OTP"], el: ["Any Citizens account holder with a registered mobile"], docs: ["Registered mobile number"] },
      { t: "Citizens Mobile App", d: "Everything you need, in your pocket, with biometric login.", rates: [["Fee", "Free"]], f: ["Biometric and PIN login", "QR payments", "Instant card controls", "Push notifications for every transaction"], el: ["Android or iOS device"], docs: ["Registered mobile number"] }
    ] },
    { id: "remit", label: "Remittance", icon: "send", items: [
      { t: "Citizens Remit", d: "Receive money from abroad straight into your account, with a government incentive.", rates: [["Incentive", "2.50%"], ["Fee", "Free"]], f: ["Credited to any Citizens account in minutes", "2.5% government cash incentive", "Partner exchange houses worldwide", "Pickup from any branch"], el: ["Any account holder", "Beneficiary NID required for pickup"], docs: ["NID", "Reference number from sender"] }
    ] }
  ];
  var root = $("#prRoot");
  var state = { type: "", q: "" };

  root.innerHTML =
    '<div class="dc-toolbar"><div class="fld"><label for="prQ">Search products</label><div class="dc-search">' + ic("search", 16) + '<input id="prQ" type="search" placeholder="Search by name or feature" autocomplete="off"></div></div></div>' +
    '<div class="dc-chips pr-types" id="prChips" role="group" aria-label="Product type"></div><div id="prSecs"></div>' +
    '<div class="dr" id="prDr" aria-hidden="true"><div class="dr-bd" data-close></div><aside class="dr-box" role="dialog" aria-modal="true" aria-labelledby="prDrT"><div class="dr-head"><h3 id="prDrT">Product details</h3><button class="modal-x" type="button" data-close aria-label="Close">' + ic("x", 18) + '</button></div><div class="dr-body" id="prDrB"></div><div class="dr-foot" id="prDrF"></div></aside></div>';

  function chips() {
    var all = [{ id: "", label: "All" }].concat(TYPES);
    $("#prChips").innerHTML = all.map(function (t) { return '<button type="button" data-c="' + t.id + '" class="' + (state.type === t.id ? "on" : "") + '">' + t.label + "</button>"; }).join("");
  }
  function card(p, ti, pi) {
    return '<button type="button" class="card pr-card" data-p="' + ti + "-" + pi + '"><div class="pr-top"><span class="dc-ic">' + ic(TYPES[ti].icon, 20) + "</span>" + (p.tag ? '<span class="pr-tag">' + esc(p.tag) + "</span>" : "") + "</div>" +
      "<h3>" + esc(p.t) + "</h3><p>" + esc(p.d) + "</p>" +
      '<div class="pr-rates">' + p.rates.map(function (r) { return '<div class="pr-rate"><small>' + esc(r[0]) + "</small><b>" + esc(r[1]) + "</b></div>"; }).join("") + "</div>" +
      '<span class="pr-more">View details ' + ic("chevR", 14) + "</span></button>";
  }
  function render() {
    var q = state.q.toLowerCase(), h = "", n = 0;
    TYPES.forEach(function (ty, ti) {
      if (state.type && state.type !== ty.id) return;
      var cards = ty.items.map(function (p, pi) { return { p: p, pi: pi }; }).filter(function (x) { return !q || (x.p.t + " " + x.p.d + " " + x.p.f.join(" ")).toLowerCase().indexOf(q) > -1; });
      if (!cards.length) return; // empty sections dropped
      n += cards.length;
      h += '<section class="dc-section" id="' + ty.id + '"><div class="page-head"><h2><span class="dc-ic pr-sec-ic">' + ic(ty.icon, 18) + "</span>" + ty.label + '</h2><span class="muted">' + cards.length + (cards.length === 1 ? " product" : " products") + '</span></div><div class="grid-auto">' +
        cards.map(function (x) { return card(x.p, ti, x.pi); }).join("") + "</div></section>";
    });
    $("#prSecs").innerHTML = n ? h : '<div class="card empty-state" style="margin-top:20px"><div class="es-ic">' + ic("search", 26) + "</div><b>No products found</b>Try a different search term or type.</div>";
  }

  var dr = $("#prDr"), lastFocus;
  function open(key) {
    var k = key.split("-"), ty = TYPES[+k[0]], p = ty.items[+k[1]];
    $("#prDrB").innerHTML =
      '<div class="card pr-hero"><div class="k">' + ty.label + "</div><h2>" + esc(p.t) + "</h2><p>" + esc(p.d) + '</p><div class="pr-rates">' + p.rates.map(function (r) { return '<div class="pr-rate"><small>' + esc(r[0]) + "</small><b>" + esc(r[1]) + "</b></div>"; }).join("") + "</div></div>" +
      "<h4>Features</h4><ul class=\"pr-feats\">" + p.f.map(function (x) { return "<li>" + ic("check", 16, 2.4) + "<span>" + esc(x) + "</span></li>"; }).join("") + "</ul>" +
      "<h4>Eligibility</h4><ul class=\"pr-feats pr-elig\">" + p.el.map(function (x) { return "<li>" + ic("shieldCheck", 16) + "<span>" + esc(x) + "</span></li>"; }).join("") + "</ul>" +
      "<h4>Documents</h4><ul class=\"pr-docs\">" + p.docs.map(function (x) { return "<li>" + ic("fileText", 15) + esc(x) + "</li>"; }).join("") + "</ul>";
    $("#prDrB").scrollTop = 0;
    $("#prDrF").innerHTML = '<a class="btn-sec" href="find-czb.html">Find a branch</a><button class="btn-pri" type="button" data-apply="' + esc(p.t) + '">Enquire</button>';
    lastFocus = document.activeElement;
    dr.classList.add("open"); dr.setAttribute("aria-hidden", "false");
    setTimeout(function () { var b = $(".modal-x", dr); if (b) b.focus(); }, 60);
  }
  function close() { dr.classList.remove("open"); dr.setAttribute("aria-hidden", "true"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  root.addEventListener("click", function (e) {
    var c = e.target.closest("[data-c]"); if (c) { state.type = c.dataset.c; chips(); render(); return; }
    var p = e.target.closest("[data-p]"); if (p) { open(p.dataset.p); return; }
    if (e.target.closest("[data-close]")) { close(); return; }
    var a = e.target.closest("[data-apply]"); if (a) { cb.toast("Thanks. A relationship manager will contact you about " + a.dataset.apply + ".", "success"); close(); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && dr.classList.contains("open")) close(); });
  $("#prQ").addEventListener("input", function (e) { state.q = e.target.value.trim(); render(); });
  chips(); render();
  if (location.hash && $(location.hash)) setTimeout(function () { $(location.hash).scrollIntoView(); }, 50);
})();
