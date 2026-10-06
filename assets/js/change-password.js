/* Change password (spec section 6.6): live checklist + strength meter, then auth card -> OTP -> done. */
(function () {
  "use strict";
  var $ = cb.$, $$ = cb.$$;
  var cur = $("#pwCur"), nw = $("#pwNew"), con = $("#pwCon"), go = $("#pwGo"), root = $("#pwRoot");
  var ALLOWED = "@&.-_!#^*()+";
  var touched = { cur: false, nw: false, con: false };
  var CHECK = cb.icon("check", 12, 3);
  $$(".pw-rule .rk").forEach(function (k) { k.innerHTML = CHECK; });

  function evalPw(p, c) {
    var up = /[A-Z]/.test(p), low = /[a-z]/.test(p), num = /[0-9]/.test(p);
    var sp = false, bad = false;
    p.split("").forEach(function (ch) { if (/[A-Za-z0-9]/.test(ch)) return; if (ALLOWED.indexOf(ch) > -1) sp = true; else bad = true; });
    var classes = [up, low, num, sp].filter(Boolean).length;
    return { len: p.length >= 12, up: up, low: low, num: num, sp: sp, three: classes >= 3, chars: !!p && !bad, diff: !!p && p !== c, classes: classes, bad: bad };
  }
  function score(p, r) {
    if (!p) return 0;
    var s = (r.len ? 1 : 0) + (r.three ? 1 : 0) + (p.length >= 16 ? 1 : 0) + (r.classes === 4 ? 1 : 0);
    if (r.bad) s = Math.min(s, 1);
    return Math.max(1, s);
  }
  var LABEL = ["", "Weak", "Fair", "Good", "Strong"];
  function setErr(f, msg) { var fld = $("#f" + f), e = $("#e" + f); fld.classList.toggle("invalid", !!msg); e.textContent = msg || ""; }

  function update() {
    var r = evalPw(nw.value, cur.value);
    $$(".pw-rule").forEach(function (el) { el.classList.toggle("ok", !!r[el.dataset.r]); });
    var s = score(nw.value, r); $("#pwMeter").dataset.s = s; $("#pwMeterT").innerHTML = LABEL[s] || "&nbsp;";
    var okNew = r.len && r.three && r.chars && r.diff;
    var valid = !!cur.value && okNew && !!con.value && con.value === nw.value;
    go.disabled = !valid;
    if (touched.cur) setErr("Cur", cur.value ? "" : "Current password is required");
    if (touched.nw) setErr("New", !nw.value ? "New password is required" : (okNew ? "" : "New password does not meet the requirements"));
    if (touched.con) setErr("Con", con.value === nw.value && con.value ? "" : "Passwords do not match");
    return valid;
  }
  [["cur", cur], ["nw", nw], ["con", con]].forEach(function (p) {
    p[1].addEventListener("input", update);
    p[1].addEventListener("blur", function () { touched[p[0]] = true; update(); });
  });
  update();

  var auth = cb.authCards($("#pwAuth"), { title: "Send my one-time password via:" });
  $("#pwForm").addEventListener("submit", function (e) { e.preventDefault(); touched = { cur: true, nw: true, con: true }; if (update()) cb.step(root, 2); });
  $("#pwBack").addEventListener("click", function () { cb.step(root, 1); });
  $("#pwSend").addEventListener("click", function () {
    var m = auth.get(), via = m && m.AUTH_SUB_TYPE === "EMAIL" ? "your registered email" : "01XXXXXX515";
    cb.otp({
      title: "Verify with OTP", message: "OTP sent to " + via + ". Enter it to update your password.",
      onSuccess: function () {
        cb.done({ title: "Password updated", message: "Your password was changed. It is valid for the next 90 days. Use it the next time you log in." }).then(function () { location.href = "settings.html"; });
      }
    });
  });
})();
