/* Linked devices (spec section 18): "N active", remove with confirm, optimistic removal, toast. */
(function () {
  "use strict";
  var $ = cb.$;
  var devices = [
    { id: "d1", name: "Chrome on macOS", kind: "web", os: "Web browser", created: new Date(2026, 8, 12), current: true },
    { id: "d2", name: "Samsung Galaxy S23", kind: "mob", os: "Android 14", created: new Date(2026, 5, 3) },
    { id: "d3", name: "iPhone 14", kind: "mob", os: "iOS 18", created: new Date(2025, 10, 21) }
  ];
  var list = $("#dvList"), openMenu = null;

  function row(d) {
    return '<div class="list-row static dv-row" data-id="' + d.id + '"><span class="lr-ic ' + d.kind + '">' + cb.icon(d.kind === "web" ? "monitor" : "smartphone") + "</span>" +
      '<span class="lr-t"><b>' + cb.esc(d.name) + (d.current ? '<span class="dv-this">' + cb.icon("check", 11, 3) + "This browser</span>" : "") + "</b><small>" + d.os + " · Created " + cb.date(d.created) + "</small></span>" +
      (d.current ? "" : '<button class="dv-more" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Device options for ' + cb.esc(d.name) + '">' + cb.icon("dots", 18) + "</button>") + "</div>";
  }
  function render() {
    $("#dvCount").textContent = devices.length + " active";
    list.innerHTML = devices.length ? devices.map(row).join("") :
      '<div class="empty-state"><div class="es-ic">' + cb.icon("monitor", 24) + "</div><b>No linked devices</b><p>Devices you sign in on will appear here.</p></div>";
  }
  function closeMenu() { if (!openMenu) return; var b = $(".dv-more", openMenu.parentElement); if (b) b.setAttribute("aria-expanded", "false"); openMenu.remove(); openMenu = null; }

  list.addEventListener("click", function (e) {
    var btn = e.target.closest(".dv-more"); if (!btn) return;
    e.stopPropagation();
    var rowEl = btn.closest(".dv-row"), was = openMenu && openMenu.parentElement === rowEl;
    closeMenu(); if (was) return;
    var m = document.createElement("div"); m.className = "dv-menu"; m.setAttribute("role", "menu");
    m.innerHTML = '<button type="button" role="menuitem">' + cb.icon("trash", 16) + "Remove device</button>";
    rowEl.appendChild(m); openMenu = m; btn.setAttribute("aria-expanded", "true");
    $("button", m).addEventListener("click", function () { var id = rowEl.dataset.id; closeMenu(); remove(id); });
    $("button", m).focus();
  });
  document.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  function remove(id) {
    var d = devices.filter(function (x) { return x.id === id; })[0]; if (!d) return;
    cb.confirm({ title: "Remove device?", message: cb.esc(d.name) + " will be signed out and will need to log in again.", ok: "Remove", danger: true, icon: "trash" }).then(function (ok) {
      if (!ok) return;
      var el = $('.dv-row[data-id="' + id + '"]', list);
      devices.splice(devices.indexOf(d), 1); // optimistic; a failed API call would splice it back and toast an error
      if (el) el.classList.add("removing");
      $("#dvCount").textContent = devices.length + " active";
      setTimeout(render, 260);
      cb.toast("Device removed", "success");
    });
  }
  render();
})();
