/* Beneficiary list (spec section 10): tabs per group, search, favourites, row menu. Design-only. */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc;
  var KEY = "citizens-ben-state";
  var TYPE_GROUP = { own: 1, other: 2, mfs: 3, card: 2 };

  // base list from dummy data + anything just added on beneficiary-add.html
  var list = (CB_DATA.beneficiaries || []).map(function (b) { return Object.assign({}, b); });
  try {
    var added = JSON.parse(localStorage.getItem("citizens-beneficiaries")) || [];
    added.filter(function (b) { return b.fresh; }).forEach(function (b, i) {
      var parts = String(b.sub || "").split(" · ");
      var g = TYPE_GROUP[b.type] || 2;
      list.push({ id: "n" + i, group: g, name: b.name, nick: b.nick || "", acc: parts[parts.length - 1], bank: g === 1 ? "Citizens Bank" : parts[0], types: g === 1 ? ["OWNBANKOTHERACC"] : g === 3 ? ["MFS"] : ["EFT", "NPSB"], fav: false, card: b.kind === "card" || b.type === "card" });
    });
  } catch (e) {}
  // persisted edits (favourite / nickname / deleted)
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  list = list.filter(function (b) { return !(state[b.id] && state[b.id].del); });
  list.forEach(function (b) { var s = state[b.id]; if (s) { if ("fav" in s) b.fav = s.fav; if ("nick" in s) b.nick = s.nick; } });
  function save(id, patch) { state[id] = Object.assign(state[id] || {}, patch); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var group = 1, q = "";
  var body = $("#bnBody");

  function accText(b) { return b.card || b.group === 3 ? b.acc : cb.mask(b.acc); }
  function label(b) { return b.nick || b.name; }
  function typeText(b) {
    var t = b.group === 1 ? ["Own Bank"] : b.types.map(function (x) { return x === "NPSBA2C" ? "NPSB" : x === "ITCLBKASH" ? "bKash" : x; });
    return [accText(b)].concat(t).join(" | ");
  }
  function row(b) {
    var color = b.mfs ? "var(--mfs-" + b.mfs + ")" : cb.avatarColor(b.name);
    return '<div class="bn-row" data-id="' + b.id + '">' +
      '<span class="bn-av" style="background:' + color + '">' + esc(cb.initials(b.name)) + "</span>" +
      '<div class="bn-t"><b><span>' + esc(label(b)) + "</span>" + (b.fav ? cb.icon("star", 14, 2) : "") + "</b><small>" + (b.nick ? esc(b.name) + " · " : "") + esc(typeText(b)) + '</small><small class="bn-bank">' + esc(b.bank) + (b.branch ? " · " + esc(b.branch) : "") + "</small></div>" +
      '<button type="button" class="btn-ghost btn-sm bn-go" data-act="go" aria-label="Transfer to ' + esc(label(b)) + '">' + cb.icon("send", 15) + " <span>Transfer</span></button>" +
      '<div class="bn-kebab"><button type="button" aria-haspopup="menu" aria-expanded="false" aria-label="More actions for ' + esc(label(b)) + '">' + cb.icon("dots", 18) + "</button>" +
      '<div class="bn-menu" role="menu">' +
      '<button type="button" role="menuitem" data-act="fav">' + cb.icon("star", 16) + (b.fav ? "Remove from favourites" : "Mark as favourite") + "</button>" +
      '<button type="button" role="menuitem" data-act="edit">' + cb.icon("pencil", 16) + "Edit</button>" +
      '<button type="button" role="menuitem" data-act="del" class="danger">' + cb.icon("trash", 16) + "Delete</button></div></div></div>";
  }
  function render() {
    [1, 2, 3].forEach(function (g) { $('.bn-count[data-c="' + g + '"]').textContent = list.filter(function (b) { return b.group === g; }).length; });
    var all = list.filter(function (b) { return b.group === group; });
    var needle = q.trim().toLowerCase().replace(/\s+/g, " ");
    var shown = all.filter(function (b) { return !needle || (b.nick + " " + b.name + " " + b.acc.replace(/\s/g, "") + " " + b.acc).toLowerCase().indexOf(needle) > -1; });
    $("#bnSearch").closest(".search-in").style.display = all.length ? "" : "none";
    if (!all.length) {
      body.innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon("users", 26) + "</div><b>No Beneficiary is added</b><p>Save people you pay often so transfers take a few taps.</p><a class=\"btn-pri btn-sm\" href=\"beneficiary-add.html\" style=\"display:inline-flex;text-decoration:none\">Add Beneficiary</a></div>";
      return;
    }
    if (!shown.length) { body.innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon("search", 26) + "</div><b>No beneficiary matches your search</b><p>Check the spelling or try the account number.</p></div>"; return; }
    var fav = shown.filter(function (b) { return b.fav; }), rest = shown.filter(function (b) { return !b.fav; });
    var h = "";
    if (fav.length) h += '<section class="bn-sec"><div class="bn-sec-h">' + cb.icon("star", 14, 2) + "Favourites</div>" + fav.map(row).join("") + "</section>";
    if (rest.length) h += '<section class="bn-sec">' + (fav.length ? '<div class="bn-sec-h">All beneficiaries</div>' : "") + rest.map(row).join("") + "</section>";
    body.innerHTML = h;
  }

  function closeMenus() { $$(".bn-kebab.open").forEach(function (k) { k.classList.remove("open"); k.firstElementChild.setAttribute("aria-expanded", "false"); }); }
  document.addEventListener("click", function (e) { if (!e.target.closest(".bn-kebab")) closeMenus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });

  function byId(id) { return list.filter(function (b) { return b.id === id; })[0]; }
  function edit(b) {
    var kv = [["Account holder", b.name], [b.group === 3 ? "Wallet number" : b.card ? "Card number" : "Account number", b.acc], [b.group === 3 ? "Wallet" : "Bank", b.bank]];
    if (b.branch) kv.push(["Branch", b.branch]);
    cb.dialog({
      title: "Edit Beneficiary", icon: "pencil", size: "sm",
      html: '<div class="bn-edit"><p class="muted" style="margin-bottom:12px">Only the nickname can be changed.</p><dl class="kv">' + kv.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + '</dl><div class="fld"><label for="bnNick">Nickname <i>Optional</i></label><input id="bnNick" maxlength="25" value="' + esc(b.nick) + '" placeholder="e.g. Brother, Landlord"></div></div>',
      buttons: [{ text: "Cancel", value: false }, {
        text: "Update", primary: true, onClick: function (api) {
          var v = $("#bnNick", api.el).value.trim();
          b.nick = v; save(b.id, { nick: v }); render();
          setTimeout(function () { cb.done({ title: "Beneficiary Updated", message: "Your changes to " + esc(label(b)) + " have been saved." }); }, 220);
        }
      }]
    });
  }

  body.addEventListener("click", function (e) {
    var kb = e.target.closest(".bn-kebab > button");
    if (kb) {
      var k = kb.parentElement, was = k.classList.contains("open"); closeMenus();
      if (!was) { k.classList.add("open"); kb.setAttribute("aria-expanded", "true"); k.classList.toggle("up", kb.getBoundingClientRect().bottom + 180 > window.innerHeight); }
      return;
    }
    var a = e.target.closest("[data-act]"); if (!a) return;
    var r = a.closest(".bn-row"), b = byId(r.dataset.id); if (!b) return;
    closeMenus();
    if (a.dataset.act === "go") { location.href = (b.group === 1 ? "fund-transfer-own.html" : "fund-transfer-other.html") + "?beneficiary=" + encodeURIComponent(b.id); }
    else if (a.dataset.act === "fav") { b.fav = !b.fav; save(b.id, { fav: b.fav }); render(); cb.toast(b.fav ? "Added to favourites" : "Removed from favourites", "success"); }
    else if (a.dataset.act === "edit") edit(b);
    else if (a.dataset.act === "del") {
      cb.confirm({ title: "Delete beneficiary", message: "Remove " + esc(label(b)) + " from your beneficiaries?", ok: "Remove", danger: true }).then(function (ok) {
        if (!ok) return;
        list = list.filter(function (x) { return x.id !== b.id; }); save(b.id, { del: true }); render(); cb.toast("Beneficiary removed", "success");
      });
    }
  });

  $("#bnTabs").addEventListener("click", function (e) {
    var t = e.target.closest("[data-g]"); if (!t) return;
    group = +t.dataset.g; q = ""; $("#bnSearch").value = "";
    $$("#bnTabs button").forEach(function (x) { x.classList.toggle("on", x === t); x.setAttribute("aria-selected", x === t); });
    render();
  });
  $("#bnSearch").addEventListener("input", function (e) { q = e.target.value; render(); });
  render();
})();
