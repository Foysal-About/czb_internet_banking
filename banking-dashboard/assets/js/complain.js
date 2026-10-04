/* Complain (spec §16): account, subject, description -> submit, no OTP */
(function () {
  var $ = cb.$, root = $(".ft-main");
  var SUBJ = ["Account service", "Card issue", "ATM or POS problem", "Fund transfer problem", "Internet banking", "Branch service", "Charges and fees", "Other"];
  var acc = cb.select($("#acc"), { items: cb.accountItems(0), placeholder: "Select account", searchPlaceholder: "Search accounts", onChange: function (it) {
    $("#brName").textContent = it.data.branch + " Branch"; $("#brShow").hidden = false;
  } });
  var subj = cb.select($("#subj"), { items: SUBJ.map(function (t) { return { value: t, title: t }; }), placeholder: "Select a subject", search: false });
  RF.counter($("#desc"), 500, $("#descCnt"));

  var v = RF.validator(root, [
    { f: "#facc", check: function () { return acc.value ? "" : "Select the account."; } },
    { f: "#fsubj", check: function () { return subj.value ? "" : "Select a subject."; } },
    { f: "#fdesc", check: function () { return $("#desc").value.trim().length >= 10 ? "" : "Describe the issue in detail (at least 10 characters)."; } }
  ]);

  var prev = [["Debit card declined at ATM", "12-Sep-2026", "Resolved"], ["Wrong charge on statement", "28-Aug-2026", "In progress"]];
  function tone(s) { return /resolv|complete|success|approve|process/i.test(s) ? "ok" : /progress|pending|review/i.test(s) ? "pending" : ""; }
  function side(extra) {
    var rows = (extra ? [extra] : []).concat(prev).map(function (p, i) {
      return '<div class="rq-prev-row' + (extra && i === 0 ? " new" : "") + '"><b>' + cb.esc(p[0]) + '</b><span class="chip ' + tone(p[2]) + '">' + p[2] + "</span><small>" + p[1] + "</small></div>";
    }).join("");
    $("#side").innerHTML = '<div class="card"><h3 class="card-title">Your previous complaints</h3><div class="rq-prev">' + rows + "</div></div>" +
      '<div class="card"><h3 class="card-title">How we handle it</h3><ol class="rq-next"><li><span><b>We log it</b>You get a reference number straight away.</span></li><li><span><b>We investigate</b>The branch and support team look into it.</span></li><li><span><b>We reply</b>Updates appear in Request Status.</span></li></ol>' +
      '<div class="rq-tat">' + cb.icon("clock", 20) + '<div><span>Typical response time</span><b>Within 3 working days</b></div></div></div>';
  }
  side();

  RF.flow({
    root: ".ft-main", icon: "message", title: "Complain", requestType: "Complain", refPrefix: "CMP", noAuth: true, status: "In Progress", showErrors: v.show,
    valid: v.ok,
    review: function () {
      var a = acc.item.data;
      return [["Account", a.product], ["Account number", a.no], ["Branch", a.branch + " Branch"], ["Subject", subj.value], ["Description", $("#desc").value.trim()]];
    },
    success: { title: "Complain submitted", dialogTitle: "Complain submitted", message: "Your complain has been submitted. We will get back to you soon." }
  });
  $("#next").addEventListener("click", function () { if (v.ok()) side([subj.value, cb.date(), "In progress"]); });
})();
