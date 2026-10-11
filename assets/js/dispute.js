/* Dispute (spec §16): account, type, amount, date <= today, narration */
(function () {
  var $ = cb.$, root = $(".ft-main");
  var TYPES = ["Fund transfer", "ATM withdrawal", "POS purchase", "Online purchase", "Bill payment", "Mobile recharge", "Cheque", "Other"];
  var acc = cb.select($("#acc"), { items: cb.accountItems(0), placeholder: "Select account", searchPlaceholder: "Search accounts" });
  var type = cb.select($("#type"), { items: TYPES.map(function (t) { return { value: t, title: t }; }), placeholder: "Select dispute type", search: false });
  var amt = cb.amount($("#amount").parentElement, { chips: [500, 1000, 5000, 10000] });
  var date = $("#date"); date.max = RF.todayIso;
  RF.counter($("#narr"), 300, $("#narrCnt"));

  var v = RF.validator(root, [
    { f: "#facc", check: function () { return acc.value ? "" : "Select the account."; } },
    { f: "#ftype", check: function () { return type.value ? "" : "Select the dispute type."; } },
    { f: "#fdate", check: function () { return !date.value ? "Choose the transaction date." : date.value > RF.todayIso ? "The date cannot be in the future." : ""; } },
    { f: "#famount", check: function () { return amt.paisa() > 0 ? "" : "Enter an amount greater than zero."; } },
    { f: "#fnarr", check: function () { return $("#narr").value.trim().length >= 10 ? "" : "Describe what happened (at least 10 characters)."; } }
  ]);
  RF.flow({
    root: ".ft-main", icon: "alert", title: "Dispute", requestType: "Transaction dispute", refPrefix: "CDP", showErrors: v.show,
    valid: v.ok,
    hero: function () { return { label: "Disputed amount", big: cb.fmtPaisa(amt.paisa()), words: cb.words(amt.paisa() / 100) }; },
    review: function () {
      var a = acc.item.data;
      return [["Account", a.product], ["Account number", a.no], ["Dispute type", type.value], ["Transaction date", RF.fmtIso(date.value)],
        ["Disputed amount", cb.fmtPaisa(amt.paisa()), "total"], ["Narration", $("#narr").value.trim()]];
    },
    success: { title: "Dispute submitted", dialogTitle: "Dispute request submitted", message: "Your dispute request has been submitted successfully." }
  });
})();
