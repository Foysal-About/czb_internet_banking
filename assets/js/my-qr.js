/* My QR (spec section 17): pick an account, real QR (inline generator), Download PNG, Share. Design-only. */
(function () {
  var $ = cb.$;

  /* ---------- compact QR encoder: byte mode, ECC level M, versions 1-12 ---------- */
  var ECC = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22], BLK = [-1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9];
  function rawModules(v) { var r = (16 * v + 128) * v + 64; if (v >= 2) { var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; }
  function mul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; }
  function rs(data, d) {
    var g = []; for (var i = 0; i < d - 1; i++) g.push(0); g.push(1); var root = 1;
    for (i = 0; i < d; i++) { for (var j = 0; j < g.length; j++) { g[j] = mul(g[j], root); if (j + 1 < g.length) g[j] ^= g[j + 1]; } root = mul(root, 2); }
    var r = g.map(function () { return 0; });
    data.forEach(function (b) { var f = b ^ r.shift(); r.push(0); g.forEach(function (c, k) { r[k] ^= mul(c, f); }); });
    return r;
  }
  function encode(text) {
    var bytes = Array.prototype.slice.call(new TextEncoder().encode(text)), v, cap;
    for (v = 1; v <= 12; v++) { cap = Math.floor(rawModules(v) / 8) - ECC[v] * BLK[v]; if (bytes.length + 2 + (v >= 10 ? 1 : 0) <= cap) break; }
    if (v > 12) { bytes = bytes.slice(0, 150); v = 12; cap = Math.floor(rawModules(v) / 8) - ECC[v] * BLK[v]; }
    var bits = []; function put(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4); put(bytes.length, v >= 10 ? 16 : 8); bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap * 8 - bits.length)); while (bits.length % 8) bits.push(0);
    for (var pad = 0xEC; bits.length < cap * 8; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = []; for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; data.push(b); }
    // blocks + interleave
    var nb = BLK[v], el = ECC[v], raw = Math.floor(rawModules(v) / 8), ns = nb - raw % nb, sl = Math.floor(raw / nb), blocks = [], pos = 0;
    for (i = 0; i < nb; i++) { var dat = data.slice(pos, pos + sl - el + (i < ns ? 0 : 1)); pos += dat.length; var e = rs(dat, el); if (i < ns) dat.push(0); blocks.push(dat.concat(e)); }
    var out = []; for (i = 0; i < blocks[0].length; i++) blocks.forEach(function (bk, j) { if (i !== sl - el || j >= ns) out.push(bk[i]); });
    return build(v, out);
  }
  function build(v, cw) {
    var size = v * 4 + 17, M = [], FN = [];
    for (var y = 0; y < size; y++) { M.push(new Array(size).fill(false)); FN.push(new Array(size).fill(false)); }
    function set(x, y, d) { M[y][x] = d; FN[y][x] = true; }
    for (var i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) { for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) { var xx = c[0] + dx, yy = c[1] + dy, d = Math.max(Math.abs(dx), Math.abs(dy)); if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, d !== 2 && d !== 4); } });
    var ap = []; if (v > 1) { var na = Math.floor(v / 7) + 2, step = Math.ceil((v * 4 + 4) / (na * 2 - 2)) * 2; ap = [6]; for (var p = size - 7; ap.length < na; p -= step) ap.splice(1, 0, p); }
    ap.forEach(function (cy, a) { ap.forEach(function (cx, b) { if ((a === 0 && b === 0) || (a === 0 && b === ap.length - 1) || (a === ap.length - 1 && b === 0)) return; for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }); });
    function fmt(mask) {
      var d = (0 << 3) | mask, r = d; for (var k = 0; k < 10; k++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var bits = ((d << 10) | r) ^ 0x5412, g = function (n) { return ((bits >>> n) & 1) !== 0; };
      for (k = 0; k <= 5; k++) set(8, k, g(k)); set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8)); for (k = 9; k < 15; k++) set(14 - k, 8, g(k));
      for (k = 0; k < 8; k++) set(size - 1 - k, 8, g(k)); for (k = 8; k < 15; k++) set(8, size - 15 + k, g(k)); set(8, size - 8, true);
    }
    fmt(0);
    if (v >= 7) { var r = v; for (i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); var vb = (v << 12) | r; for (i = 0; i < 18; i++) { var c = ((vb >>> i) & 1) !== 0, a = size - 11 + i % 3, b = Math.floor(i / 3); set(a, b, c); set(b, a, c); } }
    var k2 = 0; for (var right = size - 1; right >= 1; right -= 2) { if (right === 6) right = 5; for (var vert = 0; vert < size; vert++) for (var j = 0; j < 2; j++) { var x = right - j, up = ((right + 1) & 2) === 0, yy2 = up ? size - 1 - vert : vert; if (!FN[yy2][x] && k2 < cw.length * 8) { M[yy2][x] = ((cw[k2 >>> 3] >>> (7 - (k2 & 7))) & 1) !== 0; k2++; } } }
    var MASKS = [function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; }, function (x, y) { return x % 3 === 0; }, function (x, y) { return (x + y) % 3 === 0; }, function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; }, function (x, y) { return x * y % 2 + x * y % 3 === 0; }, function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; }, function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }];
    function apply(m) { for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) if (!FN[yy][xx] && MASKS[m](xx, yy)) M[yy][xx] = !M[yy][xx]; }
    function pen() { var s = 0; for (var t = 0; t < 2; t++) for (var a = 0; a < size; a++) { var run = 1; for (var b = 1; b < size; b++) { var cur = t ? M[b][a] : M[a][b], prev = t ? M[b - 1][a] : M[a][b - 1]; if (cur === prev) { run++; if (run === 5) s += 3; else if (run > 5) s++; } else run = 1; } } return s; }
    var best = 0, bp = 1e9; for (var m = 0; m < 8; m++) { apply(m); var pp = pen(); if (pp < bp) { bp = pp; best = m; } apply(m); }
    apply(best); fmt(best);
    return M;
  }

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
    var a = acc; matrix = encode(payload(a));
    var cv = $("#qrCanvas"); cv.width = cv.height = 520; drawQR(cv.getContext("2d"), matrix, 0, 0, 520);
    $("#qrName").textContent = CB_DATA.user.fullName; $("#qrNo").textContent = a.no + " · " + a.kind;
  }

  var items = cb.accountItems(6).filter(function (i) { return i.data.productType === "DP01"; });
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
