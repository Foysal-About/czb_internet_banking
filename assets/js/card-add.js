/* Add Card page: link a Citizens Bank card with Month/Year calendar picker and OTP verification. */
(function () {
  "use strict";
  var $ = cb.$;
  var STORAGE_KEY = "cb-added-cards";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MIN_YEAR = 2026, MIN_MONTH = 10, MAX_YEAR = 2038;

  function loadAdded() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveAdded(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function allCards() {
    return (CB_DATA.cards || []).concat(loadAdded());
  }
  function last4(c) {
    return String(c.no).replace(/\D/g, "").slice(-4);
  }
  function ferr(k, m) {
    var e = $('[data-e="' + k + '"]');
    if (!e) return;
    e.textContent = m || "";
    e.closest(".fld").classList.toggle("invalid", !!m);
  }
  function p2(n) { return String(n).padStart(2, "0"); }

  /* ---------- Month / Year Picker ---------- */
  var expIn = $("#cdExp"), expBtn = $("#cdExpBtn"), expPop = $("#cdExpPop"), expWrap = $("#cdExpWrap");
  var viewYear = 2027, selMonth = 0, selYear = 0;

  function parseExpInput() {
    var m = /^(\d{2})\/(\d{2})$/.exec(expIn.value.trim());
    if (m && +m[1] >= 1 && +m[1] <= 12) {
      selMonth = +m[1];
      selYear = 2000 + +m[2];
      if (selYear >= MIN_YEAR && selYear <= MAX_YEAR) viewYear = selYear;
    } else {
      selMonth = 0;
      selYear = 0;
    }
  }

  function renderPicker() {
    var yrs = [];
    for (var y = MIN_YEAR; y <= MAX_YEAR; y++) {
      yrs.push('<option value="' + y + '"' + (y === viewYear ? " selected" : "") + ">" + y + "</option>");
    }
    var mos = MONTHS.map(function (name, i) {
      var m = i + 1;
      var disabled = viewYear === MIN_YEAR && m < MIN_MONTH;
      var active = selYear === viewYear && selMonth === m;
      return '<button type="button" class="exp-m' + (active ? " on" : "") + '" data-m="' + m + '"' + (disabled ? " disabled" : "") + ">" +
        name + "<small>" + p2(m) + "</small></button>";
    }).join("");

    expPop.innerHTML =
      '<div class="exp-head">' +
        '<button type="button" class="exp-nav" data-yr="-1" aria-label="Previous year"' + (viewYear <= MIN_YEAR ? " disabled" : "") + ">" + cb.icon("chevL", 16) + "</button>" +
        '<select class="exp-yr-sel" id="expYrSel" aria-label="Expiry year">' + yrs.join("") + "</select>" +
        '<button type="button" class="exp-nav" data-yr="1" aria-label="Next year"' + (viewYear >= MAX_YEAR ? " disabled" : "") + ">" + cb.icon("chevR", 16) + "</button>" +
      "</div>" +
      '<div class="exp-months">' + mos + "</div>";
  }

  function openPicker(open) {
    if (open) {
      parseExpInput();
      renderPicker();
    }
    expPop.hidden = !open;
    expBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  expBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    openPicker(expPop.hidden);
  });

  expPop.addEventListener("click", function (e) {
    e.stopPropagation();
    var nav = e.target.closest("[data-yr]");
    if (nav) {
      var nextY = viewYear + (+nav.dataset.yr);
      if (nextY >= MIN_YEAR && nextY <= MAX_YEAR) {
        viewYear = nextY;
        if (selMonth && !(viewYear === MIN_YEAR && selMonth < MIN_MONTH)) {
          selYear = viewYear;
          expIn.value = p2(selMonth) + "/" + p2(selYear % 100);
          ferr("exp", "");
        }
        renderPicker();
      }
      return;
    }
    var mBtn = e.target.closest("[data-m]");
    if (mBtn && !mBtn.disabled) {
      selMonth = +mBtn.dataset.m;
      selYear = viewYear;
      expIn.value = p2(selMonth) + "/" + p2(selYear % 100);
      ferr("exp", "");
      openPicker(false);
    }
  });

  expPop.addEventListener("change", function (e) {
    if (e.target.id === "expYrSel") {
      viewYear = +e.target.value;
      if (selMonth && !(viewYear === MIN_YEAR && selMonth < MIN_MONTH)) {
        selYear = viewYear;
        expIn.value = p2(selMonth) + "/" + p2(selYear % 100);
        ferr("exp", "");
      }
      renderPicker();
    }
  });

  document.addEventListener("click", function (e) {
    if (!expPop.hidden && !expWrap.contains(e.target)) openPicker(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !expPop.hidden) openPicker(false);
  });

  /* ---------- Inputs & Form Submit ---------- */
  $("#cdNo").addEventListener("input", function (e) {
    var d = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = d.replace(/(.{4})/g, "$1 ").trim();
  });
  expIn.addEventListener("input", function (e) {
    var d = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    if (!expPop.hidden) { parseExpInput(); renderPicker(); }
  });
  $("#cdPin").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  });

  $("#cdAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    openPicker(false);
    var no = $("#cdNo").value.replace(/\D/g, ""), exp = expIn.value, pin = $("#cdPin").value, ok = true;
    ferr("no", ""); ferr("exp", ""); ferr("pin", "");
    if (!cb.valid.card(no)) { ferr("no", "Enter the 16-digit card number."); ok = false; }
    var m = /^(\d{2})\/(\d{2})$/.exec(exp);
    if (!m || +m[1] < 1 || +m[1] > 12) { ferr("exp", "Enter or select the expiry as MM/YY."); ok = false; }
    else if (2000 + +m[2] < MIN_YEAR || (2000 + +m[2] === MIN_YEAR && +m[1] < MIN_MONTH)) { ferr("exp", "This card has expired."); ok = false; }
    if (!/^\d{4}$/.test(pin)) { ferr("pin", "Enter your 4-digit card PIN."); ok = false; }
    if (!ok) return;
    if (allCards().some(function (c) { return last4(c) === no.slice(-4); })) {
      ferr("no", "This card is already linked.");
      return;
    }
    cb.otp({
      message: "Verify to link the card ending " + no.slice(-4),
      onSuccess: function () {
        var added = loadAdded();
        added.push({
          id: "cn" + Date.now(),
          title: "Citizens Linked Card",
          type: "Debit",
          network: no[0] === "5" ? "Mastercard" : "VISA",
          no: no.slice(0, 4) + " •••• •••• " + no.slice(-4),
          expiry: exp,
          holder: CB_DATA.user.fullName.toUpperCase(),
          status: "Active",
          linked: ""
        });
        saveAdded(added);
        $("#cdAddForm").reset();
        cb.done({
          title: "Card Added",
          message: "Your card ending " + no.slice(-4) + " is now linked to Citizens FAST.",
          ok: "View My Cards"
        }).then(function () {
          location.href = "cards.html";
        });
      }
    });
  });
})();
