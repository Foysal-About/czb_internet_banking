/* Tax document upload (spec §16): type drives one required field per non-blank param; file <= 5 MB */
(function () {
  var $ = cb.$, root = $(".ft-main"), MAX = 5 * 1024 * 1024;
  var TYPES = [
    { id: "1", name: "TIN Certificate", params: ["TIN Number (e.g. 123456789012)", "Issue Date (e.g. 01-Jan-2026)", "", "Taxes Circle (e.g. Circle-12, Dhaka)"] },
    { id: "2", name: "Income Tax Return Acknowledgement", params: ["Assessment Year (e.g. 2026-2027)", "Submission Date (e.g. 30-Nov-2026)", "Tax Paid (e.g. 25000)"] },
    { id: "3", name: "Source Tax Deduction Certificate", params: ["Certificate Number (e.g. STD-2026-0045)", "Deduction Date (e.g. 15-Sep-2026)"] },
    { id: "4", name: "Trade License", params: ["License Number (e.g. TRAD/DNCC/012345)", "Expiry Date (e.g. 30-Jun-2027)", "Issuing Authority (e.g. Dhaka North City Corporation)"] },
    { id: "5", name: "Other Supporting Document", params: ["Document Title (e.g. Rent agreement)"] }
  ];
  var type = cb.select($("#type"), { items: TYPES.map(function (t) { return { value: t.id, title: t.name, data: t }; }), placeholder: "Select document type", search: false, onChange: renderParams });
  var params = $("#params"), empty = $("#paramsEmpty"), cur = [], file = null;

  function label(s) { return s.split("(")[0].trim(); }
  function sample(s) { var m = s.match(/e\.g\.\s*([^)]*)/i); return m ? m[1].trim() : ""; }
  function renderParams(it) {
    cur = it.data.params.filter(function (p) { return p.trim(); }).map(function (p, i) {
      var l = label(p); return { id: "p" + i, label: l, date: /date/i.test(l), ph: sample(p), el: null };
    });
    params.innerHTML = cur.map(function (p) {
      return '<div class="fld" id="f' + p.id + '"><label>' + cb.esc(p.label) + ' <span class="req">*</span></label>' +
        (p.date ? '<input type="date" id="' + p.id + '" max="' + RF.todayIso + '" aria-label="' + cb.esc(p.label) + '">' : '<input type="text" id="' + p.id + '" placeholder="e.g. ' + cb.esc(p.ph) + '" autocomplete="off" maxlength="60">') + '<span class="ferr"></span></div>';
    }).join("");
    cur.forEach(function (p) { p.el = $("#" + p.id); });
    empty.hidden = true; v.reset();
    setTimeout(function () { var e = new Event("change", { bubbles: true }); params.dispatchEvent(e); }, 0);
  }

  /* file */
  var drop = $("#drop"), input = $("#file"), picked = $("#picked"), fileErr = "";
  function size(b) { return b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + " KB" : (b / 1024 / 1024).toFixed(1) + " MB"; }
  function take(f) {
    if (!f) return;
    if (f.size > MAX) { file = null; fileErr = "That file is " + size(f.size) + ". The maximum size is 5 MB."; }
    else if (f.size === 0) { file = null; fileErr = "That file is empty. Choose another file."; }
    else { file = f; fileErr = ""; }
    paint(); v.show(); root.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function paint() {
    drop.hidden = !!file; picked.hidden = !file;
    if (file) { $("#pName").textContent = file.name; $("#pSize").textContent = size(file.size); var x = (file.name.split(".").pop() || "file").slice(0, 4).toUpperCase(); $("#pExt").textContent = file.name.indexOf(".") > 0 ? x : "FILE"; }
  }
  drop.addEventListener("click", function () { input.click(); });
  drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", function (e) { e.stopPropagation(); take(input.files[0]); input.value = ""; });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("drag"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("drag"); }); });
  drop.addEventListener("drop", function (e) { take(e.dataTransfer.files[0]); });
  $("#pClear").addEventListener("click", function () { file = null; fileErr = ""; paint(); v.show(); root.dispatchEvent(new Event("change", { bubbles: true })); });

  var v = RF.validator(root, [
    { f: "#ftype", check: function () { return type.value ? "" : "Select the document type."; } },
    { f: "#params", silent: true, check: function () {
      for (var i = 0; i < cur.length; i++) {
        var p = cur[i], val = p.el.value.trim();
        if (!val) return "Enter " + p.label.toLowerCase() + ".";
        if (p.date && val > RF.todayIso) return p.label + " cannot be in the future.";
      }
      return "";
    } },
    { f: "#ffile", check: function () { return fileErr || (file ? "" : "Choose the document file to upload."); } }
  ]);
  /* per-parameter errors: the "#params" container has no .fld, so show them on each field */
  params.addEventListener("focusout", function (e) {
    var f = e.target.closest(".fld"); if (!f || !f.id) return;
    var p = cur.filter(function (x) { return "f" + x.id === f.id; })[0]; if (!p) return;
    var val = p.el.value.trim();
    RF.err(f, !val ? "Enter " + p.label.toLowerCase() + "." : p.date && val > RF.todayIso ? "Date cannot be in the future." : "");
  });
  params.addEventListener("input", function (e) { var f = e.target.closest(".fld"); if (f && f.classList.contains("invalid") && e.target.value.trim()) RF.err(f, ""); });

  RF.flow({
    root: ".ft-main", icon: "fileUp", title: "Tax Document", requestType: "Tax document upload", refPrefix: "CTD", showErrors: v.show,
    valid: v.ok,
    review: function () {
      var rows = [["Document type", type.item.title]];
      cur.forEach(function (p) { rows.push([p.label, p.date ? RF.fmtIso(p.el.value) : p.el.value.trim()]); });
      rows.push(["File", file.name], ["File size", size(file.size)]);
      return rows;
    },
    success: { title: "Document uploaded", dialogTitle: "Document upload submitted", message: "Your document has been uploaded successfully." },
    side: { next: [["Verify", "Confirm the upload with a one-time password."], ["We review the file", "A team member checks it against your details."], ["Done", "Any follow-up appears in Request Status."]], tat: ["Typical review time", "1 to 2 working days"] }
  });
})();
