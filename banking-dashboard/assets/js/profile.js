/* My Profile (spec section 18): read-only details + photo upload with client-side crop/resize (<= 512 KB JPEG). */
(function () {
  "use strict";
  var $ = cb.$, $$ = cb.$$, u = (window.CB_DATA || {}).user || {};
  var MAX_BYTES = 512 * 1024, OUT = 512;
  function get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function put(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); return true; } catch (e) { return false; } }
  var photo = get("cb-photo");

  // extra fields the profile API returns (dummy)
  var X = {
    tin: "512 408 9917 33", blood: "B+", mobile2: "01819004521",
    present: "House 14, Road 7, Block C, Banani, Dhaka 1213",
    permanent: "Village Shibpur, Post Shibpur, Narsingdi 1600"
  };
  function dl(rows) {
    return '<dl class="kv-grid">' + rows.map(function (r) {
      return '<div class="' + (r[2] ? "wide" : "") + '"><dt>' + r[0] + "</dt><dd>" + cb.esc(r[1] || "-") + "</dd></div>";
    }).join("") + "</dl>";
  }
  var ro = '<span class="ro-pill">' + cb.icon("lock", 12) + "Read only</span>";
  $("#pfCards").innerHTML =
    '<section class="card"><div class="card-head"><h3>Personal details</h3>' + ro + "</div>" + dl([
      ["User ID", u.userId], ["Name", u.fullName], ["Date of birth", u.dob], ["Father's name", u.father], ["Mother's name", u.mother],
      ["National ID", u.nid], ["Smart NID", u.smartNid], ["TIN", X.tin], ["Blood group", X.blood]]) + "</section>" +
    '<section class="card"><div class="card-head"><h3>Contact and branch</h3>' + ro + "</div>" + dl([
      ["Email", u.email], ["Mobile", u.mobile], ["Alternate mobile", X.mobile2], ["Home branch", u.branch], ["Customer ID", u.customerId]]) + "</section>" +
    '<section class="card"><div class="card-head"><h3>Addresses</h3>' + ro + "</div>" + dl([
      ["Present address", X.present, true], ["Permanent address", X.permanent, true]]) +
    '<div class="set-note">' + cb.icon("info", 16) + "<span>To change these details, visit your home branch with your NID.</span></div></section>";

  // ---------- photo card ----------
  function paintPhoto() {
    $("#pfPhoto").innerHTML =
      '<span class="avatar">' + (photo ? '<img alt="Profile photo" src="' + photo + '">' : cb.esc(u.initials || "C")) + "</span>" +
      "<h2>" + cb.esc(u.fullName) + "</h2><p>User ID : " + cb.esc(u.userId) + "</p>" +
      '<div class="pf-actions"><button class="btn-pri btn-sm" id="pfUp" type="button">' + cb.icon("upload", 15) + (photo ? "Change photo" : "Upload photo") + "</button>" +
      (photo ? '<button class="btn-sec btn-sm" id="pfDel" type="button">' + cb.icon("trash", 15) + "Remove</button>" : "") + "</div>" +
      '<input type="file" id="pfFile" accept="image/jpeg,image/png,image/webp" hidden>' +
      '<p class="pf-hint">JPEG, PNG or WebP. We crop it square and resize it to under 512 KB.</p>';
    $("#pfUp").addEventListener("click", function () { $("#pfFile").click(); });
    $("#pfFile").addEventListener("change", function () { var f = this.files[0]; this.value = ""; if (f) openCrop(f); });
    var d = $("#pfDel");
    if (d) d.addEventListener("click", function () {
      cb.confirm({ title: "Remove photo?", message: "Your profile photo will be replaced with your initials.", ok: "Remove", danger: true }).then(function (ok) {
        if (!ok) return; photo = ""; put("cb-photo", ""); paintPhoto(); syncAvatars(); cb.toast("Photo removed", "success");
      });
    });
  }
  function syncAvatars() {
    $$(".topbar .avatar, .user-menu .avatar").forEach(function (a) { a.innerHTML = photo ? '<img alt="" src="' + photo + '">' : cb.esc(u.initials || "C"); });
  }

  // ---------- crop dialog ----------
  function openCrop(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { cb.toast("Please choose a JPEG, PNG or WebP image", "error"); return; }
    if (file.size > 15 * 1024 * 1024) { cb.toast("That image is too large. Choose one under 15 MB", "error"); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onerror = function () { URL.revokeObjectURL(url); cb.toast("We could not read that image", "error"); };
    img.onload = function () {
      var dlg = cb.dialog({
        title: "Crop your photo",
        html: '<div class="crop"><div class="crop-frame" id="cropFrame"></div><label class="crop-zoom">' + cb.icon("search", 14) + '<input type="range" id="cropZoom" min="1" max="3" step="0.01" value="1" aria-label="Zoom">' + cb.icon("search", 18) + '</label><div class="crop-note">Drag to reposition. Output is 512 x 512 pixels.</div><div class="err" id="cropErr"></div></div>',
        buttons: [{ text: "Cancel", value: false }, { text: "Save photo", primary: true, onClick: function () { save(); return false; } }],
        onClose: function () { URL.revokeObjectURL(url); }
      });
      var el = dlg.el, frame = $("#cropFrame", el), zoom = $("#cropZoom", el), saveBtn = $(".btn-pri", el), err = $("#cropErr", el);
      frame.appendChild(img); img.className = "ready"; img.alt = "";
      var F = frame.clientWidth || 260, z = 1, x = 0, y = 0;
      var base = function () { return F / Math.min(img.naturalWidth, img.naturalHeight); };
      function clamp() {
        var s = base() * z, w = img.naturalWidth * s, h = img.naturalHeight * s;
        x = Math.min(0, Math.max(F - w, x)); y = Math.min(0, Math.max(F - h, y));
      }
      function paint() { var s = base() * z; clamp(); img.style.width = img.naturalWidth * s + "px"; img.style.height = img.naturalHeight * s + "px"; img.style.left = x + "px"; img.style.top = y + "px"; }
      // centre
      (function () { var s = base(); x = (F - img.naturalWidth * s) / 2; y = (F - img.naturalHeight * s) / 2; paint(); })();
      zoom.addEventListener("input", function () {
        var old = base() * z, cx = (F / 2 - x) / old, cy = (F / 2 - y) / old; z = +zoom.value;
        var s = base() * z; x = F / 2 - cx * s; y = F / 2 - cy * s; paint();
      });
      var drag = null;
      frame.addEventListener("pointerdown", function (e) { drag = { px: e.clientX, py: e.clientY, x: x, y: y }; frame.setPointerCapture(e.pointerId); });
      frame.addEventListener("pointermove", function (e) { if (!drag) return; x = drag.x + e.clientX - drag.px; y = drag.y + e.clientY - drag.py; paint(); });
      ["pointerup", "pointercancel"].forEach(function (n) { frame.addEventListener(n, function () { drag = null; }); });

      function toBlob(c, q) { return new Promise(function (res) { c.toBlob(res, "image/jpeg", q); }); }
      function save() {
        saveBtn.disabled = true; err.classList.remove("show");
        var s = base() * z, size = OUT;
        (function attempt() {
          var c = document.createElement("canvas"); c.width = c.height = size;
          var g = c.getContext("2d"); g.fillStyle = "white"; g.fillRect(0, 0, size, size); g.imageSmoothingQuality = "high";
          g.drawImage(img, -x / s, -y / s, F / s, F / s, 0, 0, size, size);
          var q = 0.9;
          (function loop() {
            toBlob(c, q).then(function (b) {
              if (!b) { fail(); return; }
              if (b.size > MAX_BYTES && q > 0.35) { q -= 0.1; loop(); return; }
              if (b.size > MAX_BYTES) { size = Math.round(size * 0.8); attempt(); return; }
              var r = new FileReader();
              r.onload = function () {
                photo = r.result; var ok = put("cb-photo", photo);
                dlg.close("ok"); paintPhoto(); syncAvatars();
                cb.toast(ok ? "Profile photo updated" : "Photo updated for this session", "success");
              };
              r.readAsDataURL(b);
            });
          })();
        })();
      }
      function fail() { saveBtn.disabled = false; err.textContent = "We could not process that image. Try another one."; err.classList.add("show"); }
    };
    img.src = url;
  }

  paintPhoto(); syncAvatars();
})();
