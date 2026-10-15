/* Help & Support: contact cards, searchable FAQ accordion, About/Privacy, What's New. Dummy data. */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc, ic = cb.icon;
  var FAQ = [
    ["Accounts", "How do I download my account statement?", "<p>Go to <b>Accounts &gt; Statement</b>, choose the account and a period, then select <b>Download PDF</b>. You can view statements for up to the last 6 months online.</p>"],
    ["Accounts", "Why is my available balance lower than my current balance?", "<p>Funds on hold, a lien or the minimum balance requirement reduce your available balance. Open <b>My Accounts</b> and select the account to see the breakdown.</p>"],
    ["Transfers", "What are my daily transfer limits?", "<p>Limits depend on the transfer type. See <b>Accounts &gt; Transaction Limits</b> for the amount you can still send today.</p>"],
    ["Transfers", "How long does an NPSB or BEFTN transfer take?", "<ol><li>NPSB: usually instant, 24/7.</li><li>BEFTN: next working day.</li><li>RTGS: same day during banking hours.</li></ol>"],
    ["Transfers", "I transferred money to the wrong account. What now?", "<p>Contact the call centre on <b>16222</b> immediately with the transaction ID, or raise a <a href=\"dispute.html\">dispute</a>. Reversal depends on the receiving bank.</p>"],
    ["Cards", "How do I block a lost or stolen card?", "<p>Open <b>Cards</b>, select the card and choose <b>Block card</b>. You can also call <b>16222</b> any time, 24/7.</p>"],
    ["Cards", "How can I get a new debit card PIN?", "<p>Visit any Citizens branch with your NID, or request a PIN mailer from the call centre.</p>"],
    ["Security", "Will the bank ever ask for my OTP, PIN or TPIN?", "<p><b>Never.</b> Citizens Bank staff will not ask for your password, PIN, TPIN or OTP by phone, SMS or email. Do not share them with anyone.</p>"],
    ["Security", "I forgot my password. How can I reset it?", "<p>Use <a href=\"reset-password.html\">Forgot password</a> on the sign-in page and verify with the OTP sent to your registered mobile.</p>"],
    ["Bills", "Which bills can I pay online?", "<ul><li>Electricity, gas and water</li><li>Internet and TV</li><li>Mobile recharge</li><li>Credit card bills</li></ul><p>See <a href=\"bill-pay.html\">Bill Pay</a> for the full list.</p>"],
    ["Bills", "Is there a charge for bill payments?", "<p>Utility bill payments through Citizens FAST are free of charge. Provider-side fees, if any, are shown before you confirm.</p>"]
  ];
  var NEWS = [
    ["01", "Oct", "Product", "Citizens FAST internet banking is live", "Transfer funds, pay bills and download statements from your browser with the same security as the mobile app."],
    ["22", "Sep", "Offer", "Cashback on utility bill payments", "Get up to ৳150 cashback when you pay your DESCO, Titas or WASA bill through Citizens FAST this month."],
    ["10", "Sep", "Notice", "Scheduled maintenance on 5 October", "Internet banking and the mobile app will be unavailable between 1:00 AM and 3:00 AM for system upgrades."],
    ["28", "Aug", "Event", "Citizens SME Fair 2026", "Meet our relationship managers and learn about SME loans at the Gulshan Branch from 5 to 7 September."],
    ["12", "Aug", "Security", "Beware of phishing messages", "We never send links asking for your credentials. Report suspicious messages to 16222."]
  ];
  var ABOUT = "<p>Citizens Bank PLC is a full-service commercial bank serving individuals, SMEs and corporates across Bangladesh through branches, sub-branches, ATMs, booths and digital channels.</p><p style=\"margin-top:10px\">Citizens FAST is our internet banking portal. Today, tomorrow, together.</p>";
  var PRIVACY = "<p>We collect only the information needed to provide banking services and meet regulatory requirements. Your data is encrypted in transit and at rest and is never sold to third parties.</p><p style=\"margin-top:10px\">We may share information with regulators or service providers where required by law. You can contact the call centre on 16222 to ask about your data.</p>";
  var cat = "All", q = "";
  var CATS = ["All"].concat(FAQ.map(function (x) { return x[0]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
  var root = $("#hpRoot");

  root.innerHTML =
    '<section class="card hp-hero"><h2>How can we help you?</h2><p>Search our FAQs or get in touch with the team.</p><div class="dc-search">' + ic("search", 16) + '<input id="hpQ" type="search" placeholder="Search for answers, e.g. card, limit, password" autocomplete="off" aria-label="Search FAQs"></div><div class="dc-chips" id="hpChips" role="group" aria-label="FAQ category"></div></section>' +
    '<div class="hp-grid"><section><div class="page-head"><h2 style="font-size:18px">Frequently asked questions</h2><span class="muted" id="hpCount"></span></div><div class="card hp-faq" id="faq"></div></section>' +
    '<aside class="hp-side"><div class="hp-contacts" id="contact">' +
      '<a class="card hp-cc" href="find-czb.html"><span class="dc-ic">' + ic("mapPin", 20) + "</span><div><b>Branch &amp; Booth Locator</b><small>Find a branch, sub-branch or office near you</small></div>" + ic("chevR", 18) + "</a>" +
      '<a class="card hp-cc" href="complain.html"><span class="dc-ic">' + ic("message", 20) + "</span><div><b>Complain</b><small>Raise an issue with our support team</small></div>" + ic("chevR", 18) + "</a>" +
      '<a class="card hp-cc hot" href="tel:16222"><span class="dc-ic">' + ic("phoneCall", 20) + "</span><div><b>16222</b><small>24/7 call centre · Make Call</small></div>" + ic("chevR", 18) + "</a></div>" +
      '<div class="card hp-link-card"><h3 class="card-title" style="margin-bottom:6px">About</h3><a href="#" data-info="about">' + ic("building", 16) + "About Citizens Bank" + ic("chevR", 16) + '</a><a href="#" data-info="privacy">' + ic("shield", 16) + "Privacy policy" + ic("chevR", 16) + '</a><a href="find-czb.html#contacts">' + ic("book", 16) + "Address book" + ic("chevR", 16) + "</a></div></aside></div>" +
    '<section class="dc-section" id="whatsnew"><div class="page-head"><div><h2>What\'s New</h2><p>News, offers and notices from Citizens Bank.</p></div></div><div class="card"><div class="nw-list" id="nwList"></div></div></section>';

  function chips() { $("#hpChips").innerHTML = CATS.map(function (c) { return '<button type="button" data-c="' + c + '" class="' + (c === cat ? "on" : "") + '">' + c + "</button>"; }).join(""); }
  function faq() {
    var s = q.toLowerCase();
    var items = FAQ.filter(function (x) { return (cat === "All" || x[0] === cat) && (!s || (x[1] + " " + x[2].replace(/<[^>]+>/g, " ")).toLowerCase().indexOf(s) > -1); });
    $("#hpCount").textContent = items.length + (items.length === 1 ? " question" : " questions");
    $("#faq").innerHTML = items.length ? items.map(function (x, i) {
      return '<div class="hp-q"><button type="button" aria-expanded="false" aria-controls="hpa' + i + '"><span>' + esc(x[1]) + "</span><small>" + x[0] + "</small>" + ic("chevR", 18) + '</button><div class="hp-a" id="hpa' + i + '" role="region"><div>' + x[2] + "</div></div></div>";
    }).join("") : '<div class="empty-state hp-none"><div class="es-ic">' + ic("search", 26) + "</div><b>No answers found</b>Try different words, or call us on 16222.</div>";
  }
  $("#nwList").innerHTML = NEWS.map(function (n) {
    return '<article class="nw-item"><div class="nw-date"><b>' + n[0] + "</b><small>" + n[1] + '</small></div><div><span class="chip info">' + n[2] + "</span><h4>" + esc(n[3]) + "</h4><p>" + esc(n[4]) + "</p></div></article>";
  }).join("");

  root.addEventListener("click", function (e) {
    var c = e.target.closest("[data-c]"); if (c) { cat = c.dataset.c; chips(); faq(); return; }
    var b = e.target.closest(".hp-q > button");
    if (b) { var o = b.parentElement.classList.toggle("open"); b.setAttribute("aria-expanded", o); return; }
    var i = e.target.closest("[data-info]");
    if (i) { e.preventDefault(); var k = i.dataset.info; cb.dialog({ title: k === "about" ? "About Citizens Bank" : "Privacy policy", html: k === "about" ? ABOUT : PRIVACY, buttons: [{ text: "Close", primary: true }] }); }
  });
  $("#hpQ").addEventListener("input", function (e) { q = e.target.value.trim(); faq(); });
  chips(); faq();
  if (location.hash) setTimeout(function () { var t = $(location.hash); if (t) t.scrollIntoView(); }, 50);
})();
