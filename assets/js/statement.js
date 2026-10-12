/* Statement (spec §8.2): account + period → Generate preview → Download Statement (PDF/Excel/CSV/Print). */
(function () {
  var $ = cb.$, D = window.CB_DATA;
  var acc = cb.select($("#stAccount"), { items: cb.accountItems(), placeholder: "Select account", searchPlaceholder: "Search accounts",
    onChange: function (it) {
      if (it && it.data) {
        $("#stAvail").innerHTML = "Available Balance: <b>" + cb.bdt(it.data.balance) + "</b>";
      } else {
        $("#stAvail").textContent = "";
      }
      invalidate();
    }
  });

  var from = $("#stFrom"), to = $("#stTo"), go = $("#stGo"), chips = cb.$$("#stPeriod button");
  var emptyGuide = $("#stEmptyGuide"), resultBox = $("#stResult");
  var iso = function (d) { return d.toISOString().slice(0, 10); };
  var today = new Date(2026, 9, 1);
  to.max = from.max = iso(today);

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.toggle("on", x === c); });
      var f = new Date(today); f.setDate(f.getDate() - +c.dataset.days);
      from.value = iso(f); to.value = iso(today); invalidate();
    });
  });
  [from, to].forEach(function (i) {
    i.addEventListener("change", function () {
      chips.forEach(function (x) { x.classList.remove("on"); });
      invalidate();
    });
  });

  function ready() { return acc.value && from.value && to.value; }
  function invalidate() {
    $("#stErr").classList.remove("show");
    go.disabled = !ready();
    go.querySelector("span:last-child").textContent = "Generate Statement";
    resultBox.hidden = true;
    if (emptyGuide) emptyGuide.hidden = false;
  }

  // Auto pre-select default account or hash account & Last 1 Month
  var targetId = location.hash.replace("#", "") || localStorage.getItem("citizens-default-account") || "a1";
  var matched = D.accounts.filter(function (x) { return x.id === targetId; })[0] || D.accounts[0];
  if (matched) {
    acc.set(matched.id);
    $("#stAvail").innerHTML = "Available Balance: <b>" + cb.bdt(matched.balance) + "</b>";
  }
  var defChip = cb.$('#stPeriod button[data-days="30"]');
  if (defChip) {
    defChip.classList.add("on");
    var initF = new Date(today); initF.setDate(initF.getDate() - 30);
    from.value = iso(initF); to.value = iso(today);
    go.disabled = !ready();
  }

  go.addEventListener("click", function () {
    if (from.value > to.value) {
      $("#stErr").innerHTML = cb.icon("alert", 14) + "The From date must not be after the To date.";
      $("#stErr").classList.add("show");
      return;
    }
    go.classList.add("loading"); go.disabled = true;
    if (emptyGuide) emptyGuide.hidden = true;
    resultBox.hidden = false;
    $("#stRows").innerHTML = Array(6).join('<tr><td><div class="skel" style="width:80px"></div></td><td><div class="skel" style="width:200px"></div></td><td><div class="skel" style="width:70px"></div></td><td><div class="skel" style="width:90px"></div></td><td><div class="skel" style="width:80px;margin-left:auto"></div></td></tr>');

    setTimeout(function () {
      go.classList.remove("loading"); go.disabled = false;
      var a = acc.item.data, rows = D.tx;
      $("#stTitle").textContent = a.product + " · " + cb.mask(a.no);
      $("#stRange").textContent = cb.date(new Date(from.value)) + " to " + cb.date(new Date(to.value));
      $("#stBranch").textContent = "Citizens Bank PLC · " + a.branch + " Branch (ID: " + a.branchId + ")";

      var cr = 0, dr = 0;
      rows.forEach(function (t) { if (t.amount > 0) cr += t.amount; else dr -= t.amount; });
      var opening = Math.max(a.balance * 0.6, a.balance - cr + dr), closing = opening + cr - dr;

      $("#stSummary").innerHTML =
        '<div class="st-stat-card">' +
          '<span class="st-stat-lbl">Opening Balance</span>' +
          '<b class="st-stat-val">' + cb.fmt(opening) + '</b>' +
        '</div>' +
        '<div class="st-stat-card credit">' +
          '<span class="st-stat-lbl">Total Credits</span>' +
          '<b class="st-stat-val amt-cr">+' + cb.fmt(cr) + '</b>' +
        '</div>' +
        '<div class="st-stat-card debit">' +
          '<span class="st-stat-lbl">Total Debits</span>' +
          '<b class="st-stat-val amt-dr">−' + cb.fmt(dr) + '</b>' +
        '</div>' +
        '<div class="st-stat-card closing">' +
          '<span class="st-stat-lbl">Closing Balance</span>' +
          '<b class="st-stat-val">' + cb.fmt(closing) + '</b>' +
        '</div>';

      $("#stRows").innerHTML = rows.length ? rows.map(function (t) {
        var catClass = (t.type || "other").toLowerCase().replace(/\s+/g, "-");
        return "<tr>" +
          "<td class='num'>" + t.date + "</td>" +
          "<td><b>" + cb.esc(t.narration) + "</b></td>" +
          "<td><span class='txn-cat " + catClass + "'>" + (t.type || "General") + "</span></td>" +
          "<td class='muted num'>" + t.ref + "</td>" +
          "<td class='r " + (t.amount > 0 ? "amt-cr" : "amt-dr") + "'>" + (t.amount > 0 ? "+" : "−") + cb.bdt(Math.abs(t.amount)) + "</td>" +
        "</tr>";
      }).join("") : '<tr><td colspan="5"><div class="empty-state"><div class="es-ic">' + cb.icon("sheet", 24) + '</div><b>No transactions found for the selected period.</b></div></td></tr>';

      $("#stCount").textContent = rows.length + " transactions found";
      go.querySelector("span:last-child").textContent = "Regenerate Statement";
    }, 600);
  });

  $("#stPdf").addEventListener("click", function () {
    var a = acc.item.data;
    cb.toast("Statement_" + a.branchId + "_" + a.no + ".pdf downloaded", "success");
  });

  var printBtn = $("#stPrint");
  if (printBtn) {
    printBtn.addEventListener("click", function () { window.print(); });
  }

  $("#stReset").addEventListener("click", function () {
    acc.set(undefined);
    from.value = to.value = "";
    chips.forEach(function (x) { x.classList.remove("on"); });
    $("#stAvail").textContent = "";
    invalidate();
  });
})();
