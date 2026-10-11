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
      return href === "#soon" ? '<button type="button" class="action" data-soon="' + x[1] + '">' + cb.icon(x[0], 19) + x[1] + "</button>"
        : '<a class="action" href="' + href + '">' + cb.icon(x[0], 19) + x[1] + "</a>";
    }).join("");
    return '<article class="acard" data-id="' + a.id + '" data-name="' + a.product + '">' +
      '<div class="ac-main">' +
        '<div class="ac-head"><span class="ac-ic">' + cb.icon({ DP01: "landmark", DP02: "lockOpen", DP03: "calCheck", LN01: "piggy" }[a.productType], 20) + '</span>' +
          '<div class="ac-title"><b>' + a.product + "</b><span>" + a.kind + " · " + a.branch + " Branch</span></div>" +
          '<button class="ac-share" type="button" aria-label="Share account details">' + cb.icon("share", 17) + "</button></div>" +
        '<div class="ac-label">' + LABEL[a.productType] + "</div>" +
        '<button type="button" class="ac-bal" aria-live="polite" data-bal="' + a.balance + '"><span class="ac-mask">৳ • • • • • •</span><span class="ac-tap">' + cb.icon("eye", 15) + "Tap for balance</span></button>" +
        '<div class="ac-no num">' + cb.maskLong(a.no) + "</div>" +
        '<div class="ac-foot"><div><span>Account Holder</span><b>' + U.fullName.toUpperCase() + "</b></div><div><span>Status</span><b>" + a.status + "</b></div></div>" +
      "</div>" +
      '<div class="ac-side"><div class="actions">' + acts + "</div></div>" +
      "</article>";
  }).join("");

  // tap for balance: Loading… → balance, re-mask after 4 s, one card at a time
  var revealTimer, revealed = null;
  function mask(btn) { if (!btn) return; btn.classList.remove("on", "loading"); $(".ac-mask", btn).textContent = "৳ • • • • • •"; $(".ac-tap", btn).innerHTML = cb.icon("eye", 15) + "Tap for balance"; }
  track.addEventListener("click", function (e) {
    var b = e.target.closest(".ac-bal");
    if (b) {
      if (b.classList.contains("on")) { mask(b); revealed = null; return; }
      mask(revealed); clearTimeout(revealTimer); revealed = b;
      b.classList.add("loading"); $(".ac-tap", b).textContent = "Loading…";
      setTimeout(function () {
        if (revealed !== b) return;
        b.classList.remove("loading"); b.classList.add("on");
        $(".ac-mask", b).textContent = cb.fmt(+b.dataset.bal);
        $(".ac-tap", b).innerHTML = cb.icon("eyeOff", 15) + "Hides in 4s";
        revealTimer = setTimeout(function () { mask(b); revealed = null; }, 4000);
      }, 650);
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

  // ---------- ads ----------
  $("#ads").innerHTML = [
    ["Citizens FAST", "Pay bills in seconds", "Zero charge on utility bills.", "bill-pay.html", "zap"],
    ["Deposit", "Open a DPS online", "From ৳500/month at up to 7% p.a.", "deposits.html#dps", "piggy"],
    ["Security", "Your OTP is yours alone", "We never ask for your OTP or TPIN.", "help.html", "shieldCheck"]
  ].map(function (a, i) {
    return '<a class="ad ad' + i + '" href="' + a[3] + '"><span class="ad-k">' + a[0] + "</span><b>" + a[1] + "</b><small>" + a[2] + '</small><span class="ad-ic">' + cb.icon(a[4], 34, 1.6) + "</span></a>";
  }).join("");
})();
