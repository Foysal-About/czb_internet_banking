/* Exchange rates: table with buy/sell, 7-day sparkline, converter. Dummy data. */
(function () {
  var $ = cb.$, esc = cb.esc, ic = cb.icon;
  // [code, flag text, name, buy (TT/BC), sell (TT/OD), 7-day mid-rate series, prev mid]
  var R = [
    ["USD", "US", "US Dollar", 121.60, 122.40, [121.5, 121.7, 121.8, 121.9, 122.0, 122.0, 122.0]],
    ["EUR", "EU", "Euro", 130.85, 132.10, [133.2, 132.9, 132.4, 132.0, 131.8, 131.6, 131.5]],
    ["GBP", "GB", "British Pound", 153.40, 154.90, [152.6, 153.0, 153.4, 153.6, 153.9, 154.0, 154.1]],
    ["SAR", "SA", "Saudi Riyal", 32.20, 32.75, [32.4, 32.4, 32.5, 32.5, 32.5, 32.5, 32.5]],
    ["AED", "AE", "UAE Dirham", 32.90, 33.40, [33.1, 33.1, 33.1, 33.2, 33.2, 33.1, 33.1]],
    ["KWD", "KW", "Kuwaiti Dinar", 393.50, 399.00, [394.0, 394.8, 395.2, 396.0, 396.3, 396.1, 396.2]],
    ["SGD", "SG", "Singapore Dollar", 90.10, 91.20, [90.9, 90.8, 90.7, 90.6, 90.6, 90.6, 90.6]],
    ["MYR", "MY", "Malaysian Ringgit", 26.40, 27.00, [26.5, 26.6, 26.7, 26.7, 26.7, 26.7, 26.7]],
    ["AUD", "AU", "Australian Dollar", 79.30, 80.30, [80.4, 80.2, 80.0, 79.9, 79.8, 79.8, 79.8]],
    ["CAD", "CA", "Canadian Dollar", 88.00, 89.10, [88.2, 88.4, 88.5, 88.5, 88.6, 88.6, 88.6]],
    ["JPY", "JP", "Japanese Yen", 0.81, 0.83, [0.82, 0.82, 0.82, 0.82, 0.82, 0.82, 0.82]],
    ["INR", "IN", "Indian Rupee", 1.42, 1.48, [1.44, 1.45, 1.45, 1.45, 1.46, 1.45, 1.45]],
    ["CNY", "CN", "Chinese Yuan", 16.70, 17.10, [16.8, 16.9, 16.9, 16.9, 16.9, 16.9, 16.9]],
    ["CHF", "CH", "Swiss Franc", 137.60, 139.30, [138.9, 138.7, 138.5, 138.4, 138.4, 138.4, 138.5]]
  ];
  var BASE = { code: "BDT", name: "Bangladeshi Taka", buy: 1, sell: 1 };
  var now = new Date();
  var root = $("#fxRoot");

  function spark(s) {
    var mn = Math.min.apply(null, s), mx = Math.max.apply(null, s), rg = mx - mn || 1;
    var pts = s.map(function (v, i) { return (i * 80 / (s.length - 1) + 2).toFixed(1) + "," + (24 - (v - mn) / rg * 20 + 2).toFixed(1); }).join(" ");
    var up = s[s.length - 1] >= s[0];
    return '<svg class="fx-spark ' + (up ? "up" : "dn") + '" viewBox="0 0 84 28" role="img" aria-label="7-day trend ' + (up ? "up" : "down") + '"><polyline points="' + pts + '"/></svg>';
  }
  function f(n) { return n < 10 ? n.toFixed(2) : n.toFixed(2); }

  var opts = '<option value="BDT">BDT · Bangladeshi Taka</option>' + R.map(function (r) { return '<option value="' + r[0] + '">' + r[0] + " · " + esc(r[2]) + "</option>"; }).join("");
  root.innerHTML =
    '<div class="page-head"><div class="fx-meta">' + ic("clock", 14) + '<span>Last updated <b id="fxUpd"></b></span><button class="btn-ghost btn-sm" type="button" id="fxRef">' + ic("refresh", 14) + " Refresh</button></div></div>" +
    '<div class="two-col"><section class="card"><div class="card-head"><h3 class="card-title">Today\'s rates (BDT)</h3><div class="dc-search" style="width:min(220px,100%)">' + ic("search", 16) + '<input id="fxQ" type="search" placeholder="Search currency" aria-label="Search currency" style="width:100%;border:1px solid var(--border);border-radius:var(--r-10);padding:9px 12px 9px 38px;background:var(--surface);color:var(--text);font:400 13.5px var(--font)"></div></div>' +
    '<div class="fx-wrap"><table class="dtable fx-table"><thead><tr><th>Currency</th><th class="r">Buy<small>We buy</small></th><th class="r">Sell<small>We sell</small></th><th>7-day</th><th class="r">Change</th></tr></thead><tbody id="fxBody"></tbody></table></div>' +
    '<p class="fx-note">Rates are indicative and subject to change without notice. Visit a branch for the final transaction rate.</p></section>' +
    '<section class="card fx-conv"><h3 class="card-title">Currency converter</h3>' +
    '<div class="fld" style="margin-top:14px"><label for="fxAmt">Amount</label><input id="fxAmt" type="text" inputmode="decimal" value="100"></div>' +
    '<div class="fx-pair"><div class="fld"><label for="fxFrom">From</label><select id="fxFrom">' + opts + '</select></div><button type="button" class="fx-swap" id="fxSwap" aria-label="Swap currencies">' + ic("arrowLR", 18) + '</button><div class="fld"><label for="fxTo">To</label><select id="fxTo">' + opts + "</select></div></div>" +
    '<div class="fx-out" aria-live="polite"><small id="fxOutL"></small><b id="fxOutV"></b><span id="fxOutR"></span></div></section></div>';

  function stamp() { $("#fxUpd").textContent = cb.dt(now); }
  function body() {
    var q = $("#fxQ").value.trim().toLowerCase();
    var rows = R.filter(function (r) { return !q || (r[0] + " " + r[2]).toLowerCase().indexOf(q) > -1; });
    $("#fxBody").innerHTML = rows.length ? rows.map(function (r) {
      var s = r[5], ch = (s[s.length - 1] - s[0]) / s[0] * 100, up = ch >= 0;
      return '<tr><td><div class="fx-cur"><span class="fx-flag" aria-hidden="true">' + r[1] + "</span><div><b>" + r[0] + "</b><small>" + esc(r[2]) + '</small></div></div></td><td class="r fx-hl">' + f(r[3]) + '</td><td class="r fx-hl">' + f(r[4]) + "</td><td>" + spark(s) + '</td><td class="r"><span class="fx-chg ' + (up ? "up" : "dn") + '">' + (up ? "+" : "") + ch.toFixed(2) + "%</span></td></tr>";
    }).join("") : '<tr><td colspan="5"><div class="empty-state"><b>No currency found</b>Try a different search term.</div></td></tr>';
  }
  function find(c) { return c === "BDT" ? BASE : (function () { var r = R.filter(function (x) { return x[0] === c; })[0]; return { code: r[0], name: r[2], buy: r[3], sell: r[4] }; })(); }
  function convert() {
    var amt = parseFloat($("#fxAmt").value.replace(/,/g, "")) || 0, a = $("#fxFrom").value, b = $("#fxTo").value;
    var A = find(a), B = find(b), bdt, out, rate;
    if (a === b) { out = amt; rate = 1; }
    else {
      bdt = amt * A.buy;           // customer sells A to bank
      rate = A.buy / B.sell;       // customer buys B from bank
      out = bdt / B.sell;
    }
    $("#fxOutL").textContent = amt.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + a + " =";
    $("#fxOutV").textContent = out.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + b;
    $("#fxOutR").textContent = "1 " + a + " = " + rate.toLocaleString("en-US", { maximumFractionDigits: 4 }) + " " + b + " (indicative)";
  }
  $("#fxFrom").value = "USD"; $("#fxTo").value = "BDT";
  $("#fxQ").addEventListener("input", body);
  $("#fxAmt").addEventListener("input", convert);
  $("#fxFrom").addEventListener("change", convert);
  $("#fxTo").addEventListener("change", convert);
  $("#fxSwap").addEventListener("click", function () { var a = $("#fxFrom").value; $("#fxFrom").value = $("#fxTo").value; $("#fxTo").value = a; convert(); });
  $("#fxRef").addEventListener("click", function () { now = new Date(); stamp(); cb.toast("Rates are up to date.", "success"); });
  stamp(); body(); convert();
})();
