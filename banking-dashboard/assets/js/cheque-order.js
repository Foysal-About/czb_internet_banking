/* Order cheque book (spec §15): account -> definition (+ charges) -> delivery branch -> review/auth -> OTP */
(function () {
  var $ = cb.$, D = window.CB_DATA, root = $(".ft-main");
  var DEFS = {
    Current: [["25 Leaf Current Cheque Book", 25], ["50 Leaf Current Cheque Book", 50], ["100 Leaf Current Cheque Book", 100]],
    Savings: [["10 Leaf Savings Cheque Book", 10], ["25 Leaf Savings Cheque Book", 25]]
  };
  function charges(leaves) {
    var fee = leaves * 5, stamp = 25, vat = Math.round(fee * 0.15 * 100) / 100;
    return [["Cheque book fee (" + leaves + " leaves)", fee], ["Stamp duty", stamp], ["VAT (15%)", vat]];
  }
  var total = function (l) { return charges(l).reduce(function (s, c) { return s + c[1]; }, 0); };

  var acc = cb.select($("#acc"), { items: cb.accountItems(5), placeholder: "Select account", searchPlaceholder: "Search accounts", onChange: onAccount });
  var def = cb.select($("#def"), { items: [], placeholder: "Select an account first", search: false, onChange: onDef });
  var br = cb.select($("#br"), { items: D.czbBranches.map(function (b) { return { value: b, title: b }; }), placeholder: "Select delivery branch", searchPlaceholder: "Search branches" });
  def.disable(true);
  RF.counter($("#remarks"), 120, $("#remarksCnt"));

  function onAccount(it) {
    var a = it.data || D.accounts.filter(function (x) { return x.id === it.value; })[0];
    var list = DEFS[a.kind] || DEFS.Current;
    def.setItems(list.map(function (d) { return { value: d[0], title: d[0], sub: d[1] + " leaves", data: d[1], right: cb.fmt(total(d[1])), rightLabel: "Total charges" }; }));
    def.disable(false); showCharges();
  }
  function onDef() { showCharges(); }
  function showCharges() {
    var d = def.item, dl = $("#charges"), h = $("#chHelp");
    if (!d) { dl.hidden = true; h.hidden = true; return; }
    var rows = charges(d.data).map(function (c) { return "<div><dt>" + c[0] + "</dt><dd>" + cb.fmt(c[1]) + "</dd></div>"; }).join("");
    dl.innerHTML = rows + '<div class="total"><dt>Total charges (TK)</dt><dd>' + cb.fmt(total(d.data)) + "</dd></div>";
    dl.hidden = false; h.hidden = false;
  }

  var v = RF.validator(root, [
    { f: "#facc", check: function () { return acc.value ? "" : "Select the account for the cheque book."; } },
    { f: "#fdef", check: function () { return def.value ? "" : "Select a cheque book type."; } },
    { f: "#fbr", check: function () { return br.value ? "" : "Select a delivery branch."; } }
  ]);
  RF.flow({
    root: ".ft-main", icon: "book", title: "Order Cheque Book", requestType: "Cheque book order", refPrefix: "CBO", showErrors: v.show,
    valid: v.ok,
    hero: function () { return { label: "Total charges", big: cb.fmt(total(def.item.data)) }; },
    review: function () {
      var a = acc.item.data, d = def.item, rows = [["Account", a.product], ["Account number", a.no], ["Cheque book", d.title], ["Leaves", String(d.data)]];
      charges(d.data).forEach(function (c) { rows.push([c[0], cb.fmt(c[1])]); });
      rows.push(["Total charges (TK)", cb.fmt(total(d.data)), "total"]);
      rows.push(["Delivery branch", br.item.title]);
      if ($("#remarks").value.trim()) rows.push(["Remarks", $("#remarks").value.trim()]);
      return rows;
    },
    success: { title: "Cheque book ordered", dialogTitle: "Cheque book order submitted", message: "Your cheque book order has been submitted successfully." },
    side: { next: [["Verify", "Confirm the order with a one-time password."], ["Processing", "We prepare your cheque book and send it to the branch."], ["Collect", "We notify you when it is ready. Bring a valid ID."]], tat: ["Typical delivery time", "3 to 5 working days"] }
  });
})();
