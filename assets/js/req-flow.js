/* Shared request-flow kit (spec §5.4, §15, §16): form -> review (auth cards) -> cb.otp -> cb.done -> success.
   Used by cheque-order, cheque-stop, positive-pay, pay-order, tax-document, dispute, complain.
   Back never re-enters a finished flow: after success a history pop reloads a blank form. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$, D = window.CB_DATA || {};
  var RF = window.RF = {};
  var pad = function (n, w) { return String(n).padStart(w, "0"); };

  /* ---------- date helpers ---------- */
  RF.iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1, 2) + "-" + pad(d.getDate(), 2); };
  RF.todayIso = RF.iso(new Date());
  RF.fmtIso = function (v) {
    var p = String(v).split("-"); if (p.length !== 3) return v;
    return cb.date(new Date(+p[0], +p[1] - 1, +p[2]));
  };

  /* ---------- field errors + validator ---------- */
  RF.err = function (fld, msg) {
    if (!fld) return;
    fld.classList.toggle("invalid", !!msg);
    var e = $(".ferr", fld);
    if (!e) { e = document.createElement("span"); e.className = "ferr"; e.setAttribute("role", "alert"); fld.appendChild(e); }
    e.textContent = msg || "";
  };
  /* fields: [{ f: "#fldId", check: function () { return "" | "message"; } }] */
  RF.validator = function (root, fields) {
    var touched = {};
    function run(all) {
      var ok = true;
      fields.forEach(function (x) {
        var el = $(x.f), m = x.check();
        if (m) ok = false;
        if (!x.silent) RF.err(el, m && (all || touched[x.f]) ? m : "");
      });
      return ok;
    }
    function mark(e, force) {
      var fld = e.target.closest && e.target.closest(".fld"); if (!fld) return;
      fields.forEach(function (x) { if ($(x.f) === fld && (force || e.type !== "input")) touched[x.f] = true; });
      setTimeout(function () { run(false); }, 0);
    }
    ["focusout", "change", "input"].forEach(function (t) { root.addEventListener(t, function (e) { mark(e); }); });
    root.addEventListener("amount", function (e) { mark(e); });
    return {
      ok: function () { return fields.every(function (x) { return !x.check(); }); },
      show: function () { return run(true); },
      run: function () { run(false); },
      reset: function () { touched = {}; run(false); }
    };
  };
  RF.counter = function (ta, max, out) {
    var f = function () { out.textContent = ta.value.length + " / " + max; out.classList.toggle("near", ta.value.length > max * .9); };
    ta.maxLength = max; ta.addEventListener("input", f); f();
  };

  /* ---------- dummy cheque books ---------- */
  RF.books = function (accId) {
    var n = +String(accId).replace(/\D/g, "") || 1, b = 1000 * n;
    return [
      { id: accId + "-b1", start: b + 101, end: b + 125, used: 9, issued: "12-Mar-2026" },
      { id: accId + "-b2", start: b + 126, end: b + 150, used: 0, issued: "20-Aug-2026" }
    ];
  };
  RF.bookItems = function (accId) {
    return RF.books(accId).map(function (k) {
      return { value: k.id, title: pad(k.start, 6) + " - " + pad(k.end, 6), sub: "Issued " + k.issued + " · " + (k.end - k.start + 1) + " leaves", data: k };
    });
  };
  RF.unusedItems = function (bookId) {
    var k = RF.books(bookId.split("-")[0]).filter(function (x) { return x.id === bookId; })[0], out = [];
    if (!k) return out;
    for (var i = k.start + k.used; i <= k.end && out.length < 40; i++) out.push({ value: pad(i, 6), title: "Cheque " + pad(i, 6), sub: "Unused leaf" });
    return out;
  };

  /* ---------- request log (read by requests.html) ---------- */
  RF.log = function (rec) {
    try { var a = JSON.parse(sessionStorage.getItem("cb-requests") || "[]"); a.unshift(rec); sessionStorage.setItem("cb-requests", JSON.stringify(a.slice(0, 20))); } catch (e) {}
  };

  /* ---------- the flow ---------- */
  /* cfg: { root, icon, title, noun, refPrefix, requestType, valid(), review() -> [[k,v,'total']], hero() -> {label,big,words},
            noAuth, submitLabel, success:{ title, message, dialogTitle }, onReset() } */
  RF.flow = function (cfg) {
    var root = $(cfg.root || ".ft-main"), done = false, ref = "", noAuth = !!cfg.noAuth, total = noAuth ? 2 : 3, auth, busy = false;
    var chev = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
    var labels = noAuth ? ["Details", "Done"] : ["Details", "Review", "Done"];
    root.insertAdjacentHTML("afterbegin", '<ol class="stepper">' + labels.map(function (l, i) {
      return '<li data-step="' + (i + 1) + '"' + (i === 0 ? ' class="on"' : "") + '><span class="dot">' + (i + 1) + '</span><span class="lbl">' + l + "</span></li>";
    }).join("") + "</ol>");

    var rv = "";
    if (!noAuth) {
      rv = '<section class="ft-step rq-review" data-step="2"><div class="rq-review-head"><span class="rq-ic">' + cb.icon(cfg.icon || "clipboard", 22) + '</span><div><h2>Review your request</h2><p>Check the details below, then choose how to verify.</p></div></div>' +
        '<div id="rvHero"></div><dl class="kv" id="rvList"></dl><div id="rvAuth"></div>' +
        '<label class="check"><input type="checkbox" id="rvAgree"> I confirm that the details above are correct.</label>' +
        '<div class="ft-actions"><button type="button" class="btn-sec" id="rvEdit">' + chev + ' Edit details</button><button type="button" class="btn-pri" id="rvGo" disabled>Confirm &amp; send OTP</button></div></section>';
    }
    var ok = '<section class="ft-step" data-step="' + total + '"><div class="success"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
      '<h2 id="okTitle"></h2><p id="okMsg"></p><div class="txn-id">Reference <b id="okRef"></b><button type="button" id="okCopy" aria-label="Copy reference">' + cb.icon("copy", 14) + '</button></div>' +
      '<div class="receipt"><dl class="kv" id="okList"></dl></div>' +
      '<div class="ft-actions"><a class="btn-sec" href="requests.html">Track in Request Status</a><button type="button" class="btn-sec" id="okAgain">' + cb.icon("refresh", 16) + ' New request</button><a class="btn-pri" href="index.html">Back to dashboard</a></div></div></section>';
    root.insertAdjacentHTML("beforeend", rv + ok);

    var next = $("#next", root);
    function refresh() { if (next) next.disabled = !cfg.valid(); }
    ["input", "change", "amount", "focusout"].forEach(function (t) { root.addEventListener(t, function () { setTimeout(refresh, 0); }); });
    refresh();

    /* history: Back never re-enters a finished flow */
    try { history.replaceState({ rqStep: 1 }, ""); } catch (e) {}
    window.addEventListener("popstate", function (e) {
      if (done) { location.reload(); return; }
      show(e.state && e.state.rqStep === 2 && !noAuth ? 2 : 1);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted && done) location.reload(); });
    function show(n) { cb.step(root, n); }

    function rows(list, el) {
      el.innerHTML = list.map(function (r) { return "<div" + (r[2] ? ' class="total"' : "") + "><dt>" + cb.esc(r[0]) + "</dt><dd>" + cb.esc(r[1]) + "</dd></div>"; }).join("");
    }

    if (next) next.addEventListener("click", function () {
      if (!cfg.valid()) { if (cfg.showErrors) cfg.showErrors(); return; }
      if (noAuth) { submit(next); return; }
      rows(cfg.review(), $("#rvList", root));
      var h = cfg.hero ? cfg.hero() : null;
      $("#rvHero", root).innerHTML = h ? '<div class="review-hero"><span>' + cb.esc(h.label) + '</span><div class="big">' + cb.esc(h.big) + "</div>" + (h.words ? '<div class="words">' + cb.esc(h.words) + "</div>" : "") + "</div>" : "";
      if (!auth) auth = cb.authCards($("#rvAuth", root), { title: "Verify this request via:" });
      $("#rvAgree", root).checked = false; $("#rvGo", root).disabled = true;
      try { history.pushState({ rqStep: 2 }, ""); } catch (e) {}
      show(2);
    });

    if (!noAuth) {
      $("#rvAgree", root).addEventListener("change", function () { $("#rvGo", root).disabled = !this.checked; });
      $("#rvEdit", root).addEventListener("click", function () {
        if (history.state && history.state.rqStep === 2) history.back(); else show(1);
      });
      $("#rvGo", root).addEventListener("click", function () {
        if (busy) return; busy = true;
        var btn = this, a = auth.get() || { AUTH_SUB_TYPE: "SMS" };
        btn.disabled = true;
        cb.otp({
          message: a.AUTH_SUB_TYPE === "EMAIL" ? "OTP sent to s••••l@gmail.com" : "OTP sent to 01XXXXXX515",
          verifyText: "Verify & submit",
          onSuccess: function () { busy = false; finish(); },
          onCancel: function () { busy = false; btn.disabled = !$("#rvAgree", root).checked; cb.toast("Verification cancelled"); }
        });
      });
    }

    function submit(btn) {
      if (busy) return; busy = true; btn.classList.add("loading"); btn.disabled = true;
      setTimeout(function () { busy = false; btn.classList.remove("loading"); finish(); }, 900);
    }

    function finish() {
      done = true;
      try { history.replaceState({ rqDone: 1 }, ""); } catch (e) {}
      ref = cb.txnId(cfg.refPrefix || "REQ");
      var list = cfg.review();
      RF.log({ id: ref, type: cfg.requestType || cfg.title, icon: cfg.icon || "clipboard", status: cfg.status || "Pending", date: cb.dt(), details: list.filter(function (r) { return !r[2]; }) });
      $("#okTitle", root).textContent = cfg.success.title;
      $("#okMsg", root).textContent = cfg.success.message;
      $("#okRef", root).textContent = ref;
      rows(list.concat([["Submitted", cb.dt()]]), $("#okList", root));
      show(total);
      cb.done({ title: cfg.success.dialogTitle || cfg.success.title, message: cfg.success.message });
    }
    $("#okCopy", root).addEventListener("click", function () {
      try { navigator.clipboard.writeText(ref); } catch (e) {}
      cb.toast("Reference copied", "success");
    });
    $("#okAgain", root).addEventListener("click", function () { location.reload(); });

    return { refresh: refresh };
  };
})();
