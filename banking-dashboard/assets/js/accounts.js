/* My Accounts (spec §8.1): lists all accounts grouped by type, tap to view details. */
(function () {
  var $ = cb.$, $$ = cb.$$, D = window.CB_DATA, U = D.user;

  var list = $("#maList"), detail = $("#maDetail");
  var groups = $("#maGroups"), hero = $("#maHero"), grid = $("#maGrid"), tabs = $("#maTabs"), panes = $("#maPanes");
  var crumbs = $("#maCrumbs"), h1 = $("#maH1");

  var currentFilter = "all";

  // Balance masking & timer state
  var revealTimer = null, revealedBtn = null;
  function mask(btn) {
    if (!btn) return;
    btn.classList.remove("on", "loading");
    var amtSpan = btn.querySelector(".mac-bal-amt");
    var tapSpan = btn.querySelector("span.tap");
    if (amtSpan) amtSpan.textContent = "৳ • • • • • •";
    if (tapSpan) tapSpan.innerHTML = cb.icon("eye", 14) + (btn.dataset.tapLbl || "Tap for balance");
  }

  var ICON = { DP01: "landmark", DP02: "lockOpen", DP03: "calCheck", LN01: "piggy" };
  var FILTERS = [["all", "All"], ["DP01", "Savings & Current"], ["DP03", "DPS"], ["DP02", "FDR"], ["LN01", "Loans"]];
  function balLabelOf(a) { return a.productType === "LN01" ? "Outstanding" : a.productType === "DP02" ? "Principal" : a.productType === "DP03" ? "Total deposited" : "Available balance"; }
  function toDate(s) { return new Date(String(s).replace(/-/g, " ")); }
  function pctOf(n) { return Math.max(0, Math.min(100, Math.round(n))); }
  // progress line for term products: [label, value, percent]
  function progressOf(a) {
    if (a.productType === "DP03") return ["Installments paid", a.paid + " / " + (a.paid + a.due), pctOf(a.paid / (a.paid + a.due) * 100)];
    if (a.productType === "DP02") { var o = toDate(a.opened), m = toDate(a.maturity); return ["Matures " + a.maturity, a.rate + " p.a.", pctOf((Date.now() - o) / (m - o) * 100)]; }
    if (a.productType === "LN01") return ["Repaid of " + cb.fmt(a.limit), pctOf((a.limit - a.balance) / a.limit * 100) + "%", pctOf((a.limit - a.balance) / a.limit * 100)];
    return null;
  }
  function balBtn(amount, tapLbl) {
    return '<button type="button" class="mac-bal-btn" data-bal="' + amount + '" data-tap-lbl="' + tapLbl + '">' +
      '<span class="mac-bal-amt">৳ • • • • • •</span><span class="tap">' + cb.icon("eye", 14) + tapLbl + "</span></button>";
  }
  function spaced(no) { return String(no).replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 "); }

  function renderList() {
    list.hidden = false; detail.hidden = true;
    if (crumbs) crumbs.innerHTML = '<a href="index.html">Dashboard</a><span data-icon="chevR" data-size="12"></span><span>Accounts</span><span data-icon="chevR" data-size="12"></span><b>My Accounts</b>';
    if (h1) h1.textContent = "My Accounts";
    $$("[data-icon]", crumbs).forEach(function (el) { el.innerHTML = cb.icon(el.dataset.icon, +el.dataset.size || 18); });

    var deposits = 0, loans = 0;
    D.accounts.forEach(function (a) { if (a.productType === "LN01") loans += a.balance; else deposits += a.balance; });
    var count = function (t) { return D.accounts.filter(function (a) { return t === "all" || a.productType === t; }).length; };

    var html = '<section class="ma-summary">' +
        '<div class="ms-tile ms-main"><span class="ms-lbl">Total deposits</span>' + balBtn(deposits, "Show") + "</div>" +
        '<div class="ms-tile"><span class="ms-lbl">Loan outstanding</span>' + balBtn(loans, "Show") + "</div>" +
        '<div class="ms-tile"><span class="ms-lbl">Accounts</span><b class="ms-num">' + D.accounts.length + "</b><small>" + FILTERS.slice(1).filter(function (f) { return count(f[0]); }).length + " product types</small></div>" +
      "</section>" +
      '<div class="ma-toolbar"><div class="seg ma-filters" role="tablist">' + FILTERS.filter(function (f) { return count(f[0]); }).map(function (f) {
        return '<button type="button" role="tab" data-f="' + f[0] + '" class="' + (currentFilter === f[0] ? "on" : "") + '">' + f[1] + "<i>" + count(f[0]) + "</i></button>";
      }).join("") + "</div>" +
      '<div class="st-actions"><a class="btn-sec btn-sm" href="statement.html">' + cb.icon("sheet", 15) + 'Statement</a><a class="btn-sec btn-sm" href="limits.html">' + cb.icon("gauge", 15) + "Limits</a></div></div>" +
      '<div class="ma-cards-grid">';

    D.accounts.filter(function (a) { return currentFilter === "all" || a.productType === currentFilter; }).forEach(function (a) {
      var isDebit = a.types && a.types.indexOf(5) > -1, pr = progressOf(a);
      html += '<article class="ma-card t-' + a.productType + '" data-id="' + a.id + '">' +
        '<div class="mac-head"><span class="mac-ic">' + cb.icon(ICON[a.productType], 20) + "</span>" +
          '<div class="mac-title"><b>' + a.product + "</b><span>" + a.kind + " · " + a.branch + "</span></div>" +
          '<span class="chip ' + (a.status === "Active" ? "ok" : "info") + '">' + a.status + "</span></div>" +
        '<div class="mac-no"><span class="num">•••• ' + String(a.no).slice(-4) + '</span><button type="button" class="mac-copy" data-copy="' + a.no + '" data-copy-msg="Account number copied" aria-label="Copy account number">' + cb.icon("copy", 13) + "</button></div>" +
        '<div class="mac-bal"><span class="mac-bal-lbl">' + balLabelOf(a) + "</span>" + balBtn(a.balance, "Tap for balance") + "</div>" +
        (pr ? '<div class="mac-prog"><div class="row"><span>' + pr[0] + "</span><b>" + pr[1] + '</b></div><div class="bar"><i style="width:' + pr[2] + '%"></i></div></div>' : "") +
        '<div class="mac-foot"><div class="mac-tools">' +
          '<button type="button" class="icon-only btn-share-acc" title="Share account details" aria-label="Share account details" data-id="' + a.id + '">' + cb.icon("share", 15) + "</button>" +
          '<a class="icon-only" href="statement.html" title="Statement" aria-label="Statement">' + cb.icon("sheet", 15) + "</a>" +
          (isDebit ? '<a class="icon-only" href="fund-transfer.html" title="Transfer" aria-label="Transfer">' + cb.icon("send", 15) + "</a>" : "") +
        '</div><a class="mac-more" href="#' + a.id + '">Details' + cb.icon("chevR", 15) + "</a></div>" +
      "</article>";
    });

    groups.innerHTML = html + "</div>";
  }

  // Handle tap for balance and filter tabs
  document.addEventListener("click", function (e) {
    // Filter click
    var fBtn = e.target.closest(".ma-filters button");
    if (fBtn) {
      currentFilter = fBtn.dataset.f;
      renderList();
      return;
    }

    // Tap for balance
    var b = e.target.closest(".mac-bal-btn");
    if (b) {
      if (b.classList.contains("on")) {
        mask(b);
        revealedBtn = null;
        return;
      }
      mask(revealedBtn);
      clearTimeout(revealTimer);
      revealedBtn = b;

      b.classList.add("loading");
      var tapSpan = b.querySelector("span.tap");
      if (tapSpan) tapSpan.textContent = "Loading…";

      setTimeout(function () {
        if (revealedBtn !== b) return;
        b.classList.remove("loading");
        b.classList.add("on");
        var amtSpan = b.querySelector(".mac-bal-amt");
        if (amtSpan) amtSpan.textContent = cb.fmt(+b.dataset.bal);
        if (tapSpan) tapSpan.innerHTML = cb.icon("eyeOff", 14) + (b.dataset.tapLbl === "Show" ? "4s" : "Hides in 4s");
        revealTimer = setTimeout(function () {
          mask(b);
          revealedBtn = null;
        }, 4000);
      }, 500);
      return;
    }

    // Card body opens details
    var card = e.target.closest(".ma-card");
    if (card && !e.target.closest("button, a")) { location.hash = card.dataset.id; return; }

    // Share button
    var sBtn = e.target.closest(".btn-share-acc");
    if (sBtn) {
      var a = D.accounts.filter(function (x) { return x.id === sBtn.dataset.id; })[0];
      if (a) shareAccount(a);
    }
  });

  function shareAccount(a) {
    var rows = [
      ["Account Number", a.no],
      ["Account Name", U.fullName.toUpperCase()],
      ["Product Name", a.product],
      ["Bank Name", "CITIZENS BANK PLC"],
      ["Branch Name", a.branch + " Branch"],
      ["Branch ID", a.branchId]
    ];
    var text = rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n");

    cb.dialog({
      title: "Share Account Details",
      icon: "share",
      tone: "brand",
      size: "sm",
      html: '<dl class="kv" style="text-align:left">' +
        rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd class="num">' + r[1] + '</dd></div>'; }).join("") +
      '</dl>' +
      '<div class="alert-bar warn" style="margin-top:14px">' +
        cb.icon("alert", 16) +
        '<span>Share these details only with trusted payees. Citizens Bank will never ask for your password, TPIN or OTP.</span>' +
      '</div>',
      buttons: [
        {
          text: cb.icon("copy", 16) + " Copy",
          onClick: function () {
            try { navigator.clipboard.writeText(text); } catch (e) {}
            cb.toast("Account details copied to clipboard", "success");
            return false;
          }
        },
        {
          text: cb.icon("share", 16) + " Share",
          primary: true,
          onClick: function () {
            if (navigator.share) {
              navigator.share({ title: "My Citizens Bank Account", text: text }).catch(function () {});
            } else {
              try { navigator.clipboard.writeText(text); } catch (e) {}
              cb.toast("Copied — paste it to share", "success");
            }
          }
        }
      ]
    });
  }

  // ---------- Render Detail View (§8.1) ----------
  function renderDetail(id) {
    var a = D.accounts.filter(function (x) { return x.id === id; })[0];
    if (!a) {
      location.hash = "";
      return renderList();
    }

    list.hidden = true;
    detail.hidden = false;

    if (crumbs) {
      crumbs.innerHTML = '<a href="index.html">Dashboard</a><span data-icon="chevR" data-size="12"></span><a href="accounts.html">My Accounts</a><span data-icon="chevR" data-size="12"></span><b>' + a.product + '</b>';
    }
    if (h1) h1.textContent = a.product;
    $$("[data-icon]", crumbs).forEach(function (el) { el.innerHTML = cb.icon(el.dataset.icon, +el.dataset.size || 18); });

    var balLabel = a.productType === "LN01" ? "Current Outstanding" : a.productType === "DP02" ? "Principal Amount" : a.productType === "DP03" ? "Total Deposited" : "Available Balance";
    var isDebit = a.types && a.types.indexOf(5) > -1;

    // 1. Hero: balance + account number on the left, product-specific figures on the right
    var pr = progressOf(a), stats;
    if (a.productType === "DP01") stats = [["Current balance", cb.fmt(a.current)], ["Hold", cb.fmt(a.hold)], ["Lien", cb.fmt(a.lien)], ["Minimum balance", cb.fmt(a.minBal)]];
    else if (a.productType === "DP03") stats = [["Monthly installment", cb.fmt(a.installment)], ["Next payment", a.next], ["Rate", a.rate + " p.a."], ["Overdue", cb.fmt(a.overdue)]];
    else if (a.productType === "DP02") stats = [["Rate", a.rate + " p.a."], ["Opened", a.opened], ["Maturity", a.maturity], ["Tenure", "12 months"]];
    else stats = [["Monthly EMI", cb.fmt(a.installmentAmt)], ["Next due", a.nextDue], ["Rate", a.rate + " p.a."], ["Sanctioned", cb.fmt(a.limit)]];

    hero.innerHTML = '<div class="mh-main">' +
        '<div class="mh-head"><span class="mh-ic">' + cb.icon(ICON[a.productType], 20) + '</span><div><b>' + a.product + "</b><span>" + a.kind + " · " + a.branch + " Branch (" + a.branchId + ")</span></div>" +
          '<span class="mh-chip">' + a.status + "</span></div>" +
        '<div class="mh-lbl">' + balLabelOf(a) + "</div>" +
        '<div class="mh-bal num">' + cb.fmt(a.balance) + "</div>" +
        '<div class="mh-no"><span class="num">' + spaced(a.no) + '</span><button type="button" data-copy="' + a.no + '" data-copy-msg="Account number copied" aria-label="Copy account number">' + cb.icon("copy", 14) + "</button></div>" +
        '<div class="mh-actions">' +
          (isDebit ? '<a href="fund-transfer.html" class="mh-btn">' + cb.icon("send", 16) + "Transfer</a>" : "") +
          '<a href="statement.html" class="mh-btn">' + cb.icon("sheet", 16) + "Statement</a>" +
          '<button type="button" class="mh-btn" id="maHeroShare">' + cb.icon("share", 16) + "Share</button>" +
        "</div>" +
      "</div>" +
      '<div class="mh-side">' +
        stats.map(function (r) { return '<div class="mh-stat"><span>' + r[0] + '</span><b class="num">' + r[1] + "</b></div>"; }).join("") +
        (pr ? '<div class="mh-prog"><div class="row"><span>' + pr[0] + "</span><b>" + pr[1] + '</b></div><div class="bar"><i style="width:' + pr[2] + '%"></i></div></div>' : "") +
      "</div>";

    $("#maHeroShare").addEventListener("click", function () {
      shareAccount(a);
    });

    // 2. Account details: compact list, skipping what the hero already shows
    var gridRows = [
      ["Account holder", U.fullName.toUpperCase()],
      ["Account kind", a.kind],
      ["Branch", a.branch + " Branch"],
      ["Branch ID", a.branchId],
      ["Opening date", a.opened],
      ["Customer ID", U.customerId],
      ["Status", '<span class="chip ' + (a.status === "Active" ? "ok" : "info") + '">' + a.status + "</span>"]
    ];

    grid.innerHTML = gridRows.map(function (r) {
      return "<div><dt>" + r[0] + '</dt><dd class="' + (/ID|date/.test(r[0]) ? "num" : "") + '">' + r[1] + "</dd></div>";
    }).join("");

    // 3. Product-Specific Tabs (§8.1)
    renderProductTabs(a);
  }

  function renderProductTabs(a) {
    if (a.productType === "DP01") {
      // Savings & Current: Tabs: Mini Statement · Balance · Cheque
      tabs.innerHTML = '<button class="on" data-tab="mini">Mini Statement</button>' +
        '<button data-tab="bal">Balance Details</button>' +
        '<button data-tab="chq">Cheque Books</button>';

      var miniHtml = '<div data-pane="mini">' +
        '<div class="table-wrap"><table class="dtable">' +
          '<thead><tr><th>Date</th><th>Narration</th><th>Ref ID</th><th class="r">Amount</th></tr></thead>' +
          '<tbody>' +
            D.tx.slice(0, 8).map(function (t) {
              return '<tr><td class="num">' + t.date + '</td><td><b>' + cb.esc(t.narration) + '</b></td><td class="num muted">' + t.ref + '</td><td class="r num ' + (t.amount > 0 ? 'amt-cr' : 'amt-dr') + '"><b>' + (t.amount > 0 ? '+' : '−') + cb.fmt(Math.abs(t.amount)) + '</b></td></tr>';
            }).join("") +
          '</tbody>' +
        '</table></div>' +
        '<div style="text-align:center;margin-top:16px"><a href="statement.html" class="btn-link">View Full Date-Wise Statement ' + cb.icon("arrowR", 14) + '</a></div>' +
      '</div>';

      var balHtml = '<div data-pane="bal" hidden>' +
        '<div class="table-wrap"><table class="dtable">' +
          '<tbody>' +
            '<tr><td><b>Available Balance</b><br><small class="muted">Funds immediately available for withdrawals & transfers</small></td><td class="r num" style="font-size:16px;font-weight:700;color:var(--brand-ink)">' + cb.fmt(a.balance) + '</td></tr>' +
            '<tr><td><b>Current Ledger Balance</b><br><small class="muted">Book balance including Uncleared and Lien funds</small></td><td class="r num"><b>' + cb.fmt(a.current) + '</b></td></tr>' +
            '<tr><td><b>Hold Amount</b><br><small class="muted">Transactions currently pending clearance</small></td><td class="r num"><b>' + cb.fmt(a.hold) + '</b></td></tr>' +
            '<tr><td><b>Lien Amount</b><br><small class="muted">Security deposits pledged against facilities</small></td><td class="r num"><b>' + cb.fmt(a.lien) + '</b></td></tr>' +
            '<tr><td><b>Minimum Required Balance</b><br><small class="muted">Threshold required to avoid maintenance fees</small></td><td class="r num"><b>' + cb.fmt(a.minBal) + '</b></td></tr>' +
          '</tbody>' +
        '</table></div>' +
      '</div>';

      var chqHtml = '<div data-pane="chq" hidden>' +
        '<div class="table-wrap"><table class="dtable">' +
          '<thead><tr><th>Cheque Book Series</th><th>Issue Date</th><th>Total Leaves</th><th>Used Leaves</th><th>Status</th></tr></thead>' +
          '<tbody>' +
            '<tr><td class="num"><b>#0012034 (4819001 – 4819025)</b></td><td class="num">15-Jan-2026</td><td>25</td><td>3</td><td><span class="chip ok">Active</span></td></tr>' +
            '<tr><td class="num"><b>#0012019 (3914001 – 3914010)</b></td><td class="num">04-May-2025</td><td>10</td><td>10</td><td><span class="chip">Exhausted</span></td></tr>' +
          '</tbody>' +
        '</table></div>' +
        '<div style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end">' +
          '<a href="cheque-order.html" class="btn-pri btn-sm">' + cb.icon("plus", 14) + 'Order New Cheque Book</a>' +
          '<a href="cheque-stop.html" class="btn-sec btn-sm">' + cb.icon("ban", 14) + 'Stop Cheque</a>' +
        '</div>' +
      '</div>';

      panes.innerHTML = miniHtml + balHtml + chqHtml;

    } else if (a.productType === "DP03" || a.productType === "DP02") {
      // DPS / FDR: Tabs: Account Info · Balance · Mini Statement
      var isDps = a.productType === "DP03";

      tabs.innerHTML = '<button class="on" data-tab="info">Scheme Details</button>' +
        '<button data-tab="bal">Balance Details</button>' +
        '<button data-tab="mini">Transactions</button>';

      var infoHtml = '<div data-pane="info">' +
        '<dl class="kv-grid">' +
          (isDps ?
            '<div><dt>Monthly Installment</dt><dd>' + cb.fmt(a.installment) + '</dd></div>' +
            '<div><dt>Installments Paid</dt><dd class="num">' + a.paid + ' Months</dd></div>' +
            '<div><dt>Remaining Due</dt><dd class="num">' + a.due + ' Months</dd></div>' +
            '<div><dt>Overdue Amount</dt><dd class="num">' + cb.fmt(a.overdue) + '</dd></div>' +
            '<div><dt>Next Payment Date</dt><dd class="num" style="color:var(--primary)">' + a.next + '</dd></div>'
            :
            '<div><dt>Principal Amount</dt><dd>' + cb.fmt(a.balance) + '</dd></div>' +
            '<div><dt>Tenure</dt><dd>12 Months (1 Year)</dd></div>' +
            '<div><dt>Auto Renewal</dt><dd>Principal + Interest</dd></div>'
          ) +
          '<div><dt>Profit / Interest Rate</dt><dd>' + a.rate + ' p.a.</dd></div>' +
          '<div><dt>Maturity Date</dt><dd class="num">' + a.maturity + '</dd></div>' +
          '<div><dt>Opening Date</dt><dd class="num">' + a.opened + '</dd></div>' +
        '</dl>' +
      '</div>';

      var balHtml = '<div data-pane="bal" hidden>' +
        '<div class="table-wrap"><table class="dtable">' +
          '<tbody>' +
            '<tr><td><b>' + (isDps ? 'Total Accumulated Deposits' : 'Principal Deposited') + '</b></td><td class="r num" style="font-size:16px;font-weight:700">' + cb.fmt(a.balance) + '</td></tr>' +
            '<tr><td><b>Accrued Profit (Estimated)</b></td><td class="r num amt-cr"><b>+' + cb.fmt(Math.round(a.balance * 0.07)) + '</b></td></tr>' +
            '<tr><td><b>Lien / Hold Amount</b></td><td class="r num"><b>৳0.00</b></td></tr>' +
          '</tbody>' +
        '</table></div>' +
      '</div>';

      var miniHtml = '<div data-pane="mini" hidden>' +
        '<div class="table-wrap"><table class="dtable">' +
          '<thead><tr><th>Date</th><th>Description</th><th>Ref</th><th class="r">Amount</th></tr></thead>' +
          '<tbody>' +
            '<tr><td class="num">15-Sep-2026</td><td>Monthly Installment Auto Debit</td><td class="num muted">DPS260915</td><td class="r num amt-cr"><b>+' + cb.fmt(a.installment || 200) + '</b></td></tr>' +
            '<tr><td class="num">15-Aug-2026</td><td>Monthly Installment Auto Debit</td><td class="num muted">DPS260815</td><td class="r num amt-cr"><b>+' + cb.fmt(a.installment || 200) + '</b></td></tr>' +
            '<tr><td class="num">15-Jul-2026</td><td>Monthly Installment Auto Debit</td><td class="num muted">DPS260715</td><td class="r num amt-cr"><b>+' + cb.fmt(a.installment || 200) + '</b></td></tr>' +
          '</tbody>' +
        '</table></div>' +
      '</div>';

      panes.innerHTML = infoHtml + balHtml + miniHtml;

    } else if (a.productType === "LN01") {
      // Loan: Tabs: Repayment Schedule · Balance · Account Info
      tabs.innerHTML = '<button class="on" data-tab="repay">Repayment Schedule</button>' +
        '<button data-tab="bal">Balance Details</button>' +
        '<button data-tab="info">Loan Information</button>';

      var repayHtml = '<div data-pane="repay">' +
        '<dl class="kv-grid" style="margin-bottom:16px">' +
          '<div><dt>Monthly EMI Amount</dt><dd style="color:var(--brand-ink)">' + cb.fmt(a.installmentAmt) + '</dd></div>' +
          '<div><dt>Next Due Date</dt><dd class="num" style="color:var(--danger)">' + a.nextDue + '</dd></div>' +
          '<div><dt>Remaining Repayment Tenure</dt><dd class="num">14 Years (168 EMIs)</dd></div>' +
          '<div><dt>Overdue Amount</dt><dd class="num">৳0.00 (Regular)</dd></div>' +
        '</dl>' +
        '<div style="display:flex;gap:12px;justify-content:flex-end">' +
          '<a href="fund-transfer.html" class="btn-pri btn-sm">' + cb.icon("send", 14) + 'Pay EMI Online</a>' +
        '</div>' +
      '</div>';

      var balHtml = '<div data-pane="bal" hidden>' +
        '<div class="table-wrap"><table class="dtable">' +
          '<tbody>' +
            '<tr><td><b>Current Outstanding Balance</b></td><td class="r num" style="font-size:16px;font-weight:700;color:var(--danger)">' + cb.fmt(a.balance) + '</td></tr>' +
            '<tr><td><b>Sanctioned Loan Limit</b></td><td class="r num"><b>' + cb.fmt(a.limit) + '</b></td></tr>' +
            '<tr><td><b>Available Limit</b></td><td class="r num"><b>' + cb.fmt(a.limit - a.balance) + '</b></td></tr>' +
            '<tr><td><b>Interest Rate</b></td><td class="r num"><b>' + a.rate + ' p.a.</b></td></tr>' +
          '</tbody>' +
        '</table></div>' +
      '</div>';

      var infoHtml = '<div data-pane="info" hidden>' +
        '<dl class="kv-grid">' +
          '<div><dt>Classification Status</dt><dd><span class="chip ok">Regular / Standard</span></dd></div>' +
          '<div><dt>Effective Year</dt><dd class="num">2023</dd></div>' +
          '<div><dt>Facility Expiry Date</dt><dd class="num">01-Jun-2048</dd></div>' +
          '<div><dt>Sanction Branch</dt><dd>Dhanmondi Branch (078)</dd></div>' +
        '</dl>' +
      '</div>';

      panes.innerHTML = repayHtml + balHtml + infoHtml;
    }

    // Initialize tabs switching
    cb.tabs(tabs, function (activeTab) {
      var allPanes = panes.querySelectorAll("[data-pane]");
      allPanes.forEach(function (p) {
        p.hidden = p.dataset.pane !== activeTab;
      });
    });
  }

  function route() {
    var hash = location.hash.slice(1);
    if (hash) {
      renderDetail(hash);
    } else {
      renderList();
    }
  }

  window.addEventListener("hashchange", route);
  route();
})();
