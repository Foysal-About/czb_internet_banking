/* Reset password (spec 6.3): User ID | Phone number toggle, blur validation, SMS OTP, success. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$, P = window.cbPub;
  var mode = "uid";
  var el = { cust: $("#rpCust"), branch: $("#rpBranch"), phone: $("#rpPhone"), acc: $("#rpAcc"), dob: $("#rpDob"), email: $("#rpEmail") };
  P.fillBranches(el.branch); P.dobMask(el.dob); P.digitsOnly(el.acc, 13);
  el.phone.setAttribute("maxlength", "14");

  var form = P.form([
    { el: el.cust, rule: P.rules.required("Customer ID") },
    { el: el.branch, rule: P.rules.select("a branch") },
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
      message: "We sent a 6-digit OTP by SMS to " + dest + ".",
      onSuccess: function () {
        cb.success({
          title: "Request submitted",
          message: "Your password reset request has been submitted successfully.",
          buttons: [{ text: "Back to login", icon: "lockOpen", href: "login.html", primary: true }]
        });
      }
    });
  });
})();
