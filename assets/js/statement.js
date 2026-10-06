/* Statement (spec §8.2): account + period → Generate preview → Download Statement (PDF). */
(function () {
  var $ = cb.$, D = window.CB_DATA;
  var acc = cb.select($("#stAccount"), { items: cb.accountItems(5), placeholder: "Select account", searchPlaceholder: "Search accounts",
    onChange: function (it) { $("#stAvail").innerHTML = "Available Balance: <b>" + cb.bdt(it.data.balance) + "</b>"; invalidate(); } });
  var from = $("#stFrom"), to = $("#stTo"), go = $("#stGo"), chips = cb.$$("#stPeriod button");
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
  [from, to].forEach(function (i) { i.addEventListener("change", function () { chips.forEach(function (x) { x.classList.remove("on"); }); invalidate(); }); });

  function ready() { return acc.value && from.value && to.value; }
  function invalidate() {
    $("#stErr").classList.remove("show");
    go.disabled = !ready();
    go.querySelector("span:last-child").textContent = "Generate";
    $("#stResult").hidden = true;
  }
  go.addEventListener("click", function () {
    if (from.value > to.value) { $("#stErr").innerHTML = cb.icon("alert", 14) + "The From date must not be after the To date."; $("#stErr").classList.add("show"); return; }
    go.classList.add("loading"); go.disabled = true;
    $("#stResult").hidden = false;
    $("#stRows").innerHTML = Array(5).join('<tr><td><div class="skel" style="width:90px"></div></td><td><div class="skel" style="width:220px"></div></td><td><div class="skel" style="width:90px"></div></td><td><div class="skel" style="width:80px;margin-left:auto"></div></td></tr>');
    setTimeout(function () {
      go.classList.remove("loading"); go.disabled = false;
      var a = acc.item.data, rows = D.tx;
      $("#stTitle").textContent = a.product + " · " + cb.mask(a.no);
      $("#stRange").textContent = cb.date(new Date(from.value)) + " to " + cb.date(new Date(to.value));
      var cr = 0, dr = 0; rows.forEach(function (t) { if (t.amount > 0) cr += t.amount; else dr -= t.amount; });
      var opening = Math.max(a.balance * 0.6, a.balance - cr + dr), closing = opening + cr - dr;
      $("#stSummary").innerHTML = '<dl class="kv-grid"><div><dt>Opening balance</dt><dd>' + cb.fmt(opening) + '</dd></div><div><dt>Total credit</dt><dd class="amt-cr">' + cb.fmt(cr) + '</dd></div><div><dt>Total debit</dt><dd class="amt-dr">' + cb.fmt(dr) + '</dd></div><div><dt>Closing balance</dt><dd>' + cb.fmt(closing) + "</dd></div></dl>";
      $("#stRows").innerHTML = rows.length ? rows.map(function (t) {
        return "<tr><td class='num'>" + t.date + "</td><td>" + cb.esc(t.narration) + "</td><td class='muted num'>" + t.ref + "</td><td class='r " + (t.amount > 0 ? "amt-cr" : "amt-dr") + "'>" + (t.amount > 0 ? "+" : "−") + cb.bdt(Math.abs(t.amount)) + "</td></tr>";
      }).join("") : '<tr><td colspan="4"><div class="empty-state"><div class="es-ic">' + cb.icon("sheet", 24) + "</div><b>No transactions for the selected period.</b></div></td></tr>";
      go.querySelector("span:last-child").textContent = "Regenerate";
    }, 700);
  });
  $("#stPdf").addEventListener("click", function () {
    var a = acc.item.data;
    cb.toast("Statement_" + a.branchId + "_" + a.no + ".pdf downloaded", "success");
  });
  $("#stReset").addEventListener("click", function () { acc.set(undefined); from.value = to.value = ""; chips.forEach(function (x) { x.classList.remove("on"); }); $("#stAvail").textContent = ""; invalidate(); });
})();
