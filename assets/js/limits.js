/* =====================================================================
   Citizens FAST - Transaction Limits
   Simple, clean UI modeled directly after the mobile app
   ===================================================================== */
(function () {
  "use strict";

  var $ = cb.$;

  // Data matching the mobile app specifications:
  // 1. Own Account Transfer: Min 50.00, Max 1000000.00, Day 1000000.00, Count 5
  // 2. Within CZB Account Transfer: Min 50.00, Max 1000000.00, Day 1000000.00, Count 5
  // 3. Other Bank Fund Transfer: Min 50.00, Max 1000000.00, Day 1000000.00, Count 5
  // 4. Bills Pay: Min 20.00, Max 1000000.00, Day 1000000.00, Count 5
  // Plus digital services: MFS & Mobile Recharge
  var LIMITS = [
    {
      title: "Own Account Transfer",
      min: "50.00",
      max: "1000000.00",
      day: "1000000.00",
      dayNum: 1000000,
      cnt: "5",
      used: 150000,
      href: "fund-transfer-own.html",
      actionText: "Transfer"
    },
    {
      title: "Within CZB Account Transfer",
      min: "50.00",
      max: "1000000.00",
      day: "1000000.00",
      dayNum: 1000000,
      cnt: "5",
      used: 0,
      href: "fund-transfer.html",
      actionText: "Transfer"
    },
    {
      title: "Other Bank Fund Transfer",
      min: "50.00",
      max: "1000000.00",
      day: "1000000.00",
      dayNum: 1000000,
      cnt: "5",
      used: 0,
      href: "fund-transfer-other.html",
      actionText: "Transfer"
    },
    {
      title: "Bills Pay",
      min: "20.00",
      max: "1000000.00",
      day: "1000000.00",
      dayNum: 1000000,
      cnt: "5",
      used: 12840,
      href: "bill-pay.html",
      actionText: "Pay"
    },
    {
      title: "MFS Transfer",
      min: "50.00",
      max: "30000.00",
      day: "50000.00",
      dayNum: 50000,
      cnt: "10",
      used: 15000,
      href: "fund-transfer.html",
      actionText: "Transfer"
    },
    {
      title: "Mobile Recharge",
      min: "10.00",
      max: "5000.00",
      day: "20000.00",
      dayNum: 20000,
      cnt: "20",
      used: 800,
      href: "recharge.html",
      actionText: "Recharge"
    }
  ];

  function fmtMoney(num) {
    return "৳" + Number(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render() {
    var grid = $("#lmtGrid");
    if (!grid) return;

    var totalUsed = 0;
    var totalDaily = 1000000;

    grid.innerHTML = LIMITS.map(function (it) {
      if (it.dayNum === 1000000) totalUsed += it.used;
      var remain = Math.max(0, it.dayNum - it.used);
      var pct = Math.min(100, Math.round((it.used / it.dayNum) * 100));

      return '<article class="lmt-card">' +
        '<div class="lmt-card-banner">' +
          '<h3>' + it.title + '</h3>' +
          '<span class="lmt-banner-pill">' + it.cnt + ' Txns / Day</span>' +
        '</div>' +
        '<div class="lmt-card-rows">' +
          '<div class="lmt-row">' +
            '<span class="lmt-row-label">Minimum Transaction Limit</span>' +
            '<b class="lmt-row-val">' + Number(it.min).toFixed(2) + '</b>' +
          '</div>' +
          '<div class="lmt-row">' +
            '<span class="lmt-row-label">Maximum Transaction Limit</span>' +
            '<b class="lmt-row-val">' + Number(it.max).toFixed(2) + '</b>' +
          '</div>' +
          '<div class="lmt-row">' +
            '<span class="lmt-row-label">Day Transaction Limit</span>' +
            '<b class="lmt-row-val">' + Number(it.day).toFixed(2) + '</b>' +
          '</div>' +
          '<div class="lmt-row">' +
            '<span class="lmt-row-label">No. of Transaction Per Day</span>' +
            '<b class="lmt-row-val">' + it.cnt + '</b>' +
          '</div>' +
        '</div>' +
        '<div class="lmt-card-foot">' +
          '<div class="lmt-foot-usage">' +
            '<div class="lmt-foot-lbl">' +
              '<span>Used: <b>৳' + it.used.toLocaleString() + '</b></span>' +
              '<span>Left: <b>৳' + remain.toLocaleString() + '</b></span>' +
            '</div>' +
            '<div class="lmt-mini-track"><i style="width:' + pct + '%"></i></div>' +
          '</div>' +
          '<a href="' + it.href + '" class="lmt-btn-act">' + it.actionText + '</a>' +
        '</div>' +
      '</article>';
    }).join("");

    var stripUsed = $("#stripUsed");
    var stripAvail = $("#stripAvailable");
    if (stripUsed) stripUsed.textContent = fmtMoney(totalUsed);
    if (stripAvail) stripAvail.textContent = fmtMoney(Math.max(0, totalDaily - totalUsed));
  }

  render();
})();
