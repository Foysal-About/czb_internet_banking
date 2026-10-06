/* Login page (spec 6.1 / 6.2): banner carousel, login form, "trouble logging in" chooser. */
(function () {
  var cb = window.cb, $ = cb.$, $$ = cb.$$, t = cb.t;
  var KEY = "cb-remember-uid";

  $("#langLbl").textContent = cb.lang === "bn" ? "English" : "বাংলা";

  // ---------- banner carousel (bundled gradient slides; optional CB_DATA.banners image URLs layer on top) ----------
  var slides = [
    { g: "g1", ic: "smartphone", k: t("Citizens FAST", "Citizens FAST"), h: t("Bank anywhere, anytime", "যেকোনো সময়, যেকোনো স্থানে ব্যাংকিং"), p: t("Transfers, bills, cards and more, all from one secure place.", "ট্রান্সফার, বিল, কার্ড এবং আরও অনেক কিছু, একটি নিরাপদ জায়গায়।") },
    { g: "g2", ic: "send", k: t("Fund transfer", "ফান্ড ট্রান্সফার"), h: t("Send money to any bank in seconds", "সেকেন্ডে যেকোনো ব্যাংকে টাকা পাঠান"), p: t("Own, other Citizens accounts, other banks via NPSB and mobile wallets.", "নিজের, অন্য সিটিজেন্স অ্যাকাউন্ট, NPSB-এর মাধ্যমে অন্য ব্যাংক ও মোবাইল ওয়ালেটে।") },
    { g: "g3", ic: "gift", k: t("Offers", "অফার"), h: t("Cashback on everyday payments", "প্রতিদিনের পেমেন্টে ক্যাশব্যাক"), p: t("Explore partner discounts and lifestyle offers near you.", "আপনার কাছের পার্টনার ডিসকাউন্ট ও লাইফস্টাইল অফার দেখুন।") },
    { g: "g4", ic: "shieldCheck", k: t("Stay secure", "নিরাপদ থাকুন"), h: t("Never share your OTP or password", "OTP বা পাসওয়ার্ড কারো সাথে শেয়ার করবেন না"), p: t("Citizens Bank will never ask for them by phone, SMS or email.", "সিটিজেন্স ব্যাংক ফোন, SMS বা ইমেইলে এগুলো কখনো চাইবে না।") }
  ];
  var banners = (window.CB_DATA && CB_DATA.banners) || [];
  var car = $("#car"), dotsEl = $("#carDots"), cur = 0, timer = null;

  car.innerHTML = slides.map(function (s, i) {
    var img = banners[i] && /^(https?:|data:image)/.test(banners[i]) ? '<img src="' + banners[i] + '" alt="" onerror="this.remove()">' : "";
    return '<article class="pub-slide ' + s.g + (i === 0 ? " on" : "") + '" aria-hidden="' + (i !== 0) + '" aria-label="' + (i + 1) + " / " + slides.length + '">' + img +
      '<div class="pub-slide-ic">' + cb.icon(s.ic, 48, 1.8) + "</div><small>" + s.k + "</small><h2>" + s.h + "</h2><p>" + s.p + "</p></article>";
  }).join("");
  dotsEl.innerHTML = slides.map(function (s, i) {
    return '<button type="button" role="tab" aria-label="Slide ' + (i + 1) + '" class="' + (i === 0 ? "on" : "") + '" data-i="' + i + '"></button>';
  }).join("");

  function go(n) {
    cur = (n + slides.length) % slides.length;
    $$(".pub-slide", car).forEach(function (el, i) { el.classList.toggle("on", i === cur); el.setAttribute("aria-hidden", String(i !== cur)); });
    $$("button", dotsEl).forEach(function (b, i) { b.classList.toggle("on", i === cur); b.setAttribute("aria-selected", String(i === cur)); });
  }
  function play() {
    stop();
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(function () { go(cur + 1); }, 4000);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  dotsEl.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) { go(+b.dataset.i); play(); } });
  car.addEventListener("mouseenter", stop); car.addEventListener("mouseleave", play);
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
  play();

  // ---------- login form ----------
  var uid = $("#uid"), pwd = $("#pwd"), btn = $("#loginBtn"), remember = $("#remember"), bar = $("#loginErr");
  try { var saved = localStorage.getItem(KEY); if (saved) { uid.value = saved; remember.checked = true; } } catch (e) {}

  function sync() { btn.disabled = !(uid.value.trim() && pwd.value); }
  function clearErr() { bar.classList.remove("show"); }
  [uid, pwd].forEach(function (el) { el.addEventListener("input", function () { sync(); clearErr(); }); });
  sync();

  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    var id = uid.value.trim();
    try { if (remember.checked) localStorage.setItem(KEY, id); else localStorage.removeItem(KEY); } catch (er) {}
    btn.classList.add("loading"); btn.disabled = true;
    setTimeout(function () {
      if (pwd.value === "wrong") {
        btn.classList.remove("loading"); sync();
        $("#loginErrTxt").textContent = t("Login failed. Please check your User ID and password.", "লগইন ব্যর্থ হয়েছে। আপনার ইউজার আইডি ও পাসওয়ার্ড পরীক্ষা করুন।");
        bar.classList.add("show"); pwd.value = ""; sync(); pwd.focus();
        return;
      }
      try { sessionStorage.setItem("cb-session", JSON.stringify({ userId: id, at: Date.now() })); } catch (er) {}
      location.replace("index.html"); // replace so Back does not return to login
    }, 900);
  });

  // ---------- trouble chooser ----------
  function view(id) {
    $$(".pub-view").forEach(function (v) { v.classList.toggle("on", v.id === id); });
    var f = id === "vLogin" ? uid : $(".pub-choice");
    if (f) f.focus();
  }
  $("#forgotLnk").addEventListener("click", function () { view("vTrouble"); });
  $("#backLogin").addEventListener("click", function () { view("vLogin"); });
  if (location.hash === "#trouble") view("vTrouble");
})();
