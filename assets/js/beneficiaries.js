/* Beneficiary screen (Mobile App aligned)
   - Top search bar & category pills (CZB, Other Bank, MFS)
   - Watermark background
   - FAVOURITES horizontal track with pastel avatar bubbles & gold star badge
   - Person outline avatar list with ACC **XXXX | CHANNELS subtitle
   - Direct one-click star toggle & kebab menu (Send Money, Edit Nickname, Delete)
   Design-only (no external API). */
(function () {
  var $ = cb.$, $$ = cb.$$, esc = cb.esc;
  var KEY = "citizens-ben-state-v2";
  var TYPE_GROUP = { own: 1, other: 2, mfs: 3, card: 2 };
  var GROUP_TITLES = { 1: "CZB", 2: "OTHER BANK", 3: "MFS" };

  var STAR_FILLED = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>';
  var STAR_OUTLINE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>';
  var PERSON_IC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
  var KEBAB_IC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';

  // Curated pastel palettes matching the mobile design (Foysal -> Mint, Salma -> Lavender)
  var FAV_PALETTES = {
    F: { bg: "#d1fae5", color: "#059669" }, // Mint Green
    S: { bg: "#ede9fe", color: "#7c3aed" }, // Lavender
    N: { bg: "#e0f2fe", color: "#0284c7" }, // Sky Blue
    M: { bg: "#ffedd5", color: "#ea580c" }, // Soft Peach
    A: { bg: "#fce7f3", color: "#db2777" }, // Soft Rose
    R: { bg: "#fef3c7", color: "#d97706" }, // Soft Amber
    K: { bg: "#ccfbf1", color: "#0d9488" }  // Teal
  };
  var PASTELS = [
    { bg: "#d1fae5", color: "#059669" },
    { bg: "#ede9fe", color: "#7c3aed" },
    { bg: "#ffedd5", color: "#ea580c" },
    { bg: "#e0f2fe", color: "#0284c7" },
    { bg: "#fce7f3", color: "#db2777" },
    { bg: "#fef3c7", color: "#d97706" },
    { bg: "#ccfbf1", color: "#0d9488" }
  ];
  function getPastel(name) {
    var initial = String(name || "").trim().charAt(0).toUpperCase();
    if (FAV_PALETTES[initial]) return FAV_PALETTES[initial];
    var h = 0;
    String(name).split("").forEach(function (c) { h = (h + c.charCodeAt(0)) % PASTELS.length; });
    return PASTELS[h];
  }

  // Base list from dummy data + legacy added
  var list = (CB_DATA.beneficiaries || []).map(function (b) { return Object.assign({}, b); });
  try {
    var added = JSON.parse(localStorage.getItem("citizens-beneficiaries")) || [];
    added.filter(function (b) { return b.fresh; }).forEach(function (b, i) {
      var parts = String(b.sub || "").split(" · ");
      var g = TYPE_GROUP[b.type] || 2;
      list.push({ id: "n" + i, group: g, name: b.name, nick: b.nick || "", acc: parts[parts.length - 1], bank: g === 1 ? "Citizens Bank" : parts[0], types: g === 1 ? ["NPSB", "RTGS", "BEFTN"] : g === 3 ? ["MFS"] : ["EFT", "NPSB"], fav: false, card: b.kind === "card" || b.type === "card" });
    });
  } catch (e) {}

  // Persisted edits (favourite / nickname / deleted)
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  list = list.filter(function (b) { return !(state[b.id] && state[b.id].del); });
  list.forEach(function (b) {
    var s = state[b.id];
    if (s) {
      if ("fav" in s) b.fav = s.fav;
      if ("nick" in s) b.nick = s.nick;
    }
  });

  function save(id, patch) {
    state[id] = Object.assign(state[id] || {}, patch);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var group = 1, q = "";
  var body = $("#bnBody");

  function label(b) { return b.nick || b.name; }

  function subText(b) {
    var masked = cb.mask(b.acc);
    if (b.group === 3 || b.mfs) {
      var m = (b.bank || b.mfs || "MFS").toUpperCase();
      return masked + " | " + m;
    }
    var rails = [];
    if (b.types && b.types.length) {
      b.types.forEach(function (x) {
        if (x === "OWNBANKOTHERACC") { rails.push("NPSB", "RTGS", "BEFTN"); }
        else if (x === "NPSBA2C") { rails.push("NPSB"); }
        else if (x === "ITCLBKASH") { rails.push("BKASH"); }
        else if (x === "EFT") { rails.push("BEFTN"); }
        else { rails.push(String(x).toUpperCase()); }
      });
    }
    if (!rails.length) rails = ["NPSB", "RTGS", "BEFTN"];
    var uniq = [];
    rails.forEach(function (r) { if (uniq.indexOf(r) === -1) uniq.push(r); });
    return masked + " | " + uniq.join(" | ");
  }

  function favBubble(b) {
    var display = label(b);
    var initial = display.charAt(0).toUpperCase();
    var p = getPastel(display);
    return '<button type="button" class="bn-fav-item" data-fav-id="' + b.id + '" aria-label="' + esc(display) + '">' +
      '<div class="bn-fav-bubble-wrap">' +
        '<div class="bn-fav-bubble" style="background:' + p.bg + ';color:' + p.color + '">' + esc(initial) + '</div>' +
        '<span class="bn-fav-star-badge" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.2 6 20.5l1.3-6.7-5-4.7 6.8-.9z"/></svg>' +
        '</span>' +
      '</div>' +
      '<span class="bn-fav-name">' + esc(display) + '</span>' +
    '</button>';
  }

  function row(b) {
    var displayName = label(b).toUpperCase();
    return '<div class="bn-row" data-id="' + b.id + '">' +
      '<div class="bn-person-av">' + PERSON_IC + '</div>' +
      '<div class="bn-t">' +
        '<div class="bn-t-name">' + esc(displayName) + '</div>' +
        '<div class="bn-t-sub">' + esc(subText(b)) + '</div>' +
      '</div>' +
      '<div class="bn-row-actions">' +
        '<button type="button" class="bn-star-btn' + (b.fav ? ' is-fav' : '') + '" data-act="fav" aria-label="' + (b.fav ? 'Remove from favourites' : 'Mark as favourite') + '">' +
          (b.fav ? STAR_FILLED : STAR_OUTLINE) +
        '</button>' +
        '<div class="bn-kebab">' +
          '<button type="button" aria-haspopup="menu" aria-expanded="false" aria-label="More actions for ' + esc(label(b)) + '">' + KEBAB_IC + '</button>' +
          '<div class="bn-menu" role="menu">' +
            '<a href="fund-transfer.html?beneficiary=' + encodeURIComponent(b.id) + '">' + cb.icon("send", 16) + 'Send Money</a>' +
            '<button type="button" role="menuitem" data-act="edit">' + cb.icon("pencil", 16) + 'Edit Nickname</button>' +
            '<button type="button" role="menuitem" data-act="del" class="danger">' + cb.icon("trash", 16) + 'Delete Beneficiary</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var all = list.filter(function (b) { return b.group === group; });
    var needle = q.trim().toLowerCase().replace(/\s+/g, " ");
    var shown = all.filter(function (b) {
      if (!needle) return true;
      var str = (b.nick + " " + b.name + " " + b.acc.replace(/\s/g, "") + " " + b.acc + " " + (b.bank || "")).toLowerCase();
      return str.indexOf(needle) > -1;
    });

    if (!all.length) {
      body.innerHTML = '<div class="bn-empty"><div class="bn-empty-ic">' + cb.icon("users", 26) + '</div><b>No Beneficiary added</b><p>You have no saved beneficiaries in ' + esc(GROUP_TITLES[group]) + '.</p></div>';
      return;
    }

    if (!shown.length) {
      body.innerHTML = '<div class="bn-empty"><div class="bn-empty-ic">' + cb.icon("search", 26) + '</div><b>No beneficiary matches your search</b><p>Check the spelling or try searching by account number.</p><button type="button" class="btn btn-sm btn-sec" id="bnClearSearch">Clear search</button></div>';
      return;
    }

    var fav = shown.filter(function (b) { return b.fav; });
    var h = "";

    // FAVOURITES Track (if any favourites in the filtered group)
    if (fav.length) {
      h += '<div class="bn-sec">' +
        '<div class="bn-sec-label">FAVOURITES</div>' +
        '<div class="bn-fav-track">' + fav.map(favBubble).join("") + '</div>' +
      '</div>';
    }

    // Active Category Group List
    h += '<div class="bn-sec">' +
      '<div class="bn-sec-label">' + esc(GROUP_TITLES[group] || "BENEFICIARIES") + '</div>' +
      '<div class="bn-list">' + shown.map(row).join("") + '</div>' +
    '</div>';

    body.innerHTML = h;
  }

  function closeMenus() {
    $$(".bn-kebab.open").forEach(function (k) {
      k.classList.remove("open");
      k.firstElementChild.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("click", function (e) { if (!e.target.closest(".bn-kebab")) closeMenus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });

  function byId(id) {
    return list.filter(function (b) { return b.id === id; })[0];
  }

  function edit(b) {
    var accLabel = b.group === 3 ? "Wallet Number" : b.card ? "Card Number" : "Account Number";
    var holderName = (b.name || "").toUpperCase();
    var currentNick = b.nick || b.name || "";

    cb.dialog({
      title: "Edit Beneficiary",
      icon: "pencil",
      size: "sm",
      html: '<div class="bn-edit">' +
        '<p class="bn-edit-note">Only the nickname can be changed</p>' +
        '<div class="bn-edit-field">' +
          '<label>' + accLabel + '</label>' +
          '<input type="text" class="bn-edit-box is-ro" value="' + esc(b.acc) + '" readonly disabled tabindex="-1">' +
        '</div>' +
        '<div class="bn-edit-field">' +
          '<label>Account Holder Name</label>' +
          '<input type="text" class="bn-edit-box is-ro" value="' + esc(holderName) + '" readonly disabled tabindex="-1">' +
        '</div>' +
        '<div class="bn-edit-field">' +
          '<label for="bnNick">Nickname</label>' +
          '<input id="bnNick" type="text" class="bn-edit-box is-edit" maxlength="30" value="' + esc(currentNick) + '" placeholder="Enter nickname" autocomplete="off">' +
        '</div>' +
      '</div>',
      buttons: [
        { text: "Cancel", value: false },
        {
          text: "Update",
          primary: true,
          onClick: function (api) {
            var v = $("#bnNick", api.el).value.trim();
            b.nick = v;
            save(b.id, { nick: v });
            render();
            setTimeout(function () {
              cb.done({ title: "Beneficiary Updated", message: "Nickname for " + esc(b.name) + " has been updated." });
            }, 220);
          }
        }
      ]
    });
    setTimeout(function () {
      var inp = $("#bnNick");
      if (inp) { inp.focus(); inp.select(); }
    }, 120);
  }

  body.addEventListener("click", function (e) {
    // Favorite bubble click -> scroll to and highlight row
    var fv = e.target.closest("[data-fav-id]");
    if (fv) {
      var targetRow = $('.bn-row[data-id="' + fv.dataset.favId + '"]');
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
        targetRow.classList.add("bn-row-highlight");
        setTimeout(function () { targetRow.classList.remove("bn-row-highlight"); }, 1000);
      }
      return;
    }

    // Clear search button in empty state
    var clr = e.target.closest("#bnClearSearch");
    if (clr) {
      q = "";
      var inp = $("#bnSearch");
      if (inp) inp.value = "";
      render();
      return;
    }

    // Kebab toggle
    var kb = e.target.closest(".bn-kebab > button");
    if (kb) {
      var k = kb.parentElement, was = k.classList.contains("open");
      closeMenus();
      if (!was) {
        k.classList.add("open");
        kb.setAttribute("aria-expanded", "true");
        k.classList.toggle("up", kb.getBoundingClientRect().bottom + 190 > window.innerHeight);
      }
      return;
    }

    // Action button (star or menu items)
    var a = e.target.closest("[data-act]");
    if (!a) return;
    var r = a.closest(".bn-row"), b = r ? byId(r.dataset.id) : null;
    if (!b) return;

    closeMenus();

    if (a.dataset.act === "fav") {
      b.fav = !b.fav;
      save(b.id, { fav: b.fav });
      render();
      cb.toast(b.fav ? "Added to favourites" : "Removed from favourites", "success");
    } else if (a.dataset.act === "edit") {
      edit(b);
    } else if (a.dataset.act === "del") {
      cb.confirm({
        title: "Delete beneficiary",
        message: "Remove " + esc(label(b)) + " from your beneficiaries?",
        ok: "Remove",
        danger: true
      }).then(function (ok) {
        if (!ok) return;
        list = list.filter(function (x) { return x.id !== b.id; });
        save(b.id, { del: true });
        render();
        cb.toast("Beneficiary removed", "success");
      });
    }
  });

  // Category filter pills
  var tabs = $("#bnTabs");
  if (tabs) {
    tabs.addEventListener("click", function (e) {
      var t = e.target.closest("[data-g]");
      if (!t) return;
      group = +t.dataset.g;
      $$("#bnTabs .bn-pill").forEach(function (x) {
        var on = x === t;
        x.classList.toggle("on", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      render();
    });
  }

  // Search input
  var sInp = $("#bnSearch");
  if (sInp) {
    sInp.addEventListener("input", function (e) {
      q = e.target.value;
      render();
    });
  }

  render();
})();
