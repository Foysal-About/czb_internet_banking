/* Calculators (spec §19): EMI, FDR (simple interest), Zakat. Client-side only. */
(function () {
  var $ = cb.$, $$ = cb.$$, ic = cb.icon;
  var C = 2 * Math.PI * 44;

  function num(s) { var v = parseFloat(String(s).replace(/,/g, "")); return isFinite(v) ? v : 0; }
  function money(n) { return cb.fmt(Math.round(n * 100) / 100); }
  function group(n, dec) { return (+n).toLocaleString("en-US", { maximumFractionDigits: dec || 0 }); }

  // slider + number field with clamp notice. cfg: id,label,pre,suf,min,max,step,dec,val
  function field(c) {
    return '<div class="ca-fld"><div class="fld"><label for="' + c.id + '">' + c.label + "</label>" +
      '<div class="ca-row"><div class="prefix-in">' + (c.pre ? "<span>" + c.pre + "</span>" : "") + '<input id="' + c.id + '" type="text" inputmode="decimal" autocomplete="off" value="' + group(c.val, c.dec) + '" aria-describedby="' + c.id + 'N">' + (c.suf ? '<span class="sfx">' + c.suf + "</span>" : "") + "</div>" +
      '<div class="ca-range"><input type="range" id="' + c.id + 'R" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.val + '" aria-label="' + c.label + ' slider"><div class="ca-scale"><span>' + group(c.min, c.dec) + "</span><span>" + group(c.max, c.dec) + "</span></div></div></div>" +
      '<div class="ca-note" id="' + c.id + 'N" role="status">' + ic("info", 14) + "<span></span></div></div></div>";
  }
  function bind(c, onChange) {
    var inp = $("#" + c.id), rng = $("#" + c.id + "R"), note = $("#" + c.id + "N");
    var val = c.val;
    function setNote(msg) { note.classList.toggle("show", !!msg); $("span", note).textContent = msg || ""; }
    function apply(raw, fromText) {
      var v = num(raw), msg = "";
      if (v > c.max) { v = c.max; msg = c.label + " can be at most " + group(c.max, c.dec) + ". Adjusted to the maximum."; }
      if (v < c.min) { v = c.min; msg = c.label + " can't be below " + group(c.min, c.dec) + ". Adjusted."; }
      if (c.dec === 0) v = Math.round(v); else v = Math.round(v * 100) / 100;
      val = v; rng.value = v; setNote(msg);
      if (!fromText || msg) inp.value = group(v, c.dec);
      onChange();
    }
    inp.addEventListener("input", function () { apply(inp.value, true); });
    inp.addEventListener("blur", function () { inp.value = group(val, c.dec); });
    rng.addEventListener("input", function () { apply(rng.value, false); });
    return function () { return val; };
  }

  function donut(p, i) {
    var t = p + i, pl = t > 0 ? C * p / t : 0, il = t > 0 ? C - pl : 0, pct = t > 0 ? Math.round(i / t * 100) : 0;
    return '<svg class="ca-donut" viewBox="0 0 120 120" role="img" aria-label="Interest is ' + pct + ' percent of total payment"><g transform="rotate(-90 60 60)"><circle class="d-bg" cx="60" cy="60" r="44"/>' +
      '<circle class="d-p" cx="60" cy="60" r="44" stroke-dasharray="' + pl + " " + (C - pl) + '"/><circle class="d-i" cx="60" cy="60" r="44" stroke-dasharray="' + il + " " + (C - il) + '" stroke-dashoffset="' + (-pl) + '"/></g>' +
      '<text x="60" y="58" text-anchor="middle">' + pct + '%</text><text class="t-s" x="60" y="72" text-anchor="middle">interest</text></svg>';
  }
  function viz(p, i, pl, il) {
    var t = p + i, pw = t > 0 ? (p / t * 100) : 0;
    return '<div class="ca-viz">' + donut(p, i) + '<div class="ca-legend"><div><i class="lg-p"></i>' + pl + "<b>" + money(p) + '</b></div><div><i class="lg-i"></i>' + il + "<b>" + money(i) + "</b></div></div></div>" +
      '<div class="ca-bar" aria-hidden="true"><i style="width:' + pw + '%;background:var(--acc-czb)"></i><i style="width:' + (t > 0 ? 100 - pw : 0) + '%;background:var(--gold)"></i></div>';
  }
  var DISC = '<p class="ca-disc">' + ic("info", 14) + "<span>Figures are indicative only and do not constitute an offer. Actual rates and charges are decided by the bank.</span></p>";

  var root = $("#caRoot");
  var zk = { silver: 26.13 }, NISAB_G = 612.36;
  root.innerHTML =
    '<section class="card ca-tabs-card" data-tabs-scope><div class="tabs" role="tablist" data-tabs>' +
      '<button type="button" data-tab="emi" class="on" aria-selected="true">EMI</button><button type="button" data-tab="fdr" aria-selected="false">FDR</button><button type="button" data-tab="zakat" aria-selected="false">Zakat</button></div>' +

    '<div data-pane="emi"><p class="ca-sub">Estimate your monthly installment for a loan.</p><div class="two-col"><div>' +
      field({ id: "emiA", label: "Loan amount", pre: "৳", min: 0, max: 100000000, step: 10000, dec: 0, val: 2500000 }) +
      field({ id: "emiT", label: "Tenure", suf: "months", min: 0, max: 360, step: 1, dec: 0, val: 60 }) +
      field({ id: "emiR", label: "Interest rate (p.a.)", suf: "%", min: 0, max: 30, step: 0.1, dec: 2, val: 9 }) +
      '</div><div class="card ca-res" aria-live="polite"><h3 class="card-title">Monthly installment</h3><div class="ca-big"><small>You pay each month</small><b id="emiM"></b><span id="emiS"></span></div><div class="ca-rows" id="emiRows"></div><div id="emiViz"></div><div class="ca-amort-t">Yearly amortization</div><div class="ca-amort"><table class="dtable"><thead><tr><th>Year</th><th class="r">Principal</th><th class="r">Interest</th><th class="r">Balance</th></tr></thead><tbody id="emiTb"></tbody></table></div>' + DISC + "</div></div></div>" +

    '<div data-pane="fdr" hidden><p class="ca-sub">Maturity value of a fixed deposit using simple interest.</p><div class="two-col"><div>' +
      field({ id: "fdA", label: "Deposit amount", pre: "৳", min: 0, max: 100000000, step: 10000, dec: 0, val: 500000 }) +
      field({ id: "fdT", label: "Tenure", suf: "months", min: 0, max: 120, step: 1, dec: 0, val: 12 }) +
      field({ id: "fdR", label: "Interest rate (p.a.)", suf: "%", min: 0, max: 15, step: 0.05, dec: 2, val: 7.25 }) +
      '</div><div class="card ca-res" aria-live="polite"><h3 class="card-title">Maturity value</h3><div class="ca-big"><small>You receive at maturity</small><b id="fdM"></b><span id="fdS"></span></div><div class="ca-rows" id="fdRows"></div><div id="fdViz"></div>' + DISC + "</div></div></div>" +

    '<div data-pane="zakat" hidden><p class="ca-sub">Zakat is 2.5% of your total zakatable wealth once it reaches the nisab.</p><div class="two-col"><div class="ca-zk">' +
      ["zkHome|Cash at home", "zkBank|Cash in bank", "zkGold|Gold (market value)", "zkSilver|Silver (market value)", "zkTrade|Trade goods"].map(function (f) {
        var p = f.split("|"); return '<div class="ca-fld"><div class="fld"><label for="' + p[0] + '">' + p[1] + '</label><div class="prefix-in"><span>৳</span><input id="' + p[0] + '" type="text" inputmode="decimal" placeholder="0" autocomplete="off"></div></div></div>';
      }).join("") +
      '<div class="ca-cfg"><div class="fld"><label for="zkPrice">Silver price per gram (configurable)</label><div class="prefix-in"><span>৳</span><input id="zkPrice" type="text" inputmode="decimal" value="26.13"><span class="sfx">/ g</span></div><span class="help">Nisab is ' + NISAB_G + ' g of silver. Update the price to the current market rate.</span></div></div>' +
      '</div><div class="card ca-res" aria-live="polite"><h3 class="card-title">Zakat payable</h3><div class="ca-big"><small>Zakat due (2.5%)</small><b id="zkM"></b><span id="zkS"></span></div><div class="ca-rows" id="zkRows"></div><div class="ca-nisab" id="zkN"></div>' + DISC + "</div></div></div></section>";

  cb.tabs($("[data-tabs]", root));

  // ---------- EMI ----------
  var emiC = [{ id: "emiA", label: "Loan amount", min: 0, max: 100000000, dec: 0, val: 2500000 }, { id: "emiT", label: "Tenure", min: 0, max: 360, dec: 0, val: 60 }, { id: "emiR", label: "Interest rate (p.a.)", min: 0, max: 30, dec: 2, val: 9 }];
  var eg = emiC.map(function (c) { return bind(c, emi); });
  function emi() {
    var P = eg[0](), n = eg[1](), rate = eg[2](), r = rate / 1200, m = 0;
    if (P > 0 && n > 0) m = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    m = Math.round(m * 100) / 100;
    var total = m * n, interest = Math.max(0, total - P);
    $("#emiM").textContent = money(m);
    $("#emiS").textContent = n ? "for " + n + " months" : "Enter tenure to calculate";
    $("#emiRows").innerHTML = '<div><span>Principal</span><b>' + money(P) + "</b></div><div><span>Total interest</span><b>" + money(interest) + "</b></div><div><span>Total payment</span><b>" + money(total) + "</b></div>";
    $("#emiViz").innerHTML = viz(P, interest, "Principal", "Interest");
    var bal = P, rows = [], y = 0, yp = 0, yi = 0;
    for (var k = 1; k <= n; k++) {
      var it = bal * r, pr = Math.min(bal, m - it); if (k === n) pr = bal;
      bal = Math.max(0, bal - pr); yp += pr; yi += it;
      if (k % 12 === 0 || k === n) { y++; rows.push("<tr><td>" + y + '</td><td class="r">' + group(yp) + '</td><td class="r">' + group(yi) + '</td><td class="r">' + group(bal) + "</td></tr>"); yp = 0; yi = 0; }
    }
    $("#emiTb").innerHTML = rows.join("") || '<tr><td colspan="4" class="muted">No schedule yet</td></tr>';
  }
  $$("#emiTb").length && emi();

  // ---------- FDR ----------
  var fdC = [{ id: "fdA", label: "Deposit amount", min: 0, max: 100000000, dec: 0, val: 500000 }, { id: "fdT", label: "Tenure", min: 0, max: 120, dec: 0, val: 12 }, { id: "fdR", label: "Interest rate (p.a.)", min: 0, max: 15, dec: 2, val: 7.25 }];
  var fg = fdC.map(function (c) { return bind(c, fdr); });
  function fdr() {
    var P = fg[0](), n = fg[1](), rate = fg[2]();
    var i = Math.round(P * rate / 100 * n / 12 * 100) / 100, t = P + i;
    $("#fdM").textContent = money(t);
    $("#fdS").textContent = n ? "after " + n + " months (" + (n / 12).toFixed(n % 12 ? 1 : 0) + " yrs)" : "Enter tenure to calculate";
    $("#fdRows").innerHTML = "<div><span>Deposit</span><b>" + money(P) + "</b></div><div><span>Interest earned</span><b>" + money(i) + "</b></div><div><span>Monthly interest (avg.)</span><b>" + money(n ? i / n : 0) + "</b></div>";
    $("#fdViz").innerHTML = viz(P, i, "Deposit", "Interest");
  }
  fdr();

  // ---------- Zakat ----------
  function zakat() {
    var ids = ["zkHome", "zkBank", "zkGold", "zkSilver", "zkTrade"];
    var total = ids.reduce(function (s, id) { return s + Math.max(0, num($("#" + id).value)); }, 0);
    zk.silver = num($("#zkPrice").value) || 0;
    var nisab = zk.silver * NISAB_G, met = total > 0 && nisab > 0 && total >= nisab, z = met ? total * 0.025 : 0;
    $("#zkM").textContent = money(z);
    $("#zkS").textContent = met ? "2.5% of " + money(total) : "Nisab not reached";
    $("#zkRows").innerHTML = "<div><span>Total wealth</span><b>" + money(total) + "</b></div><div><span>Nisab (" + NISAB_G + " g silver)</span><b>" + money(nisab) + "</b></div>";
    var n = $("#zkN");
    n.className = "ca-nisab " + (met ? "met" : "not");
    n.innerHTML = ic(met ? "check" : "info", 18) + "<div><b>" + (met ? "Nisab met" : total ? "Below nisab" : "Enter your assets") + "</b><p>" +
      (met ? "Your wealth is above the nisab, so zakat of " + money(z) + " is payable." : "Zakat is payable once your wealth reaches " + money(nisab) + ".") + "</p></div>";
  }
  ["zkHome", "zkBank", "zkGold", "zkSilver", "zkTrade", "zkPrice"].forEach(function (id) {
    var el = $("#" + id);
    el.addEventListener("input", function () { el.value = el.value.replace(/[^\d.,]/g, ""); zakat(); });
    el.addEventListener("blur", function () { var v = num(el.value); if (el.value) el.value = id === "zkPrice" ? v.toFixed(2) : group(v, 2); zakat(); });
  });
  zakat();
})();
