/* Inward / Outward cheques (spec §15): hardcoded demo rows, status chips, search */
(function () {
  var $ = cb.$, $$ = cb.$$;
  var DATA = {
    inward: [
      ["004512", "Rafiq Ahmed", "0012034571340", 25000, "Accepted", "29-Sep-2026"],
      ["004513", "Kamal Traders", "0012034571340", 148500, "Pending", "30-Sep-2026"],
      ["000871", "Nusrat Jahan", "0012087120884", 12000, "Accepted", "26-Sep-2026"],
      ["000872", "Mahmudul Hasan", "0012087120884", 56000, "Rejected", "24-Sep-2026"],
      ["002210", "Farhana Akter", "0031044030451", 8750, "Accepted", "21-Sep-2026"],
      ["002214", "Arif Chowdhury", "0031044030451", 33000, "Pending", "01-Oct-2026"],
      ["007301", "Anoy Islam", "0045091355210", 90000, "Rejected", "17-Sep-2026"],
      ["007305", "Jamal Uddin", "0045091355210", 15500, "Accepted", "12-Sep-2026"]
    ],
    outward: [
      ["001120", "Dutch-Bangla Bank - Gulshan", "0012034571340", 42000, "Accepted", "28-Sep-2026"],
      ["001121", "BRAC Bank - Banani", "0012034571340", 17800, "Pending", "01-Oct-2026"],
      ["000890", "The City Bank - Principal", "0012087120884", 220000, "Accepted", "23-Sep-2026"],
      ["000891", "Eastern Bank - Dhanmondi", "0012087120884", 9500, "Rejected", "20-Sep-2026"],
      ["002231", "Prime Bank - Motijheel", "0031044030451", 64000, "Accepted", "18-Sep-2026"],
      ["002232", "Sonali Bank - Ramna", "0031044030451", 5200, "Pending", "30-Sep-2026"],
      ["007320", "Islami Bank - Mirpur", "0045091355210", 130000, "Rejected", "14-Sep-2026"],
      ["007321", "Mutual Trust Bank - Banani", "0045091355210", 27250, "Accepted", "09-Sep-2026"]
    ]
  };
  var tab = "inward", status = "All", q = "";
  var TONE = { Accepted: "ok", Rejected: "fail", Pending: "pending" };
  var body = $("#chBody"), chips = $("#chChips"), search = $("#chSearch"), clear = $("#chClear");

  function rows() {
    return DATA[tab].filter(function (r) {
      if (status !== "All" && r[4] !== status) return false;
      var hay = (r[0] + " " + r[1] + " " + r[2]).toLowerCase();
      return !q || hay.indexOf(q) > -1;
    });
  }
  function paintChips() {
    var all = DATA[tab];
    chips.innerHTML = ["All", "Pending", "Accepted", "Rejected"].map(function (s) {
      var n = s === "All" ? all.length : all.filter(function (r) { return r[4] === s; }).length;
      return '<button type="button" data-s="' + s + '" class="' + (s === status ? "on" : "") + '" aria-pressed="' + (s === status) + '">' + s + "<i>" + n + "</i></button>";
    }).join("");
  }
  function paint() {
    paintChips();
    var r = rows(), who = tab === "inward" ? "Beneficiary" : "Drawee bank";
    clear.hidden = status === "All" && !q;
    $("#chCount").textContent = r.length + " of " + DATA[tab].length + " " + tab + " cheques";
    if (!r.length) {
      body.innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon("cheque", 26) + '</div><b>No cheques found</b><p>Try another status or a different search.</p><button type="button" class="btn-sec btn-sm" id="chReset">Clear filters</button></div>';
      $("#chReset").addEventListener("click", reset); return;
    }
    body.innerHTML = '<table class="dtable rq-table ch-table"><thead><tr><th>Cheque No</th><th>' + who + '</th><th>Account</th><th>Date</th><th class="r">Amount</th><th>Status</th></tr></thead><tbody>' +
      r.map(function (x) {
        return '<tr><td class="ch-no" data-l="Cheque No"><b>' + x[0] + '</b></td><td class="ch-who" data-l="' + who + '">' + cb.esc(x[1]) + '</td><td class="ch-acc muted" data-l="Account">' + cb.mask(x[2]) + '</td><td class="ch-date muted" data-l="Date">' + x[5] + '</td><td class="r ch-amt" data-l="Amount">' + cb.fmt(x[3]) + '</td><td class="ch-st"><span class="chip ' + TONE[x[4]] + '">' + x[4] + "</span></td></tr>";
      }).join("") + "</tbody></table>";
  }
  function reset() { status = "All"; q = ""; search.value = ""; paint(); }
  chips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; status = b.dataset.s; paint(); });
  search.addEventListener("input", function () { q = search.value.trim().toLowerCase(); paint(); });
  clear.addEventListener("click", reset);
  $$("[data-tab]", $("[data-tabs]")).forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.tab; status = "All"; paint(); }); });
  paint();
})();
