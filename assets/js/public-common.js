/* Shared helpers for the pre-login pages and TPIN recovery: blur-validated forms (spec 4.4), DOB mask + rule, branch select fill. Exposes window.cbPub. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$;
  var P = window.cbPub = {};


  // ---- rules: return "" when valid, else an error sentence ----
  var R = P.rules = {
    required: function (label) {
      return function (v) { return String(v).trim() ? "" : label + " is required"; };
    },
    select: function (label) {
      return function (v) { return v ? "" : "Please select " + label; };
    },
    account: function (v) {
      if (!String(v).trim()) return "Account number is required";
      return cb.valid.account(v) ? "" : "Please enter a valid 13-digit account number";
    },
    mobile: function (v) {
      if (!String(v).trim()) return "Phone number is required";
      return cb.valid.mobile(v) ? "" : "Please enter a valid mobile number";
    },
    email: function (v) {
      if (!String(v).trim()) return "Email is required";
      return cb.valid.email(v) ? "" : "Please enter a valid email address";
    },
    dob: function (v) {
      v = String(v).trim();
      if (!v) return "Date of birth is required";
      var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v), bad = "Please enter a valid date";
      if (!m) return bad;
      var d = +m[1], mo = +m[2], y = +m[3], dt = new Date(y, mo - 1, d);
      if (y < 1900 || dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return bad;
      var today = new Date(); today.setHours(0, 0, 0, 0);
      if (dt > today) return "Date of birth can't be in the future";
      return "";
    }
  };

  // DD/MM/YYYY auto-slash mask
  P.dobMask = function (input) {
    input.setAttribute("maxlength", "10"); input.setAttribute("inputmode", "numeric"); input.setAttribute("autocomplete", "off");
    input.addEventListener("input", function () {
      var d = input.value.replace(/\D/g, "").slice(0, 8), o = d.slice(0, 2);
      if (d.length > 2) o += "/" + d.slice(2, 4);
      if (d.length > 4) o += "/" + d.slice(4);
      input.value = o;
    });
  };
  P.digitsOnly = function (input, max) {
    input.addEventListener("input", function () { input.value = input.value.replace(/\D/g, "").slice(0, max); });
  };

  // Fill a <select> with CZB branches (cb data)
  P.fillBranches = function (sel) {
    var list = (window.CB_DATA && CB_DATA.czbBranches) || [];
    sel.innerHTML = '<option value="">Select branch</option>' +
      list.map(function (b) { return '<option value="' + b + '">' + b + "</option>"; }).join("");
  };

  // Blur-validated form. fields: [{ el, rule, when() }]. Returns { valid(), update(), reset() }.
  P.form = function (fields, btn, onChange) {
    function box(f) { return f.el.closest(".fld"); }
    function active(f) { return !f.when || f.when(); }
    function show(f, force) {
      var b = box(f); if (!b) return;
      var msg = active(f) && (f.touched || force) ? f.rule(f.el.value) : "";
      var e = $(".ferr", b);
      if (!e) { e = document.createElement("div"); e.className = "ferr"; e.setAttribute("role", "alert"); b.appendChild(e); }
      e.textContent = msg; b.classList.toggle("invalid", !!msg);
      f.el.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function valid() { return fields.every(function (f) { return !active(f) || f.rule(f.el.value) === ""; }); }
    function update() { if (btn) btn.disabled = !valid(); if (onChange) onChange(); }
    fields.forEach(function (f) {
      var live = function () { if (f.touched || f.live) { f.touched = true; show(f); } update(); };
      f.el.addEventListener("blur", function () { f.touched = true; show(f); update(); });
      f.el.addEventListener("change", function () { f.touched = true; show(f); update(); });
      f.el.addEventListener("input", function () { if (f.touched) show(f); update(); });
      if (f.live) f.el.addEventListener("input", live);
    });
    update();
    return {
      valid: valid, update: update,
      refresh: function () { fields.forEach(function (f) { show(f); }); update(); },
      showAll: function () { fields.forEach(function (f) { f.touched = true; show(f, true); }); update(); },
      reset: function () { fields.forEach(function (f) { f.touched = false; f.el.value = ""; show(f); }); update(); }
    };
  };

  // Masked destination for the OTP message
  P.maskPhone = function (v) {
    var d = String(v || "").replace(/\D/g, "").replace(/^880/, ""); if (d.length === 10) d = "0" + d;
    return d.length >= 11 ? d.slice(0, 3) + "XXXXXX" + d.slice(-2) : "01XXXXXX515";
  };

})();
