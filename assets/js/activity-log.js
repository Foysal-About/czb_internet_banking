/* Activity log (spec section 18): 10 rows then See more (+10). */
(function () {
  "use strict";
  var $ = cb.$;
  var PAGE = 10;
  // [title, type, channel, hours ago, ip, amount]
  var RAW = [
    ["Login successful", "Login", "IBU", 1, "103.114.22.18"],
    ["Fund transfer to Farhana Akter", "Fund Transfer", "IBU", 3, "103.114.22.18", 1500],
    ["Mobile recharge 01711234567", "Recharge", "MOB", 20, "10.20.4.77", 100],
    ["Login successful", "Login", "MOB", 21, "10.20.4.77"],
    ["Bill payment DESCO", "Bill Payment", "IBU", 52, "103.114.22.18", 1840],
    ["Login failed: wrong password", "Login Failed", "WEB", 75, "182.160.97.4"],
    ["Login failed: wrong password", "Login Failed", "WEB", 75.1, "182.160.97.4"],
    ["Account locked after failed attempts", "Account Locked", "WEB", 75.2, "182.160.97.4"],
    ["Beneficiary added: Sumi Akter", "Beneficiary", "IBU", 100, "103.114.22.18"],
    ["Logout", "Logout", "IBU", 101, "103.114.22.18"],
    ["Fund transfer to Anoy Islam", "Fund Transfer", "MOB", 130, "10.20.4.77", 5000],
    ["Login successful", "Login", "IBU", 131, "103.114.22.18"],
    ["Password changed", "Password Change", "IBU", 200, "103.114.22.18"],
    ["Bill payment Link3 Internet", "Bill Payment", "MOB", 220, "10.20.4.77", 1500],
    ["TPIN blocked: too many attempts", "TPIN Blocked", "MOB", 250, "10.20.4.77"],
    ["Login successful", "Login", "MOB", 251, "10.20.4.77"],
    ["Mobile recharge 01819876543", "Recharge", "IBU", 300, "103.114.22.18", 200],
    ["Fund transfer to Mahmudul Hasan", "Fund Transfer", "IBU", 330, "103.114.22.18", 25000],
    ["Logout", "Logout", "MOB", 340, "10.20.4.77"],
    ["Login successful", "Login", "IBU", 341, "103.114.22.18"],
    ["Bill payment Titas Gas", "Bill Payment", "IBU", 400, "103.114.22.18", 960],
    ["Login failed: user not recognised", "Login Failed", "WEB", 460, "45.64.133.90"],
    ["Fund transfer to Own Account", "Fund Transfer", "MOB", 500, "10.20.4.77", 10000],
    ["Login successful", "Login", "MOB", 501, "10.20.4.77"],
    ["Mobile recharge 01711234567", "Recharge", "MOB", 560, "10.20.4.77", 100],
    ["Logout", "Logout", "IBU", 600, "103.114.22.18"],
    ["Login successful", "Login", "IBU", 601, "103.114.22.18"],
    ["Bill payment DESCO", "Bill Payment", "MOB", 700, "10.20.4.77", 1720],
    ["Fund transfer to Kamal Traders", "Fund Transfer", "IBU", 760, "103.114.22.18", 42000],
    ["Login successful", "Login", "IBU", 761, "103.114.22.18"],
    ["Account locked by customer request", "Account Locked", "MOB", 840, "10.20.4.77"],
    ["Login successful", "Login", "MOB", 900, "10.20.4.77"],
    ["Fund transfer to bKash Rahima Begum", "Fund Transfer", "MOB", 960, "10.20.4.77", 3000],
    ["Logout", "Logout", "IBU", 1000, "103.114.22.18"],
    ["Login successful", "Login", "IBU", 1001, "103.114.22.18"],
    ["Mobile recharge 01912445566", "Recharge", "IBU", 1100, "103.114.22.18", 50],
    ["Bill payment Link3 Internet", "Bill Payment", "IBU", 1180, "103.114.22.18", 1500],
    ["Login failed: wrong password", "Login Failed", "WEB", 1250, "182.160.97.4"],
    ["Login successful", "Login", "MOB", 1300, "10.20.4.77"],
    ["Fund transfer to Nusrat Jahan", "Fund Transfer", "IBU", 1400, "103.114.22.18", 7500],
    ["Logout", "Logout", "MOB", 1450, "10.20.4.77"],
    ["Login successful", "Login", "MOB", 1451, "10.20.4.77"],
    ["Bill payment DESCO", "Bill Payment", "IBU", 1560, "103.114.22.18", 1640],
    ["Mobile recharge 01711234567", "Recharge", "MOB", 1700, "10.20.4.77", 100],
    ["Login successful", "Login", "IBU", 1800, "103.114.22.18"]
  ];
  var NOW = new Date(2026, 9, 1, 15, 14).getTime();
  var rows = RAW.map(function (r) { return { title: r[0], type: r[1], ch: r[2], at: new Date(NOW - r[3] * 3600000), ip: r[4], amt: r[5] }; });
  function p2(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
  function stamp(d) { return ymd(d) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function tone(r) { return /fail|block|lock|logout/i.test(r.type) ? "fail" : /login|transfer|payment|recharge/i.test(r.type) ? "ok" : ""; }

  var shown = PAGE;

  function render() {
    var all = rows, vis = all.slice(0, shown);
    $("#alCount").textContent = all.length + (all.length === 1 ? " activity" : " activities");
    $("#alList").innerHTML = vis.map(function (r) {
      var t = tone(r);
      return '<div class="al-row"><span class="al-ic ' + (t === "fail" ? "bad" : t === "ok" ? "good" : "neutral") + '" title="' + (r.ch === "MOB" ? "Mobile app" : "Internet banking") + '">' + cb.icon(r.ch === "MOB" ? "smartphone" : "monitor", 18) + "</span>" +
        '<div class="al-t"><b>' + cb.esc(r.title) + '<span class="al-ch">' + r.ch + "</span></b><small>IP " + r.ip + (r.amt ? ' · <span class="amt">' + cb.fmt(r.amt) + "</span>" : "") + "</small></div>" +
        '<span class="chip ' + (t || "plain") + '">' + cb.esc(r.type) + '</span><span class="al-d">' + stamp(r.at) + "</span></div>";
    }).join("");
    $("#alEmpty").hidden = all.length > 0;
    $("#alMore").hidden = !all.length;
    $("#alMoreBtn").hidden = shown >= all.length;
    $("#alShown").textContent = "Showing " + Math.min(shown, all.length) + " of " + all.length;
  }
  $("#alMoreBtn").addEventListener("click", function () { shown += PAGE; render(); });
  render();
})();
