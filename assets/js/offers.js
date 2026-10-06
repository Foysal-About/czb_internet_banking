/* Offers: cardholder benefit offers + lifestyle brand grid (#lifestyle) with category chips and search. */
(function () {
  var $ = cb.$, esc = cb.esc, ic = cb.icon;
  // [company, category, discount headline, detail, address, contact, web, valid]
  var OFFERS = [
    ["Aarong", "Fashion", "15% off", "On all apparel with Citizens cards", "Aarong, Gulshan-1, Dhaka", "09613-800100", "aarong.example", "31-Dec-2026"],
    ["Yellow", "Fashion", "20% off", "On selected seasonal collections", "Bashundhara City, Panthapath, Dhaka", "09678-100200", "yellow.example", "30-Nov-2026"],
    ["Pizza Hut", "Food", "Buy 1 get 1", "On large pizzas, dine-in only", "Banani 11, Dhaka", "16688", "pizzahut.example", "31-Dec-2026"],
    ["Sultan's Dine", "Food", "12% off", "On total bill, all outlets", "Dhanmondi 27, Dhaka", "09666-777000", "sultansdine.example", "15-Dec-2026"],
    ["US-Bangla Airlines", "Tour & Travels", "10% off", "On domestic base fare", "Airport Road, Kawlar, Dhaka", "13605", "usbangla.example", "31-Dec-2026"],
    ["Novotel Dhaka", "Tour & Travels", "25% off stay", "On weekend room bookings", "Gulshan Avenue, Dhaka", "02-5881-0000", "novotel.example", "31-Oct-2026"],
    ["Daraz", "E-Commerce", "৳300 off", "On orders above ৳3,000", "Online", "16312", "daraz.example", "15-Nov-2026"],
    ["Chaldal", "E-Commerce", "Free delivery", "On first 3 orders each month", "Online", "16710", "chaldal.example", "31-Dec-2026"],
    ["Apollo Hospitals", "Health", "15% off", "On diagnostic tests", "Bashundhara R/A, Dhaka", "10678", "apollo.example", "31-Dec-2026"],
    ["Bata", "Fashion", "10% off", "On footwear, all outlets", "Multiple outlets nationwide", "16225", "bata.example", "30-Nov-2026"]
  ];
  var CATS = ["All", "Fashion", "Tour & Travels", "Food", "E-Commerce"];
  var BRANDS = [["Aarong", "Fashion", "15% off"], ["Yellow", "Fashion", "20% off"], ["Bata", "Fashion", "10% off"], ["Ecstasy", "Fashion", "12% off"],
    ["US-Bangla", "Tour & Travels", "10% off"], ["Novotel", "Tour & Travels", "25% off stay"], ["Sea Pearl Resort", "Tour & Travels", "18% off"], ["Biman", "Tour & Travels", "5% off"],
    ["Pizza Hut", "Food", "Buy 1 get 1"], ["Sultan's Dine", "Food", "12% off"], ["Kacchi Bhai", "Food", "10% off"], ["Pizza Burg", "Food", "15% off"],
    ["Daraz", "E-Commerce", "৳300 off"], ["Chaldal", "E-Commerce", "Free delivery"], ["Pickaboo", "E-Commerce", "8% off"], ["Rokomari", "E-Commerce", "15% off"]];
  var q = "", cat = "All";
  var root = $("#ofRoot");

  function logo(name, i) { return '<span class="dc-logo">' + cb.brandLogo(name) + "</span>"; }

  root.innerHTML =
    '<section class="card of-hero"><span class="of-gift">' + ic("gift", 32) + '</span><div><h2>Benefits for Citizens cardholders</h2><p>Exclusive discounts across fashion, dining, travel and shopping. Show your Citizens card or pay with the app.</p></div>' +
    '<div class="of-stats"><div><b id="ofN">' + OFFERS.length + '</b><small>Active offers</small></div><div><b>' + BRANDS.length + '</b><small>Lifestyle partners</small></div></div></section>' +
    '<div class="dc-toolbar"><div class="fld"><label for="ofQ">Search offers and brands</label><div class="dc-search">' + ic("search", 16) + '<input id="ofQ" type="search" placeholder="Search by company, offer or category" autocomplete="off"></div></div></div>' +
    '<section class="dc-section" style="margin-top:8px" id="benefits"><div class="page-head"><h2>Benefit offers</h2><span class="muted" id="ofCount"></span></div><div class="grid-auto" id="ofGrid"></div></section>' +
    '<section class="dc-section" id="lifestyle"><div class="page-head"><div><h2>Lifestyle</h2><p>Browse partner brands by category.</p></div></div>' +
    '<div class="dc-chips" id="lsChips" role="group" aria-label="Category"></div><div class="of-brands" id="lsGrid"></div></section>';

  function offerCard(o, i) {
    return '<article class="card of-card"><div class="of-top">' + logo(o[0], i) + "<div><b>" + esc(o[0]) + "</b><small>" + esc(o[1]) + '</small></div></div>' +
      '<div class="of-deal"><b>' + esc(o[2]) + "</b><small>" + esc(o[3]) + "</small></div>" +
      '<ul class="of-info"><li>' + ic("mapPin", 14) + "<span>" + esc(o[4]) + "</span></li><li>" + ic("phoneCall", 14) + '<a href="tel:' + esc(o[5].replace(/[^\d+]/g, "")) + '">' + esc(o[5]) + "</a></li><li>" + ic("share", 14) + "<span>" + esc(o[6]) + "</span></li></ul>" +
      '<div class="of-foot"><span class="of-valid">Valid till ' + esc(o[7]) + '</span><a class="dc-act" href="tel:' + esc(o[5].replace(/[^\d+]/g, "")) + '">' + ic("phoneCall", 14) + "Call</a></div></article>";
  }
  function empty(t) { return '<div class="empty-state card dc-empty"><div class="es-ic">' + ic("search", 26) + "</div><b>" + t + "</b>Try a different search term.</div>"; }

  function render() {
    var s = q.toLowerCase();
    var of = OFFERS.map(function (o, i) { return { o: o, i: i }; }).filter(function (x) { return !s || x.o.slice(0, 5).join(" ").toLowerCase().indexOf(s) > -1; });
    $("#ofCount").textContent = of.length + (of.length === 1 ? " offer" : " offers");
    $("#ofGrid").innerHTML = of.length ? of.map(function (x) { return offerCard(x.o, x.i); }).join("") : empty("No offers found");

    $("#lsChips").innerHTML = CATS.map(function (c) {
      var n = BRANDS.filter(function (b) { return (c === "All" || b[1] === c) && (!s || (b[0] + " " + b[1]).toLowerCase().indexOf(s) > -1); }).length;
      return '<button type="button" data-c="' + esc(c) + '" class="' + (cat === c ? "on" : "") + '">' + c + " <small>" + n + "</small></button>";
    }).join("");
    var br = BRANDS.map(function (b, i) { return { b: b, i: i }; }).filter(function (x) { return (cat === "All" || x.b[1] === cat) && (!s || (x.b[0] + " " + x.b[1]).toLowerCase().indexOf(s) > -1); });
    $("#lsGrid").innerHTML = br.length ? br.map(function (x) {
      return '<button type="button" class="of-brand" data-b="' + x.i + '">' + logo(x.b[0], x.i) + "<b>" + esc(x.b[0]) + "</b><small>" + esc(x.b[1]) + '</small><span class="of-tag">' + esc(x.b[2]) + "</span></button>";
    }).join("") : empty("No brands found");
  }

  root.addEventListener("click", function (e) {
    var c = e.target.closest("[data-c]"); if (c) { cat = c.dataset.c; render(); return; }
    var b = e.target.closest("[data-b]");
    if (b) {
      var x = BRANDS[+b.dataset.b];
      cb.dialog({ title: esc(x[0]), html: '<div class="of-deal" style="text-align:left"><b>' + esc(x[2]) + "</b><small>" + esc(x[1]) + ' offer for Citizens cardholders</small></div><p style="margin-top:12px;font-size:13px;color:var(--muted)">Show your Citizens debit or credit card at the outlet or pay online with your card to enjoy this offer. Terms and conditions apply.</p>', buttons: [{ text: "Got it", primary: true }] });
    }
  });
  $("#ofQ").addEventListener("input", function (e) { q = e.target.value.trim(); render(); });
  render();
  if (location.hash === "#lifestyle") setTimeout(function () { $("#lifestyle").scrollIntoView(); }, 50);
})();
