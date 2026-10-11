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

  RF.flow({
    root: ".ft-main", icon: "message", title: "Complain", requestType: "Complain", refPrefix: "CMP", noAuth: true, status: "In Progress", showErrors: v.show,
    valid: v.ok,
    review: function () {
      var a = acc.item.data;
      return [["Account", a.product], ["Account number", a.no], ["Branch", a.branch + " Branch"], ["Subject", subj.value], ["Description", $("#desc").value.trim()]];
    },
    success: { title: "Complain submitted", dialogTitle: "Complain submitted", message: "Your complain has been submitted. We will get back to you soon." }
  });
})();
