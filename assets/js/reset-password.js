/* Reset password (spec 6.3): User ID | Phone number toggle, blur validation, SMS OTP, success. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$, t = cb.t, P = window.cbPub;
  $("#langLbl").textContent = cb.lang === "bn" ? "English" : "বাংলা";

  var mode = "uid";
  var el = { cust: $("#rpCust"), branch: $("#rpBranch"), phone: $("#rpPhone"), acc: $("#rpAcc"), dob: $("#rpDob"), email: $("#rpEmail") };
  P.fillBranches(el.branch); P.dobMask(el.dob); P.digitsOnly(el.acc, 13);
  el.phone.setAttribute("maxlength", "14");

  var form = P.form([
    { el: el.cust, rule: P.rules.required(t("Customer ID", "কাস্টমার আইডি")) },
    { el: el.branch, rule: P.rules.select(t("a branch", "শাখা")) },
    { el: el.phone, rule: P.rules.mobile, when: function () { return mode === "phone"; } },
    { el: el.acc, rule: P.rules.account },
    { el: el.dob, rule: P.rules.dob },
    { el: el.email, rule: P.rules.email, live: true }
  ], $("#rpNext"));

  $("#rpMode").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-m]"); if (!b) return;
    mode = b.dataset.m;
    $$("#rpMode button").forEach(function (x) { x.classList.toggle("on", x === b); });
    $("#rpPhoneFld").hidden = mode !== "phone";
    if (mode === "uid") { el.phone.value = ""; }
    form.refresh();
  });

  function show(id) { $$(".pub-view").forEach(function (v) { v.classList.toggle("on", v.id === id); }); window.scrollTo({ top: 0 }); }

  $("#rpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.valid()) { form.showAll(); return; }
    var dest = mode === "phone" ? P.maskPhone(el.phone.value) : "your registered mobile number";
    // Always SMS: no auth-method picker for this flow.
    cb.otp({
      message: t("We sent a 6-digit OTP by SMS to ", "৬ সংখ্যার OTP SMS-এ পাঠানো হয়েছে ") + dest + ".",
      onSuccess: function () {
        $("#vDone").innerHTML = P.successHtml(
          t("Request submitted", "অনুরোধ জমা হয়েছে"),
          t("Your password reset request has been submitted successfully.", "আপনার পাসওয়ার্ড রিসেটের অনুরোধ সফলভাবে জমা হয়েছে।"),
          '<a class="btn-pri" href="login.html">' + cb.icon("lockOpen", 16) + "<span>" + t("Back to login", "লগইনে ফিরুন") + "</span></a>");
        show("vDone");
      }
    });
  });
})();
