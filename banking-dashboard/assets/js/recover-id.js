/* Recover user ID (spec 6.4): Branch, Account (13), Phone, Email, DOB -> SMS OTP -> success. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$, t = cb.t, P = window.cbPub;
  $("#langLbl").textContent = cb.lang === "bn" ? "English" : "বাংলা";

  var el = { branch: $("#riBranch"), acc: $("#riAcc"), phone: $("#riPhone"), email: $("#riEmail"), dob: $("#riDob") };
  P.fillBranches(el.branch); P.dobMask(el.dob); P.digitsOnly(el.acc, 13);
  el.phone.setAttribute("maxlength", "14");

  var form = P.form([
    { el: el.branch, rule: P.rules.select(t("a branch", "শাখা")) },
    { el: el.acc, rule: P.rules.account },
    { el: el.phone, rule: P.rules.mobile },
    { el: el.dob, rule: P.rules.dob },
    { el: el.email, rule: P.rules.email, live: true }
  ], $("#riNext"));

  function show(id) { $$(".pub-view").forEach(function (v) { v.classList.toggle("on", v.id === id); }); window.scrollTo({ top: 0 }); }

  $("#riForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.valid()) { form.showAll(); return; }
    cb.otp({
      message: t("We sent a 6-digit OTP by SMS to ", "৬ সংখ্যার OTP SMS-এ পাঠানো হয়েছে ") + P.maskPhone(el.phone.value) + ".",
      onSuccess: function () {
        $("#vDone").innerHTML = P.successHtml(
          t("Request submitted", "অনুরোধ জমা হয়েছে"),
          t("Your user ID recovery request has been submitted successfully.", "আপনার ইউজার আইডি পুনরুদ্ধারের অনুরোধ সফলভাবে জমা হয়েছে।"),
          '<a class="btn-pri" href="login.html">' + cb.icon("lockOpen", 16) + "<span>" + t("Back to login", "লগইনে ফিরুন") + "</span></a>");
        show("vDone");
      }
    });
  });
})();
