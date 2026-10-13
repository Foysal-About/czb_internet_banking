/* Citizens FAST portal: dummy data (design only, no API).
   Shapes follow the mobile spec so screens look like the real thing:
   accountType 0 ALL · 1 PAYEE · 5 PAYABLES (debit) · 6 RECEIVABLES (own-transfer target)
   producT_TYPE DP01 Savings/Current · DP02 FDR · DP03 DPS · LN01 Loan */
window.CB_DATA = (function () {
  var user = {
    userId: "foysal.syed", fullName: "Syed Foysal", initials: "SF", customerId: "CZB10045218",
    company: "Rahim Textiles Ltd.",
    mobile: "01711234515", email: "syed.foysal@gmail.com", branch: "Gulshan Branch", branchId: "012",
    dob: "14/03/1992", father: "Syed Abdul Karim", mother: "Rokeya Begum", nid: "1992261845730", smartNid: "8714 5523 9061",
    lastLogin: "01 Oct 2026, 09:40 AM"
  };

  var accounts = [
    { id: "a1", product: "General Account", productType: "DP01", kind: "Current", no: "0012034571340", branch: "Gulshan", branchId: "012", balance: 12480.00, current: 12980.00, hold: 0, lien: 500, minBal: 0, opened: "12-Mar-2019", status: "Active", types: [0, 5, 6] },
    { id: "a2", product: "Savings Account", productType: "DP01", kind: "Savings", no: "0012087120884", branch: "Gulshan", branchId: "012", balance: 31205.60, current: 31705.60, hold: 0, lien: 0, minBal: 500, opened: "04-Jan-2020", status: "Active", rate: "4.50%", types: [0, 5, 6] },
    { id: "a3", product: "Salary Account", productType: "DP01", kind: "Current", no: "0031044030451", branch: "Uttara", branchId: "031", balance: 46210.00, current: 46210.00, hold: 0, lien: 0, minBal: 0, opened: "18-Jul-2021", status: "Active", types: [0, 5, 6] },
    { id: "a4", product: "Joint Savings", productType: "DP01", kind: "Savings", no: "0045091355210", branch: "Banani", branchId: "045", balance: 158900.00, current: 158900.00, hold: 2000, lien: 0, minBal: 1000, opened: "09-Feb-2022", status: "Active", rate: "4.50%", types: [0, 5, 6] },
    { id: "a5", product: "Monthly DPS", productType: "DP03", kind: "DPS", no: "0045112099027", branch: "Banani", branchId: "045", balance: 3600.00, opened: "15-Apr-2025", status: "Active", rate: "7.00%", maturity: "15-Apr-2030", installment: 200, paid: 18, due: 42, overdue: 0, next: "15-Oct-2026", types: [0, 6] },
    { id: "a6", product: "Citizens FDR 12M", productType: "DP02", kind: "FDR", no: "0091045655604", branch: "Gulshan", branchId: "012", balance: 100000.00, opened: "12-Mar-2026", status: "Active", rate: "7.25%", maturity: "12-Mar-2027", renewal: "—", types: [0] },
    { id: "a7", product: "Home Loan", productType: "LN01", kind: "Loan", no: "0078330144172", branch: "Dhanmondi", branchId: "078", balance: 1425000.00, opened: "01-Jun-2023", status: "Regular", rate: "9.00%", limit: 2000000, installmentAmt: 24500, nextDue: "05-Oct-2026", types: [0] }
  ];

  var cards = [
    { id: "c1", title: "Citizens VISA Debit", type: "Debit", network: "VISA", no: "4512 •••• •••• 7134", expiry: "09/29", holder: "SYED FOYSAL", status: "Active", linked: "0012034571340" },
    { id: "c2", title: "Citizens Platinum Credit", type: "Credit", network: "VISA", no: "4921 •••• •••• 4421", expiry: "06/28", holder: "SYED FOYSAL", status: "Active", limit: 250000, available: 185000, outstanding: 65000, minDue: 3250, statementDate: "20-Sep-2026", dueDate: "10-Oct-2026", currency: "BDT / USD" },
    { id: "c3", title: "Citizens Gold Credit", type: "Credit", network: "Mastercard", no: "5243 •••• •••• 0918", expiry: "11/27", holder: "SYED FOYSAL", status: "Active", limit: 100000, available: 62500, outstanding: 37500, minDue: 1875, statementDate: "20-Sep-2026", dueDate: "10-Oct-2026", currency: "BDT" }
  ];

  // beneficiaries by group: 1 Citizens Bank · 2 Other Bank · 3 MFS
  var beneficiaries = [
    { id: "b1", group: 1, name: "Foysal", nick: "", acc: "0012045680001", bank: "Citizens Bank", branch: "Gulshan", types: ["NPSB", "RTGS", "BEFTN"], fav: true },
    { id: "b2", group: 1, name: "Salma", nick: "", acc: "0012099134321", bank: "Citizens Bank", branch: "Banani", types: ["NPSB", "RTGS", "BEFTN"], fav: true },
    { id: "b3", group: 1, name: "Naim Hasan", nick: "", acc: "0045071820001", bank: "Citizens Bank", branch: "Dhanmondi", types: ["NPSB", "RTGS", "BEFTN"], fav: false },
    { id: "b4", group: 1, name: "Shohan", nick: "", acc: "0031044035678", bank: "Citizens Bank", branch: "Uttara", types: ["BKASH"], fav: false, mfs: "bkash" },
    { id: "b5", group: 2, name: "Mahmudul Hasan", nick: "Office", acc: "1051100344217", bank: "Dutch-Bangla Bank", branch: "Gulshan", routing: "090261725", types: ["NPSB", "RTGS", "BEFTN"], fav: true },
    { id: "b6", group: 2, name: "Farhana Akter", nick: "", acc: "2205660011823", bank: "BRAC Bank", branch: "Banani", routing: "060260435", types: ["NPSB", "BEFTN"], fav: false },
    { id: "b7", group: 2, name: "Kamal Traders", nick: "Supplier", acc: "1401220977105", bank: "The City Bank", branch: "Gulshan", routing: "225261729", types: ["RTGS", "BEFTN"], fav: false },
    { id: "b8", group: 2, name: "Arif Chowdhury", nick: "Card", acc: "4319000000002290", bank: "BRAC Bank", card: true, types: ["NPSB"], fav: false },
    { id: "b9", group: 3, name: "Rahima Begum", nick: "Mother", acc: "01711234567", bank: "bKash", mfs: "bkash", types: ["BKASH"], fav: true },
    { id: "b10", group: 3, name: "Jamal Uddin", nick: "Driver", acc: "01819876543", bank: "Nagad", mfs: "nagad", types: ["NAGAD"], fav: false },
    { id: "b11", group: 3, name: "Sumi Akter", nick: "", acc: "01912445566", bank: "Tap", mfs: "tap", types: ["TAP"], fav: false }
  ];

  var mfs = [
    { id: "bkash", name: "bKash", code: "ITCLBKASH", color: "var(--mfs-bkash)" },
    { id: "nagad", name: "Nagad", code: "NAGAD", color: "var(--mfs-nagad)" },
    { id: "tap", name: "Tap", code: "TAP", color: "var(--mfs-tap)" },
    { id: "upay", name: "Upay", code: "UPAY", color: "var(--mfs-upay)" },
    { id: "rocket", name: "Rocket", code: "ROCKET", color: "var(--mfs-rocket)" }
  ];

  var banks = ["Dutch-Bangla Bank", "BRAC Bank", "The City Bank", "Eastern Bank", "Islami Bank Bangladesh", "Sonali Bank", "Prime Bank", "Mutual Trust Bank"];
  var branches = {
    "Dutch-Bangla Bank": [["Gulshan", "090261725"], ["Motijheel", "090274538"], ["Dhanmondi", "090260834"]],
    "BRAC Bank": [["Gulshan", "060261726"], ["Banani", "060260435"], ["Uttara", "060264638"]],
    "The City Bank": [["Principal Office", "225274531"], ["Gulshan", "225261729"]],
    "Eastern Bank": [["Principal", "095274530"], ["Dhanmondi", "095260836"]],
    "Islami Bank Bangladesh": [["Local Office", "125274535"], ["Mirpur", "125262941"]],
    "Sonali Bank": [["Local Office", "200274535"], ["Ramna", "200275020"]],
    "Prime Bank": [["Motijheel", "170274530"], ["Gulshan", "170261726"]],
    "Mutual Trust Bank": [["Dilkusha", "145274532"], ["Banani", "145260436"]]
  };
  var czbBranches = ["Principal Branch", "Gulshan Branch", "Banani Branch", "Dhanmondi Branch", "Uttara Branch", "Motijheel Branch", "Agrabad Branch", "Sylhet Branch"];

  // transactions (for statement, history, mini statement)
  var tx = [
    ["29-Sep-2026", "Grocery Store - Banani", -7450.00, "POS"],
    ["25-Sep-2026", "Online Bill Payment - DESCO", -1840.00, "Bill Pay"],
    ["22-Sep-2026", "Cheque Deposit", 176193.00, "Deposit"],
    ["18-Sep-2026", "POS - Aarong Uttara", -9941.20, "POS"],
    ["15-Sep-2026", "ATM Withdrawal - Dhanmondi", -5000.00, "ATM"],
    ["09-Sep-2026", "Salary - A/C 3045", 89564.00, "Salary"],
    ["05-Sep-2026", "Transfer to A/C 2098 (NPSB)", -54151.20, "Fund Transfer"],
    ["02-Sep-2026", "Cash Deposit - A/C 1023", 17619.30, "Deposit"],
    ["28-Aug-2026", "Mobile Recharge - 01711234567", -100.00, "Recharge"],
    ["24-Aug-2026", "bKash Transfer - Rahima Begum", -3000.00, "MFS"],
    ["20-Aug-2026", "Interest Credit", 412.55, "Interest"],
    ["15-Aug-2026", "Link3 Internet Bill", -1500.00, "Bill Pay"]
  ].map(function (t, i) { return { date: t[0], narration: t[1], amount: t[2], type: t[3], ref: "CBT" + (2609290000 + i * 137) }; });

  return { user: user, accounts: accounts, cards: cards, beneficiaries: beneficiaries, mfs: mfs, banks: banks, branches: branches, czbBranches: czbBranches, tx: tx };
})();
