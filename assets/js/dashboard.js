/* Dashboard (spec §7): account cards with tap-for-balance + share, customisable shortcut grid,
   mini statement, lifestyle & offers, ads. The account in view becomes the default account. */
(function () {
  var $ = cb.$, $$ = cb.$$, D = window.CB_DATA, U = D.user;

  // ---------- greeting ----------
  var h = new Date().getHours();
  $("#greet").textContent = (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening") + ", " + U.fullName.split(" ").pop();
  $("#greetSub").textContent = "Last login " + U.lastLogin;

  // ---------- account cards ----------
  var ACTIONS = {
    DP01: [["send", "Transfer", "fund-transfer.html"], ["sheet", "Statement", "statement.html"], ["phone", "Recharge", "recharge.html"], ["zap", "Pay bills", "bill-pay.html"]],
    DP03: [["calCheck", "Pay installment", "fund-transfer.html#czb"], ["sheet", "Statement", "statement.html"], ["info", "Details", "accounts.html#"]],
    DP02: [["fileText", "Certificate", "#soon"], ["sheet", "Statement", "statement.html"], ["info", "Details", "accounts.html#"]],
    LN01: [["send", "Pay EMI", "fund-transfer.html#czb"], ["calCheck", "Repayment", "accounts.html#"], ["info", "Details", "accounts.html#"]]
  };
  var LABEL = { DP01: "Available balance", DP02: "Principal", DP03: "Total deposited", LN01: "Current outstanding" };
  var track = $("#cardTrack");
  track.innerHTML = D.accounts.map(function (a) {
    var acts = ACTIONS[a.productType].map(function (x) {
      var href = x[2] === "accounts.html#" ? "accounts.html#" + a.id : x[2];
      return href === "#soon" ? '<button type="button" class="ac-action" data-soon="' + x[1] + '">' + cb.icon(x[0], 16) + '<span>' + x[1] + '</span></button>'
        : '<a class="ac-action" href="' + href + '">' + cb.icon(x[0], 16) + '<span>' + x[1] + '</span></a>';
    }).join("");
    return '<article class="acard" data-id="' + a.id + '" data-name="' + a.product + '">' +
      '<div class="ac-head">' +
        '<div class="ac-brand">' +
          '<span class="ac-ic">' + cb.icon({ DP01: "landmark", DP02: "lockOpen", DP03: "calCheck", LN01: "piggy" }[a.productType], 20) + '</span>' +
          '<div class="ac-title"><b>' + a.product + '</b><span>' + a.kind + ' · ' + a.branch + ' Branch</span></div>' +
        '</div>' +
        '<div class="ac-tools">' +
          '<button class="ac-share" type="button" aria-label="Share account details" title="Share account details">' + cb.icon("share", 15) + '<span>Share</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="ac-body">' +
        '<div class="ac-bal-group">' +
          '<div class="ac-label">' + LABEL[a.productType] + '</div>' +
          '<button type="button" class="ac-bal" aria-live="polite" data-bal="' + a.balance + '">' +
            '<span class="ac-mask">৳ ••••••</span>' +
            '<span class="ac-tap">' + cb.icon("eye", 14) + '<span>Tap for balance</span></span>' +
          '</button>' +
        '</div>' +
        '<div class="ac-meta">' +
          '<div class="ac-meta-item">' +
            '<span class="ac-meta-lbl">Account Number</span>' +
            '<div class="ac-no-wrap">' +
              '<span class="ac-no num">' + cb.maskLong(a.no) + '</span>' +
              '<button type="button" class="ac-copy-btn" data-copy="' + a.no + '" data-copy-msg="Account number copied" title="Copy account number" aria-label="Copy account number">' + cb.icon("copy", 13) + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="ac-meta-item">' +
            '<span class="ac-meta-lbl">Account Holder</span>' +
            '<b class="ac-holder-val">' + U.fullName.toUpperCase() + '</b>' +
          '</div>' +
          '<div class="ac-meta-item">' +
            '<span class="ac-meta-lbl">Status</span>' +
            '<span class="ac-status-badge"><i class="status-dot"></i>' + a.status + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ac-actions">' + acts + '</div>' +
      '</article>';
  }).join("");

  // tap for balance: Loading… → balance, re-mask after 4 s, one card at a time
  var revealTimer, revealed = null;
  function mask(btn) {
    if (!btn) return;
    btn.classList.remove("on", "loading");
    $(".ac-mask", btn).textContent = "৳ ••••••";
    $(".ac-tap", btn).innerHTML = cb.icon("eye", 14) + "<span>Tap for balance</span>";
  }
  track.addEventListener("click", function (e) {
    var b = e.target.closest(".ac-bal");
    if (b) {
      if (b.classList.contains("on")) { mask(b); revealed = null; return; }
      mask(revealed); clearTimeout(revealTimer); revealed = b;
      b.classList.add("loading"); $(".ac-tap", b).innerHTML = '<span>Loading…</span>';
      setTimeout(function () {
        if (revealed !== b) return;
        b.classList.remove("loading"); b.classList.add("on");
        $(".ac-mask", b).textContent = cb.fmt(+b.dataset.bal);
        $(".ac-tap", b).innerHTML = cb.icon("eyeOff", 14) + "<span>Hides in 4s</span>";
        revealTimer = setTimeout(function () { mask(b); revealed = null; }, 4000);
      }, 500);
      return;
    }
    var s = e.target.closest(".ac-share");
    if (s) share(D.accounts.filter(function (a) { return a.id === s.closest(".acard").dataset.id; })[0]);
  });
  function share(a) {
    var rows = [["Account Number", a.no], ["Account Name", U.fullName.toUpperCase()], ["Product Name", a.product], ["Bank Name", "CITIZENS BANK PLC"], ["Branch Name", a.branch + " Branch"], ["Branch ID", a.branchId]];
    var text = rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n");
    cb.dialog({ title: "Share account details", icon: "share", tone: "brand", size: "sm",
      html: '<dl class="share-kv">' + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + '</dl><div class="alert-bar warn">' + cb.icon("alert", 16) + "<span>Share these details only with people you trust. Citizens Bank will never ask for your password, TPIN or OTP.</span></div>",
      buttons: [{ text: cb.icon("copy", 16) + " Copy", onClick: function () { try { navigator.clipboard.writeText(text); } catch (e) {} cb.toast("Account details copied"); return false; } },
                { text: cb.icon("share", 16) + " Share", primary: true, onClick: function () { if (navigator.share) navigator.share({ title: "My Citizens Bank account", text: text }).catch(function () {}); else { try { navigator.clipboard.writeText(text); } catch (e) {} cb.toast("Copied — paste it to share"); } } }] });
  }

  // slider + default account
  var slides = $$(".acard", track), dotsWrap = $("#cardDots"), current = 0, defaultId = null;
  try { defaultId = localStorage.getItem("citizens-default-account"); } catch (e) {}
  if (!slides.some(function (c) { return c.dataset.id === defaultId; })) defaultId = slides[0].dataset.id;
  slides.forEach(function (c, i) { var d = document.createElement("button"); d.setAttribute("aria-label", "Go to account " + (i + 1)); d.addEventListener("click", function () { go(i); }); dotsWrap.appendChild(d); });
  function step() { return slides[0].offsetWidth + 16; }
  function go(i) { track.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, i)) * step() }); }
  function render() {
    $$("button", dotsWrap).forEach(function (d, i) { d.classList.toggle("on", i === current); });
    slides.forEach(function (x) { x.classList.toggle("is-default", x.dataset.id === defaultId); });
    $("#prevCard").disabled = current === 0; $("#nextCard").disabled = current === slides.length - 1;
    $("#cardCount").textContent = (current + 1) + " of " + slides.length + " accounts";
    var a = D.accounts[current];
    $("#miniSub").textContent = a.product + " · " + cb.mask(a.no);
  }
  var settle;
  track.addEventListener("scroll", function () {
    var i = Math.round(track.scrollLeft / step());
    if (i !== current) { current = i; mask(revealed); revealed = null; render(); }
    clearTimeout(settle);
    settle = setTimeout(function () {
      var id = slides[current].dataset.id; if (id === defaultId) return;
      defaultId = id; try { localStorage.setItem("citizens-default-account", id); } catch (e) {}
      render(); cb.toast(slides[current].dataset.name + " is now your default account");
    }, 220);
  }, { passive: true });
  $("#prevCard").addEventListener("click", function () { go(current - 1); });
  $("#nextCard").addEventListener("click", function () { go(current + 1); });
  track.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(current - 1); if (e.key === "ArrowRight") go(current + 1); });
  // mouse / pen drag to swipe (touch and trackpads already swipe through native scroll-snap)
  var drag = null, dragged = false;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch" || e.button !== 0 || slides.length < 2) return;
    drag = { id: e.pointerId, x: e.clientX, left: track.scrollLeft, from: current, moved: false };
  });
  track.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      drag.moved = true; track.setPointerCapture(drag.id); track.classList.add("dragging");
      try { window.getSelection().removeAllRanges(); } catch (er) {}
    }
    e.preventDefault();
    track.scrollLeft = drag.left - dx;
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.moved) return;
    track.classList.remove("dragging");
    var dx = e.clientX - d.x;
    dragged = true; setTimeout(function () { dragged = false; }, 0);
    go(Math.abs(dx) > step() * 0.15 ? d.from + (dx < 0 ? 1 : -1) : d.from);
  }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  // a drag that ends over a button or link must not also click it
  track.addEventListener("click", function (e) { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  track.addEventListener("dragstart", function (e) { e.preventDefault(); });
  current = Math.max(0, slides.findIndex(function (c) { return c.dataset.id === defaultId; }));
  render(); track.style.scrollBehavior = "auto"; track.scrollLeft = current * step(); track.style.scrollBehavior = "";

  // ---------- shortcuts (§7.3): up to 9, locked trio, presets, drag to reorder ----------
  var CAT = [
    ["More", [["transfer", "Fund Transfer", "send", "fund-transfer.html"], ["billpay", "Bill Payment", "zap", "bill-pay.html"], ["recharge", "Recharge", "phone", "recharge.html"],
      ["cards", "Card Services", "card", "cards.html"], ["qr", "My QR", "qr", "my-qr.html"], ["deposit", "Deposit Scheme", "piggy", "deposits.html"], ["statement", "Statement", "sheet", "statement.html"],
      ["limits", "Transaction Limit", "gauge", "limits.html"], ["products", "My Products", "package", "products.html"], ["ibadah", "Ibadah", "moon", "#soon"], ["zakat", "Zakat", "calculator", "calculators.html#zakat"],
      ["calc", "Calculator", "calculator", "calculators.html"], ["beneficiary", "Beneficiary", "users", "beneficiaries.html"], ["request", "Request", "inbox", "requests.html"]]],
    ["Request", [["status", "Status", "clipboard", "requests.html"], ["mini", "Mini-Statements", "fileText", "accounts.html"], ["complain", "Complain", "message", "complain.html"], ["positive", "Positive Pay", "shieldCheck", "positive-pay.html"],
      ["payorder", "Pay Order", "fileText", "pay-order.html"], ["dispute", "Dispute Request", "alert", "dispute.html"], ["tax", "Tax Document", "fileUp", "tax-document.html"]]],
    ["Cheque", [["stopchq", "Stop Cheque", "ban", "cheque-stop.html"], ["orderchq", "Order Cheque", "book", "cheque-order.html"], ["inward", "Inward Cheque", "arrowL", "cheques.html"], ["outward", "Outward Cheque", "send", "cheques.html#outward"]]],
    ["Other", [["find", "Find CZB", "mapPin", "find-czb.html"], ["help", "Help & Support", "help", "help.html"], ["whatsnew", "What's New", "star", "#soon"]]]
  ];
  var BY = {}; CAT.forEach(function (g) { g[1].forEach(function (s) { BY[s[0]] = s; }); });
  var LOCKED = ["transfer", "billpay", "recharge"];
  var PRESETS = { "3": LOCKED.slice(), "6": LOCKED.concat(["cards", "qr", "statement"]), "default": ["transfer", "billpay", "recharge", "cards", "qr", "deposit", "statement", "tax", "dispute"] };
  var KEY = "cb-shortcuts-" + U.userId, sel, preset;
  try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved && saved.items) { sel = saved.items; preset = saved.preset; } } catch (e) {}
  if (!sel) { sel = PRESETS["default"].slice(); preset = "default"; }
  function tile(s) {
    var soon = s[3] === "#soon";
    return '<a class="sc-tile" href="' + (soon ? "#" : s[3]) + '"' + (soon ? ' data-soon="' + s[1] + '"' : "") + '><span class="sc-ic">' + cb.icon(s[2], 22) + "</span><span>" + s[1] + "</span></a>";
  }
  function paintGrid() {
    $("#scGrid").innerHTML = sel.map(function (id) { return tile(BY[id]); }).join("");
  }
  paintGrid();

  $("#seeMore").addEventListener("click", function () {
    cb.dialog({ title: "All services", size: "lg", html: CAT.map(function (g) {
      return '<div class="dir-group"><h4>' + g[0] + '</h4><div class="dir-grid">' + g[1].map(tile).join("") + "</div></div>";
    }).join("") + '<div class="dir-hotline">' + cb.icon("phoneCall", 18) + '<span>Contact CZB 24/7 <b>16222</b></span></div>' });
  });

  $("#customize").addEventListener("click", function () {
    var work = sel.slice(), wp = preset;
    var d = cb.dialog({ title: "Customise quick actions", size: "lg",
      html: '<p class="cz-note">Pick up to 9 shortcuts and drag to reorder. Fund Transfer, Bill Payment and Recharge are always shown.</p>' +
        '<div class="seg cz-presets"><button type="button" data-p="3">3</button><button type="button" data-p="6">6</button><button type="button" data-p="default">Default</button><button type="button" data-p="custom">Custom</button></div>' +
        '<div class="cz-head"><b>Your shortcuts</b><span id="czCount"></span></div><div class="cz-sel" id="czSel"></div>' +
        '<div class="cz-head"><b>Available</b></div><div id="czAvail"></div>',
      buttons: [{ text: "Cancel", value: false }, { text: "Save", primary: true, onClick: function () { sel = work; preset = wp; try { localStorage.setItem(KEY, JSON.stringify({ items: sel, preset: preset })); } catch (e) {} paintGrid(); cb.toast("Quick actions updated", "success"); } }] });
    var el = d.el;
    function paint() {
      $$(".cz-presets button", el).forEach(function (b) { b.classList.toggle("on", b.dataset.p === wp); });
      $("#czCount", el).textContent = work.length + " / 9";
      $("#czSel", el).innerHTML = work.map(function (id, i) {
        var s = BY[id], locked = LOCKED.indexOf(id) > -1;
        return '<div class="cz-chip' + (locked ? " locked" : "") + '" draggable="true" data-i="' + i + '">' + cb.icon("dots", 14) + cb.icon(s[2], 16) + "<span>" + s[1] + "</span>" + (locked ? cb.icon("lock", 13) : '<button type="button" class="cz-x" data-id="' + id + '" aria-label="Remove ' + s[1] + '">' + cb.icon("x", 13) + "</button>") + "</div>";
      }).join("");
      $("#czAvail", el).innerHTML = CAT.map(function (g) {
        var items = g[1].filter(function (s) { return work.indexOf(s[0]) < 0; });
        if (!items.length) return "";
        return '<div class="cz-group"><small>' + g[0] + "</small>" + items.map(function (s) { return '<button type="button" class="cz-add" data-id="' + s[0] + '"' + (work.length >= 9 ? " disabled" : "") + ">" + cb.icon("plus", 13) + s[1] + "</button>"; }).join("") + "</div>";
      }).join("");
    }
    el.addEventListener("click", function (e) {
      var p = e.target.closest(".cz-presets button");
      if (p) { wp = p.dataset.p; if (PRESETS[wp]) work = PRESETS[wp].slice(); paint(); return; }
      var x = e.target.closest(".cz-x"); if (x) { work.splice(work.indexOf(x.dataset.id), 1); wp = "custom"; paint(); return; }
      var a = e.target.closest(".cz-add"); if (a && work.length < 9) { work.push(a.dataset.id); wp = "custom"; paint(); }
    });
    var dragI = null;
    el.addEventListener("dragstart", function (e) { var c = e.target.closest(".cz-chip"); if (c) { dragI = +c.dataset.i; c.classList.add("drag"); } });
    el.addEventListener("dragover", function (e) { if (e.target.closest(".cz-chip")) e.preventDefault(); });
    el.addEventListener("drop", function (e) {
      var c = e.target.closest(".cz-chip"); if (!c || dragI === null) return; e.preventDefault();
      var to = +c.dataset.i, item = work.splice(dragI, 1)[0]; work.splice(to, 0, item); dragI = null; wp = "custom"; paint();
    });
    el.addEventListener("dragend", function () { dragI = null; $$(".cz-chip.drag", el).forEach(function (c) { c.classList.remove("drag"); }); });
    paint();
  });


  // ---------- cash flow chart & filter ----------
  (function () {
    var svg = $("#cfSvg"); if (!svg) return;
    var filterSel = $("#cfFilter");
    var barsGroup = $("#cfBars"), labelsGroup = $("#cfLabels"), hitGroup = $("#cfHit");
    var tip = $("#cfTip"), tm = $("#cfTipM"), tv = $("#cfTipV"), tr = $("rect", tip);
    var NS = "http://www.w3.org/2000/svg";

    var DATA = {
      "1m": [
        { label: "Week 1", full: "1–7 Sep 2026", cr: 7.2, dr: 4.1 },
        { label: "Week 2", full: "8–14 Sep 2026", cr: 8.5, dr: 3.2 },
        { label: "Week 3", full: "15–21 Sep 2026", cr: 6.8, dr: 5.0 },
        { label: "Week 4", full: "22–30 Sep 2026", cr: 9.1, dr: 4.4 }
      ],
      "6m": [
        { label: "Apr", full: "Apr 2026", cr: 5.6, dr: 4.5 },
        { label: "May", full: "May 2026", cr: 7.3, dr: 3.6 },
        { label: "Jun", full: "Jun 2026", cr: 6.4, dr: 4.8 },
        { label: "Jul", full: "Jul 2026", cr: 7.6, dr: 4.0 },
        { label: "Aug", full: "Aug 2026", cr: 6.9, dr: 4.3 },
        { label: "Sep", full: "Sep 2026", cr: 8.4, dr: 3.9 }
      ],
      "1y": [
        { label: "Oct", full: "Oct 2025", cr: 5.4, dr: 3.9 },
        { label: "Nov", full: "Nov 2025", cr: 5.8, dr: 4.6 },
        { label: "Dec", full: "Dec 2025", cr: 6.2, dr: 5.1 },
        { label: "Jan", full: "Jan 2026", cr: 5.9, dr: 4.1 },
        { label: "Feb", full: "Feb 2026", cr: 6.0, dr: 3.8 },
        { label: "Mar", full: "Mar 2026", cr: 6.6, dr: 4.2 },
        { label: "Apr", full: "Apr 2026", cr: 5.6, dr: 4.5 },
        { label: "May", full: "May 2026", cr: 7.3, dr: 3.6 },
        { label: "Jun", full: "Jun 2026", cr: 6.4, dr: 4.8 },
        { label: "Jul", full: "Jul 2026", cr: 7.6, dr: 4.0 },
        { label: "Aug", full: "Aug 2026", cr: 6.9, dr: 4.3 },
        { label: "Sep", full: "Sep 2026", cr: 8.4, dr: 3.9 }
      ]
    };

    function render(key) {
      var items = DATA[key] || DATA["1y"];
      var N = items.length;
      var X0 = 44, Y0 = 296, W = 572;
      var slotW = W / N;

      var barW = N === 12 ? 15 : (N === 6 ? 24 : 32);
      var gap = N === 12 ? 3 : (N === 6 ? 6 : 8);

      if (barsGroup) barsGroup.innerHTML = "";
      if (labelsGroup) labelsGroup.innerHTML = "";
      if (hitGroup) hitGroup.innerHTML = "";

      var bars = [];

      items.forEach(function (d, i) {
        var cx = X0 + slotW * (i + 0.5);
        var crH = Math.round(d.cr * 27 * 10) / 10;
        var drH = Math.round(d.dr * 27 * 10) / 10;

        var crRect = document.createElementNS(NS, "rect");
        crRect.setAttribute("x", (cx - barW - gap / 2).toFixed(1));
        crRect.setAttribute("y", (Y0 - crH).toFixed(1));
        crRect.setAttribute("width", barW);
        crRect.setAttribute("height", crH.toFixed(1));
        crRect.setAttribute("rx", "4");
        crRect.setAttribute("fill", "var(--primary)");
        if (barsGroup) barsGroup.appendChild(crRect);
        bars.push(crRect);

        var drRect = document.createElementNS(NS, "rect");
        drRect.setAttribute("x", (cx + gap / 2).toFixed(1));
        drRect.setAttribute("y", (Y0 - drH).toFixed(1));
        drRect.setAttribute("width", barW);
        drRect.setAttribute("height", drH.toFixed(1));
        drRect.setAttribute("rx", "4");
        drRect.setAttribute("fill", "var(--primary-light)");
        if (barsGroup) barsGroup.appendChild(drRect);
        bars.push(drRect);

        var lbl = document.createElementNS(NS, "text");
        lbl.setAttribute("x", cx.toFixed(1));
        lbl.setAttribute("y", "318");
        lbl.setAttribute("text-anchor", "middle");
        lbl.textContent = d.label;
        if (labelsGroup) labelsGroup.appendChild(lbl);

        var hitRect = document.createElementNS(NS, "rect");
        hitRect.setAttribute("x", (X0 + slotW * i).toFixed(1));
        hitRect.setAttribute("y", "20");
        hitRect.setAttribute("width", slotW.toFixed(1));
        hitRect.setAttribute("height", "276");
        hitRect.setAttribute("fill", "transparent");
        hitRect.style.cursor = "pointer";

        hitRect.addEventListener("mouseenter", function () { show(i, bars); });
        hitRect.addEventListener("click", function () { show(i, bars); });
        if (hitGroup) hitGroup.appendChild(hitRect);
      });

      function show(i, bList) {
        var cx = X0 + slotW * (i + 0.5);
        var tipW = 126;
        var tx = Math.max(44, Math.min(616 - tipW, cx - tipW / 2));
        tr.setAttribute("x", tx.toFixed(1));
        tr.setAttribute("width", tipW);
        tm.setAttribute("x", (tx + 10).toFixed(1));
        tv.setAttribute("x", (tx + 10).toFixed(1));
        tm.textContent = items[i].full;
        tv.textContent = "Cr ৳" + items[i].cr.toFixed(1) + "k · Dr ৳" + items[i].dr.toFixed(1) + "k";
        bList.forEach(function (b, k) {
          b.style.opacity = Math.floor(k / 2) === i ? 1 : 0.45;
        });
      }

      function reset(bList) {
        show(items.length - 1, bList);
        bList.forEach(function (b) { b.style.opacity = ""; });
      }

      svg.onmouseleave = function () { reset(bars); };
      reset(bars);
    }

    render(filterSel ? filterSel.value : "1y");

    if (filterSel) {
      filterSel.addEventListener("change", function () {
        render(this.value);
      });
    }
  })();

  // ---------- mini statement ----------
  $("#miniRows").innerHTML = D.tx.slice(0, 8).map(function (t) {
    return '<tr><td class="num">' + t.date + "</td><td>" + cb.esc(t.narration) + '</td><td class="amt ' + (t.amount > 0 ? "cr" : "dr") + ' num">' + (t.amount > 0 ? "+" : "−") + Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 }) + "</td></tr>";
  }).join("");

  // ---------- lifestyle & offers ----------
  var LS = [["Aarong", "Fashion", "15% off", "#8b1c1c"], ["Pizza Hut", "Food", "Buy 1 get 1", "#c62828"], ["US-Bangla", "Tour & Travels", "10% off", "#1565c0"], ["Daraz", "E-Commerce", "৳300 off", "#f47820"],
    ["Yellow", "Fashion", "20% off", "#b07800"], ["Sultan's Dine", "Food", "12% off", "#2e7d32"], ["Novotel", "Tour & Travels", "25% off stay", "#3f51b5"], ["Chaldal", "E-Commerce", "Free delivery", "#39b54a"]];
  $("#lsRow").innerHTML = LS.map(function (o) {
    return '<a class="ls-card" href="offers.html"><span class="ls-logo">' + cb.brandLogo(o[0], 42) + '</span><b>' + o[0] + "</b><small>" + o[1] + '</small><span class="ls-deal">' + o[2] + "</span></a>";
  }).join("");

  // ---------- Stripe-inspired Stats & Interactive Ray Burst Art ----------
  (function initStripeArt() {
    var canvas = $("#stripeRayCanvas");
    var wrap = $("#stripeCanvasWrap");
    if (!canvas || !wrap) return;

    var ctx = canvas.getContext("2d");
    var width = 0, height = 0, dpr = 1;
    var rays = [];
    var RAY_COUNT = 240;
    var boosted = false;

    // Mouse / interaction state
    var mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      isHovered: false
    };

    var tilt = { curX: 0, curY: 0, targetX: 0, targetY: 0 };
    var activeSector = -1; // 0, 1, 2, 3 or -1

    function isDarkTheme() {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }

    function createRays() {
      rays = [];
      if (!width || !height) return;

      var originX = width / 2;
      var originY = height - 4;
      var maxSpread = 1.545; // ~88.5 degrees each side from vertical (full 177 deg fan)

      for (var i = 0; i < RAY_COUNT; i++) {
        var u = (i / (RAY_COUNT - 1)) * 2 - 1; // -1 to +1
        var jitter = (Math.random() - 0.5) * 0.018;
        var angle = u * maxSpread + jitter;

        var sinA = Math.sin(angle);
        var cosA = Math.cos(angle);

        // Elliptical ceiling envelope matching exact dome shape
        var denom = Math.pow(sinA / (width * 0.485), 2) + Math.pow(cosA / (height * 0.865), 2);
        var maxBound = 1.0 / Math.sqrt(denom);

        // Staggered length tiers matching the reference constellation
        var rnd = Math.random();
        var lengthFrac;
        if (rnd < 0.28) {
          // Short tier (dense rays stopping within the amber core)
          lengthFrac = 0.32 + Math.random() * 0.20;
        } else if (rnd < 0.72) {
          // Mid tier (crossing the amber dome into the sky)
          lengthFrac = 0.54 + Math.random() * 0.26;
        } else {
          // Long tier (reaching outer dome perimeter)
          lengthFrac = 0.82 + Math.random() * 0.20;
          if (Math.random() < 0.12) {
            lengthFrac = 1.03 + Math.random() * 0.05; // occasional prominent spikes
          }
        }

        var rayLen = maxBound * lengthFrac;
        var hasMidNode = Math.random() < 0.34;
        var midFrac = 0.45 + Math.random() * 0.32;

        rays.push({
          angle: angle,
          sinA: sinA,
          cosA: cosA,
          length: rayLen,
          hasMidNode: hasMidNode,
          midFrac: midFrac,
          baseWidth: 0.9 + Math.random() * 0.35,
          baseAlpha: 0.45 + Math.random() * 0.45,
          tipRadius: 1.8 + Math.random() * 1.0,
          midRadius: 1.4 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 0.5
        });
      }
    }

    function resize() {
      var rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      createRays();
    }

    window.addEventListener("resize", resize);
    resize();

    // Mouse & Touch events
    wrap.addEventListener("mouseenter", function (e) {
      mouse.isHovered = true;
      var rect = wrap.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.x = mouse.targetX;
      mouse.y = mouse.targetY;
    });

    wrap.addEventListener("mousemove", function (e) {
      var rect = wrap.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    });

    wrap.addEventListener("mouseleave", function () {
      mouse.isHovered = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      tilt.targetX = 0;
      tilt.targetY = 0;
    });

    wrap.addEventListener("touchmove", function (e) {
      if (!e.touches || !e.touches[0]) return;
      var rect = wrap.getBoundingClientRect();
      mouse.isHovered = true;
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
    }, { passive: true });

    wrap.addEventListener("touchend", function () {
      mouse.isHovered = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      tilt.targetX = 0;
      tilt.targetY = 0;
    });

    // Illumination toggle button
    var modeBtn = $("#artModeBtn");
    if (modeBtn) {
      modeBtn.addEventListener("click", function () {
        boosted = !boosted;
        modeBtn.classList.toggle("boosted", boosted);
        cb.toast(boosted ? "Enhanced illumination active" : "Standard illumination active");
      });
    }

    // Exact color definitions matching reference image
    var THEME_COLORS = {
      light: {
        skyTop: "#f2f8ff",
        skyMid: "#dbeafe",
        skyBottom: "#bcdbf8",
        domeStops: [
          [0.00, "rgba(238, 172, 98, 0.94)"],
          [0.32, "rgba(244, 186, 114, 0.84)"],
          [0.60, "rgba(236, 198, 140, 0.54)"],
          [0.82, "rgba(215, 208, 190, 0.22)"],
          [1.00, "rgba(186, 215, 243, 0.00)"]
        ],
        rayStroke: "rgba(45, 108, 223, ",     // vibrant blue ray
        rayTip: "rgba(37, 99, 235, ",        // tip bead
        tipGlow: "rgba(56, 189, 248, 0.8)",  // illuminated cyan glow
        coreAnchor: "rgba(120, 90, 60, 0.75)"
      },
      dark: {
        skyTop: "#080d1a",
        skyMid: "#0d1629",
        skyBottom: "#0b1224",
        domeStops: [
          [0.00, "rgba(245, 158, 11, 0.74)"],
          [0.32, "rgba(217, 119, 6, 0.52)"],
          [0.60, "rgba(180, 83, 9, 0.28)"],
          [0.82, "rgba(30, 58, 138, 0.14)"],
          [1.00, "rgba(11, 18, 36, 0.00)"]
        ],
        rayStroke: "rgba(96, 165, 250, ",    // cyber neon azure
        rayTip: "rgba(147, 197, 253, ",      // light blue bead
        tipGlow: "rgba(96, 165, 250, 0.85)", // neon blue glow
        coreAnchor: "rgba(251, 191, 36, 0.8)"
      }
    };

    function render(time) {
      requestAnimationFrame(render);
      if (!width || !height) return;

      var dark = isDarkTheme();
      var colors = dark ? THEME_COLORS.dark : THEME_COLORS.light;

      // Smooth mouse coordinates and subtle tilt
      if (mouse.isHovered) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
        tilt.targetX = ((mouse.y / height) - 0.5) * -3.5;
        tilt.targetY = ((mouse.x / width) - 0.5) * 5.0;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      }

      tilt.curX += (tilt.targetX - tilt.curX) * 0.08;
      tilt.curY += (tilt.targetY - tilt.curY) * 0.08;
      canvas.style.transform = "perspective(900px) rotateX(" + tilt.curX.toFixed(2) + "deg) rotateY(" + tilt.curY.toFixed(2) + "deg)";

      ctx.clearRect(0, 0, width, height);

      var originX = width / 2;
      var originY = height - 4;

      // 1. Draw base sky gradient
      var sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, colors.skyTop);
      sky.addColorStop(0.45, colors.skyMid);
      sky.addColorStop(1, colors.skyBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw elliptical glowing amber dome at bottom center
      ctx.save();
      ctx.translate(originX, originY);
      ctx.scale(1.35, 1.0); // wide dome ellipse
      var domeRadius = Math.min(width * 0.44, height * 0.88);
      var dome = ctx.createRadialGradient(0, 0, 0, 0, 0, domeRadius);
      for (var s = 0; s < colors.domeStops.length; s++) {
        dome.addColorStop(colors.domeStops[s][0], colors.domeStops[s][1]);
      }
      ctx.fillStyle = dome;
      ctx.beginPath();
      ctx.arc(0, 0, domeRadius, -Math.PI, 0);
      ctx.fill();
      ctx.restore();

      // 3. Render straight radiating rays with subtle hover elasticity
      var boostMult = boosted ? 1.3 : 1.0;
      var timeSec = time * 0.001;

      for (var i = 0; i < rays.length; i++) {
        var r = rays[i];

        // Micro ambient breathing
        var breathe = Math.sin(timeSec * 1.5 * r.speed + r.phase) * 0.7;
        var effLength = r.length + breathe;

        var tipX = originX + r.sinA * effLength;
        var tipY = originY - r.cosA * effLength;

        // Hover magnetic deflection & feeling
        var hoverInf = 0;
        var isFlexed = false;
        var cpx = 0, cpy = 0;

        if (mouse.isHovered && mouse.x > 0) {
          var dist = Math.hypot(tipX - mouse.x, tipY - mouse.y);
          if (dist < 180) {
            var raw = 1 - dist / 180;
            hoverInf = raw * raw; // smooth quadratic falloff
            isFlexed = true;

            // Subtle magnetic pull toward mouse
            var pull = hoverInf * 24;
            var angleToMouse = Math.atan2(mouse.y - tipY, mouse.x - tipX);
            tipX += Math.cos(angleToMouse) * pull;
            tipY += Math.sin(angleToMouse) * pull;

            // Curved flexion control point
            cpx = originX + r.sinA * (effLength * 0.55) + Math.cos(angleToMouse) * (pull * 0.4);
            cpy = originY - r.cosA * (effLength * 0.55) + Math.sin(angleToMouse) * (pull * 0.4);
          }
        }

        // Sector highlight check from metric card hover
        var sectorBoost = 0;
        if (activeSector >= 0) {
          var secMin = -1.545 + activeSector * (3.09 / 4);
          var secMax = secMin + (3.09 / 4);
          if (r.angle >= secMin && r.angle <= secMax) {
            sectorBoost = 0.55;
          }
        }

        var totalHighlight = Math.min(1.5, hoverInf + sectorBoost);

        // Alpha & styling
        var alpha = Math.min(1, r.baseAlpha * boostMult + totalHighlight * 0.5);
        var lineWidth = r.baseWidth * boostMult + totalHighlight * 0.6;

        // Draw ray: perfectly straight when idle, smoothly flexed when hovered
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        if (isFlexed) {
          ctx.quadraticCurveTo(cpx, cpy, tipX, tipY);
        } else {
          ctx.lineTo(tipX, tipY);
        }
        ctx.strokeStyle = colors.rayStroke + alpha.toFixed(2) + ")";
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Draw intermediate node if ray has one
        if (r.hasMidNode) {
          var midX = originX + (tipX - originX) * r.midFrac;
          var midY = originY + (tipY - originY) * r.midFrac;
          ctx.beginPath();
          ctx.arc(midX, midY, r.midRadius, 0, Math.PI * 2);
          ctx.fillStyle = colors.rayTip + (alpha * 0.9).toFixed(2) + ")";
          ctx.fill();
        }

        // Draw outer tip bead
        var tipR = r.tipRadius * boostMult + totalHighlight * 1.6;
        ctx.beginPath();
        ctx.arc(tipX, tipY, tipR, 0, Math.PI * 2);
        ctx.fillStyle = colors.rayTip + alpha.toFixed(2) + ")";

        // Subtle glow when hovered or boosted
        if (totalHighlight > 0.12 || boosted) {
          ctx.save();
          ctx.shadowColor = colors.tipGlow;
          ctx.shadowBlur = 8 * (totalHighlight + (boosted ? 0.5 : 0));
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fill();
        }
      }

      // 4. Draw center convergence pin anchor
      ctx.beginPath();
      ctx.arc(originX, originY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.coreAnchor;
      ctx.fill();
    }

    render(0);
  })();
})();
