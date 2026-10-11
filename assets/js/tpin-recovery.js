/* TPIN recovery (spec 18, inside the app shell): Email, Branch, DOB -> verify (auth cards) -> OTP -> success. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$, P = window.cbPub, U = (window.CB_DATA && CB_DATA.user) || {};
  var el = { email: $("#tpEmail"), branch: $("#tpBranch"), dob: $("#tpDob") };
  P.fillBranches(el.branch); P.dobMask(el.dob);

  var form = P.form([
    { el: el.email, rule: P.rules.email, live: true },
    { el: el.branch, rule: P.rules.select("a branch") },
    { el: el.dob, rule: P.rules.dob }
  ], $("#tpNext"));

  var auth = cb.authCards($("#tpAuth"), { title: "Receive your one-time password via:" });

  function step(id) { $$(".tpr-step").forEach(function (s) { s.classList.toggle("on", s.id === id); }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  $("#tpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.valid()) { form.showAll(); return; }
    $("#tpReview").innerHTML =
      "<div><dt>User ID</dt><dd>" + esc(U.userId || "-") + "</dd></div>" +
      "<div><dt>Email</dt><dd>" + esc(el.email.value.trim()) + "</dd></div>" +
      "<div><dt>Branch</dt><dd>" + esc(el.branch.value) + "</dd></div>" +
      "<div><dt>Date of birth</dt><dd>" + esc(el.dob.value) + "</dd></div>";
    step("tpS2");
  });
  $("#tpBack").addEventListener("click", function () { step("tpS1"); });

  $("#tpSend").addEventListener("click", function () {
    var a = auth.get(), via = a && a.AUTH_SUB_TYPE === "EMAIL" ? "your email address" : "your registered mobile number";
    cb.otp({
      message: "We sent a 6-digit OTP to " + via + ".",
      onSuccess: function () {
        cb.success({
          title: "TPIN recovery request submitted",
          message: "Your TPIN recovery request has been submitted successfully. You will receive further instructions shortly.",
          buttons: [{ text: "Back to Settings", href: "settings.html" }, { text: "Go to Dashboard", href: "index.html", primary: true }]
        });
        try { history.replaceState(null, "", "tpin-recovery.html"); } catch (er) {}
      }
    });
  });
})();
