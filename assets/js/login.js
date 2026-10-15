/* Login page (spec 6.1 / 6.2): brand carousel, login form, "trouble logging in" chooser, sign-up (app-only registration).
   Views: #vLogin (default), #vTrouble (login.html#trouble), #vSignup (login.html#signup). */
(function () {
  var cb = window.cb, P = window.cbPub, $ = cb.$, $$ = cb.$$;
  var KEY = "cb-remember-uid";

  // ---------- brand carousel ----------
  var slides = [
    { ic: "smartphone", k: "Citizens FAST", h: "Bank anywhere, anytime", p: "Transfers, bills, cards and more, all from one secure place." },
    { ic: "send", k: "NPSB · BEFTN · RTGS", h: "Send money to any bank in seconds", p: "Own, other Citizens accounts, other banks via NPSB and mobile wallets." },
    { ic: "gift", k: "Lifestyle offers", h: "Cashback on everyday payments", p: "Explore partner discounts and lifestyle offers near you." },
    { ic: "shieldCheck", k: "Never share your OTP", h: "Your security comes first", p: "Citizens Bank will never ask for your OTP or password by phone, SMS or email." }
  ];
  var phone = '<div class="auth-phone" aria-hidden="true"><i class="p-notch"></i><i class="p-bar l"></i><i class="p-bar r"></i><i class="p-card l"></i><i class="p-card r"></i><i class="p-pill"></i><i class="p-block"></i><i class="p-home"></i></div>';
  var car = $("#car"), dotsEl = $("#carDots"), cur = 0, timer = null;

  car.innerHTML = slides.map(function (s, i) {
    return '<section class="auth-slide' + (i === 0 ? " on" : "") + '" aria-hidden="' + (i !== 0) + '" aria-label="' + (i + 1) + " / " + slides.length + '">' + phone +
      "<h2>" + s.h + "</h2><p>" + s.p + '</p><span class="auth-badge">' + cb.icon(s.ic, 14, 2) + s.k + "</span></section>";
  }).join("");
  dotsEl.innerHTML = slides.map(function (s, i) {
    return '<button type="button" role="tab" aria-label="Go to slide ' + (i + 1) + '" aria-selected="' + (i === 0) + '" class="' + (i === 0 ? "on" : "") + '" data-i="' + i + '"></button>';
  }).join("");

  function go(n) {
    cur = (n + slides.length) % slides.length;
    $$(".auth-slide", car).forEach(function (el, i) { el.classList.toggle("on", i === cur); el.setAttribute("aria-hidden", String(i !== cur)); });
    $$("button", dotsEl).forEach(function (b, i) { b.classList.toggle("on", i === cur); b.setAttribute("aria-selected", String(i === cur)); });
  }
  function play() {
    stop();
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(function () { go(cur + 1); }, 5000);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  dotsEl.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) { go(+b.dataset.i); play(); } });
  car.addEventListener("mouseenter", stop); car.addEventListener("mouseleave", play);
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
  play();

  // ---------- views ----------
  var brand = $("#brand"), back = $("#backBtn"), inner = $("#inner"), panel = $("#panel");
  var HASH = { vLogin: "", vTrouble: "#trouble", vSignup: "#signup" };
  function view(id, focus) {
    $$(".auth-view").forEach(function (v) { v.classList.toggle("on", v.id === id); });
    var signup = id === "vSignup";
    brand.classList.toggle("is-signup", signup);
    inner.classList.toggle("wide", signup);
    back.hidden = id === "vLogin";
    panel.classList.toggle("no-back", id === "vLogin");
    if (signup) demo.start(); else demo.stop();
    try { history.replaceState(null, "", location.pathname + location.search + HASH[id]); } catch (e) {}
    if (focus === false) return;
    window.scrollTo(0, 0);
    var f = id === "vLogin" ? uid : id === "vSignup" ? $("#suTitle") : $(".auth-choice");
    if (f) f.focus({ preventScroll: true });
  }
  document.addEventListener("click", function (e) { var g = e.target.closest("[data-go]"); if (g) view(g.dataset.go); });
  back.addEventListener("click", function () { view("vLogin"); });
  $("#forgotLnk").addEventListener("click", function () { view("vTrouble"); });

  // ---------- login form ----------
  var uid = $("#uid"), pwd = $("#pwd"), btn = $("#loginBtn"), remember = $("#remember"), bar = $("#loginErr");
  try { var saved = localStorage.getItem(KEY); if (saved) { uid.value = saved; remember.checked = true; } } catch (e) {}

  // ---------- captcha (design build: generated and checked in the browser; the API must verify it server-side) ----------
  var CAPTCHA_ENFORCED = false; // development: captcha shows but never blocks sign-in. Set true before release.
  var capIn = $("#capIn"), capImg = $("#capImg"), capCode = "", capW = 0;
  var CAP_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabdefghjkmnpqrtuy23456789"; // no 0/O, 1/l/I, c/s/v/w/x/z look-alikes
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function drawCaptcha() {
    var w = capImg.clientWidth || 190, h = capImg.clientHeight || 56, dpr = window.devicePixelRatio || 1;
    capW = w; capImg.width = Math.round(w * dpr); capImg.height = Math.round(h * dpr);
    var g = capImg.getContext("2d"), cs = getComputedStyle(document.documentElement);
    var ink = cs.getPropertyValue("--text").trim() || "#374151", mute = cs.getPropertyValue("--muted").trim() || "#757575";
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    g.fillStyle = mute; g.globalAlpha = .35;
    for (var i = 0; i < 45; i++) g.fillRect(rnd(0, w), rnd(0, h), 1.6, 1.6);
    g.strokeStyle = mute; g.lineWidth = 1; g.globalAlpha = .45;
    for (i = 0; i < 3; i++) { g.beginPath(); g.moveTo(0, rnd(0, h)); g.bezierCurveTo(w / 3, rnd(0, h), w * 2 / 3, rnd(0, h), w, rnd(0, h)); g.stroke(); }
    // characters sit left of the refresh button
    var step = Math.min(26, (w - 52) / capCode.length), x0 = 14 + step / 2;
    g.globalAlpha = 1; g.fillStyle = ink; g.font = "500 22px 'DM Mono', 'Courier New', monospace"; g.textAlign = "center"; g.textBaseline = "middle";
    for (i = 0; i < capCode.length; i++) {
      g.save(); g.translate(x0 + i * step, h / 2 + rnd(-4, 4)); g.rotate(rnd(-.35, .35)); g.fillText(capCode[i], 0, 0); g.restore();
    }
    g.strokeStyle = ink; g.globalAlpha = .7; g.lineWidth = 1.5; g.beginPath();
    g.moveTo(x0 - step / 2, h / 2 + rnd(-3, 3)); g.quadraticCurveTo(x0 + step * capCode.length / 2, h / 2 + rnd(-9, 9), x0 + step * (capCode.length - .5), h / 2 + rnd(-3, 3)); g.stroke();
  }
  function newCaptcha() {
    capCode = "";
    for (var i = 0; i < 6; i++) capCode += CAP_CHARS[Math.floor(Math.random() * CAP_CHARS.length)];
    capIn.value = ""; drawCaptcha();
  }
  function captchaError(msg) {
    var b = capIn.closest(".fld"), e = $(".ferr", b);
    if (!e) { e = document.createElement("div"); e.className = "ferr"; e.setAttribute("role", "alert"); b.appendChild(e); }
    e.textContent = msg; b.classList.add("invalid"); capIn.setAttribute("aria-invalid", "true");
  }
  newCaptcha();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawCaptcha);
  $("#capNew").addEventListener("click", function () {
    var b = this; b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
    newCaptcha(); login.update(); capIn.focus();
  });
  document.addEventListener("click", function (e) { if (e.target.closest("#themeToggle")) setTimeout(drawCaptcha, 0); });
  window.addEventListener("resize", function () { if (capImg.clientWidth !== capW) drawCaptcha(); });

  var login = P.form([
    { el: uid, rule: P.rules.required("User ID") },
    { el: pwd, rule: P.rules.required("Password") }
  ].concat(CAPTCHA_ENFORCED ? [{ el: capIn, rule: function (v) { return String(v).trim() ? "" : "Please enter the captcha"; } }] : []), btn);
  [uid, pwd, capIn].forEach(function (el) { el.addEventListener("input", function () { bar.classList.remove("show"); }); });

  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!login.valid()) { login.showAll(); return; }
    if (CAPTCHA_ENFORCED && capIn.value.trim().toLowerCase() !== capCode.toLowerCase()) {
      newCaptcha(); login.update();
      captchaError("The captcha didn't match. Please try the new one.");
      capIn.focus(); return;
    }
    var id = uid.value.trim();
    try { if (remember.checked) localStorage.setItem(KEY, id); else localStorage.removeItem(KEY); } catch (er) {}
    btn.classList.add("loading"); btn.disabled = true;
    $("#loginBtnTxt").textContent = "Signing in…";
    setTimeout(function () {
      if (pwd.value === "wrong") {
        btn.classList.remove("loading");
        $("#loginBtnTxt").textContent = "Sign In";
        $("#loginErrTxt").textContent = "Login failed. Please check your User ID and password.";
        bar.classList.add("show"); pwd.value = ""; newCaptcha(); login.update(); pwd.focus();
        return;
      }
      try { sessionStorage.setItem("cb-session", JSON.stringify({ userId: id, at: Date.now() })); } catch (er) {}
      location.replace("index.html"); // replace so Back does not return to login
    }, 900);
  });

  // ---------- sign up: registration is app-only; the phone walks through the app flow in step with the list ----------
  var demo = (function () {
    var screens = $$("#suPhone .su-s"), steps = $$("#suSteps li"), DUR = [3600, 3800, 3400, 3600], at = -1, t = null;
    var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    steps.forEach(function (li, i) { li.style.setProperty("--d", DUR[i] + "ms"); });
    function show(n) {
      var prev = screens[at];
      at = n % screens.length;
      screens.forEach(function (s, i) { s.classList.toggle("on", i === at); s.classList.toggle("out", s === prev && i !== at); });
      steps.forEach(function (li, i) { li.classList.toggle("on", i === at); li.classList.toggle("done", i < at); });
    }
    function tick() { t = setTimeout(function () { show(at + 1); tick(); }, DUR[at]); }
    function stop() { clearTimeout(t); t = null; }
    function start() {
      stop();
      if (still) { show(1); return; } // static: the register screen, filled in
      show(0); tick();
    }
    document.addEventListener("visibilitychange", function () {
      if (!$("#vSignup").classList.contains("on") || still) return;
      if (document.hidden) stop(); else if (!t) tick();
    });
    return { start: start, stop: stop };
  })();

  // put the visitor's own store first on a phone
  var os = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ? "ios" : /android/i.test(navigator.userAgent) ? "android" : "";
  if (os) { var mine = $('#suStores [data-os="' + os + '"]'); mine.parentNode.insertBefore(mine, mine.parentNode.firstChild); }

  // ---------- initial view ----------
  if (location.hash === "#trouble") view("vTrouble", false);
  else if (location.hash === "#signup") view("vSignup", false);
  else view("vLogin", false);
})();
