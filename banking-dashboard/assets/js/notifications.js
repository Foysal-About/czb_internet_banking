/* Notifications page (spec section 18): shares cb.NOTIFS with the bell panel so both stay in sync. */
(function () {
  "use strict";
  var $ = cb.$, $$ = cb.$$, N = cb.NOTIFS, filter = "all";
  var list = $("#npList");

  function unreadCount() { return N.filter(function (n) { return n[6]; }).length; }
  // push NOTIFS state into the bell panel (its DOM mirrors NOTIFS order)
  function syncBell() {
    var items = $$("#notifList .n-item"), c = unreadCount();
    items.forEach(function (el, i) { if (N[i]) el.classList.toggle("unread", !!N[i][6]); });
    var badge = $("#notifCount"), mark = $("#notifMark"), nl = $("#notifList");
    if (badge) badge.textContent = c ? c : "";
    if (mark) mark.disabled = !c;
    if (nl) nl.classList.toggle("none-unread", !c);
  }
  // pull bell-panel clicks back into NOTIFS
  function pullBell() {
    $$("#notifList .n-item").forEach(function (el, i) { if (N[i]) N[i][6] = el.classList.contains("unread"); });
    render(false);
  }
  ["#notifList", "#notifMark"].forEach(function (s) { var e = $(s); if (e) e.addEventListener("click", function () { setTimeout(pullBell, 0); }); });

  function render(sync) {
    var c = unreadCount(), g = "", h = "", shown = 0;
    $("#npUnread").textContent = c; $("#npUnread").hidden = !c;
    $("#npMark").disabled = !c;
    N.forEach(function (n, i) {
      if (filter === "unread" && !n[6]) return;
      if (n[0] !== g) { g = n[0]; h += '<div class="n-group">' + g + "</div>"; }
      h += '<button type="button" class="n-item' + (n[6] ? " unread" : "") + '" data-i="' + i + '"><span class="n-icon ' + n[1] + '">' + cb.icon(n[2]) + '</span><span class="n-body"><b>' + n[3] + "</b><span>" + n[4] + "</span><time>" + n[5] + "</time></span></button>";
      shown++;
    });
    list.innerHTML = h; list.hidden = !shown;
    var empty = $("#npEmpty"); empty.hidden = !!shown;
    if (!shown) {
      var none = !N.length;
      $("#npEmptyT").textContent = none ? "No notifications yet" : "You're all caught up";
      $("#npEmptyP").textContent = none ? "We will let you know when something needs your attention." : "You have no unread notifications.";
    }
    if (sync !== false) syncBell();
  }
  list.addEventListener("click", function (e) {
    var b = e.target.closest(".n-item"); if (!b) return;
    var n = N[+b.dataset.i]; if (n && n[6]) { n[6] = false; render(); }
  });
  $("#npMark").addEventListener("click", function () {
    N.forEach(function (n) { n[6] = false; }); render(); cb.toast("All notifications marked as read", "success");
  });
  $$("#npTabs button").forEach(function (t) {
    t.addEventListener("click", function () {
      filter = t.dataset.f;
      $$("#npTabs button").forEach(function (x) { x.classList.toggle("on", x === t); x.setAttribute("aria-selected", x === t); });
      render(false);
    });
  });
  render();
})();
