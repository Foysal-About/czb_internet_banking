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
        $("#tpS3").innerHTML = '<div class="success"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
          "<h2>TPIN recovery request submitted</h2><p>Your TPIN recovery request has been submitted successfully. You will receive further instructions shortly.</p>" +
          '<div class="ft-actions"><a class="btn-sec" href="settings.html">Back to Settings</a><a class="btn-pri" href="index.html">Go to Dashboard</a></div></div>';
        step("tpS3");
        try { history.replaceState(null, "", "tpin-recovery.html"); } catch (er) {}
      }
    });
  });
})();
