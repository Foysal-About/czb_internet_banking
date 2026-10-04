/* Stop cheque (spec §15): account -> book -> unused cheque -> amount > 0 -> reason */
(function () {
  var $ = cb.$, root = $(".ft-main");
  var acc = cb.select($("#acc"), { items: cb.accountItems(5), placeholder: "Select account", searchPlaceholder: "Search accounts", onChange: function (it) {
    book.setItems(RF.bookItems(it.value)); book.disable(false); chq.setItems([]); chq.disable(true);
  } });
  var book = cb.select($("#book"), { items: [], placeholder: "Select an account first", search: false, onChange: function (it) {
    chq.setItems(RF.unusedItems(it.value)); chq.disable(false);
  } });
  var chq = cb.select($("#chq"), { items: [], placeholder: "Select a cheque book first", searchPlaceholder: "Search cheque number" });
  book.disable(true); chq.disable(true);
  var amt = cb.amount($("#amount").parentElement, { chips: [1000, 5000, 10000, 25000] });
  RF.counter($("#reason"), 150, $("#reasonCnt"));

  var v = RF.validator(root, [
    { f: "#facc", check: function () { return acc.value ? "" : "Select the source account."; } },
    { f: "#fbook", check: function () { return book.value ? "" : "Select a cheque book."; } },
    { f: "#fchq", check: function () { return chq.value ? "" : "Select the cheque to stop."; } },
    { f: "#famount", check: function () { return amt.paisa() > 0 ? "" : "Enter an amount greater than zero."; } },
    { f: "#freason", check: function () { var t = $("#reason").value.trim(); return t.length >= 3 ? "" : "Tell us why you want to stop this cheque."; } }
  ]);
  RF.flow({
    root: ".ft-main", icon: "ban", title: "Stop Cheque", requestType: "Stop cheque", refPrefix: "CSP", showErrors: v.show,
    valid: v.ok,
    hero: function () { return { label: "Cheque amount", big: cb.fmtPaisa(amt.paisa()), words: cb.words(amt.paisa() / 100) }; },
    review: function () {
      var a = acc.item.data, k = book.item;
      return [["Account", a.product], ["Account number", a.no], ["Available balance", cb.fmt(a.balance)], ["Cheque book", k.title], ["Cheque number", chq.value],
        ["Cheque amount", cb.fmtPaisa(amt.paisa()), "total"], ["Reason", $("#reason").value.trim()]];
    },
    success: { title: "Stop cheque requested", dialogTitle: "Stop cheque request submitted", message: "Your stop cheque request has been submitted successfully." },
    side: { next: [["Verify", "Confirm the request with a one-time password."], ["Cheque is blocked", "We stop payment on the cheque you chose."], ["Confirmation", "Check the status in Request Status."]], tat: ["Typical processing time", "Within the same working day"] }
  });
})();
