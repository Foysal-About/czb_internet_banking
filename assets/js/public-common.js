/* Shared helpers for the pre-login pages and TPIN recovery: i18n of static text,
   blur-validated forms (spec 4.4), DOB mask + rule, branch select fill. Exposes window.cbPub. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$, t = cb.t;
  var P = window.cbPub = {};

  // Static text: <span data-bn="বাংলা">English</span>, placeholders via data-bn-ph.
  P.i18n = function (root) {
    if (cb.lang !== "bn") return;
    $$("[data-bn]", root).forEach(function (el) { el.textContent = el.getAttribute("data-bn"); });
    $$("[data-bn-ph]", root).forEach(function (el) { el.placeholder = el.getAttribute("data-bn-ph"); });
    $$("[data-bn-label]", root).forEach(function (el) { el.setAttribute("aria-label", el.getAttribute("data-bn-label")); });
  };

  // ---- rules: return "" when valid, else an error sentence ----
  var R = P.rules = {
    required: function (label) {
      return function (v) { return String(v).trim() ? "" : t(label + " is required", label + " আবশ্যক"); };
    },
    select: function (label) {
      return function (v) { return v ? "" : t("Please select " + label, label + " নির্বাচন করুন"); };
    },
    account: function (v) {
      if (!String(v).trim()) return t("Account number is required", "অ্যাকাউন্ট নম্বর আবশ্যক");
      return cb.valid.account(v) ? "" : t("Please enter a valid 13-digit account number", "সঠিক ১৩ সংখ্যার অ্যাকাউন্ট নম্বর দিন");
    },
    mobile: function (v) {
      if (!String(v).trim()) return t("Phone number is required", "ফোন নম্বর আবশ্যক");
      return cb.valid.mobile(v) ? "" : t("Please enter a valid mobile number", "সঠিক মোবাইল নম্বর দিন");
    },
    email: function (v) {
      if (!String(v).trim()) return t("Email is required", "ইমেইল আবশ্যক");
      return cb.valid.email(v) ? "" : t("Please enter a valid email address", "সঠিক ইমেইল ঠিকানা দিন");
    },
    dob: function (v) {
      v = String(v).trim();
      if (!v) return t("Date of birth is required", "জন্ম তারিখ আবশ্যক");
      var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v), bad = t("Please enter a valid date", "সঠিক তারিখ দিন");
      if (!m) return bad;
      var d = +m[1], mo = +m[2], y = +m[3], dt = new Date(y, mo - 1, d);
      if (y < 1900 || dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return bad;
      var today = new Date(); today.setHours(0, 0, 0, 0);
      if (dt > today) return t("Date of birth can't be in the future", "জন্ম তারিখ ভবিষ্যতের হতে পারবে না");
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
    sel.innerHTML = '<option value="">' + t("Select branch", "শাখা নির্বাচন করুন") + "</option>" +
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

  // Success panel markup
  P.successHtml = function (title, msg, actions) {
    return '<div class="pub-success success"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      "<h2>" + title + "</h2><p>" + msg + "</p>" + actions + "</div>";
  };

  P.i18n();
})();
