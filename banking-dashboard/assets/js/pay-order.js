/* Pay order (spec §15, web-only build of RequestPayOrder): beneficiary, amount, reference, account */
(function () {
  var $ = cb.$, root = $(".ft-main");
  var acc = cb.select($("#acc"), { items: cb.accountItems(5), placeholder: "Select account", searchPlaceholder: "Search accounts" });
  var amt = cb.amount($("#amount").parentElement, { chips: [5000, 10000, 25000, 50000, 100000] });
  var ben = $("#ben"), ref = $("#refno");
  ben.addEventListener("input", function () { ben.value = ben.value.replace(/[^A-Za-z .'-]/g, ""); });

  var v = RF.validator(root, [
    { f: "#facc", check: function () { return acc.value ? "" : "Select the source account."; } },
    { f: "#fben", check: function () { return ben.value.trim().length >= 3 ? "" : "Enter the beneficiary name (at least 3 letters)."; } },
    { f: "#famount", check: function () {
      var p = amt.paisa(); if (!(p > 0)) return "Enter an amount greater than zero.";
      var a = acc.item && acc.item.data; return a && p / 100 > a.balance ? "The amount is more than the available balance." : "";
    } },
    { f: "#frefno", check: function () { return ref.value.trim().length >= 3 ? "" : "Enter a reference (at least 3 characters)."; } }
  ]);
  RF.flow({
    root: ".ft-main", icon: "fileText", title: "Pay Order", requestType: "Pay order", refPrefix: "CPO", showErrors: v.show,
    valid: v.ok,
    hero: function () { return { label: "Pay order amount", big: cb.fmtPaisa(amt.paisa()), words: cb.words(amt.paisa() / 100) }; },
    review: function () {
      var a = acc.item.data;
      return [["Pay from", a.product], ["Account number", a.no], ["Beneficiary name", ben.value.trim()], ["Reference", ref.value.trim()], ["Amount", cb.fmtPaisa(amt.paisa()), "total"]];
    },
    success: { title: "Pay order requested", dialogTitle: "Pay order request submitted", message: "Your pay order request has been submitted successfully." },
    side: { next: [["Verify", "Confirm the request with a one-time password."], ["We issue the pay order", "The amount is debited from your account."], ["Collect it", "Pick it up from your branch when we notify you."]], tat: ["Typical processing time", "1 working day"] }
  });
})();
