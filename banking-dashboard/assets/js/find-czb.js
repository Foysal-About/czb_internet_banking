/* Find CZB: location finder (Branch / ATM / Booth / Sub-branch) + Address Book + 24/7 call centre.
   Works inside the app shell and pre-login (body[data-shell="public"]). Dummy data only. */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc, ic = cb.icon;
  var isPublic = document.body.dataset.shell === "public";

  // ---------- public shell ----------
  if (isPublic) {
    var app = $(".app");
    if (app) app.className = "pub-app";
    var crumb = $(".crumbs");
    if (crumb) crumb.innerHTML = '<a href="login.html">Sign in</a><span>' + ic("chevR", 12) + "</span><b>Find CZB</b>";
    document.body.insertAdjacentHTML("afterbegin",
      '<header class="pub-head"><div class="pub-head-in">' +
      '<a class="pub-brand" href="login.html"><span class="brand-mark">' + cb.LOGO + '</span><span><b>Citizens Bank</b><small>Citizens FAST</small></span></a>' +
      '<nav class="pub-nav" aria-label="Public"><a href="exchange-rates.html">Exchange Rates</a><a href="help.html">Help</a><a class="btn-pri" href="login.html">Sign in</a></nav></div></header>');
  }

  // ---------- data ----------
  var TYPES = [
    { id: "branch", label: "Branch", icon: "landmark", cls: "fc-ic-branch" },
    { id: "atm", label: "ATM", icon: "card", cls: "fc-ic-atm" },
    { id: "booth", label: "Booth", icon: "smartphone", cls: "fc-ic-agent" },
    { id: "sub", label: "Sub-branch", icon: "building", cls: "fc-ic-sub" }
  ];
  // [type, name, division, address, contact, email, lat, lng]
  var RAW = [
    ["branch", "Principal Branch", "Dhaka", "Dilkusha C/A, Motijheel, Dhaka-1000", "02-9566000", "principal@czb.example", 23.7338, 90.4155],
    ["branch", "Gulshan Branch", "Dhaka", "Plot 12, Gulshan Avenue, Gulshan-1, Dhaka-1212", "02-9882145", "gulshan@czb.example", 23.7925, 90.4078],
    ["branch", "Banani Branch", "Dhaka", "House 41, Road 11, Banani, Dhaka-1213", "02-9894401", "banani@czb.example", 23.794, 90.4043],
    ["branch", "Dhanmondi Branch", "Dhaka", "Road 27, Dhanmondi R/A, Dhaka-1209", "02-9115582", "dhanmondi@czb.example", 23.7461, 90.3742],
    ["branch", "Uttara Branch", "Dhaka", "Sector 3, Rajlakshmi Complex, Uttara, Dhaka-1230", "02-8991278", "uttara@czb.example", 23.8759, 90.3795],
    ["branch", "Mirpur Branch", "Dhaka", "Section 10, Mirpur, Dhaka-1216", "02-9005533", "mirpur@czb.example", 23.8069, 90.3687],
    ["branch", "Agrabad Branch", "Chattogram", "Sheikh Mujib Road, Agrabad C/A, Chattogram", "031-2515200", "agrabad@czb.example", 22.325, 91.81],
    ["branch", "GEC Circle Branch", "Chattogram", "CRB Road, GEC Circle, Chattogram", "031-2853120", "gec@czb.example", 22.3592, 91.8218],
    ["branch", "Sylhet Branch", "Sylhet", "Zindabazar Point, Sylhet-3100", "0821-717844", "sylhet@czb.example", 24.8949, 91.8687],
    ["branch", "Rajshahi Branch", "Rajshahi", "Shaheb Bazar, Rajshahi-6000", "0721-775410", "rajshahi@czb.example", 24.3636, 88.6],
    ["branch", "Khulna Branch", "Khulna", "KDA Avenue, Sonadanga, Khulna", "041-731205", "khulna@czb.example", 22.813, 89.55],
    ["branch", "Barishal Branch", "Barishal", "Launch Ghat Road, Barishal-8200", "0431-2176640", "barishal@czb.example", 22.701, 90.3535],
    ["branch", "Rangpur Branch", "Rangpur", "Station Road, Rangpur-5400", "0521-62244", "rangpur@czb.example", 25.7468, 89.2508],
    ["branch", "Mymensingh Branch", "Mymensingh", "Ganginar Par, Mymensingh-2200", "091-66520", "mymensingh@czb.example", 24.7471, 90.4203],
    ["atm", "Gulshan-2 Circle ATM", "Dhaka", "Gulshan-2 Circle, Dhaka-1212 (24/7)", "16222", "atm@czb.example", 23.7943, 90.4143],
    ["atm", "Bashundhara City ATM", "Dhaka", "Level 2, Bashundhara City, Panthapath, Dhaka (24/7)", "16222", "atm@czb.example", 23.7512, 90.3908],
    ["atm", "Uttara Sector 7 ATM", "Dhaka", "Sector 7, Uttara, Dhaka-1230 (24/7)", "16222", "atm@czb.example", 23.8681, 90.4004],
    ["atm", "Motijheel Shapla ATM", "Dhaka", "Shapla Chattar, Motijheel, Dhaka (24/7)", "16222", "atm@czb.example", 23.7336, 90.4189],
    ["atm", "Agrabad Access Road ATM", "Chattogram", "Agrabad Access Road, Chattogram (24/7)", "16222", "atm@czb.example", 22.3302, 91.8128],
    ["atm", "Zindabazar ATM", "Sylhet", "Zindabazar, Sylhet (24/7)", "16222", "atm@czb.example", 24.8962, 91.8701],
    ["atm", "Sonadanga ATM", "Khulna", "Sonadanga Bus Terminal, Khulna (24/7)", "16222", "atm@czb.example", 22.8014, 89.5442],
    ["booth", "Dhaka University Booth", "Dhaka", "TSC, University of Dhaka, Dhaka-1000", "01711-000101", "booth.du@czb.example", 23.7317, 90.3965],
    ["booth", "Jamuna Future Park Booth", "Dhaka", "Level 4, Jamuna Future Park, Dhaka", "01711-000102", "booth.jfp@czb.example", 23.8137, 90.4247],
    ["booth", "Chattogram Port Booth", "Chattogram", "Port Connecting Road, Chattogram", "01711-000103", "booth.port@czb.example", 22.3196, 91.8287],
    ["booth", "Rajshahi University Booth", "Rajshahi", "Campus Gate, Motihar, Rajshahi", "01711-000104", "booth.ru@czb.example", 24.3734, 88.6431],
    ["booth", "Cumilla Cantonment Booth", "Chattogram", "Cantonment Road, Cumilla", "01711-000105", "booth.cml@czb.example", 23.4607, 91.1809],
    ["sub", "Narayanganj Sub-branch", "Dhaka", "Chashara, Narayanganj-1400", "02-7645120", "narayanganj@czb.example", 23.6238, 90.5],
    ["sub", "Gazipur Sub-branch", "Dhaka", "Chowrasta, Gazipur-1700", "02-9262244", "gazipur@czb.example", 23.9999, 90.4203],
    ["sub", "Bogura Sub-branch", "Rajshahi", "Sherpur Road, Bogura-5800", "051-66120", "bogura@czb.example", 24.8465, 89.3773],
    ["sub", "Jashore Sub-branch", "Khulna", "MK Road, Jashore-7400", "0421-67205", "jashore@czb.example", 23.1667, 89.2167],
    ["sub", "Habiganj Sub-branch", "Sylhet", "Court Road, Habiganj-3300", "0831-61255", "habiganj@czb.example", 24.3745, 91.4155]
  ];
  var LOCS = RAW.map(function (r, i) { return { id: "l" + i, type: r[0], name: r[1], div: r[2], addr: r[3], tel: r[4], mail: r[5], lat: r[6], lng: r[7] }; });
  var DIVS = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"];

  // Address book (locationType 3): offices & desks
  var BOOK = [
    { id: "b0", type: "ho", name: "Head Office", div: "Dhaka", addr: "Citizens Tower, Dilkusha C/A, Motijheel, Dhaka-1000", tel: "02-9566000", mail: "info@czb.example", lat: 23.7338, lng: 90.4155 },
    { id: "b1", type: "ho", name: "Card Centre", div: "Dhaka", addr: "Level 6, Gulshan Avenue, Dhaka-1212", tel: "02-9882300", mail: "cards@czb.example", lat: 23.7925, lng: 90.4078 },
    { id: "b2", type: "ho", name: "Remittance Desk", div: "Dhaka", addr: "Principal Branch, Dilkusha C/A, Dhaka-1000", tel: "02-9566044", mail: "remittance@czb.example", lat: 23.7338, lng: 90.4155 },
    { id: "b3", type: "ho", name: "SME & Retail Desk", div: "Dhaka", addr: "Banani Branch, Road 11, Banani, Dhaka-1213", tel: "02-9894420", mail: "sme@czb.example", lat: 23.794, lng: 90.4043 },
    { id: "b4", type: "ho", name: "Chattogram Regional Office", div: "Chattogram", addr: "Agrabad C/A, Chattogram", tel: "031-2515210", mail: "ctg.region@czb.example", lat: 22.325, lng: 91.81 },
    { id: "b5", type: "ho", name: "Sylhet Regional Office", div: "Sylhet", addr: "Zindabazar Point, Sylhet-3100", tel: "0821-717850", mail: "sylhet.region@czb.example", lat: 24.8949, lng: 91.8687 },
    { id: "b6", type: "ho", name: "Khulna Regional Office", div: "Khulna", addr: "KDA Avenue, Sonadanga, Khulna", tel: "041-731210", mail: "khulna.region@czb.example", lat: 22.813, lng: 89.55 },
    { id: "b7", type: "ho", name: "Rajshahi Regional Office", div: "Rajshahi", addr: "Shaheb Bazar, Rajshahi-6000", tel: "0721-775420", mail: "rajshahi.region@czb.example", lat: 24.3636, lng: 88.6 }
  ];

  var st = { type: "branch", div: "", q: "", sel: LOCS[0], bq: "" };
  var root = $("#fcRoot");

  root.innerHTML =
    '<div class="fc-head"><div class="seg" role="tablist" id="fcTypes" aria-label="Location type"></div></div>' +
    '<div class="dc-toolbar">' +
      '<div class="fld"><label for="fcQ">Search</label><div class="dc-search">' + ic("search", 16) + '<input id="fcQ" type="search" placeholder="Search by name, address or area" autocomplete="off"></div></div>' +
      '<div class="fld narrow"><label for="fcDiv">Division</label><select id="fcDiv"><option value="">All divisions</option>' + DIVS.map(function (d) { return "<option>" + d + "</option>"; }).join("") + "</select></div>" +
    "</div>" +
    '<section class="fc-panel" id="fcPanel" aria-label="Map"><div class="fc-embed" id="fcEmbed"></div><div class="fc-pop fc-detail" id="fcDetail"></div></section>' +
    '<div class="dc-count" id="fcCount" aria-live="polite"></div>' +
    '<section class="card fc-list-card"><div class="fc-list" id="fcList"></div></section>' +
    '<section class="dc-section" id="contacts"><div class="page-head"><div><h2>Contacts &amp; Address Book</h2><p>Reach the call centre any time, or find a regional office or desk.</p></div></div>' +
      '<div class="ct-grid"><div>' +
        '<div class="card ct-hero"><div class="k">24/7 call centre</div><a class="big" href="tel:16222">16222</a><p>Card block, balance enquiry and urgent support, any time of day.</p>' +
        '<div class="ct-alt">' + ic("phone", 16) + '<span>From abroad: <a href="tel:+8809666716222">+880 9666 716222</a></span></div>' +
        '<div class="ct-btns"><a class="btn-gold" href="tel:16222">Make Call</a></div></div></div>' +
      '<div class="card ct-book"><div class="dc-toolbar" style="margin-bottom:6px"><div class="fld"><label for="bkQ">Search address book</label><div class="dc-search">' + ic("search", 16) + '<input id="bkQ" type="search" placeholder="Search offices and desks" autocomplete="off"></div></div></div><div class="fc-list" id="bkList"></div></div>' +
      "</div></section>";

  function typeMeta(id) { return TYPES.filter(function (t) { return t.id === id; })[0] || { label: "Office", icon: "building", cls: "fc-ic-ho" }; }
  function match(l, q) { return !q || (l.name + " " + l.addr + " " + l.div).toLowerCase().indexOf(q) > -1; }

  function renderTypes() {
    $("#fcTypes").innerHTML = TYPES.map(function (t) {
      var n = LOCS.filter(function (l) { return l.type === t.id; }).length;
      return '<button type="button" role="tab" data-t="' + t.id + '" class="' + (st.type === t.id ? "on" : "") + '" aria-selected="' + (st.type === t.id) + '">' + ic(t.icon, 15) + t.label + ' <span class="dc-badge-n">' + n + "</span></button>";
    }).join("");
  }

  function acts(l) {
    return '<div class="dc-acts"><button type="button" class="dc-act" data-map="' + l.id + '">' + ic("mapPin", 14) + "Map</button>" +
      '<a class="dc-act" href="mailto:' + esc(l.mail) + '">' + ic("mail", 14) + "Mail</a>" +
      '<a class="dc-act" href="tel:' + esc(l.tel.replace(/[^\d+]/g, "")) + '">' + ic("phoneCall", 14) + "Call</a></div>";
  }
  function row(l, isBook) {
    var t = typeMeta(l.type), open = l.type === "atm" ? '<span class="chip fc-open">24/7</span>' : "";
    return '<div class="fc-row' + (st.sel && st.sel.id === l.id ? " on" : "") + '" data-id="' + l.id + '"><span class="dc-ic ' + t.cls + '">' + ic(t.icon, 20) + "</span>" +
      '<div class="fc-main"><b>' + esc(l.name) + "</b>" + open + "<p>" + esc(l.addr) + '</p><div class="fc-meta"><span>' + ic("phone", 13) + esc(l.tel) + "</span><span>" + ic("mail", 13) + esc(l.mail) + "</span></div></div>" +
      (isBook ? "" : '<div class="fc-div">' + esc(l.div) + "<small>Division</small></div>") + acts(l) + "</div>";
  }

  function renderList() {
    var q = st.q.toLowerCase();
    var items = LOCS.filter(function (l) { return l.type === st.type && (!st.div || l.div === st.div) && match(l, q); });
    $("#fcCount").textContent = items.length + (items.length === 1 ? " location" : " locations") + " found";
    $("#fcList").innerHTML = items.length ? items.map(function (l) { return row(l); }).join("") :
      '<div class="empty-state fc-empty"><div class="es-ic">' + ic("mapPin", 26) + "</div><b>No locations found</b>Try a different division or search term.</div>";
    if (items.length && !items.some(function (l) { return st.sel && l.id === st.sel.id; }) && !st.userPicked) { st.sel = items[0]; renderMap(); }
  }
  function renderBook() {
    var q = st.bq.toLowerCase();
    var items = BOOK.filter(function (l) { return match(l, q); });
    $("#bkList").innerHTML = items.length ? items.map(function (l) { return row(l, true); }).join("") :
      '<div class="empty-state fc-empty"><div class="es-ic">' + ic("search", 26) + "</div><b>No contacts found</b>Try a different search term.</div>";
  }

  function renderMap() {
    var l = st.sel; if (!l) return;
    var t = typeMeta(l.type), dx = 0.0055, dy = 0.0035;
    var bbox = [l.lng - dx, l.lat - dy, l.lng + dx, l.lat + dy].join(",");
    var src = "https://www.openstreetmap.org/export/embed.html?bbox=" + encodeURIComponent(bbox) + "&layer=mapnik&marker=" + l.lat + "%2C" + l.lng;
    var link = "https://www.openstreetmap.org/?mlat=" + l.lat + "&mlon=" + l.lng + "#map=16/" + l.lat + "/" + l.lng;
    var box = $("#fcEmbed");
    box.innerHTML = '<div class="fc-fallback" id="fcFb"><div><span class="dc-ic">' + ic("mapPin", 22) + "</span><b>" + esc(l.name) + "</b>" +
      (navigator.onLine === false ? "Map unavailable offline." : "Loading map…") + "<br>" + l.lat.toFixed(4) + ", " + l.lng.toFixed(4) + "</div></div>" +
      '<iframe title="Map of ' + esc(l.name) + '" loading="lazy" referrerpolicy="no-referrer" src="' + src + '"></iframe>';
    var fr = $("iframe", box), fb = $("#fcFb");
    fr.addEventListener("load", function () { fb.hidden = true; });
    setTimeout(function () { if (!fb.hidden) fb.firstChild.innerHTML = '<span class="dc-ic">' + ic("mapPin", 22) + "</span><b>" + esc(l.name) + '</b>Map could not be loaded. <a class="dc-link" target="_blank" rel="noopener" href="' + link + '">Open in OpenStreetMap</a>'; }, 7000);
    $("#fcDetail").innerHTML = '<div><div class="fc-main"><span class="dc-ic ' + t.cls + '" style="margin-bottom:12px">' + ic(t.icon, 20) + "</span><b>" + esc(l.name) + '</b> <span class="chip info">' + t.label + "</span>" +
      '<p>' + esc(l.addr) + '</p></div><div class="fc-meta"><span>' + ic("mapPin", 13) + esc(l.div) + " Division</span><span>" + ic("phone", 13) + esc(l.tel) + "</span><span>" + ic("mail", 13) + esc(l.mail) + "</span></div>" +
      '<div class="fc-coords">Lat ' + l.lat.toFixed(4) + " · Lng " + l.lng.toFixed(4) + "</div></div>" +
      '<div class="dc-acts"><a class="dc-act" target="_blank" rel="noopener" href="' + link + '">' + ic("mapPin", 14) + "Open map</a>" +
      '<a class="dc-act" href="mailto:' + esc(l.mail) + '">' + ic("mail", 14) + "Mail</a>" +
      '<a class="dc-act" href="tel:' + esc(l.tel.replace(/[^\d+]/g, "")) + '">' + ic("phoneCall", 14) + "Call</a></div>";
    $$(".fc-row.on").forEach(function (r) { r.classList.remove("on"); });
    $$('.fc-row[data-id="' + l.id + '"]').forEach(function (r) { r.classList.add("on"); });
  }

  function pick(id, scroll) {
    var l = LOCS.concat(BOOK).filter(function (x) { return x.id === id; })[0];
    if (!l) return;
    st.sel = l; st.userPicked = true; renderMap();
    if (scroll) $("#fcPanel").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  root.addEventListener("click", function (e) {
    var t = e.target.closest("[data-t]");
    if (t) { st.type = t.dataset.t; st.userPicked = false; renderTypes(); renderList(); return; }
    var m = e.target.closest("[data-map]");
    if (m) { pick(m.dataset.map, true); return; }
    var r = e.target.closest(".fc-row");
    if (r && !e.target.closest("a")) pick(r.dataset.id, false);
  });
  $("#fcQ").addEventListener("input", function (e) { st.q = e.target.value.trim(); st.userPicked = false; renderList(); });
  $("#fcDiv").addEventListener("change", function (e) { st.div = e.target.value; st.userPicked = false; renderList(); });
  $("#bkQ").addEventListener("input", function (e) { st.bq = e.target.value.trim(); renderBook(); });

  renderTypes(); renderList(); renderMap(); renderBook();
  if (location.hash === "#contacts") setTimeout(function () { $("#contacts").scrollIntoView(); }, 50);
})();
