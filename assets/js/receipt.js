/* Shared receipt (spec §5.3): reads cb.saveReceipt() data from sessionStorage. Lives only for the session. */
(function () {
  var $ = cb.$, esc = cb.esc, host = $("#rcHost");
  var r = cb.loadReceipt();

  function gone() {
    host.innerHTML = '<div class="card empty-state rc-gone"><div class="es-ic">' + cb.icon("receipt", 26) + '</div>' +
      '<b>This receipt is no longer available</b><p>Receipts are kept only while you are signed in. You can find past transactions in your history.</p>' +
      '<div class="rc-actions"><a class="btn-pri" href="index.html">Back to Home</a><a class="btn-sec" href="history.html">Transaction History</a></div></div>';
  }
  if (!r || !r.txnId) return gone();

  var date = r.date || cb.dt();
  var rows = (r.rows || []).slice();
  function has(k) { return rows.some(function (x) { return String(x[0]).toLowerCase() === k; }); }
  if (r.type && !has("transfer type") && !has("type")) rows.unshift(["Type", r.type]);
  if (!has("date & time") && !has("date")) rows.unshift(["Date & time", date]);

  host.innerHTML =
    '<article class="card receipt-card rc-sheet" id="rcSheet">' +
      '<div class="rc-head"><span class="brand-mark" data-logo></span><div><b>Citizens Bank</b><small>Citizens FAST</small></div></div>' +
      '<div class="rc-body">' +
        '<div class="rc-title"><span class="rc-tick">' + cb.icon("check", 22, 2.6) + '</span><h2>Payment Receipt !</h2>' +
        (r.title ? '<span class="chip ok">' + esc(r.title) + '</span>' : "") + '</div>' +
        '<div class="rc-ref"><span>REF</span><b id="rcRef">' + esc(r.txnId) + '</b>' +
        '<button type="button" class="icon-only btn-ghost no-print" id="rcCopyRef" aria-label="Copy reference">' + cb.icon("copy", 16) + '</button></div>' +
        (r.amount ? '<div class="rc-amt"><span>Amount</span><b>' + esc(r.amount) + '</b></div>' : "") +
        '<dl class="rc-rows">' + rows.map(function (x) {
          return '<div' + (/^total/i.test(x[0]) ? ' class="total"' : "") + '><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>';
        }).join("") + '</dl>' +
        '<p class="rc-foot">This is a system generated receipt and does not require a signature.</p>' +
      '</div></article>' +
    '<div class="rc-actions no-print">' +
      '<button type="button" class="btn-pri" id="rcPdf">' + cb.icon("download", 16) + 'Download PDF</button>' +
      '<button type="button" class="btn-sec" id="rcShare">' + cb.icon("share", 16) + 'Share</button>' +
      '<button type="button" class="btn-sec" id="rcCopy">' + cb.icon("copy", 16) + 'Copy</button>' +
      '<a class="btn-sec" href="index.html">Back to Home</a>' +
      (r.back ? '<a class="btn-link" href="' + esc(r.back) + '">Back to history</a>' : "") +
    '</div>';
  cb.$$("[data-logo]", host).forEach(function (el) { el.innerHTML = cb.LOGO; });

  function text() {
    return "Citizens Bank - Payment Receipt\nREF: " + r.txnId + (r.amount ? "\nAmount: " + r.amount : "") + "\n" +
      rows.map(function (x) { return x[0] + ": " + x[1]; }).join("\n");
  }
  function copy(t, msg) {
    var done = function () { cb.toast(msg, "success"); };
    try { navigator.clipboard.writeText(t).then(done, done); } catch (e) { done(); }
  }
  $("#rcPdf").addEventListener("click", function () { document.title = "Receipt_" + r.txnId; window.print(); });
  $("#rcCopy").addEventListener("click", function () { copy(text(), "Receipt copied"); });
  $("#rcCopyRef").addEventListener("click", function () { copy(r.txnId, "Reference copied"); });
  $("#rcShare").addEventListener("click", function () {
    if (navigator.share) navigator.share({ title: "Payment Receipt", text: text() }).catch(function () {});
    else copy(text(), "Receipt copied to share");
  });
})();
