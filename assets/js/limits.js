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
      cnt: "5"
    },
    {
      title: "Within CZB Account Transfer",
      min: "50.00",
      max: "1000000.00",
      day: "1000000.00",
      cnt: "5"
    },
    {
      title: "Other Bank Fund Transfer",
      min: "50.00",
      max: "1000000.00",
      day: "1000000.00",
      cnt: "5"
    },
    {
      title: "Bills Pay",
      min: "20.00",
      max: "1000000.00",
      day: "1000000.00",
      cnt: "5"
    },
    {
      title: "MFS Transfer",
      min: "50.00",
      max: "30000.00",
      day: "50000.00",
      cnt: "10"
    },
    {
      title: "Mobile Recharge",
      min: "10.00",
      max: "5000.00",
      day: "20000.00",
      cnt: "20"
    }
  ];

  function render() {
    var grid = $("#lmtGrid");
    if (!grid) return;

    grid.innerHTML = LIMITS.map(function (it) {
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
      '</article>';
    }).join("");
  }

  render();
})();
