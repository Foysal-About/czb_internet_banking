# Citizens FAST — Internet Banking Portal: Business, Functional & Design Spec

> Copy of the spec provided by the product owner (2026-10-01), kept here as the design brief for this
> HTML/CSS prototype. The prototype is **design only**: it uses dummy data and calls no API.
> Endpoint names are kept as reference for the build team.

## 0. Tags
✅ Live (mobile calls a real API) · ⚠️ Partial (stub/hardcoded) · 🔵 Not built · 🌐 Web-specific decision.

## 1. Product summary
Retail internet banking for Citizens Bank PLC (Bangladesh), mirroring the Citizens FAST app.
In scope: accounts & balances, history & statements, fund transfer (own, intra-bank, BEFTN, RTGS, NPSB, MFS),
beneficiary management, bill payment, mobile recharge, cards, DPS/FDR, cheque services, service requests,
notifications, profile & security, branch/ATM locator, products & offers.
Out of scope: corporate/SME, loans (servicing only), investments, chat, remittance.
Not for web: QR scanning, Qibla, biometric. Optional: prayer times, Dua, Tasbih, Zakat & EMI calculators.

## 2. Information architecture
Mobile bottom bar (Home · Beneficiary · QR · History · Settings) becomes a persistent left sidebar:
Dashboard · Accounts (Statement, History) · Transfer (Beneficiary) · Payments (Bill Pay, Recharge) · Cards ·
Deposits · Cheques · Requests · Settings · — · Find CZB · Offers · Help. Top bar: logo, bell (unread), session
countdown, avatar menu. Content max width ~1200px.

Sitemap:
- Public: Landing/Login · Trouble logging in · Reset password · Recover user ID · Self-registration · Find CZB · Contacts · Lifestyle/Offers
- Dashboard: Home
- Accounts: list/details · Statement · Transaction history · Transaction limits · Mini statement
- Transfer: hub → form → confirm → success → receipt · Payment history
- Beneficiary: List · Add (per channel) · Add-auth · Edit
- Payments: Bill pay (category → biller → form → confirm → success) · Mobile recharge (form → confirm → success → receipt)
- Cards: list · details · add
- Deposits: hub · Open DPS · Open FDR · details
- Cheques: Order cheque book · Stop cheque · Positive pay · Inward/Outward cheque
- Requests: Request status · Tax document upload · Dispute · Complain · Pay order
- Settings: My profile · Login options · Change password · TPIN recovery · Linked devices · Activity log · Notifications · Appearance/Language
- Discover: Products · Product details · Find CZB · Benefits/Offers · Calculators · Ibadah

## 3. Design system
Colours (tokens only, never inline hex): BrandRed #8B1C1C · BrandRedStrong #8B0000 (buttons, active) · TopBarRed #9B1D1D ·
Home header wash #FFDDDD→#FFFFFF (dark #241015→#141215) · Surface variant #F5F5F5 (dark #272422) · Outline #E0E0E0/#EEEEEE (dark #504C4A) ·
Text #000/#757575 (dark #E0E0E0/#A3A1A1) · Success #2E7D32 · Warning #F9A825 · Error #C62828 ·
Account card gradient #9A1114→#740408→#5B0609→#3F0404 (white text) · Gold CTA #F6B93B on #2A1A05 ·
Transfer accents CZB #8B1B1B · Other Bank #2E7D32 · MFS #3F51B5 (badge 16% alpha, ring 55%) ·
MFS chips bKash #E2136E · Nagad #F47820 · Tap #39B54A · Upay #FBB917 · Rocket #8C3B8E.
Type: SF Pro / system stack; Bangla: Noto Sans Bengali. Screen title 24 Bold · Section/sheet title 20 Bold · Currency glyph 20 SemiBold ·
Amount input 18 SemiBold · Field value 16 Regular / list title 16 SemiBold · Button 16 Medium · Body 14 · Label 12 Medium / caption 12.
Browser zoom & WCAG 2.1 AA resizing must work. Radii 8·10·12·16·20·28·pill (inputs 10–12, cards 16–20, account card 20).
Component mapping: bottom-sheet picker → searchable select/modal list (avatar · name · `ACC ···· 1234 | BANK`); account selector shows
account no, product, available balance; segmented row → tabs; amount field ৳ + large digits + chips; OTP sheet → centred modal 6 inputs;
auth method cards "Complete payment confirmation via:" SMS / Email; review card From/To/Amount/Charges/Notes; success page tick +
Back to Home / View Receipt; forced session sheet → non-dismissible modal; refresh failures → toast; first-load failure → inline empty state
with Retry; account card carousel (dark-red gradient); skeleton loaders.

## 4. Cross-cutting rules
4.1 Session: idle 5 min; absolute cap expires_in; 401 → forced sign-out; non-dismissible "Session Logged Out — You were signed out from
this device." → Back to Login Screen. Manual logout: "Do you want to exit?". Countdown in top bar (web). Clear all state on sign-out.
4.2 Transaction auth handshake: same body posted up to 3×: probe (AUTH → auth methods) → AUTH_TYPE=OTP + SMS|EMAIL (→ "OTP sent to
01XXXXXX515") → OTP code (→ OK + TRANSACTION_ID). FAILED shows error on the form. Auth options data-driven; hide biometric.
TPIN (fund transfer only, when enabled): review page asks 6-digit masked TPIN (Show/Hide, "Forgot TPIN?") before auth cards; wrong →
"Invalid TPIN" and clear boxes. Requests (beneficiary, change password, cheque, tax doc) take auth methods from api/authentication-types.
4.3 Money in integer paisa; amount max 2 decimals, no negatives; limits display-only; fees: show Charge 0 (BDT 0.00) until backend confirms.
Debit accounts accountType 5, own-transfer targets 6. Never key lists by account number alone.
4.4 Validation: account 13 digits ("Please enter a valid 13-digit account number"); BD mobile ^01[3-9]\d{8}$ ("Please enter a valid mobile
number"); email ("Please enter a valid email address"); DOB DD/MM/YYYY not future; amount; required ("<Label> is required");
password ≥12 chars, 3 of 4 {upper, lower, digit, special @&.-_!#^*()+}, differs from current; confirm matches ("Passwords do not match").
Errors after blur; primary buttons disabled until valid.
4.5 Errors: friendly sentences only; empty+error → inline Retry; refresh failure → dismissible alert keeping data; background → silent.
4.6 Security: mask ACC **1234; autocomplete off on OTP/TPIN; no sensitive data in URLs.
4.7 Bilingual English + Bangla from day one.

## 5. Shared components
5.1 Account selector: product name, account number, available balance; "Available Balance: BDT x,xxx.xx" under the field.
5.2 OTP modal: 6 digits numeric, auto-advance, paste; Verify enabled at 6; server message above ("OTP sent to …"); countdown 85 s
(01:25); Resend disabled until countdown ends; errors inside; closing cancels.
5.3 Review card: From (A/C), To (name, account, bank), Amount, Charges, Notes (editable pencil), auth cards, Cancel/Confirm.
Success: tick, title, summary (From, Receiver, To account, Bank, Amount, Date & time, Transaction ID), Back to Home / View Receipt.
Receipt: bank logo, Transaction ID, date, from, receiver, to account, bank, type, amount, charges, total, Download PDF.
After sign-out: "This receipt is no longer available". Back must not re-enter the flow.
5.4 Request-auth page: summary → auth cards → OTP → success dialog ("Cheque book order submitted", "Stop cheque request submitted",
"Positive pay request submitted", "Document upload submitted", "Beneficiary Added") → return.

## 6. Pre-login
6.1 Landing: full-screen banner carousel (auto-advance 4 s), LOGIN and REGISTER NOW; footer Location (Find CZB), Contacts (address book +
call centre), LifeStyle.
6.2 Login: User ID (required, trimmed), Password (Show/Hide), Remember user ID (stores ID only). LOGIN enabled when both filled.
Links: Forgot password? → "Having Trouble With Login" (Reset My Password / Recover My ID); How to Sign Up? → Self Registration;
"Open through e-KYC". Error dialog fallback "Login failed". No biometric on web.
6.3 Reset password: toggle "Which one do you prefer to forgot password with?" User ID | Phone Number. Fields: Customer ID, Branch (select),
Phone Number (only for Phone), Account Number (13), Date of Birth (DD/MM/YYYY), Email. Next → SMS OTP → "Your password reset request has
been submitted successfully." (customer never types a new password).
6.4 Recover user ID: Branch, Account Number (13), Phone Number, Email, Date of Birth → SMS OTP → "Your user ID recovery request has been
submitted successfully."
6.5 Self-registration (UI): Welcome → Get Started → "Do you have any CZB Card or Account?" (I am New / I have CZB Account / Card) →
"Which one do you prefer to register with?" Account (Individual | Proprietorship) / Card (Credit | Prepaid, disabled "Coming soon...");
note "It is mandatory for CZB customers to register with an available Card/Account" → Account information: Alias/Userid, Account Number (13),
Account Name, Date Of Birth, Mobile No (11) → Phone OTP (step 3/4) → Email OTP (step 4/4) → "Registration Successful!" → Login.
6.6 Change password: Current, New, Confirm (Show/Hide). Live checklist "Minimum 12 characters"; "Password must meet any three conditions":
uppercase, lowercase, numbers, special (@&.-_!#^*()+). Notes: "New password cannot be the same as any of your last 4 passwords",
"New password will be valid for next 90 days". Update Password → auth page → OTP.

## 7. Dashboard
Header: photo, full name, bell with unread dot. Account cards: dark-red gradient per account, `**** **** **** 1234`, "Account Holder",
title; "Tap for balance" → Loading… → available balance, auto-hides after 4 s (one card at a time); Share: Account Number, Account Name,
Product Name, Bank Name "CITIZENS BANK PLC", Branch Name, Branch ID, fraud warning, Copy/Share; click → account details.
Shortcut grid: up to 9 tiles, customisable, reorderable, presets 3 / 6 / Default / Custom; Fund Transfer, Bill Payment, Recharge locked.
Default nine: Fund Transfer, Bill Payment, Recharge, Card Services, My QR, Deposit Scheme, Statement, Tax Document, Dispute Request.
Add card promo "Card — Add Card & Explore" (+ Add Card). Lifestyle & Offers row (See all). Benefits card "Explore our specially curated
offers…" View all Offers. Ads row. Hotline 16222. Web: add recent transactions widget.
"See More" directory: More (Transfer, Bill Pay, Recharge, Cards, My QR, Deposit, Statement, Transaction Limit, My Products, Ibadah, Zakat,
Calculator, Beneficiary, Request) · Request (Status, Mini-Statements, Complain, Positive Pay, Pay Order, Dispute Request, Tax Document) ·
Cheque (Stop, Order, Inward, Outward) · Other (Find CZB, Help & Support, What's New).

## 8. Accounts
8.1 Details: header AVAILABLE BALANCE (Loan: CURRENT OUTSTANDING) + grid PRODUCT, ACCOUNT HOLDER, BRANCH NAME, A/C OPENING DATE, STATUS,
CUSTOMER ID (demand) or INTEREST RATE. Savings/Current tabs: Mini Statement · Balance (Current, Hold, Lien, Min Bal. Required, Available) ·
Cheque (books Start Leaf, End Leaf, Issue Date → used leaves). FDR/DPS: Account Info (Branch, Product, Title, Status, Opening, Maturity,
Last Renewal, Currency; DPS + Interest Rate, Next Payment Date, installments Paid/Due/OverDue) · Balance (Current, UnClear, Blocked, Hold,
Lien, Pending Authorization (Cr), Min Bal., Available) · Mini Statement. Loan: Account Info (Effective Year, Expiry, Interest Rate, Loan Limit,
Allowable Limit, Classification Status) · Balance (Current Outstanding, Un Clear, Blocked, Pending Authorization, Limit Available) ·
Repayment (Current OS Balance, Installment Amount, Frequency, Next Due Date, Installment Due No, No. of Installment, Grace Period,
No. of Overdue, Overdue Amount). Mini statement: Date dd-MM-yyyy, Narration, ±Amount; empty "No recent transactions".
8.2 Statement: Account (required), Filter by Period (Last 2 Weeks · 1 Month · 6 Months · 1 year), From/To (editing clears chip).
Generate previews → Download Statement (PDF `Statement_<branchId>_<accountNo>.pdf`). Empty "No transactions for the selected period."
Web: cap range, CSV/Excel.
8.3 History: tabs Fund Transfer · Bill Pay · Mobile (own filters each); required Transfer Type (searchable), From, To; "The From date must not
be after the To date."; 10 rows then "Show more" (+10); row: From account, date, type, To, amount; web: row opens receipt.
Empty: "Choose a transaction type, then a From and To date…" / "No transactions in this period." Payment history: Source Account + From/To.
8.4 Limits: per transaction type: Minimum, Maximum, Day Transaction Limit, No. of Transaction Per Day; web: used vs limit bars.
8.5 Mini statement: coming soon (use the details tab).

## 9. Fund transfer
Hub cards CZB · Other Bank · MFS → form with method tabs → Next → review + auth → OTP → success → receipt.
Methods: Own Account (From type 5 · To own accounts type 6 · Account holder read-only · Amount · Notes) · Other CZB account (From ·
Beneficiary · Account holder · Amount · Notes) · BEFTN (From · Beneficiary · Account holder · Receiver mobile · Amount · Notes) ·
RTGS (From · Beneficiary · Account holder · Amount · Notes) · NPSB (Transaction type A2A/A2C/C2A/C2C · From (account or card) ·
Beneficiary · Account holder · Amount · Notes) · MFS bKash/Nagad/Tap… (From · Beneficiary wallet · card Account Name/Receiver Name/Mobile ·
Amount · Notes). Switching tabs keeps From/Amount/Notes, clears beneficiary. NPSB: From & Beneficiary disabled until type chosen.
Amount chips 500 · 5,000 · 10,000 · 20,000. Notes optional, default "<Group> Transfer" (e.g. "CZB Transfer"). No scheduling.
Beneficiary picker has "+ Add new beneficiary". Labels: Transfer Type · Transfer From ("Available balance: …") · Transfer to (Beneficiary) ·
"ACCOUNT HOLDER DETAILS" card · Receiver Mobile No · Transfer Amount ("Enter amount here") · Purpose ("Purpose of this transfer");
link to Transaction Limit. Review: Transfer From, Transfer To (name + bank), Amount, Charge (0), Purpose (editable); TPIN step when enabled;
auth cards (first pre-selected); Cancel / Confirm. Success "Your Fund Transfer is Successful", date `dd-MMM-yyyy | hh:mm a`.
Receipt "Payment Receipt !", REF <txnId>, Payment Method, Receiver Name, Receiver Account, Receiver Bank Name, Ref Number, Payment Time,
PDF `TransactionReceipt_<txnId>.pdf`.

## 10. Beneficiary management
List: tabs Citizens Bank · Other Bank · MFS; search (alias, name, account); FAVOURITES section on top; row: initial avatar, nickname/name,
"ACC **1234 | EFT | NPSB…"; row menu: Mark as / Remove from favourites · Edit · Delete ("Remove X from your beneficiaries?").
Empty: "No Beneficiary is added" / "No beneficiary matches your search".
Add: "Add Beneficiary — Select an option to continue" → form → auth page "Complete adding beneficiary via" → OTP → "Beneficiary Added".
CZB: Account Number · Account Holder Name · Nickname. Other Bank Account toggle: Account Number · Account Holder Name · Bank Name ·
Branch Name (routing) · Nickname; Card toggle: Card Number · Card Holder Name · Bank Name · Nickname (NPSBA2C). MFS: Wallet Number ·
Wallet Holder Name · MFS Name · Nickname. Card (credit card) local only. Validate 13-digit account, 16-digit card, BD mobile.
Edit: read-only except Nickname ("Only the nickname can be changed") → Update → "Beneficiary Updated".

## 11. Bill payment ⚠️
Categories → billers → form: Pay From → biller fields → [Bill Month/Year] → Amount. Blueprints: DESCO prepaid (Mobile Number · Account
Number, amount typed) · NESCO prepaid (Mobile · Meter/Customer No, typed) · DPDC (Customer Number/Account Code · Bill Month-Year, fetched) ·
Bakhrabad gas (Mobile · Customer Online Code · Meter/Non-Meter toggle) · Jalalabad/Paschimanchal gas (Mobile · Bill Account No) ·
Khulna (Bill No · Meter toggle) · WASA (Bill No) · e-Mutation (Tracking Number) · e-Porcha (Reference Id) · Land tax (Payment Token) ·
NSDA (Applicant Id) · default (Bill Number) · Credit card (Pay From · Beneficiary card · Card Type BDT/USD · Receiver Name after inquiry ·
Amount). Inquiry enabled when all filled (mobile fields 11 digits); shows breakdown; fetched amount read-only. Chips 500 · 1,000 ·
2,000 · 5,000 when editable. Then review → success.

## 12. Mobile recharge
Pay From · Mobile number (11 digits, operator detected from first 3 digits: GP 013/017 · Robi 018 · Banglalink 014/019 · Airtel 016 ·
Teletalk 015; override in "Select an operator") · Connection PrePaid/PostPaid · Amount whole taka > 0, chips 20 · 50 · 100 · 500 ·
Recents "BDT <amt> - <operator>" cards (tap fills). Confirm → handshake. Receipt: Operator / Mobile Number / Connection Type over
"Total Recharge".

## 13. Cards
List: card visuals `**** 1234`, holder, expiry + "Add Card — Link a new account to CZB" tile. Details: Card Number, Holder, Type, Currency,
Credit Limit (BDT), Available Credit Limit, Expiry, Statement Date, Payment Due Date, Minimum Payment Due, Outstanding, Mobile.
Transactions From/To + View Transactions; Download Statement. "More": Virtual Prepaid Card, Card Block, Foreign Part, Limit Conversion,
Card Statement, Passport Endorsement, EMI, Service Request. Add card: Card Number (16), Expiry (MM/YY), Card PIN (masked).

## 14. Deposit schemes
Hub: slider of existing DPS/FDR + "Create New Account" per group. DPS ("Savings Details"): Source Account → Opening Branch → Bank Product →
Term (Month) → Installment Amount (dropdown or fixed) → Continue → "New Account Details": Product Name, Tenure, Terms, Terms Frequency,
Maturity Date, Base Deposit Amount, Installment Amount, Installment Frequency, Maturity Amount, Profit Rate → Open Account / Cancel.
FDR: Source Account → Branch → Bank Product → Term Year (read-only) → Principal Amount → Auto Renew (Principal / Matured Amount) → preview.
Existing deposit cards: name, DPS/FDR badge, account number, holder, Status, Maturity Date.

## 15. Cheque services
Order cheque book: Account → Definition (name, leaf count, charges) → charges card with **Total charges (TK)** → Delivery Branch → Submit →
auth → "Your cheque book order has been submitted successfully." Stop cheque: Source Account → Cheque Book (start - end) → Un-Used Cheque →
Cheque Amount → Reason → Submit → auth. Positive pay: Source Account → Cheque Book → Un-Used Cheque → Amount → Start/End Date (≤ today,
dd-MMM-yyyy) → Beneficiary Name → Submit → auth. Inward/Outward: Cheque No, Beneficiary, Account, Amount, Pending/Accepted/Rejected.
Pay order: coming soon (beneficiary name, amount, reference).

## 16. Service requests
Request status: Date, Type, status coloured (green process/approve/complete/success · red declin/reject/fail/cancel · amber
progress/pending/review · grey other); empty "No requests found"; web: detail drawer. Tax document: Document Type → one required field per
param (date picker if label has "date") → Document File (size limit) → auth → "Your document has been uploaded successfully."
Dispute: Source Account · Dispute Type · Disputed Amount · Date (≤ today) · Narration ("Describe scenario"). Complain: subject, description.

## 17. QR
My QR: pick an account; QR of the account; "Show this code at any Citizens Fast counter or merchant to pay into this account."; Download PNG, Share.

## 18. Profile & settings
Settings hub: profile card ("User ID : …") · My Profile · App Settings · Appearance (Light/Dark) · Info Update · Log Out.
App settings: searchable list; Log In: Log In Option; General: Limits, Notification, Linked Device, Activity Log, Language.
My profile: User ID, Name, Date of Birth, Father's Name, Mother's Name, National ID, Smart NID, Email; photo upload with crop (JPEG ≤ 512 KB).
Login options: User ID (read-only) · Password → Change Password · TPIN → TPIN Recovery. TPIN recovery: Email · Branch Name · Date of birth →
"TPIN Recovery — coming soon". Linked devices: "N active", rows device type + created date, ⋮ Remove → "Remove device?" → "Device removed".
Activity log: 10 then +10 "See more"; channel icon (MOB mobile, IBU/WEB web), title, type chip (red fail/block/lock/logout; green
login/transfer/payment/recharge), date yyyy-MM-dd HH:mm. Notifications: unread bold + red icon; click marks read; empty "No notifications yet".
About / Privacy / FAQ. Help & Support, What's New: coming soon.

## 19. Discovery
Find CZB: location types (Branch, ATM, Sub-branch, Agent…), Division filter + search, rows with Map / Mail / Call; web map view.
Contacts: address book + 24/7 call centre (16222). Products: types → products → details (feature list). Benefits/Offers: company, discount
info, amount, address, web, contact, logo. Lifestyle: brand grid, chips All, Fashion, Tour & Travels, Food, E-Commerce.
EMI calculator: amount ৳0–100,000,000 · tenure 0–360 months · rate 0–30% → monthly installment. FDR calculator: amount · 0–120 months ·
0–15% → maturity (simple interest). Zakat: cash at home, cash in bank, gold, silver, trade goods → 2.5% if nisab met (612.36 g silver at
৳26.13/g, configurable). Exchange rates page.

## 20–21. Open questions & delivery order
See the original spec; not relevant to this design prototype.
