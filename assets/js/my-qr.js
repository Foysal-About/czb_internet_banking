/* My QR (spec section 17): pick an account, real QR (assets/js/qr.js), Download PNG, Share. Design-only. */
(function () {
  var $ = cb.$;

  /* ---------- drawing ---------- */
  var BRAND = "M219 0L375 156 339 192 219 73 73 219 219 365 277 309 313 345 219 438 0 219Z M458 130L611 283 458 436 193 171 228 135 458 364 538 284 458 204 404 257 368 221Z";
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function drawQR(ctx, M, x0, y0, px) {
    var n = M.length, quiet = 2, mod = Math.floor(px / (n + quiet * 2)), off = Math.floor((px - mod * n) / 2);
    ctx.fillStyle = "white"; ctx.fillRect(x0, y0, px, px); ctx.fillStyle = tok("--gold-ink") || "black";
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (M[y][x]) ctx.fillRect(x0 + off + x * mod, y0 + off + y * mod, mod, mod);
    var lg = Math.round(px * 0.2), lx = x0 + (px - lg) / 2, ly = y0 + (px - lg) / 2;
    ctx.fillStyle = "white"; ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(lx - 4, ly - 4, lg + 8, lg + 8, lg * 0.26) : ctx.rect(lx - 4, ly - 4, lg + 8, lg + 8)); ctx.fill();
    ctx.save(); var s = (lg * 0.72) / 651; ctx.translate(lx + lg * 0.14, ly + lg * 0.5 - 219 * s); ctx.scale(s, s); ctx.fillStyle = tok("--primary-strong") || "black"; ctx.fill(new Path2D(BRAND)); ctx.restore();
  }

  var acc, matrix;
  function payload(a) { return JSON.stringify({ bank: "Citizens Bank", name: CB_DATA.user.fullName, account: a.no, branch: a.branch, type: a.kind }); }
  function paint() {
    var a = acc; matrix = cbQR.encode(payload(a));
    var cv = $("#qrCanvas"); cv.width = cv.height = 520; drawQR(cv.getContext("2d"), matrix, 0, 0, 520);
    $("#qrName").textContent = CB_DATA.user.fullName; $("#qrNo").textContent = a.no + " · " + a.kind;
  }

  var items = cb.sourceAccountItems(6).filter(function (i) { return i.data.productType === "DP01"; });
  var sel = cb.select($("#qrAcc"), { placeholder: "Select account", items: items, value: items[0] && items[0].value, onChange: function (it) { acc = it.data; paint(); } });
  acc = items[0] && items[0].data;
  if (!acc) { $(".qr-stage").innerHTML = '<div class="empty-state"><div class="es-ic">' + cb.icon("qr", 26) + "</div><b>No account available</b><p>You have no account that can receive money.</p></div>"; return; }
  paint();

  function pngCanvas() {
    var W = 800, H = 980, c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d");
    x.fillStyle = tok("--primary-strong") || "black"; x.fillRect(0, 0, W, H);
    x.fillStyle = "white"; x.beginPath(); (x.roundRect ? x.roundRect(60, 60, W - 120, H - 120, 40) : x.rect(60, 60, W - 120, H - 120)); x.fill();
    drawQR(x, matrix, 130, 130, 540);
    x.textAlign = "center"; x.fillStyle = tok("--gold-ink") || "black"; x.font = "700 38px sans-serif"; x.fillText(CB_DATA.user.fullName, W / 2, 740);
    x.font = "500 30px sans-serif"; x.fillText(acc.no, W / 2, 790);
    x.font = "400 24px sans-serif"; x.fillText("Citizens FAST · Pay into this account", W / 2, 850);
    return c;
  }
  $("#qrDl").onclick = function () {
    var c = pngCanvas(), a = document.createElement("a");
    a.download = "citizens-fast-qr-" + acc.no.slice(-4) + ".png"; a.href = c.toDataURL("image/png"); document.body.appendChild(a); a.click(); a.remove();
    cb.toast("QR code downloaded", "success");
  };
  var text = function () { return "Pay into my Citizens Bank account\n" + CB_DATA.user.fullName + "\nAccount " + acc.no + " · " + acc.branch + " Branch"; };
  function copy() { try { navigator.clipboard.writeText(text()); } catch (e) {} cb.toast("Account details copied", "success"); }
  $("#qrCopy").onclick = copy;
  $("#qrShare").onclick = function () {
    if (navigator.share) { navigator.share({ title: "My Citizens FAST QR", text: text() }).catch(function () {}); } else copy();
  };
})();
