/* Citizens FAST internet banking portal: shared shell + component kit (design build, no API).
   Every page loads: assets/data.js, then assets/app.js.
   <body data-page="..."> highlights the menu item. <body data-shell="public"> skips the sidebar/top bar.
   Components live on window.cb. See the README in /assets for usage. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var D = window.CB_DATA || {};
  var cb = window.cb = {};
  cb.$ = $; cb.$$ = $$;

  // ===================================================================
  // Icons (Lucide, ISC licence). cb.icon(name, size, stroke)
  // ===================================================================
  var I = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    landmark: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M12 2 20 7H4z"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    sheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    arrowLR: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12.667 8 10 12h4l-2.667 4"/>',
    smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    cardPlus: '<path d="M22 12V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9"/><path d="M2 10h20"/><path d="M19 16v6"/><path d="M16 19h6"/>',
    piggy: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/>',
    calCheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    lockOpen: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    fileUp: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    qr: '<rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="4"/><path d="M18 20a6 6 0 0 0-12 0"/>',
    idCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><path d="M16 10h2"/><path d="M16 14h2"/>',
    key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    lock: '<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M16 14v4"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    trending: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>', plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', arrowL: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
    copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    dots: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phoneCall: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>', globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    cheque: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h6"/><path d="M6 14h3"/><path d="M14 14h4"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>'
  };
  cb.icon = function (name, size, stroke) {
    size = size || 18;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (stroke || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || I.info) + "</svg>";
  };
  cb.LOGO = '<svg viewBox="0 0 611 438" aria-hidden="true"><path fill="currentColor" d="M219 0L375 156 339 192 219 73 73 219 219 365 277 309 313 345 219 438 0 219Z M458 130L611 283 458 436 193 171 228 135 458 364 538 284 458 204 404 257 368 221Z"/></svg>';

  // ===================================================================
  // Brand Logos (Exact official vector identities for partner brands)
  // cb.brandLogo(name, size)
  // ===================================================================
  var BRAND_LOGOS = {
    aarong: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Aarong" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<radialGradient id="aarBg" cx="50%" cy="38%" r="65%"><stop offset="0%" stop-color="#991F22"/><stop offset="100%" stop-color="#671114"/></radialGradient>' +
        '<linearGradient id="aarGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE8B7"/><stop offset="50%" stop-color="#E5BE6E"/><stop offset="100%" stop-color="#C2963A"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="url(#aarBg)"/>' +
      '<circle cx="50" cy="40" r="27" fill="none" stroke="url(#aarGold)" stroke-width="1.2" stroke-dasharray="2 1.5" opacity="0.6"/>' +
      '<g fill="url(#aarGold)">' +
        '<path d="M50 19 C48 23 48 29 50 32 C52 29 52 23 50 19Z"/>' +
        '<path d="M43 21 C43 25 45 30 48 33 C46 30 44 25 43 21Z"/>' +
        '<path d="M57 21 C57 25 55 30 52 33 C54 30 56 25 57 21Z"/>' +
        '<path d="M37 26 C38 30 42 33 46 35 C43 32 40 28 37 26Z"/>' +
        '<path d="M63 26 C62 30 58 33 54 35 C57 32 60 28 63 26Z"/>' +
        '<path d="M33 33 C36 36 40 37 45 37 C41 36 37 34 33 33Z"/>' +
        '<path d="M67 33 C64 36 60 37 55 37 C59 36 63 34 67 33Z"/>' +
        '<circle cx="50" cy="17" r="1.8"/><circle cx="42" cy="19" r="1.8"/><circle cx="58" cy="19" r="1.8"/><circle cx="35" cy="24" r="1.8"/><circle cx="65" cy="24" r="1.8"/><circle cx="31" cy="32" r="1.8"/><circle cx="69" cy="32" r="1.8"/>' +
        '<path d="M50 33 C47 33 45 36 45 40 C45 45 48 49 51 52 C53 50 55 46 55 42 C55 37 52 33 50 33Z"/>' +
        '<circle cx="49" cy="34" r="3.2"/><path d="M46 34 L41 35 L46 36.5 Z"/>' +
        '<circle cx="47" cy="30" r="1"/><circle cx="49" cy="29" r="1"/><circle cx="51" cy="30" r="1"/>' +
        '<path d="M43 53 Q50 51 57 53 Q54 55 46 55 Z"/>' +
      '</g>' +
      '<text x="50" y="80" font-family="Georgia, \'Times New Roman\', serif" font-size="16" font-weight="700" letter-spacing="2" fill="#FFE8B7" text-anchor="middle">aarong</text>' +
      '<line x1="32" y1="86" x2="68" y2="86" stroke="url(#aarGold)" stroke-width="0.8" opacity="0.6"/>' +
    '</svg>',

    pizzahut: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Pizza Hut" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="phRed" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#EE2737"/><stop offset="100%" stop-color="#BF0D1C"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="#FFFFFF"/>' +
      '<rect x="2" y="2" width="96" height="96" rx="18" fill="none" stroke="#F0EBE6" stroke-width="1.5"/>' +
      '<path d="M14 43 C22 38 36 35 50 35 C64 35 78 38 86 43 C83 37 78 31 72 27 C64 21 58 18 50 18 C42 18 36 21 28 27 C22 31 17 37 14 43 Z" fill="url(#phRed)"/>' +
      '<path d="M10 44 C22 38 38 36 50 36 C62 36 78 38 90 44 C82 48 66 50 50 50 C34 50 18 48 10 44 Z" fill="#BA0C1D"/>' +
      '<path d="M25 54 C36 51 64 51 75 54 C63 56.5 37 56.5 25 54 Z" fill="#FFC220"/>' +
      '<text x="50" y="72" font-family="\'Arial Black\', Impact, sans-serif" font-weight="900" font-size="16" fill="#141414" text-anchor="middle" letter-spacing="-0.5">Pizza</text>' +
      '<text x="50" y="87" font-family="\'Arial Black\', Impact, sans-serif" font-weight="900" font-size="16" fill="#141414" text-anchor="middle" letter-spacing="-0.5">Hut</text>' +
    '</svg>',

    usbangla: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="US-Bangla" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="usbSky" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00BAEE"/><stop offset="100%" stop-color="#0086CE"/></linearGradient>' +
        '<linearGradient id="usbNavy" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0C2F55"/><stop offset="100%" stop-color="#06182E"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="#FFFFFF"/>' +
      '<rect x="2" y="2" width="96" height="96" rx="18" fill="none" stroke="#E3EAF2" stroke-width="1.5"/>' +
      '<path d="M22 41 C36 29 55 21 82 17 C68 26 54 36 43 45 C34 46 26 44 22 41 Z" fill="url(#usbNavy)"/>' +
      '<path d="M16 52 C32 40 52 32 78 28 C62 39 48 49 37 57 C27 58 20 56 16 52 Z" fill="url(#usbSky)"/>' +
      '<circle cx="73" cy="22" r="4.5" fill="#E62B2B"/>' +
      '<text x="50" y="75" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="900" font-size="11" fill="#0C2F55" text-anchor="middle" letter-spacing="0.5">US-BANGLA</text>' +
      '<text x="50" y="87" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#00A2DF" text-anchor="middle" letter-spacing="2">AIRLINES</text>' +
    '</svg>',

    daraz: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Daraz" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="dzBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF6B00"/><stop offset="100%" stop-color="#F14A00"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="url(#dzBg)"/>' +
      '<g transform="translate(50, 42) scale(0.92)">' +
        '<path d="M0 -24 L24 -10 L0 4 L-24 -10 Z" fill="#FFFFFF"/>' +
        '<path d="M0 -4 L16 -13 L7 -18 L-9 -9 Z" fill="#FF8433"/>' +
        '<path d="M-24 -10 L0 4 L0 32 L-24 18 Z" fill="#D33800"/>' +
        '<path d="M0 4 L24 -10 L24 18 L0 32 Z" fill="#FFA04D"/>' +
        '<path d="M-4 1 L4 -3 L4 29 L-4 33 Z" fill="#FFFFFF" opacity="0.9"/>' +
      '</g>' +
      '<text x="50" y="85" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">daraz</text>' +
    '</svg>',

    yellow: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Yellow" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#FFCD00"/>' +
      '<rect x="9" y="24" width="82" height="52" rx="10" fill="#121212"/>' +
      '<text x="50" y="56" font-family="\'Arial Black\', \'Montserrat\', Impact, sans-serif" font-weight="900" font-size="15" fill="#FFCD00" text-anchor="middle" letter-spacing="2">YELLOW</text>' +
      '<rect x="22" y="63" width="56" height="3" rx="1.5" fill="#FFCD00"/>' +
    '</svg>',

    sultansdine: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Sultan\'s Dine" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<radialGradient id="sdBg" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#12572D"/><stop offset="100%" stop-color="#082A14"/></radialGradient>' +
        '<linearGradient id="sdGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE38F"/><stop offset="50%" stop-color="#E1B846"/><stop offset="100%" stop-color="#A57D1D"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="url(#sdBg)"/>' +
      '<path d="M18 50 C18 30 32 18 50 18 C68 18 82 30 82 50" fill="none" stroke="url(#sdGold)" stroke-width="1.2" stroke-dasharray="2 1.5" opacity="0.6"/>' +
      '<g fill="url(#sdGold)">' +
        '<path d="M50 15 C49 19 49 22 50 25 C51 22 51 19 50 15 Z"/><circle cx="50" cy="14" r="1.5"/><circle cx="47" cy="17" r="1"/><circle cx="53" cy="17" r="1"/>' +
        '<path d="M36 34 C36 26 43 23 50 23 C57 23 64 26 64 34 C64 38 60 41 50 41 C40 41 36 38 36 34 Z"/>' +
        '<rect x="33" y="41" width="34" height="4" rx="2" fill="url(#sdGold)"/><circle cx="40" cy="43" r="1" fill="#082A14"/><circle cx="50" cy="43" r="1.2" fill="#082A14"/><circle cx="60" cy="43" r="1" fill="#082A14"/>' +
        '<path d="M26 44 C26 38 30 34 34 33 C32 36 32 40 34 43 Z"/><path d="M74 44 C74 38 70 34 66 33 C68 36 68 40 66 43 Z"/>' +
      '</g>' +
      '<text x="50" y="62" font-family="Georgia, \'Times New Roman\', serif" font-weight="900" font-size="11" fill="#FFE38F" text-anchor="middle" letter-spacing="1.5">SULTAN\'S</text>' +
      '<text x="50" y="76" font-family="Georgia, \'Times New Roman\', serif" font-weight="800" font-size="13" fill="#FFE38F" text-anchor="middle" letter-spacing="3.5">DINE</text>' +
      '<g fill="url(#sdGold)"><line x1="28" y1="83" x2="44" y2="83" stroke="url(#sdGold)" stroke-width="0.8"/><polygon points="50,81 51.5,83 50,85 48.5,83"/><line x1="56" y1="83" x2="72" y2="83" stroke="url(#sdGold)" stroke-width="0.8"/></g>' +
    '</svg>',

    novotel: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Novotel" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="novoBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0E2B4E"/><stop offset="100%" stop-color="#041428"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="url(#novoBg)"/>' +
      '<path d="M38 31 C43 27 52 27 58 31 C52 29 45 29 38 31 Z" fill="#29B6F6"/>' +
      '<text x="50" y="55" font-family="\'Montserrat\', \'Helvetica Neue\', Arial, sans-serif" font-weight="800" font-size="14.5" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">NOVOTEL</text>' +
      '<line x1="26" y1="63" x2="74" y2="63" stroke="#29B6F6" stroke-width="1" opacity="0.7"/>' +
      '<text x="50" y="75" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="600" font-size="6.5" fill="#B4C7DB" text-anchor="middle" letter-spacing="2.2">HOTELS &amp; RESORTS</text>' +
    '</svg>',

    chaldal: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Chaldal" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="chaldalBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2ECC71"/><stop offset="100%" stop-color="#219653"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="url(#chaldalBg)"/>' +
      '<g transform="translate(50, 42)">' +
        '<path d="M-2 -22 C-5 -29 -10 -31 -14 -30 C-12 -26 -8 -23 -4 -21 Z" fill="#78E08F"/>' +
        '<path d="M1 -23 C2 -31 6 -34 11 -33 C9 -28 6 -24 2 -21 Z" fill="#78E08F"/>' +
        '<path d="M0 -22 C0 -31 -2 -34 -2 -35 C3 -34 4 -28 1 -21 Z" fill="#A8E6CF"/>' +
        '<path d="M-7 -20 C-6 -22 6 -22 7 -20 L3 -2 L-3 -2 Z" fill="#FF793F"/>' +
        '<circle cx="11" cy="-14" r="8" fill="#FF5252"/>' +
        '<path d="M11 -22 C12 -24 14 -24 15 -23 C13 -21 12 -21 11 -22 Z" fill="#78E08F"/>' +
        '<path d="M-22 -12 L22 -12 L18 20 L-18 20 Z" fill="#FFFFFF"/>' +
        '<path d="M-10 -12 C-10 -22 10 -22 10 -12" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M-8 -12 C-8 -19 8 -19 8 -12" fill="none" stroke="#219653" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M-8 4 Q0 12 8 4" fill="none" stroke="#FF793F" stroke-width="2.5" stroke-linecap="round"/>' +
      '</g>' +
      '<text x="50" y="85" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.3">chaldal</text>' +
    '</svg>',

    bata: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Bata" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#E21836"/>' +
      '<text x="50" y="63" font-family="\'Brush Script MT\', \'Arial Black\', Impact, sans-serif" font-style="italic" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">Bata</text>' +
    '</svg>',

    ecstasy: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Ecstasy" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#111111"/>' +
      '<rect x="2" y="2" width="96" height="96" rx="18" fill="none" stroke="#2E2E2E" stroke-width="1.5"/>' +
      '<text x="50" y="44" font-family="\'Times New Roman\', Georgia, serif" font-weight="300" font-size="28" fill="#FFFFFF" text-anchor="middle">E</text>' +
      '<line x1="28" y1="52" x2="72" y2="52" stroke="#FFFFFF" stroke-width="0.8"/>' +
      '<text x="50" y="69" font-family="\'Montserrat\', \'Helvetica Neue\', Arial, sans-serif" font-weight="800" font-size="10.5" fill="#FFFFFF" text-anchor="middle" letter-spacing="3.5">ECSTASY</text>' +
    '</svg>',

    biman: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Biman" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#006A4E"/>' +
      '<circle cx="50" cy="42" r="24" fill="#F42A41"/>' +
      '<path d="M34 50 C40 44 46 38 64 30 C58 37 53 43 51 49 C46 51 40 52 34 50 Z" fill="#FFFFFF"/>' +
      '<path d="M42 43 C48 36 56 31 66 26 C60 34 56 40 52 46 Z" fill="#FFFFFF"/>' +
      '<circle cx="66" cy="26" r="2.5" fill="#FFFFFF"/><path d="M68 25 L73 24 L69 27 Z" fill="#FFFFFF"/>' +
      '<text x="50" y="83" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="900" font-size="12.5" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">BIMAN</text>' +
    '</svg>',

    seapearl: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Sea Pearl" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#0A2540"/>' +
      '<circle cx="50" cy="38" r="9" fill="#FFF8E7"/><circle cx="50" cy="38" r="7" fill="#FFFFFF"/>' +
      '<path d="M26 50 C32 40 42 36 50 36 C58 36 68 40 74 50 C66 54 58 56 50 56 C42 56 34 54 26 50 Z" fill="none" stroke="#D4AF37" stroke-width="2"/>' +
      '<path d="M32 52 Q50 62 68 52" fill="none" stroke="#00AEEF" stroke-width="2"/>' +
      '<text x="50" y="74" font-family="Georgia, serif" font-weight="800" font-size="9" fill="#D4AF37" text-anchor="middle" letter-spacing="1.5">SEA PEARL</text>' +
      '<text x="50" y="85" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="600" font-size="7" fill="#88A0B8" text-anchor="middle" letter-spacing="2">RESORT</text>' +
    '</svg>',

    kacchibhai: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Kacchi Bhai" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#1F1514"/>' +
      '<path d="M30 40 C30 36 70 36 70 40 L65 56 C65 60 35 60 35 56 Z" fill="#D49A3D"/>' +
      '<ellipse cx="50" cy="40" rx="20" ry="4" fill="#F5C068"/><circle cx="50" cy="34" r="3" fill="#F5C068"/>' +
      '<path d="M43 32 Q41 26 45 22" fill="none" stroke="#F5C068" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M50 31 Q53 25 49 20" fill="none" stroke="#F5C068" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M57 32 Q55 26 59 22" fill="none" stroke="#F5C068" stroke-width="1.5" stroke-linecap="round"/>' +
      '<text x="50" y="73" font-family="\'Arial Black\', Impact, sans-serif" font-weight="900" font-size="10.5" fill="#F5C068" text-anchor="middle" letter-spacing="1">KACCHI BHAI</text>' +
      '<text x="50" y="85" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="700" font-size="7" fill="#E65100" text-anchor="middle" letter-spacing="2">TRADITIONAL</text>' +
    '</svg>',

    pizzaburg: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Pizza Burg" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#C21818"/>' +
      '<circle cx="50" cy="38" r="20" fill="#FFA000"/>' +
      '<path d="M34 38 C34 30 66 30 66 38 Z" fill="#FFE082"/>' +
      '<rect x="33" y="40" width="34" height="4" rx="2" fill="#5D4037"/>' +
      '<path d="M34 46 C34 48 66 48 66 46 Z" fill="#FFE082"/>' +
      '<text x="50" y="73" font-family="\'Arial Black\', Impact, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">PIZZA BURG</text>' +
      '<text x="50" y="85" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="800" font-size="7" fill="#FFD54F" text-anchor="middle" letter-spacing="2">PIZZA &amp; BURGER</text>' +
    '</svg>',

    pickaboo: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Pickaboo" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#008BE3"/>' +
      '<circle cx="40" cy="36" r="6" fill="#FFFFFF"/><circle cx="60" cy="36" r="6" fill="#FFFFFF"/>' +
      '<circle cx="42" cy="36" r="3" fill="#008BE3"/><circle cx="58" cy="36" r="3" fill="#008BE3"/>' +
      '<path d="M38 48 Q50 56 62 48" fill="none" stroke="#FFD200" stroke-width="4" stroke-linecap="round"/>' +
      '<text x="50" y="78" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">pickaboo</text>' +
    '</svg>',

    rokomari: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Rokomari" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="rokoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E91E63"/><stop offset="100%" stop-color="#FF5722"/></linearGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="20" fill="url(#rokoGrad)"/>' +
      '<path d="M50 48 C44 44 32 44 24 46 L24 28 C32 26 44 26 50 30 C56 26 68 26 76 28 L76 46 C68 44 56 44 50 48 Z" fill="#FFFFFF"/>' +
      '<path d="M50 30 L50 48" stroke="#E91E63" stroke-width="1.5"/>' +
      '<text x="50" y="74" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.3">rokomari</text>' +
      '<text x="50" y="85" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="700" font-size="7" fill="#FFE082" text-anchor="middle">.com</text>' +
    '</svg>',

    apollo: '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="Apollo Hospitals" role="img" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="100" rx="20" fill="#FFFFFF"/>' +
      '<rect x="2" y="2" width="96" height="96" rx="18" fill="none" stroke="#E1E8EE" stroke-width="1.5"/>' +
      '<path d="M50 20 C52 28 58 32 58 38 C58 44 54 48 50 48 C46 48 42 44 42 38 C42 32 48 28 50 20 Z" fill="#D32F2F"/>' +
      '<path d="M50 28 C51 32 54 34 54 38 C54 41 52 43 50 43 C48 43 46 41 46 38 C46 34 49 32 50 28 Z" fill="#FF9800"/>' +
      '<text x="50" y="66" font-family="Georgia, \'Times New Roman\', serif" font-weight="800" font-size="14" fill="#0D47A1" text-anchor="middle" letter-spacing="1">Apollo</text>' +
      '<text x="50" y="78" font-family="\'Helvetica Neue\', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#546E7A" text-anchor="middle" letter-spacing="2">HOSPITALS</text>' +
    '</svg>'
  };

  cb.brandLogo = function (name, size) {
    var raw = String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    var key = "";
    if (raw.indexOf("aarong") > -1) key = "aarong";
    else if (raw.indexOf("pizzahut") > -1) key = "pizzahut";
    else if (raw.indexOf("usbangla") > -1) key = "usbangla";
    else if (raw.indexOf("daraz") > -1) key = "daraz";
    else if (raw.indexOf("yellow") > -1) key = "yellow";
    else if (raw.indexOf("sultan") > -1) key = "sultansdine";
    else if (raw.indexOf("novotel") > -1) key = "novotel";
    else if (raw.indexOf("chaldal") > -1) key = "chaldal";
    else if (raw.indexOf("bata") > -1) key = "bata";
    else if (raw.indexOf("ecstasy") > -1) key = "ecstasy";
    else if (raw.indexOf("biman") > -1) key = "biman";
    else if (raw.indexOf("seapearl") > -1) key = "seapearl";
    else if (raw.indexOf("kacchi") > -1) key = "kacchibhai";
    else if (raw.indexOf("pizzaburg") > -1) key = "pizzaburg";
    else if (raw.indexOf("pickaboo") > -1) key = "pickaboo";
    else if (raw.indexOf("rokomari") > -1) key = "rokomari";
    else if (raw.indexOf("apollo") > -1) key = "apollo";

    if (key && BRAND_LOGOS[key]) {
      var svg = BRAND_LOGOS[key];
      if (size) {
        svg = svg.replace('<svg ', '<svg width="' + size + '" height="' + size + '" ');
      }
      return svg;
    }
    var init = String(name || "").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "CB";
    var dim = size ? ' width="' + size + '" height="' + size + '"' : ' width="100%" height="100%"';
    return '<svg viewBox="0 0 100 100"' + dim + '><rect width="100" height="100" rx="20" fill="#8b1c1c"/><text x="50" y="58" font-family="sans-serif" font-weight="800" font-size="28" fill="#fff" text-anchor="middle">' + init + '</text></svg>';
  };

  // ===================================================================
  // Formatting helpers (money is held in integer paisa)
  // ===================================================================
  cb.toPaisa = function (v) { var n = parseFloat(String(v).replace(/[^0-9.]/g, "")); return isNaN(n) ? 0 : Math.round(n * 100); };
  cb.fmtPaisa = function (p) { return "৳" + (p / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  cb.fmt = function (n) { return cb.fmtPaisa(Math.round((+n || 0) * 100)); };
  cb.bdt = function (n) { return "BDT " + (+n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  cb.mask = function (acc) { var d = String(acc).replace(/\D/g, ""); return "ACC **" + d.slice(-4); };
  cb.maskLong = function (acc) { var d = String(acc).replace(/\D/g, ""); return "•••• •••• •••• " + d.slice(-4); };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  cb.date = function (d) { d = d || new Date(); return String(d.getDate()).padStart(2, "0") + "-" + MON[d.getMonth()] + "-" + d.getFullYear(); };
  cb.dt = function (d) { d = d || new Date(); var h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0"); return cb.date(d) + " | " + String(h % 12 || 12).padStart(2, "0") + ":" + m + " " + (h < 12 ? "AM" : "PM"); };
  cb.txnId = function (p) { var d = new Date(); return (p || "CZB") + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + Math.floor(100000 + Math.random() * 899999); };

  // ---------- date-range filters: pick within the last 6 months, presets of 1, 3 and 6 months ----------
  cb.RANGE_MONTHS = 6;
  function isoOf(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  // shift a YYYY-MM-DD date by n calendar months, clamped to the month's last day (31 Aug - 6 = 28 Feb)
  cb.addMonths = function (iso, n) {
    var p = iso.split("-"), y = +p[0], m = +p[1] - 1 + n, last = new Date(y, m + 1, 0).getDate();
    return isoOf(new Date(y, m, Math.min(+p[2], last)));
  };
  cb.rangeError = function (f, t, today) {
    if (!f || !t) return "";
    if (f > t) return "The From date must not be after the To date.";
    if (f < cb.addMonths(today, -cb.RANGE_MONTHS) || t > today) return "Choose dates within the last " + cb.RANGE_MONTHS + " months.";
    return "";
  };
  /* Bound a From/To pair to the last 6 months and, given `chips`, render 1/3/6-month presets into it.
     onPick runs after a preset fills the dates (setting .value fires no change event). */
  cb.dateRange = function (o) {
    var from = o.from, to = o.to, today = o.today, box = o.chips, btns = [];
    from.min = to.min = cb.addMonths(today, -cb.RANGE_MONTHS);
    from.max = to.max = today;
    function mark(m) { btns.forEach(function (b) { var on = +b.dataset.months === m; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(on)); }); }
    function pick(m) { from.value = cb.addMonths(today, -m); to.value = today; mark(m); }
    if (box) {
      box.classList.add("period-chips"); box.setAttribute("role", "radiogroup");
      if (!box.hasAttribute("aria-label")) box.setAttribute("aria-label", "Period");
      box.innerHTML = [1, 3, 6].map(function (m) {
        return '<button type="button" role="radio" aria-checked="false" data-months="' + m + '" aria-label="Last ' + m + (m > 1 ? " months" : " month") + '">' + m + (m > 1 ? " Months" : " Month") + "</button>";
      }).join("");
      btns = cb.$$("button", box);
      box.addEventListener("click", function (e) { var b = e.target.closest("[data-months]"); if (b) { pick(+b.dataset.months); if (o.onPick) o.onPick(); } });
      [from, to].forEach(function (el) { el.addEventListener("change", function () { mark(0); }); });
    }
    return { pick: pick, clear: function () { mark(0); }, error: function () { return cb.rangeError(from.value, to.value, today); } };
  };
  cb.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""); }
  function three(n) { var h = Math.floor(n / 100), r = n % 100; return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : ""); }
  cb.words = function (num) {
    var n = Math.floor(num), p = Math.round((num - n) * 100); if (!n && !p) return "";
    var parts = [], c = Math.floor(n / 1e7); n %= 1e7; var l = Math.floor(n / 1e5); n %= 1e5; var t = Math.floor(n / 1e3); n %= 1e3;
    if (c) parts.push(three(c) + " Crore"); if (l) parts.push(two(l) + " Lakh"); if (t) parts.push(two(t) + " Thousand"); if (n) parts.push(three(n));
    return "Taka " + (parts.join(" ") || "Zero") + (p ? " and " + two(p) + " Paisa" : "") + " Only";
  };
  // validation rules from FieldValidation.kt
  cb.valid = {
    account: function (v) { return /^\d{13}$/.test(String(v).replace(/\D/g, "")); },
    mobile: function (v) { var d = String(v).replace(/\D/g, "").replace(/^880/, ""); if (d.length === 10) d = "0" + d; return /^01[3-9]\d{8}$/.test(d); },
    email: function (v) { v = String(v).trim(); return v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    card: function (v) { return /^\d{16}$/.test(String(v).replace(/\D/g, "")); }
  };

  // ===================================================================
  // Navigation (spec §2.1 / §2.2)
  // ===================================================================
  var MENU = [
    { label: "Dashboard", icon: "dashboard", href: "index.html", page: "dashboard" },
    { label: "Accounts", icon: "landmark", items: [
      { label: "My Accounts", icon: "wallet", href: "accounts.html", page: "accounts" },
      { label: "Statement", icon: "sheet", href: "statement.html", page: "statement" },
      { label: "Transaction History", icon: "history", href: "history.html", page: "history" },
      { label: "Transaction Limits", icon: "gauge", href: "limits.html", page: "limits" } ] },
    { label: "Fund Transfer", icon: "send", href: "fund-transfer.html", page: "transfer" },
    { label: "Beneficiary", icon: "users", href: "beneficiaries.html", page: "beneficiary" },
    { label: "Bill Payment", icon: "zap", href: "bill-pay.html", page: "billpay" },
    { label: "Mobile Recharge", icon: "phone", href: "recharge.html", page: "recharge" },
    { label: "My QR", icon: "qr", href: "my-qr.html", page: "qr" },
    // Cards section hidden for now
    // { label: "Cards", icon: "card", items: [
    //   { label: "My Cards", icon: "card", href: "cards.html", page: "cards" },
    //   { label: "Add Card", icon: "cardPlus", href: "card-add.html", page: "cards-add" } ] },
    { label: "Deposits", icon: "piggy", items: [
      { label: "Deposit Schemes", icon: "piggy", href: "deposits.html", page: "deposits" },
      { label: "Open DPS", icon: "calCheck", href: "deposits.html#dps", page: "deposits-dps" },
      { label: "Open FDR", icon: "lockOpen", href: "deposits.html#fdr", page: "deposits-fdr" } ] },
    { label: "Requests", icon: "inbox", items: [
      { label: "Request Status", icon: "clipboard", href: "requests.html", page: "requests" },
      { label: "Order Cheque Book", icon: "book", href: "cheque-order.html", page: "cheque-order" },
      { label: "Stop Cheque", icon: "ban", href: "cheque-stop.html", page: "cheque-stop" },
      { label: "Positive Pay", icon: "shieldCheck", href: "positive-pay.html", page: "positive-pay" },
      { label: "Inward / Outward", icon: "arrowLR", href: "cheques.html", page: "cheques" },
      { label: "Pay Order", icon: "fileText", href: "pay-order.html", page: "pay-order" },
      { label: "Tax Document", icon: "fileUp", href: "tax-document.html", page: "tax" },
      { label: "Dispute", icon: "alert", href: "dispute.html", page: "dispute" },
      { label: "Complain", icon: "message", href: "complain.html", page: "complain" } ] },
    { label: "Settings", icon: "settings", items: [
      { label: "My Profile", icon: "idCard", href: "profile.html", page: "profile" },
      { label: "Change Password", icon: "key", href: "change-password.html", page: "password" },
      { label: "TPIN Recovery", icon: "lock", href: "tpin-recovery.html", page: "tpin" },
      { label: "Linked Devices", icon: "monitor", href: "linked-devices.html", page: "devices" },
      { label: "Activity Log", icon: "activity", href: "activity-log.html", page: "activity" },
      { label: "Notifications", icon: "bell", href: "notifications.html", page: "notifications" } ] }
  ];
  var DISCOVER = [
    { label: "Find CZB", icon: "mapPin", href: "find-czb.html", page: "find" },
    { label: "Products", icon: "package", href: "products.html", page: "products" },
    { label: "Offers", icon: "gift", href: "offers.html", page: "offers" },
    { label: "Calculators", icon: "calculator", href: "calculators.html", page: "calculators" },
    { label: "Exchange Rates", icon: "trending", href: "exchange-rates.html", page: "rates" },
    { label: "Help & Support", icon: "help", href: "help.html", page: "help" }
  ];
  cb.MENU = MENU; cb.DISCOVER = DISCOVER;

  var page = document.body.dataset.page || "";
  var isPublic = document.body.dataset.shell === "public";
  var u = D.user || { fullName: "Customer", initials: "C" };

  function navLink(it) {
    return '<a href="' + it.href + '" class="nav-link" data-page="' + it.page + '">' + cb.icon(it.icon) + "<span>" + it.label + "</span></a>";
  }
  function buildNav() {
    var h = '<nav class="nav" aria-label="Main">';
    MENU.forEach(function (m) {
      if (!m.items) { h += navLink(m); return; }
      h += '<div class="nav-group"><button class="nav-toggle" aria-expanded="false">' + cb.icon(m.icon) + "<span>" + m.label + '</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>';
      h += '<div class="submenu"><div class="submenu-inner">';
      m.items.forEach(function (it) { h += '<a href="' + it.href + '" data-page="' + it.page + '">' + cb.icon(it.icon, 15).replace("<svg", '<svg class="sub-ic"') + "<span>" + it.label + "</span></a>"; });
      h += "</div></div></div>";
    });
    h += '<div class="nav-sep"></div><div class="nav-label">Discover</div>';
    DISCOVER.forEach(function (it) { h += navLink(it); });
    return h + "</nav>";
  }

  var SIDEBAR = '<div class="backdrop" id="backdrop"></div><aside class="sidebar" id="sidebar">' +
    '<a class="brand" href="index.html" aria-label="Citizens Bank PLC home"><img class="brand-logo" src="assets/img/citizens-bank-logo.png" alt="" width="2000" height="713"></a>' +
    '<button class="drawer-close" id="drawerClose" aria-label="Close menu">' + cb.icon("x") + "</button>" +
    buildNav() +
    '<button class="logout" data-logout>' + cb.icon("logout") + "<span>Log out</span></button>" +
    '<div class="tagline">TODAY · TOMORROW · TOGETHER</div></aside>';

  var NOTIFS = [
    ["Today", "success", "arrowL", "Money received", "You received <b>৳5,000.00</b> from Anoy Islam (CZB Transfer).", "11:02 AM", true],
    ["Today", "success", "send", "Fund transfer successful", "You sent <b>৳1,500.00</b> to Farhana Akter via NPSB.", "2:14 PM", true],
    ["Today", "info", "monitor", "New login detected", "Signed in from Chrome on macOS · Dhaka, BD.", "9:40 AM", true],
    ["Yesterday", "warning", "gift", "New cashback offer", "Get up to ৳150 cashback on bill payments this week.", "Yesterday", false],
    ["Yesterday", "brand", "zap", "Bill payment due", "Your DESCO bill of ৳1,840.00 is due on 03-Oct-2026.", "Yesterday", false],
    ["Earlier", "brand", "calCheck", "DPS installment reminder", "Installment of ৳200 for DPS ACC **9027 is due 15-Oct-2026.", "28 Sep", false],
    ["Earlier", "info", "shield", "Security tip", "Never share your PIN, TPIN or OTP with anyone, including Citizens Bank staff.", "3 Jun", false]
  ];
  cb.NOTIFS = NOTIFS;
  function notifItems() {
    var h = "", g = "";
    NOTIFS.forEach(function (n) {
      if (n[0] !== g) { g = n[0]; h += '<div class="n-group">' + g + "</div>"; }
      h += '<button class="n-item' + (n[6] ? " unread" : "") + '"><span class="n-icon ' + n[1] + '">' + cb.icon(n[2]) + '</span><span class="n-body"><b>' + n[3] + "</b><span>" + n[4] + "</span><time>" + n[5] + "</time></span></button>";
    });
    return h;
  }
  var ACTIONS =
    '<label class="search hide-s">' + cb.icon("search", 16) + '<input placeholder="Search transactions, payees…"></label>' +
    '<span class="session-pill hide-s" id="sessionPill" title="Session idle timer">' + cb.icon("clock", 13) + '<span>Session:</span> <b id="sessionTime">05:00</b></span>' +
    '<button class="theme-switch" id="themeToggle" aria-label="Toggle dark mode" title="Light / dark mode"><span class="knob">' + cb.icon("sun", 14, 2.2).replace("<svg", '<svg class="sun"') + cb.icon("moon", 14, 2.2).replace("<svg", '<svg class="moon"') + "</span></button>" +
    '<div class="notif-wrap"><button class="icon-btn" id="notifBtn" aria-label="Notifications" aria-expanded="false">' + cb.icon("bell") + '<span class="count" id="notifCount"></span></button>' +
      '<div class="notif-panel" id="notifPanel" role="dialog" aria-label="Notifications"><div class="n-head"><button class="n-back" id="notifBack" aria-label="Back">' + cb.icon("chevL", 20) + '</button><h3>Notifications</h3><button class="n-mark" id="notifMark">Mark all as read</button></div>' +
      '<div class="n-tabs"><button class="on" data-f="all">All</button><button data-f="unread">Unread</button></div>' +
      '<div class="n-list" id="notifList">' + notifItems() + '<div class="n-empty">' + cb.icon("check", 22) + "You're all caught up</div></div>" +
      '<a href="notifications.html" class="n-foot">View all notifications</a></div></div>' +
    '<div class="user-wrap"><button class="user" id="userBtn" aria-haspopup="menu" aria-expanded="false"><span class="avatar">' + u.initials + '</span><span class="meta"><b>' + u.fullName + "</b><span>" + (u.company || "Corporate Banking") + "</span></span>" + cb.icon("chevD", 16) + "</button>" +
      '<div class="user-menu" id="userMenu" role="menu"><div class="um-head"><span class="avatar lg">' + u.initials + "</span><div><b>" + u.fullName + "</b><span>" + (u.company ? u.company + " · " : "") + "User ID: " + (u.userId || "") + "</span><small>Last login " + (u.lastLogin || "") + "</small></div></div>" +
      '<a href="profile.html" role="menuitem">' + cb.icon("idCard", 16) + "My Profile</a>" +
      '<a href="settings.html" role="menuitem">' + cb.icon("settings", 16) + "Settings</a>" +
      '<a href="activity-log.html" role="menuitem">' + cb.icon("activity", 16) + "Activity Log</a>" +
      '<button role="menuitem" class="danger" data-logout>' + cb.icon("logout", 16) + "Log out</button></div></div>";

  // ===================================================================
  // Render shell
  // ===================================================================
  var app = $(".app");
  if (!isPublic && app) {
    app.insertAdjacentHTML("afterbegin", SIDEBAR);
    var topbar = $(".topbar");
    if (topbar) {
      topbar.insertAdjacentHTML("beforeend", '<div class="topbar-actions">' + ACTIONS + "</div>");
    }
    var hashMap = { "#dps": "deposits-dps", "#fdr": "deposits-fdr", "#add": "cards-add" };
    if (page === "deposits" && hashMap[location.hash] && /deposits/.test(hashMap[location.hash])) page = hashMap[location.hash];
    if (page === "cards" && location.hash === "#add") page = "cards-add";
    var active = $('.sidebar [data-page="' + page + '"]');
    if (active) {
      active.classList.add("active");
      var grp = active.closest(".nav-group");
      if (grp) { grp.classList.add("open"); $(".nav-toggle", grp).setAttribute("aria-expanded", "true"); }
    }
  }

  // ---------- theme ----------
  var root = document.documentElement;
  document.addEventListener("click", function (e) {
    if (e.target.closest("#themeToggle")) {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("citizens-theme", next); } catch (er) {}
    }
  });

  // ---------- sidebar accordion + drawer ----------
  $$(".nav-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var g = btn.parentElement, willOpen = !g.classList.contains("open");
      $$(".nav-group.open").forEach(function (x) { x.classList.remove("open"); $(".nav-toggle", x).setAttribute("aria-expanded", "false"); });
      if (willOpen) { g.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    });
  });
  function closeDrawer() { document.body.classList.remove("drawer-open"); }
  if ($("#backdrop")) {
    $("#backdrop").addEventListener("click", closeDrawer);
    $("#drawerClose").addEventListener("click", closeDrawer);
  }

  // ---------- notifications ----------
  if ($("#notifBtn")) {
    var nBtn = $("#notifBtn"), nList = $("#notifList"), nCount = $("#notifCount"), nMark = $("#notifMark");
    var setNotif = function (open) { document.body.classList.toggle("notif-open", open); nBtn.setAttribute("aria-expanded", open); if (open) setUser(false); };
    var nUpdate = function () {
      var n = $$(".n-item.unread", nList).length;
      nCount.textContent = n ? n : ""; nMark.disabled = !n; nList.classList.toggle("none-unread", !n);
    };
    nBtn.addEventListener("click", function (e) { e.stopPropagation(); setNotif(!document.body.classList.contains("notif-open")); });
    $("#notifBack").addEventListener("click", function () { setNotif(false); });
    $$(".n-item", nList).forEach(function (it) { it.addEventListener("click", function () { it.classList.remove("unread"); nUpdate(); }); });
    nMark.addEventListener("click", function () { $$(".n-item.unread", nList).forEach(function (it) { it.classList.remove("unread"); }); nUpdate(); });
    $$(".n-tabs button").forEach(function (t) {
      t.addEventListener("click", function () { $$(".n-tabs button").forEach(function (x) { x.classList.toggle("on", x === t); }); nList.classList.toggle("only-unread", t.dataset.f === "unread"); });
    });
    nUpdate();
  }
  // ---------- user menu ----------
  function setUser(open) { var w = $(".user-wrap"); if (!w) return; w.classList.toggle("open", open); $("#userBtn").setAttribute("aria-expanded", open); }
  if ($("#userBtn")) $("#userBtn").addEventListener("click", function (e) { e.stopPropagation(); setUser(!$(".user-wrap").classList.contains("open")); if (document.body.classList.contains("notif-open")) document.body.classList.remove("notif-open"); });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".notif-panel") && !e.target.closest("#notifBtn")) document.body.classList.remove("notif-open");
    if (!e.target.closest(".user-wrap")) setUser(false);
  });

  // ===================================================================
  // Toast
  // ===================================================================
  var toast = document.createElement("div"); toast.className = "toast"; toast.setAttribute("role", "status"); document.body.appendChild(toast);
  var toastTimer;
  cb.toast = window.cbToast = function (msg, kind) {
    toast.className = "toast" + (kind ? " " + kind : ""); toast.textContent = msg;
    requestAnimationFrame(function () { toast.classList.add("show"); });
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  };

  // ===================================================================
  // Dialogs: cb.dialog / cb.confirm / cb.done
  // ===================================================================
  var dlgStack = [];
  cb.dialog = function (o) {
    var el = document.createElement("div");
    el.className = "dlg" + (o.size ? " dlg-" + o.size : "");
    el.setAttribute("role", o.alert ? "alertdialog" : "dialog"); el.setAttribute("aria-modal", "true");
    el.innerHTML = '<div class="dlg-backdrop"></div><div class="dlg-box">' +
      (o.dismissible === false ? "" : '<button class="dlg-x" aria-label="Close">' + cb.icon("x") + "</button>") +
      (o.icon ? '<div class="dlg-ic ' + (o.tone || "") + '">' + cb.icon(o.icon, 26) + "</div>" : "") +
      (o.title ? '<h3 class="dlg-title">' + o.title + "</h3>" : "") +
      '<div class="dlg-body">' + (o.html || (o.message ? "<p>" + o.message + "</p>" : "")) + "</div>" +
      (o.buttons ? '<div class="dlg-actions">' + o.buttons.map(function (b, i) { return '<button class="' + (b.primary ? "btn-pri" : b.danger ? "btn-danger" : "btn-sec") + '" data-i="' + i + '">' + b.text + "</button>"; }).join("") + "</div>" : "") +
      "</div>";
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("open"); });
    var close = function (val) {
      el.classList.remove("open"); setTimeout(function () { el.remove(); }, 200);
      dlgStack.splice(dlgStack.indexOf(api), 1);
      if (o.onClose) o.onClose(val);
    };
    var api = { el: el, close: close, dismissible: o.dismissible !== false };
    dlgStack.push(api);
    if (o.dismissible !== false) {
      $(".dlg-x", el).addEventListener("click", function () { close(null); });
      $(".dlg-backdrop", el).addEventListener("click", function () { close(null); });
    }
    $$(".dlg-actions button", el).forEach(function (b) {
      b.addEventListener("click", function () { var btn = o.buttons[+b.dataset.i]; if (btn.onClick && btn.onClick(api) === false) return; close(btn.value !== undefined ? btn.value : +b.dataset.i); });
    });
    setTimeout(function () { var f = $(".dlg-actions .btn-pri", el) || $(".dlg-actions button, input", el); if (f) f.focus(); }, 60);
    return api;
  };
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var top = dlgStack[dlgStack.length - 1];
    if (top) { if (top.dismissible) top.close(null); return; }
    closeDrawer(); document.body.classList.remove("notif-open"); setUser(false);
  });
  cb.confirm = function (o) {
    return new Promise(function (res) {
      cb.dialog({ title: o.title, message: o.message, icon: o.icon || (o.danger ? "alert" : "help"), tone: o.danger ? "danger" : "", size: "sm",
        buttons: [{ text: o.cancel || "Cancel", value: false }, { text: o.ok || "Confirm", primary: !o.danger, danger: !!o.danger, value: true }],
        onClose: function (v) { res(v === true); } });
    });
  };
  cb.done = function (o) {
    return new Promise(function (res) {
      cb.dialog({ title: o.title || "Done", message: o.message, html: o.html, icon: "check", tone: "success", size: "sm",
        buttons: [{ text: o.ok || "Done", primary: true, value: true }], onClose: function () { res(); } });
    });
  };

  // Success pop-up for finished transactions and requests (non-dismissible: the user picks a next step).
  // cb.success({ title, message (html), amount, ref:{label,value}, extra (html), rows:[[label, value, {total, html}]],
  //              buttons:[{text, icon, href | onClick(api), primary}] })
  cb.success = function (o) {
    var rows = o.rows || [];
    var api = cb.dialog({
      title: o.title, icon: "check", tone: "success", dismissible: false,
      html: (o.message ? "<p>" + o.message + "</p>" : "") +
        (o.amount ? '<div class="tx-amt">' + o.amount + "</div>" : "") +
        (o.ref ? '<div class="txn-id">' + (o.ref.label || "Transaction ID") + " <b>" + cb.esc(o.ref.value) + '</b><button type="button" class="tx-copy" aria-label="Copy ' + (o.ref.label || "transaction ID") + '">' + cb.icon("copy", 14) + "</button></div>" : "") +
        (o.extra || "") +
        (rows.length ? '<dl class="kv tx-receipt">' + rows.map(function (r) {
          var x = r[2] || {};
          return "<div" + (x.total ? ' class="total"' : "") + "><dt>" + cb.esc(r[0]) + "</dt><dd>" + (x.html ? r[1] : cb.esc(r[1])) + "</dd></div>";
        }).join("") + "</dl>" : ""),
      buttons: (o.buttons || [{ text: "Back to dashboard", href: "index.html", primary: true }]).map(function (b) {
        return { text: (b.icon ? cb.icon(b.icon, 16) + " " : "") + b.text, primary: !!b.primary,
          onClick: function (dlg) { if (b.href) { location.href = b.href; return false; } if (b.onClick) b.onClick(dlg); } };
      })
    });
    api.el.classList.add("dlg-tx");
    var copy = $(".tx-copy", api.el);
    if (copy) copy.addEventListener("click", function () {
      try { navigator.clipboard.writeText(o.ref.value); } catch (e) {}
      cb.toast((o.ref.label || "Transaction ID") + " copied");
    });
    return api;
  };

  // ===================================================================
  // OTP modal (spec §5.2): 6 digits, auto-advance, paste, 85s countdown,
  // Resend disabled until the countdown ends, errors inside the modal.
  // cb.otp({ message, summary, note, onVerify(code) -> Promise<bool|string>, onResend, onCancel })
  // ===================================================================
  cb.otp = function (o) {
    o = o || {};
    var boxes = "";
    for (var i = 0; i < 6; i++) boxes += '<input inputmode="numeric" autocomplete="one-time-code" maxlength="1" aria-label="Digit ' + (i + 1) + '">';
    var api = cb.dialog({
      title: o.title || "Verify with OTP", icon: "lock", tone: "brand", size: "sm", dismissible: true,
      html: (o.summary || "") + '<p class="otp-msg">' + (o.message || "Code sent to your mobile &amp; email") + '</p><div class="otp">' + boxes + '</div>' +
        '<div class="otp-err" role="alert"></div><div class="otp-meta"><button type="button" class="otp-resend" disabled>Resend in <b>01:25</b></button></div>' +
        (o.note ? '<p class="otp-note">' + cb.icon("shield", 14) + o.note + "</p>" : ""),
      buttons: [{ text: "Cancel", value: false }, { text: o.verifyText || "Verify", primary: true, onClick: function () { verify(); return false; } }],
      onClose: function (v) { clearInterval(timer); if (v !== "ok" && o.onCancel) o.onCancel(); }
    });
    var el = api.el, ins = $$(".otp input", el), vbtn = $(".dlg-actions .btn-pri", el), err = $(".otp-err", el), rs = $(".otp-resend", el), timer;
    el.classList.add("otp-dlg");
    var val = function () { return ins.map(function (b) { return b.value; }).join(""); };
    var state = function () { ins.forEach(function (b) { b.classList.toggle("filled", !!b.value); }); vbtn.disabled = val().length !== 6; };
    ins.forEach(function (b, i) {
      b.addEventListener("input", function () {
        b.value = b.value.replace(/\D/g, "").slice(-1);
        err.textContent = "";
        if (b.value) {
          b.classList.remove("just-typed");
          void b.offsetWidth;
          b.classList.add("just-typed");
        }
        if (b.value && ins[i + 1]) ins[i + 1].focus();
        state();
      });
      b.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !b.value && ins[i - 1]) { ins[i - 1].focus(); ins[i - 1].value = ""; state(); }
        if (e.key === "ArrowLeft" && ins[i - 1]) ins[i - 1].focus();
        if (e.key === "ArrowRight" && ins[i + 1]) ins[i + 1].focus();
        if (e.key === "Enter" && !vbtn.disabled) verify();
      });
      b.addEventListener("paste", function (e) {
        var d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); if (!d) return;
        e.preventDefault();
        ins.forEach(function (x, k) {
          x.value = d[k] || "";
          if (x.value) {
            x.classList.remove("just-typed");
            void x.offsetWidth;
            x.classList.add("just-typed");
          }
        });
        (ins[d.length] || ins[5]).focus();
        state();
      });
    });
    function countdown() {
      var left = 85; clearInterval(timer); rs.disabled = true;
      var tick = function () {
        if (left <= 0) { clearInterval(timer); rs.disabled = false; rs.innerHTML = "Resend code"; return; }
        rs.innerHTML = "Resend in <b>0" + Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") + "</b>"; left--;
      };
      tick(); timer = setInterval(tick, 1000);
    }
    rs.addEventListener("click", function () { ins.forEach(function (b) { b.value = ""; }); state(); countdown(); ins[0].focus(); cb.toast("A new OTP has been sent"); if (o.onResend) o.onResend(); });
    function verify() {
      var code = val(); if (code.length !== 6) return;
      vbtn.classList.add("loading"); vbtn.disabled = true;
      setTimeout(function () {
        vbtn.classList.remove("loading");
        var bad = code === "000000";
        var r = o.onVerify ? o.onVerify(code) : true;
        if (bad || r === false || typeof r === "string") {
          err.textContent = typeof r === "string" ? r : "The OTP you entered is incorrect. Please try again.";
          $(".otp", el).classList.add("shake"); setTimeout(function () { $(".otp", el).classList.remove("shake"); }, 400);
          ins.forEach(function (b) { b.value = ""; }); state(); ins[0].focus(); return;
        }
        api.close("ok"); if (o.onSuccess) o.onSuccess(code);
      }, 900);
    }
    state(); countdown(); setTimeout(function () { ins[0].focus(); }, 80);
    return api;
  };

  // ===================================================================
  // Auth method cards (spec §4.2): data-driven, biometric hidden.
  // cb.authCards(el, { title, methods }) -> { get() }
  // ===================================================================
  cb.AUTH_METHODS = [
    { type: "OTP", sub: "SMS", label: "SMS", desc: "One-time password to 01XXXXXX515", icon: "message" },
    { type: "OTP", sub: "EMAIL", label: "Email", desc: "One-time password to s••••l@gmail.com", icon: "mail" }
  ];
  cb.authCards = function (el, o) {
    o = o || {}; var methods = o.methods || cb.AUTH_METHODS, name = "auth" + Math.random().toString(36).slice(2, 7);
    el.classList.add("auth-block");
    el.innerHTML = '<div class="auth-title">' + (o.title || "Complete payment confirmation via:") + '</div><div class="auth-cards">' +
      methods.map(function (m, i) {
        return '<label class="auth-card"><input type="radio" name="' + name + '" value="' + m.sub + '"' + (i === 0 ? " checked" : "") + '><span class="ac-ic">' + cb.icon(m.icon || "message", 20) + '</span><span class="ac-t"><b>' + m.label + "</b><small>" + m.desc + '</small></span><span class="radio"></span></label>';
      }).join("") + "</div>";
    return { get: function () { var r = $("input:checked", el); return r ? { AUTH_TYPE: "OTP", AUTH_SUB_TYPE: r.value } : null; } };
  };

  // ===================================================================
  // Searchable select / combobox (spec §3.4 / §5.1)
  // cb.select(el, { name, placeholder, items:[{value,title,sub,right,rightLabel,icon,color,initials,group,disabled,acc:{no,name,bal}}], value,
  //                 search, footer:{text, href|onClick}, onChange(item), emptyText })
  // ===================================================================
  cb.select = function (el, o) {
    o = o || {};
    var items = o.items || [], value = o.value, disabled = !!o.disabled;
    el.classList.add("cbs");
    el.innerHTML = '<button type="button" class="cbs-trigger" aria-haspopup="listbox" aria-expanded="false"></button>' +
      '<div class="cbs-menu" role="listbox">' + (o.search === false ? "" : '<div class="search-in">' + cb.icon("search", 16) + '<input class="cbs-search" placeholder="' + (o.searchPlaceholder || "Search") + '" autocomplete="off"></div>') +
      '<div class="cbs-list"></div>' + (o.footer ? '<a class="cbs-foot" href="' + (o.footer.href || "#") + '">' + cb.icon("plus", 16) + o.footer.text + "</a>" : "") + "</div>";
    var trig = $(".cbs-trigger", el), list = $(".cbs-list", el), search = $(".cbs-search", el);
    function avatar(it) {
      if (it.icon) return '<span class="cbs-ic" style="background:' + (it.color || "var(--card-grad)") + '">' + cb.icon(it.icon, 18) + "</span>";
      if (it.initials) return '<span class="cbs-ic round" style="background:' + (it.color || "var(--primary)") + '">' + it.initials + "</span>";
      return "";
    }
    // acc: ID-card icon | account number · name, balance in red (same look as the fund transfer picker)
    var ID_CARD = '<svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="1" width="24" height="18" rx="4"/><circle cx="7.5" cy="7.5" r="2.4"/><path d="M4.2 15c0-1.7 1.5-2.8 3.3-2.8s3.3 1.1 3.3 2.8"/><g class="ln"><line x1="14" y1="7" x2="21" y2="7"/><line x1="14" y1="10.5" x2="21" y2="10.5"/><line x1="14" y1="14" x2="18.5" y2="14"/></g></svg>';
    function row(it, on) {
      if (it.acc) return '<span class="cbs-idc">' + ID_CARD + '</span><span class="cbs-sep"></span><span class="cbs-t"><b>' + cb.esc(it.acc.no) + (it.acc.name ? " <small>· " + cb.esc(it.acc.name) + "</small>" : "") + "</b>" +
        (it.acc.bal != null ? '<small class="cbs-bal">' + Number(it.acc.bal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " BDT</small>" : "") + "</span>";
      return avatar(it) + '<span class="cbs-t"><b>' + cb.esc(it.title) + (it.badge ? ' <i class="cbs-badge">' + it.badge + "</i>" : "") + "</b>" + (it.sub ? "<small>" + cb.esc(it.sub) + "</small>" : "") + "</span>" +
        (it.right ? '<span class="cbs-r">' + (it.rightLabel && on ? "<small>" + it.rightLabel + "</small>" : "") + "<b>" + it.right + "</b></span>" : "");
    }
    function paintTrigger() {
      var it = items.filter(function (x) { return x.value === value; })[0];
      trig.innerHTML = (it ? row(it, true) : '<span class="cbs-ph">' + (o.placeholder || "Select") + "</span>") + '<span class="cbs-chev">' + cb.icon("chevD", 18) + "</span>";
      trig.disabled = disabled; el.classList.toggle("has-value", !!it); el.classList.toggle("disabled", disabled);
    }
    function render() {
      var q = search ? search.value.trim().toLowerCase() : "", g = null, h = "", n = 0;
      items.forEach(function (it, i) {
        var hay = (it.title + " " + (it.sub || "") + " " + (it.search || "")).toLowerCase();
        if (q && hay.indexOf(q) < 0 && hay.replace(/\D/g, "").indexOf(q.replace(/\D/g, "") || "~") < 0) return;
        if (it.group && it.group !== g) { g = it.group; h += '<div class="cbs-group">' + g + "</div>"; }
        h += '<button type="button" role="option" class="cbs-opt' + (it.value === value ? " on" : "") + '" data-i="' + i + '"' + (it.disabled ? " disabled" : "") + ">" + row(it) + '<span class="cbs-tick">' + cb.icon("check", 16, 2.6) + "</span></button>"; n++;
      });
      list.innerHTML = h || '<div class="cbs-empty">' + (q ? "No match for your search" : o.emptyText || "Nothing to show") + "</div>";
    }
    function open(v) {
      if (disabled && v) return;
      if (v) $$(".cbs.open").forEach(function (x) { if (x !== el) x.classList.remove("open"); });
      el.classList.toggle("open", v); trig.setAttribute("aria-expanded", v);
      if (v) { if (search) { search.value = ""; } render(); if (search) setTimeout(function () { search.focus(); }, 30); var on = $(".cbs-opt.on", el); if (on) on.scrollIntoView({ block: "nearest" }); }
    }
    trig.addEventListener("click", function () { open(!el.classList.contains("open")); });
    if (search) {
      search.addEventListener("input", render);
      search.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); var f = $(".cbs-opt:not([disabled])", el); if (f) f.click(); } });
    }
    list.addEventListener("click", function (e) {
      var b = e.target.closest(".cbs-opt"); if (!b) return;
      var it = items[+b.dataset.i]; value = it.value; paintTrigger(); open(false); trig.focus();
      el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: it }));
      if (o.onChange) o.onChange(it);
    });
    if (o.footer && o.footer.onClick) $(".cbs-foot", el).addEventListener("click", function (e) { e.preventDefault(); open(false); o.footer.onClick(); });
    document.addEventListener("click", function (e) { if (!el.contains(e.target)) open(false); });
    el.addEventListener("keydown", function (e) { if (e.key === "Escape" && el.classList.contains("open")) { e.stopPropagation(); open(false); trig.focus(); } });
    paintTrigger();
    return {
      el: el,
      get value() { return value; },
      get item() { return items.filter(function (x) { return x.value === value; })[0] || null; },
      set: function (v) { value = v; paintTrigger(); },
      setItems: function (arr, keep) { items = arr; if (!keep || !items.some(function (x) { return x.value === value; })) value = o.keepFirst && items[0] ? items[0].value : undefined; paintTrigger(); },
      disable: function (d) { disabled = d; paintTrigger(); }
    };
  };
  // ready-made item lists from the dummy data
  var ACC_IC = { DP01: "landmark", DP02: "lockOpen", DP03: "calCheck", LN01: "piggy" };
  cb.accountItems = function (accountType) {
    return (D.accounts || []).filter(function (a) { return accountType == null || a.types.indexOf(accountType) > -1; }).map(function (a) {
      return { value: a.id, title: a.product, sub: a.no + " · " + a.kind + " · " + a.branch, right: cb.fmt(a.balance), rightLabel: a.productType === "LN01" ? "Outstanding" : "Available balance", icon: ACC_IC[a.productType], color: "var(--card-grad)", search: a.no, data: a };
    });
  };
  // source ("from") account pickers: same ID-card row as the fund transfer "Transfer from" picker
  cb.sourceAccountItems = function (accountType) {
    return cb.accountItems(accountType).map(function (it) { it.acc = { no: it.data.no, name: it.data.product, bal: it.data.balance }; return it; });
  };
  cb.cardItems = function (filter) {
    return (D.cards || []).filter(function (c) { return !filter || filter(c); }).map(function (c) {
      return { value: c.id, title: c.title, sub: c.no + " · " + c.network, right: c.type === "Credit" ? cb.fmt(c.available) : "", rightLabel: "Available limit", icon: "card", color: "linear-gradient(135deg,#1f2937,#4b5563)", data: c };
    });
  };
  var AV = ["#8b1c1c", "#0e7490", "#c2410c", "#2e7d32", "#3f51b5", "#be185d", "#6d28d9"];
  cb.avatarColor = function (s) { var h = 0; String(s).split("").forEach(function (c) { h = (h + c.charCodeAt(0)) % AV.length; }); return AV[h]; };
  cb.initials = function (n) { return String(n).replace(/^MD\.?\s*/i, "").split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase(); };
  cb.beneficiaryItems = function (group, type) {
    return (D.beneficiaries || []).filter(function (b) { return b.group === group && (!type || b.types.indexOf(type) > -1); }).map(function (b) {
      return { value: b.id, title: b.nick || b.name, sub: (b.card || b.group === 3 ? b.acc : cb.mask(b.acc)) + " | " + b.bank, initials: cb.initials(b.name), color: b.mfs ? "var(--mfs-" + b.mfs + ")" : cb.avatarColor(b.name), badge: b.fav ? "★" : "", search: b.name + " " + b.acc, data: b };
    });
  };

  // ===================================================================
  // Amount field: ৳ prefix, 2 decimals, quick chips. cb.amount(el, { chips, whole, max }) -> { paisa(), set(n) }
  // ===================================================================
  cb.amount = function (el, o) {
    o = o || {};
    var input = $("input", el), chipsWrap = el.parentElement.querySelector(".chips"), wordsEl = el.parentElement.querySelector(".words");
    function sync() { var p = cb.toPaisa(input.value); if (wordsEl) wordsEl.textContent = p ? cb.words(p / 100) : ""; el.dispatchEvent(new CustomEvent("amount", { bubbles: true, detail: p })); }
    input.addEventListener("input", function () {
      var v = input.value.replace(o.whole ? /[^0-9]/g : /[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
      var pr = v.split("."); if (pr[1] !== undefined) v = pr[0] + "." + pr[1].slice(0, 2);
      if (o.max && parseFloat(v) > o.max) v = String(o.max);
      input.value = v; el.classList.remove("invalid"); sync();
    });
    input.addEventListener("blur", function () { var p = cb.toPaisa(input.value); input.value = p ? (p / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : ""; });
    input.addEventListener("focus", function () { input.value = input.value.replace(/,/g, ""); });
    if (chipsWrap && o.chips) {
      chipsWrap.innerHTML = o.chips.map(function (c) { return '<button type="button" data-amt="' + c + '">' + c.toLocaleString("en-IN") + "</button>"; }).join("");
      $$("button", chipsWrap).forEach(function (b) { b.addEventListener("click", function () { input.value = (+b.dataset.amt).toLocaleString("en-IN"); el.classList.remove("invalid"); sync(); }); });
    }
    return { paisa: function () { return cb.toPaisa(input.value); }, set: function (n) { input.value = n ? (+n).toLocaleString("en-IN") : ""; sync(); }, input: input };
  };

  // ===================================================================
  // Tabs: <div data-tabs> with buttons [data-tab], panes [data-pane] in the same [data-tabs-scope]
  // ===================================================================
  cb.tabs = function (tablist, onChange) {
    var scope = tablist.closest("[data-tabs-scope]") || document;
    $$("[data-tab]", tablist).forEach(function (b) {
      b.setAttribute("role", "tab");
      b.addEventListener("click", function () {
        $$("[data-tab]", tablist).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
        $$("[data-pane]", scope).forEach(function (p) { if (p.closest("[data-tabs-scope]") === tablist.closest("[data-tabs-scope]")) p.hidden = p.dataset.pane !== b.dataset.tab; });
        if (onChange) onChange(b.dataset.tab);
      });
    });
  };
  $$("[data-tabs]").forEach(function (t) { if (!t.dataset.manual) cb.tabs(t); });

  // ===================================================================
  // Stepper: cb.step(rootEl, n) shows [data-step=n] sections and updates .stepper
  // ===================================================================
  cb.step = function (root, n) {
    $$(".ft-step", root).forEach(function (s) { s.classList.toggle("on", +s.dataset.step === n); });
    var total = $$(".stepper li", root).length;
    $$(".stepper li", root).forEach(function (li) { var k = +li.dataset.step; li.classList.toggle("on", k === n && n < total); li.classList.toggle("done", k < n || n >= total); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===================================================================
  // Receipt (spec §5.3): cb.saveReceipt({ title, amount, rows:[[k,v]], txnId, type }) then go to receipt.html
  // ===================================================================
  cb.saveReceipt = function (r) { try { sessionStorage.setItem("cb-receipt", JSON.stringify(r)); } catch (e) {} };
  cb.loadReceipt = function () { try { return JSON.parse(sessionStorage.getItem("cb-receipt")); } catch (e) { return null; } };

  // ===================================================================
  // Session (spec §4.1): 5 min idle, non-dismissible sign-out modal. ?idle=20 shortens it for demos.
  // ===================================================================
  cb.logout = function () {
    cb.confirm({ title: "Log out", message: "Do you want to exit?", ok: "Log out", danger: true, icon: "logout" }).then(function (ok) {
      if (!ok) return;
      try { sessionStorage.clear(); } catch (e) {}
      location.href = "login.html";
    });
  };
  document.addEventListener("click", function (e) { if (e.target.closest("[data-logout]")) { e.preventDefault(); cb.logout(); } });
  cb.sessionExpired = function () {
    try { sessionStorage.clear(); } catch (e) {}
    cb.dialog({ title: "Session Logged Out", message: "You were signed out from this device.", icon: "lock", tone: "danger", size: "sm", dismissible: false, alert: true,
      buttons: [{ text: "Back to Login Screen", primary: true, onClick: function () { location.href = "login.html"; return false; } }] });
  };
  if (!isPublic && $("#sessionTime")) {
    var IDLE = 300, m = location.search.match(/idle=(\d+)/); if (m) IDLE = +m[1];
    var left = IDLE, expired = false, pill = $("#sessionPill"), st = $("#sessionTime");
    var reset = function () { if (!expired) left = IDLE; };
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(function (ev) { document.addEventListener(ev, reset, { passive: true }); });
    setInterval(function () {
      if (expired) return; left--;
      st.textContent = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");
      pill.classList.toggle("warn", left <= 60);
      if (left <= 0) { expired = true; cb.sessionExpired(); }
    }, 1000);
  }

  // ===================================================================
  // Misc: copy buttons, password show/hide, "coming soon" links
  // ===================================================================
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-copy]");
    if (c) { try { navigator.clipboard.writeText(c.dataset.copy); } catch (er) {} cb.toast(c.dataset.copyMsg || "Copied"); }
    var p = e.target.closest("[data-toggle-pass]");
    if (p) { var inp = p.parentElement.querySelector("input"); var show = inp.type === "password"; inp.type = show ? "text" : "password"; p.innerHTML = cb.icon(show ? "eyeOff" : "eye", 18); p.setAttribute("aria-label", show ? "Hide" : "Show"); }
    var s = e.target.closest("[data-soon]");
    if (s) { e.preventDefault(); cb.toast((s.dataset.soon || "This feature") + " is coming soon"); }
  });
  $$("[data-toggle-pass]").forEach(function (b) { b.innerHTML = cb.icon("eye", 18); b.setAttribute("aria-label", "Show"); });
  $$("[data-icon]").forEach(function (el) { el.innerHTML = cb.icon(el.dataset.icon, +el.dataset.size || 18, el.dataset.stroke); });
  $$("[data-logo]").forEach(function (el) { el.innerHTML = cb.LOGO; });

  // ---------------------------------------------------------------
  // Account picker for .acc-select (#fromSelect)
  // ---------------------------------------------------------------
  window.cbAccountPicker = function (box) {
    if (!box) return;
    var trigger = box.querySelector(".acc-trigger");
    var search = box.querySelector(".search-in input");

    box._paint = function () {
      var r = box.querySelector('input[name="from"]:checked');
      if (!r) {
        var visible = box.querySelectorAll('.acc-row:not(.kind-off) input[name="from"]');
        if (visible.length) {
          r = visible[0];
          r.checked = true;
        }
      }
      if (!r) return;
      var nameEl = box.querySelector("#fromName") || box.querySelector(".acc-trigger .acc-tx b") || box.querySelector(".acc-tx b");
      var metaEl = box.querySelector("#fromMeta") || box.querySelector(".acc-trigger .acc-tx span:not(.acc-bal-val)");
      var balEl = box.querySelector("#fromBal") || box.querySelector(".acc-trigger .acc-bal-val") || box.querySelector(".acc-bal b");
      var icEl = box.querySelector("#fromIc") || box.querySelector(".acc-trigger .acc-ic");

      if (nameEl) {
        var no = r.dataset.no || "";
        var nm = r.dataset.name || "";
        var isDef = r.closest(".acc-row") && r.closest(".acc-row").classList.contains("is-default");
        nameEl.innerHTML = (no ? cb.esc(no) + (nm ? ' <small class="acc-sub">· ' + cb.esc(nm) + '</small>' : '') : cb.esc(nm)) + (isDef ? '<i class="def-tag">Default</i>' : '');
      }
      if (balEl) {
        var b = Number(r.dataset.bal || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        balEl.textContent = b + " BDT";
      }
      if (metaEl && metaEl !== balEl) {
        metaEl.textContent = r.dataset.branch || "";
      }
      if (icEl) {
        var rowIc = r.closest(".acc-row") ? r.closest(".acc-row").querySelector(".acc-ic") : null;
        if (rowIc) {
          icEl.innerHTML = rowIc.innerHTML;
        }
      }
    };

    box._filter = function () {
      var q = (search ? search.value : "").trim().toLowerCase();
      var rows = box.querySelectorAll(".acc-row");
      var matchedCount = 0;
      rows.forEach(function (row) {
        if (row.classList.contains("kind-off")) {
          row.style.display = "none";
          return;
        }
        var rIn = row.querySelector("input");
        var match = !q || row.textContent.toLowerCase().indexOf(q) > -1 || (rIn && ((rIn.dataset.branch || "") + " " + (rIn.dataset.type || "")).toLowerCase().indexOf(q) > -1);
        row.style.display = match ? "" : "none";
        if (match) matchedCount++;
      });
      var groups = box.querySelectorAll(".acc-group");
      groups.forEach(function (g) {
        if (g.classList.contains("kind-off")) {
          g.style.display = "none";
          return;
        }
        var kind = g.dataset.kind;
        var hasVisible = false;
        rows.forEach(function (r) {
          if (r.dataset.kind === kind && !r.classList.contains("kind-off") && r.style.display !== "none") {
            hasVisible = true;
          }
        });
        g.style.display = hasVisible ? "" : "none";
      });
      var noneEl = box.querySelector(".acc-none");
      if (noneEl) noneEl.style.display = matchedCount === 0 ? "block" : "none";
    };

    if (trigger) {
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var willOpen = !box.classList.contains("open");
        document.querySelectorAll(".acc-select.open").forEach(function (x) {
          if (x !== box) x.classList.remove("open");
        });
        box.classList.toggle("open", willOpen);
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (willOpen && search) {
          setTimeout(function () { search.focus(); }, 50);
        }
      });
    }

    if (search) {
      search.addEventListener("input", function () {
        box._filter();
      });
    }

    box.addEventListener("change", function (e) {
      if (e.target.name === "from") {
        box._paint();
        box.classList.remove("open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("#" + box.id)) {
        box.classList.remove("open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });

    box._filter();
    box._paint();
  };

  // ---------------------------------------------------------------
  // Beneficiary picker for .ben-select (#toSelect / #hubBenSelect)
  // ---------------------------------------------------------------
  window.cbBeneficiaryPicker = function (box) {
    if (!box) return;
    var trigger = box.querySelector(".acc-trigger");
    var search = box.querySelector(".search-in input");
    var toName = box.querySelector("#toName") || box.querySelector("#hubToName");
    var toSub = box.querySelector("#toSub") || box.querySelector("#hubToSub");
    var toIc = box.querySelector("#toIc") || box.querySelector("#hubToIc");

    box._paintTo = function () {
      var r = box.querySelector('input[name="to"]:checked');
      if (!r) {
        var dest = box.dataset.dest;
        if (toName) {
          toName.textContent = dest === "own" ? "Choose account" : dest === "mfs" ? "Choose wallet" : "Choose beneficiary";
          toName.className = "to-placeholder";
        }
        if (toSub) {
          toSub.textContent = box.id === "hubBenSelect" ? "Select payee to send money" : dest === "own" ? "Select one of your own accounts" : dest === "mfs" ? "Select a saved wallet" : "Select from saved payees";
          toSub.className = "ben-sub-val to-placeholder-sub";
        }
        if (toIc) {
          toIc.innerHTML = '<span class="av av-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>';
        }
        box.classList.remove("has-selection");
        return;
      }

      box.classList.add("has-selection");
      var benRow = r.closest(".ben");
      var name = r.dataset.name || "";
      var no = r.dataset.no || "";
      var bank = r.dataset.bank || "";

      if (toName) {
        toName.className = "";
        var tag = benRow ? benRow.querySelector(".tag") : null;
        var tagHtml = tag ? ' <span class="' + tag.className + '">' + cb.esc(tag.textContent) + '</span>' : '';
        toName.innerHTML = cb.esc(name) + tagHtml;
      }
      if (toSub) {
        toSub.className = "ben-sub-val";
        toSub.textContent = (no ? no + " · " : "") + bank;
      }
      if (toIc && benRow) {
        var av = benRow.querySelector(".av");
        if (av) {
          toIc.innerHTML = av.outerHTML;
        }
      }
      var err = document.querySelector("#toErr");
      if (err) err.classList.remove("show");
      if (trigger) trigger.classList.remove("invalid");
    };

    box._filterTo = function () {
      var q = (search ? search.value : "").trim().toLowerCase();
      var activePane = box.querySelector(".tab-pane.on") || box;
      var rows = activePane.querySelectorAll(".ben");
      var matchedCount = 0;
      rows.forEach(function (row) {
        if (row.classList.contains("kind-off")) {
          row.style.display = "none";
          return;
        }
        var match = !q || row.textContent.toLowerCase().indexOf(q) > -1;
        row.style.display = match ? "" : "none";
        if (match) matchedCount++;
      });
      var emptyEl = activePane.querySelector(".empty-note");
      if (emptyEl) emptyEl.style.display = matchedCount === 0 && q ? "block" : "none";
    };

    if (trigger) {
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var willOpen = !box.classList.contains("open");
        document.querySelectorAll(".acc-select.open").forEach(function (x) {
          if (x !== box) x.classList.remove("open");
        });
        box.classList.toggle("open", willOpen);
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (willOpen && search) {
          setTimeout(function () { search.focus(); }, 50);
        }
      });
    }

    if (search) {
      search.addEventListener("input", function () {
        box._filterTo();
      });
    }

    // Selecting a beneficiary
    box.addEventListener("click", function (e) {
      var row = e.target.closest(".ben");
      if (!row) return;
      var input = row.querySelector('input[name="to"]');
      if (input) {
        input.checked = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      box._paintTo();
      box.classList.remove("open");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });

    box.addEventListener("change", function (e) {
      if (e.target.name === "to") {
        box._paintTo();
        box.classList.remove("open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("#" + box.id)) {
        box.classList.remove("open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("open")) {
        box.classList.remove("open");
        if (trigger) {
          trigger.setAttribute("aria-expanded", "false");
          trigger.focus();
        }
      }
    });

    box._filterTo();
    box._paintTo();
  };
})();
