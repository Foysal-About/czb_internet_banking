/* Positive pay (spec §15): account -> book -> unused cheque -> amount -> start/end date <= today -> beneficiary */
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
  var amt = cb.amount($("#amount").parentElement, { chips: [5000, 10000, 25000, 50000] });
  var start = $("#start"), end = $("#end"), ben = $("#ben");
  start.max = end.max = RF.todayIso;
  ben.addEventListener("input", function () { ben.value = ben.value.replace(/[^A-Za-z .'-]/g, ""); });

  var v = RF.validator(root, [
    { f: "#facc", check: function () { return acc.value ? "" : "Select the source account."; } },
    { f: "#fbook", check: function () { return book.value ? "" : "Select a cheque book."; } },
    { f: "#fchq", check: function () { return chq.value ? "" : "Select the cheque to register."; } },
    { f: "#famount", check: function () { return amt.paisa() > 0 ? "" : "Enter an amount greater than zero."; } },
    { f: "#fstart", check: function () { return !start.value ? "Choose a start date." : start.value > RF.todayIso ? "Start date cannot be in the future." : ""; } },
    { f: "#fend", check: function () { return !end.value ? "Choose an end date." : end.value > RF.todayIso ? "End date cannot be in the future." : start.value && end.value < start.value ? "End date must not be before the start date." : ""; } },
    { f: "#fben", check: function () { return ben.value.trim().length >= 3 ? "" : "Enter the beneficiary name (at least 3 letters)."; } }
  ]);
  RF.flow({
    root: ".ft-main", icon: "shieldCheck", title: "Positive Pay", requestType: "Positive pay", refPrefix: "CPP", showErrors: v.show,
    valid: v.ok,
    hero: function () { return { label: "Cheque amount", big: cb.fmtPaisa(amt.paisa()), words: cb.words(amt.paisa() / 100) }; },
    review: function () {
      var a = acc.item.data;
      return [["Account", a.product], ["Account number", a.no], ["Cheque book", book.item.title], ["Cheque number", chq.value],
        ["Cheque amount", cb.fmtPaisa(amt.paisa()), "total"], ["Start date", RF.fmtIso(start.value)], ["End date", RF.fmtIso(end.value)], ["Beneficiary name", ben.value.trim()]];
    },
    success: { title: "Positive pay registered", dialogTitle: "Positive pay request submitted", message: "Your positive pay request has been submitted successfully." }
  });
})();
