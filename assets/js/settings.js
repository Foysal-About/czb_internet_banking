/* Settings hub (spec section 18): profile card, searchable settings, appearance, language, security prefs, log out. */
(function () {
  "use strict";
  var $ = cb.$, $$ = cb.$$, u = (window.CB_DATA || {}).user || {};
  var root = document.documentElement;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var photo = get("cb-photo", "");
  var avatar = function (cls) { return '<span class="avatar ' + cls + '">' + (photo ? '<img alt="" src="' + photo + '">' : cb.esc(u.initials || "C")) + "</span>"; };

  $("#setHero").innerHTML = avatar("xl") +
    '<div class="set-hero-t"><h2>' + cb.esc(u.fullName) + "</h2><p>User ID : " + cb.esc(u.userId) + "</p><small>" + cb.icon("clock", 13) + "Last login " + cb.esc(u.lastLogin) + "</small></div>" +
    '<a class="btn-gold" href="profile.html">' + cb.icon("idCard", 16) + "My Profile</a>";

  // ---------- searchable list ----------
  var unread = cb.NOTIFS.filter(function (n) { return n[6]; }).length;
  var GROUPS = [
    ["Account", [
      ["idCard", "My Profile", "Personal details and profile photo", "profile.html", "profile photo name nid address email"]
    ]],
    ["Log in", [
      ["key", "Change Password", "Update your login password", "change-password.html", "password login security"],
      ["lock", "TPIN Recovery", "Reset your transaction PIN", "tpin-recovery.html", "tpin pin forgot recovery"]
    ]],
    ["General", [
      ["gauge", "Transaction Limit", "Daily and per-transaction limits", "limits.html", "limit limits daily"],
      ["bell", "Notification", "Alerts and messages from the bank", "notifications.html", "notification alerts inbox", unread ? String(unread) : ""],
      ["monitor", "Linked Device", "Devices that can access your account", "linked-devices.html", "device devices browser", "3"],
      ["activity", "Activity Log", "Recent sign-ins and transactions", "activity-log.html", "activity log history login"]
    ]]
  ];
  var list = $("#setList");
  list.innerHTML = GROUPS.map(function (g) {
    return '<div class="set-block"><div class="set-group">' + g[0] + "</div>" + g[1].map(function (r) {
      return '<a class="list-row" href="' + r[3] + '" data-k="' + (r[1] + " " + r[2] + " " + r[4]).toLowerCase() + '"><span class="lr-ic">' + cb.icon(r[0]) + '</span><span class="lr-t"><b>' + r[1] + "</b><small>" + r[2] + "</small></span>" +
        (r[5] ? '<span class="lr-r"><span class="count-pill">' + r[5] + "</span></span>" : "") + cb.icon("chevR", 18) + "</a>";
    }).join("") + "</div>";
  }).join("");
  $("#setSearch").addEventListener("input", function () {
    var q = this.value.trim().toLowerCase(), any = false;
    $$(".set-block", list).forEach(function (b) {
      var vis = 0;
      $$(".list-row", b).forEach(function (r) { var m = !q || r.dataset.k.indexOf(q) > -1; r.hidden = !m; if (m) vis++; });
      b.hidden = !vis; if (vis) any = true;
    });
    $("#setEmpty").hidden = any;
  });

  // ---------- side column ----------
  var theme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  $("#setSide").innerHTML =
    '<section class="card list-card"><div class="set-card-head"><h2>Appearance</h2></div><div class="set-theme" role="radiogroup" aria-label="Appearance">' +
      [["light", "sun", "Light"], ["dark", "moon", "Dark"]].map(function (t) {
        return '<label><input type="radio" name="theme" value="' + t[0] + '"' + (theme === t[0] ? " checked" : "") + '><span class="th-swatch ' + t[0] + '"><i></i><i></i></span><span class="th-l">' + cb.icon(t[1], 15) + t[2] + "</span></label>";
      }).join("") + "</div></section>" +
    '<section class="card list-card"><div class="set-card-head"><h2>Language</h2></div>' +
      '<div class="list-row static lang-row"><span class="lr-ic">' + cb.icon("globe") + '</span><span class="lr-t"><b>Display language</b><small>Applies across the portal</small></span>' +
      '<div class="seg" id="langSeg"><button type="button" data-l="en" class="' + (cb.lang !== "bn" ? "on" : "") + '">English</button><button type="button" data-l="bn" class="' + (cb.lang === "bn" ? "on" : "") + '">বাংলা</button></div></div></section>' +
    '<section class="card list-card"><button class="list-row danger" type="button" data-logout><span class="lr-ic">' + cb.icon("logout") + '</span><span class="lr-t"><b>Log Out</b><small>Sign out of this device</small></span></button></section>';

  $$('input[name="theme"]').forEach(function (r) {
    r.addEventListener("change", function () { root.setAttribute("data-theme", r.value); set("citizens-theme", r.value); });
  });
  new MutationObserver(function () {
    var t = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    $$('input[name="theme"]').forEach(function (r) { r.checked = r.value === t; });
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  $$("#langSeg button").forEach(function (b) { b.addEventListener("click", function () { if (b.dataset.l !== cb.lang) cb.setLang(b.dataset.l); }); });
})();
