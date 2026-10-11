/* Deposit schemes (spec section 14): hub + DPS / FDR wizards.
   Modeled directly after the mobile app Deposit Opening experience. */
(function () {
  "use strict";

  var $ = cb.$, $$ = cb.$$, esc = cb.esc;
  var money = function (n) { return cb.fmt(Math.round(n * 100) / 100); };

  /* ---------- catalogue ---------- */
  var DPS_RATE = { 12: 6.5, 24: 7.0, 36: 7.25, 60: 7.5, 84: 7.75, 120: 8.0 };
  var DPS = [
    { id: "d1", name: "Citizens Monthly Savings DPS", sub: "Flexible term and installment", terms: [12, 24, 36, 60, 84, 120], insts: [500, 1000, 2000, 3000, 5000, 10000] },
    { id: "d2", name: "Citizens Kotipoti DPS", sub: "Term picked by you, fixed target", terms: [60, 84, 120], inst: 10000 },
    { id: "d3", name: "Citizens Millionaire DPS", sub: "Fixed 10-year millionaire plan", terms: [120], inst: 5500 }
  ];
  var FDR = [
    { id: "f1", name: "Citizens FDR 1 Year", sub: "7.25% p.a.", years: 1, rate: 7.25, min: 50000, max: 5000000 },
    { id: "f2", name: "Citizens FDR 2 Year", sub: "7.75% p.a.", years: 2, rate: 7.75, min: 50000, max: 5000000 },
    { id: "f3", name: "Citizens FDR 3 Year", sub: "8.25% p.a.", years: 3, rate: 8.25, min: 100000, max: 10000000 }
  ];
  var CFG = {
    dps: {
      title: "Deposit Opening",
      cardTitle: "Savings Details",
      cardSub: "Savings Account Information",
      icon: "calCheck",
      how: "Deposit Opening Steps",
      steps: [
        "Select your <b>Source Account</b> and <b>Branch Name</b>.",
        "Choose your <b>Bank Product</b> and <b>Term (Month)</b>.",
        "Verify <b>Interest Rate</b>, <b>Deposit Amount</b> and <b>Installment</b>.",
        "Review <b>New Account Details</b> and confirm with OTP."
      ]
    },
    fdr: {
      title: "Fixed Deposit Opening",
      cardTitle: "Fixed Deposit Details",
      cardSub: "FDR Account Information",
      icon: "lockOpen",
      how: "Open an FDR",
      steps: [
        "Select your <b>Source Account</b> and <b>Branch Name</b>.",
        "Pick a <b>product</b> and term.",
        "Enter the <b>principal</b>, choose <b>auto renew</b> and confirm with OTP."
      ]
    }
  };

  /* ---------- hub ---------- */
  var dep = (CB_DATA.accounts || []).filter(function (a) { return a.kind === "DPS" || a.kind === "FDR"; });
  function depCard(a) {
    var isF = a.kind === "FDR";
    return '<a class="dep-card' + (isF ? " is-fdr" : "") + '" href="accounts.html#' + a.id + '" aria-label="' + esc(a.product) + '">' +
      '<div class="dc-top"><span class="dc-ic">' + cb.icon(isF ? "lockOpen" : "calCheck", 20) + '</span><div class="dc-name"><b>' + esc(a.product) + "</b><span>" + esc(a.no) + '</span></div><span class="dc-badge">' + a.kind + "</span></div>" +
      '<div class="dc-bal"><span>' + (isF ? "Principal" : "Deposited so far") + "</span><b>" + cb.fmt(a.balance) + "</b></div>" +
      '<div class="dc-grid"><div><span>Holder</span><b>' + esc(CB_DATA.user.fullName) + '</b></div><div><span>Status</span><b class="dc-status">' + esc(a.status) + "</b></div><div><span>Profit rate</span><b>" + esc(a.rate || "—") + "</b></div><div><span>Maturity date</span><b>" + esc(a.maturity || "—") + "</b></div></div></a>";
  }
  function newTile(k, label, ic) { return '<a class="dep-new" href="#' + k + '" data-go="' + k + '"><span class="es-ic">' + cb.icon(ic, 22) + "</span><b>" + label + "</b></a>"; }
  var track = $("#depTrack");
  track.innerHTML = (dep.length ? dep.map(depCard).join("") : '<div class="card empty-state" style="flex:1"><div class="es-ic">' + cb.icon("piggy", 26) + "</div><b>No deposit accounts yet</b><p>Open a DPS or FDR below to start saving.</p></div>") + newTile("dps", "New DPS", "calCheck") + newTile("fdr", "New FDR", "lockOpen");
  $("#depPrev").onclick = function () { track.scrollBy({ left: -360, behavior: "smooth" }); };
  $("#depNext").onclick = function () { track.scrollBy({ left: 360, behavior: "smooth" }); };

  /* ---------- wizard ---------- */
  var kind = null, V = {}, F = [], preview = null;
  function today() { return new Date(); }
  function addMonths(d, n) { var x = new Date(d.getTime()); x.setMonth(x.getMonth() + n); return x; }

  function fieldDefs() {
    var common = [
      { k: "src", label: "Source Account", build: buildSrc, filled: function () { return !!V.src; } },
      { k: "branch", label: "Account Opening Branch Name", build: buildBranch, filled: function () { return !!V.branch; } },
      { k: "prod", label: "Bank Product", build: buildProd, filled: function () { return !!V.prod; } }
    ];
    if (kind === "dps") return [
      { k: "src", label: "Source Account", build: buildSrc, filled: function () { return !!V.src; } },
      { k: "branch", label: "Account Opening Branch Name", build: buildBranch, filled: function () { return !!V.branch; } },
      { k: "prod", label: "Bank Product", build: buildProd, filled: function () { return !!V.prod; } },
      { k: "term", label: "Term (Month)", build: buildTermDps, filled: function () { return !!V.term; } },
      { k: "rate", label: "Interest Rate", build: buildRateDps, filled: function () { return !!V.rate; } },
      { k: "depAmt", label: "Deposit Amount", build: buildDepAmtDps, filled: function () { return V.depAmt > 0; } },
      { k: "inst", label: "Installment Amount", build: buildInstDps, filled: function () { return V.inst > 0; } }
    ];
    return common.concat([
      { k: "term", label: "Term Year", ro: true, build: buildTermFdr, filled: function () { return !!V.term; } },
      { k: "amt", label: "Principal Amount", build: buildPrincipal, filled: function () { return V.amt > 0; } },
      { k: "renew", label: "Auto Renew", build: buildRenew, filled: function () { return !!V.renew; } }
    ]);
  }

  function srcAcc() {
    return (CB_DATA.accounts || []).filter(function (a) { return a.id === V.src; })[0];
  }
  function prodObj() {
    return (kind === "dps" ? DPS : FDR).filter(function (p) { return p.id === V.prod; })[0];
  }
  function ctl(k) { return $('[data-k="' + k + '"] .ctl'); }
  function setErr(k, m) { var f = $('[data-k="' + k + '"]'); if (!f) return; $(".ferr", f).textContent = m || ""; f.classList.toggle("invalid", !!m); }

  function buildSrc(el) {
    var accs = cb.accountItems(5);
    var crds = (CB_DATA.cards || []).filter(function (c) { return c.status === "Active"; }).map(function (c) {
      return { value: c.id, title: c.title, sub: c.no + " · " + c.network, right: c.available ? cb.fmt(c.available) : "", rightLabel: "Available", icon: "card", color: "var(--card-grad)", data: c };
    });
    var items = accs.concat(crds);
    cb.select(el, {
      placeholder: "Select Account or card",
      items: items,
      onChange: function (it) {
        V.src = it.value;
        refresh("src");
        var bal = it.data && (it.data.balance !== undefined ? it.data.balance : it.data.available);
        if (bal !== undefined) {
          var h = $('[data-k="src"] .lbl-r');
          if (h) h.innerHTML = "Available: <b>" + cb.fmt(bal) + "</b>";
        }
      }
    });
  }

  function buildBranch(el) {
    cb.select(el, {
      placeholder: "Select Branch...",
      items: (CB_DATA.czbBranches || []).map(function (b) {
        return { value: b, title: b, icon: "mapPin", color: "var(--card-grad)" };
      }),
      onChange: function (it) {
        V.branch = it.value;
        refresh("branch");
      }
    });
  }

  function buildProd(el) {
    var list = kind === "dps" ? DPS : FDR;
    cb.select(el, {
      placeholder: "Select Product Type...",
      search: false,
      items: list.map(function (p) {
        return { value: p.id, title: p.name, sub: p.sub, icon: kind === "dps" ? "calCheck" : "lockOpen", color: "var(--card-grad)" };
      }),
      onChange: function (it) {
        V.prod = it.value;
        refresh("prod");
      }
    });
  }

  function fixedInput(el, text) {
    el.innerHTML = '<input class="dp-fixed" readonly value="' + esc(text) + '" aria-readonly="true">';
  }

  function buildTermDps(el) {
    var p = prodObj();
    if (!p) { el.innerHTML = ""; return; }
    var terms = p.terms || (p.term ? [p.term] : [12, 24, 36, 60, 84, 120]);
    cb.select(el, {
      placeholder: "00",
      search: false,
      items: terms.map(function (n) {
        var r = DPS_RATE[n] || 8.0;
        return { value: n, title: String(n).padStart(2, "0") + " (" + n + " Months)", sub: (n / 12) + (n === 12 ? " Year" : " Years") + " · " + r.toFixed(2) + "% p.a." };
      }),
      onChange: function (it) {
        V.term = Number(it.value);
        var r = DPS_RATE[V.term] || 8.0;
        V.rate = r.toFixed(2) + "% p.a.";
        if (V.inst) {
          V.depAmt = V.inst * V.term;
        }
        refresh("term");
      }
    });
  }

  function buildRateDps(el) {
    var rateVal = V.rate || (V.term && DPS_RATE[V.term] ? DPS_RATE[V.term].toFixed(2) + "% p.a." : "");
    if (rateVal) V.rate = rateVal;
    el.innerHTML = '<input id="dpsRateIn" type="text" placeholder="Enter Interest Rate Type" value="' + (rateVal ? esc(rateVal) : "") + '">';
    var inp = $("input", el);
    inp.addEventListener("input", function () {
      V.rate = this.value.trim();
      paintFields();
    });
  }

  function buildDepAmtDps(el) {
    var val = V.depAmt ? String(V.depAmt) : "";
    el.innerHTML = '<div class="amount-in"><span>৳</span><input id="dpsDepAmtIn" inputmode="decimal" placeholder="Enter Deposit Amount" value="' + (val ? Number(val).toLocaleString() : "") + '"></div>' +
      '<div class="chips"><button type="button" data-damt="50000">৳50,000</button><button type="button" data-damt="100000">৳100,000</button><button type="button" data-damt="500000">৳500,000</button><button type="button" data-damt="1000000">৳1,000,000</button></div>';
    var inp = $("input", el);
    inp.addEventListener("input", function () {
      var n = parseFloat(this.value.replace(/[^0-9.]/g, "")) || 0;
      V.depAmt = n;
      if (V.term && n > 0) {
        var instCalc = Math.round(n / V.term);
        var instIn = $("#dpsInstIn");
        if (instIn && !instIn.matches(":focus")) {
          V.inst = instCalc;
          instIn.value = instCalc.toLocaleString();
        }
      }
      paintFields();
    });
    $$(".chips button", el).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var n = Number(btn.dataset.damt);
        V.depAmt = n;
        inp.value = n.toLocaleString();
        if (V.term) {
          var instCalc = Math.round(n / V.term);
          var instIn = $("#dpsInstIn");
          if (instIn) {
            V.inst = instCalc;
            instIn.value = instCalc.toLocaleString();
          }
        }
        paintFields();
      });
    });
  }

  function buildInstDps(el) {
    var p = prodObj();
    var val = V.inst ? String(V.inst) : (p && p.inst ? String(p.inst) : "");
    if (val && !V.inst) V.inst = Number(val);
    el.innerHTML = '<div class="amount-in"><span>৳</span><input id="dpsInstIn" inputmode="decimal" placeholder="Enter Installment Amount" value="' + (val ? Number(val).toLocaleString() : "") + '"></div>' +
      '<div class="chips"><button type="button" data-iamt="500">৳500</button><button type="button" data-iamt="1000">৳1,000</button><button type="button" data-iamt="2000">৳2,000</button><button type="button" data-iamt="5000">৳5,000</button><button type="button" data-iamt="10000">৳10,000</button></div>';
    var inp = $("input", el);
    inp.addEventListener("input", function () {
      var n = parseFloat(this.value.replace(/[^0-9.]/g, "")) || 0;
      V.inst = n;
      if (V.term && n > 0) {
        var depCalc = n * V.term;
        V.depAmt = depCalc;
        var depIn = $("#dpsDepAmtIn");
        if (depIn && !depIn.matches(":focus")) {
          depIn.value = depCalc.toLocaleString();
        }
      }
      paintFields();
    });
    $$(".chips button", el).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var n = Number(btn.dataset.iamt);
        V.inst = n;
        inp.value = n.toLocaleString();
        if (V.term) {
          var depCalc = n * V.term;
          V.depAmt = depCalc;
          var depIn = $("#dpsDepAmtIn");
          if (depIn) depIn.value = depCalc.toLocaleString();
        }
        paintFields();
      });
    });
  }

  function buildTermFdr(el) { var p = prodObj(); if (!p) { el.innerHTML = ""; return; } V.term = p.years; fixedInput(el, p.years + (p.years === 1 ? " year" : " years")); }
  function buildPrincipal(el) {
    var p = prodObj(); el.innerHTML = '<div class="amount-in"><span>৳</span><input inputmode="decimal" autocomplete="off" placeholder="0.00" aria-label="Principal amount in taka"></div><div class="words"></div><div class="chips"></div>';
    var a = cb.amount($(".amount-in", el), { chips: p ? [p.min, p.min * 2, p.min * 5, p.min * 10].filter(function (x) { return x <= p.max; }) : [] });
    $(".amount-in", el).addEventListener("amount", function (e) { V.amt = e.detail / 100; setErr("amt", ""); paintFields(); });
    if (p) $('[data-k="amt"] .lbl-r').innerHTML = "Min " + cb.fmt(p.min) + " · Max " + cb.fmt(p.max);
    el._amt = a;
  }
  function buildRenew(el) {
    el.innerHTML = '<div class="opt-grid">' +
      [["principal", "Principal Amount", "Renew the principal; profit is paid to your account."], ["matured", "Principal + Interest Amount", "Renew principal and profit together."]].map(function (o) {
        return '<label class="opt"><input type="radio" name="renew" value="' + o[0] + '"><span class="opt-box"><span class="opt-t"><b>' + o[1] + "</b><small>" + o[2] + '</small></span><span class="radio"></span></span></label>';
      }).join("") + "</div>";
    $$("input", el).forEach(function (r) { r.addEventListener("change", function () { V.renew = r.value; refresh("renew"); }); });
  }

  function paintFields(from) {
    F.forEach(function (f, i) {
      var box = $('[data-k="' + f.k + '"]');
      if (!box) return;
      var prevOk = F.slice(0, i).every(function (g) { return g.filled(); });
      box.classList.toggle("locked", !prevOk);
      box.classList.toggle("filled", f.filled());
    });
    var all = F.every(function (f) { return f.filled(); });
    $("#wzContinue").disabled = !all;
  }

  function refresh(k) {
    var idx = F.map(function (f) { return f.k; }).indexOf(k);
    F.slice(idx + 1).forEach(function (f) {
      delete V[f.k];
      var l = $('[data-k="' + f.k + '"] .lbl-r');
      if (l) l.textContent = "";
      setErr(f.k, "");
      f.build(ctl(f.k));
    });
    paintFields();
  }

  function open(k) {
    kind = k; V = {}; preview = null;
    var c = CFG[k];
    $("#wzIc").innerHTML = cb.icon(c.icon, 22);
    $("#wzTitle").textContent = c.cardTitle || c.title;
    $("#wzSub").textContent = c.cardSub || c.sub;

    var crumb = $("#depCrumb"), h1 = $("#depH1");
    if (crumb) crumb.textContent = c.title;
    if (h1) h1.textContent = c.title;

    $("#howT").textContent = c.how;
    $("#howL").innerHTML = c.steps.map(function (s) { return "<li><span>" + s + "</span></li>"; }).join("");
    F = fieldDefs();
    $("#wzFields").innerHTML = F.map(function (f, i) {
      return '<div class="fld locked" data-k="' + f.k + '"><label><span class="fld-step">' + (i + 1) + "</span>" + f.label + (f.ro ? '<span class="ro-tag">Read only</span>' : "") + '<span class="lbl-r"></span></label><div class="ctl"></div><span class="lock-hint">Complete previous field to continue</span><span class="ferr"></span></div>';
    }).join("");
    F.forEach(function (f) { f.build(ctl(f.k)); });
    $("#wzForm").hidden = false; $("#wzPreview").hidden = true; $("#wzDone").hidden = true; $(".rv-head").hidden = false;
    paintFields();
  }

  /* ---------- calculations ---------- */
  function calc() {
    var p = prodObj(), now = today();
    if (kind === "dps") {
      var n = V.term, r = parseFloat(V.rate) || DPS_RATE[n] || 8.0, base = V.inst * n, interest = V.inst * n * (n + 1) / 2 * r / 1200;
      return { rate: r, base: base, maturity: base + interest, date: addMonths(now, n) };
    }
    var rate = p.rate, m = V.amt * Math.pow(1 + rate / 400, 4 * V.term);
    return { rate: rate, maturity: m, date: addMonths(now, V.term * 12) };
  }

  function showPreview() {
    var a = srcAcc(), p = prodObj(), ok = true;
    if (kind === "dps" && a && a.balance && V.inst > a.balance) {
      setErr("inst", "The installment is more than available balance of " + cb.fmt(a.balance) + ".");
      ok = false;
    }
    if (kind === "fdr") {
      if (V.amt < p.min) { setErr("amt", "Minimum principal is " + cb.fmt(p.min) + "."); ok = false; }
      else if (V.amt > p.max) { setErr("amt", "Maximum principal is " + cb.fmt(p.max) + "."); ok = false; }
      else if (a && a.balance && V.amt > a.balance) { setErr("amt", "Principal is more than available balance of " + cb.fmt(a.balance) + "."); ok = false; }
    }
    if (!ok) return;
    var c = calc(); preview = c;
    var rows = kind === "dps" ? [
      ["Product Name", p.name],
      ["Source Account", a ? cb.mask(a.no) : "Selected Source Account"],
      ["Account Opening Branch Name", V.branch],
      ["Term (Month)", V.term + " Months (" + (V.term / 12) + (V.term === 12 ? " Year" : " Years") + ")"],
      ["Interest Rate", V.rate || (c.rate.toFixed(2) + "% p.a.")],
      ["Deposit Amount", money(V.depAmt)],
      ["Installment Amount", money(V.inst) + " / Month"],
      ["Maturity Date", cb.date(c.date)],
      ["Estimated Principal + Interest Amount", money(c.maturity), true]
    ] : [
      ["Product Name", p.name],
      ["Source Account", a ? cb.mask(a.no) : "Selected Source Account"],
      ["Account Opening Branch Name", V.branch],
      ["Tenure", V.term + (V.term === 1 ? " year" : " years")],
      ["Principal Amount", money(V.amt)],
      ["Auto Renew", V.renew === "matured" ? "Principal + Interest Amount" : "Principal Amount"],
      ["Maturity Date", cb.date(c.date)],
      ["Estimated Principal + Interest Amount", money(c.maturity), true],
      ["Profit Rate", c.rate.toFixed(2) + "% p.a.", true]
    ];
    $("#wzKv").innerHTML = rows.map(function (r) { return "<div" + (r[2] ? ' class="total"' : "") + "><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
    $("#wzForm").hidden = true; $("#wzPreview").hidden = false;
    $("#wzTitle").textContent = "New Account Details"; $("#wzSub").textContent = "Check details before opening the account";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToForm() {
    $("#wzPreview").hidden = true; $("#wzForm").hidden = false;
    var c = CFG[kind];
    $("#wzTitle").textContent = c.cardTitle || c.title;
    $("#wzSub").textContent = c.cardSub || c.sub;
  }

  function openAccount() {
    var a = srcAcc(), p = prodObj(), c = preview, amount = kind === "dps" ? V.inst : V.amt;
    cb.otp({ message: "Verify to open your " + kind.toUpperCase() + " account", onSuccess: function () {
      var no = "00" + String(Math.floor(Math.random() * 1e11)).padStart(11, "0");
      $("#wzPreview").hidden = true; $(".rv-head").hidden = true; var d = $("#wzDone"); d.hidden = false;
      d.innerHTML = '<div class="success dp-done"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
        "<h2>" + kind.toUpperCase() + " account opened</h2><p>" + esc(p.name) + " is now active.</p>" +
        '<div class="new-acc"><span>New account number</span><b>' + no + "</b></div>" +
        '<dl class="kv"><div><dt>' + (kind === "dps" ? "Monthly installment" : "Principal") + "</dt><dd>" + money(amount) + "</dd></div><div><dt>Profit rate</dt><dd>" + c.rate.toFixed(2) + "% p.a.</dd></div><div><dt>Maturity date</dt><dd>" + cb.date(c.date) + '</dd></div><div class="total"><dt>Principal + Interest amount</dt><dd>' + money(c.maturity) + "</dd></div></dl>" +
        '<div class="ft-actions"><a class="btn-sec" href="accounts.html">View accounts</a><a class="btn-pri" href="deposits.html" data-go="">Back to deposits</a></div></div>';
      window.scrollTo({ top: 0, behavior: "smooth" });
    } });
  }

  $("#wzContinue").onclick = showPreview;
  $("#wzOpen").onclick = openAccount;
  $("#wzCancel").onclick = backToForm;
  $("#wzBack").onclick = function () { go(""); };

  /* ---------- routing ---------- */
  function route() {
    var h = location.hash.replace("#", "");
    var wiz = h === "dps" || h === "fdr";
    $("#vHub").hidden = wiz; $("#vWiz").hidden = !wiz;
    var crumb = $("#depCrumb"), h1 = $("#depH1");
    if (!wiz) {
      if (crumb) crumb.textContent = "Deposit Schemes";
      if (h1) h1.textContent = "Deposit Schemes";
    }
    if (wiz) open(h);
    window.scrollTo(0, 0);
  }
  function go(k) { if (k) location.hash = k; else { history.pushState(null, "", location.pathname); route(); } }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-go]"); if (!a) return;
    if (a.dataset.go === "") { e.preventDefault(); go(""); }
  });
  window.addEventListener("hashchange", route);
  route();
})();
