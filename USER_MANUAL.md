# Citizens Bank PLC (CZB)
## CloudNet Corporate Dynamic Internet Banking Platform
### Comprehensive User Operations Manual & System Guide

[![Platform](https://img.shields.io/badge/Platform-Citizens%20Bank%20Corporate-8B1C1C?style=flat&logo=angular&logoColor=white)](https://ibanktest.citizensbankbd.com/CorporateCBPLCUAT/login)
[![Security](https://img.shields.io/badge/Security-Maker--Checker%20%7C%202FA%20OTP-0A85EA?style=flat)](https://www.citizensbankbd.com/)
[![Support](https://img.shields.io/badge/Hotline-16222-28A745?style=flat)](tel:16222)
[![Version](https://img.shields.io/badge/Manual%20Version-1.0%20(UAT%20%26%20Production)-3178C6?style=flat)](https://ibanktest.citizensbankbd.com/CorporateCBPLCUAT/login)

---

## 📌 Document Overview & Executive Profile

Welcome to the **Citizens Bank PLC CloudNet Corporate Dynamic Internet Banking Platform**. This web portal is engineered specifically for corporate institutions, multinational commercial entities, manufacturing conglomerates, government departments, and educational institutions.

The platform provides corporate cash management, single and bulk fund disbursements, payroll automation, commercial account statements, trade and solvency requisitions, and administrative user controls, all governed by a dual-control (**Maker-Checker**) authorization engine in compliance with Bangladesh Bank Guidelines on ICT Security for Scheduled Banks.

| Document Property | Operational Value |
| :--- | :--- |
| **Financial Institution** | **Citizens Bank PLC (CZB)** |
| **Platform Engine** | CloudNet Corporate Dynamic Internet Banking |
| **Portal UAT / Staging URL** | **`https://ibanktest.citizensbankbd.com/CorporateCBPLCUAT/login`** |
| **Reference Corporate Client** | **`ttml2023`** |
| **Document Scope** | Complete End-to-End User Operations & Procedural Manual |
| **Document Version** | 1.0 (Enterprise Release) |
| **Customer Support Hotline** | **16222** (24/7 Corporate Banking Desk) |
| **Official Corporate Support Email**| `corporate.support@citizensbankbd.com` |

---

## 📑 Master Table of Contents

1. [Chapter 1: Platform Architecture, Roles & Security Principles](#-chapter-1-platform-architecture-roles--security-principles)
2. [Chapter 2: Accessing the Portal, Login & Authentication](#-chapter-2-accessing-the-portal-login--authentication)
3. [Chapter 3: Corporate Dashboard Navigation & Liquidity Overview](#-chapter-3-corporate-dashboard-navigation--liquidity-overview)
4. [Chapter 4: Single Fund Transfers & Interbank Clearing Rails](#-chapter-4-single-fund-transfers--interbank-clearing-rails)
5. [Chapter 5: Enterprise Bulk Fund Transfer & Corporate Payroll](#-chapter-5-enterprise-bulk-fund-transfer--corporate-payroll)
6. [Chapter 6: Dual-Control & Multi-Level Authorization (Checker Guide)](#-chapter-6-dual-control--multi-level-authorization-checker-guide)
7. [Chapter 7: Corporate Account Management & Statement Reconciliation](#-chapter-7-corporate-account-management--statement-reconciliation)
8. [Chapter 8: Beneficiary Directory Management Hub](#-chapter-8-beneficiary-directory-management-hub)
9. [Chapter 9: Corporate Service Requests ("Requests Desk")](#-chapter-9-corporate-service-requests-requests-desk)
10. [Chapter 10: Corporate Administration & User Management](#-chapter-10-corporate-administration--user-management)
11. [Chapter 11: Audit Trails & Enterprise Cybersecurity Governance](#-chapter-11-audit-trails--enterprise-cybersecurity-governance)
12. [Chapter 12: Complete Application Routing & Role Permissions Map](#-chapter-12-complete-application-routing--role-permissions-map)
13. [Chapter 13: Operational Checklists, Troubleshooting & FAQs](#-chapter-13-operational-checklists-troubleshooting--faqs)

---

## 🏛️ Chapter 1: Platform Architecture, Roles & Security Principles

### 1.1 The Maker-Checker Dual-Control Governance
All financial transactions within Citizens Bank Corporate Banking are governed by the **Maker-Checker Dual Approval Framework**:
* **Maker (Initiator):** Responsible for initiating fund transfers, uploading bulk payroll spreadsheets, and drafting service requests. A Maker **cannot** finalize or debit company accounts.
* **Checker / Authorizer (Approver):** Responsible for inspecting recipient details, routing numbers, and transaction sums in figures and words, and signing off using Two-Factor Authentication (2FA OTP). A Checker **cannot** approve a transaction they initiated themselves.

### 1.2 Configurable Monetary Slabs
Transactions are automatically routed to one or more approval levels based on configured monetary thresholds:
* **Slab 1 (BDT 0.01 – BDT 500,000):** Approved by any single Level 1 Authorizer.
* **Slab 2 (BDT 500,000.01 – BDT 5,000,000):** Sequential dual-level approval (Level 1 + Level 2 Authorizers).
* **Slab 3 (BDT 5,000,000.01 – BDT 50,000,000):** Triple-level sign-off (Level 1 + Level 2 + Level 3 Authorizers).
* **Slab 4 (Above BDT 50,000,000):** Executive Board / Managing Director Signatory authorization.

### 1.3 Two-Factor Authentication (2FA)
All sensitive financial movements and administrative changes mandate a 6-digit cryptographic One-Time Password (OTP) dispatched simultaneously to:
1. The user's verified corporate Mobile Number via SMS.
2. The user's registered corporate Email Address.

---

## 🔐 Chapter 2: Accessing the Portal, Login & Authentication

### 2.1 Navigating to the Portal
1. Open a modern, secure web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).
2. Navigate to the Citizens Bank Corporate Portal:
   👉 **`https://ibanktest.citizensbankbd.com/CorporateCBPLCUAT/login`**

```
+---------------------------------------------------------------------------------+
|                                CITIZENS BANK PLC                                |
|                           Citizens FAST Corporate Portal                        |
+---------------------------------------------------------------------------------+
|                                                                                 |
|   User ID:     [ ttml2023                                                     ] |
|   Password:    [ ••••••••••••••••                                      ] [👁]   |
|                                                                                 |
|   [✓] Remember user ID                 [ Forgot Password? ]                     |
|                                                                                 |
|   [               LOGIN                ]                                        |
|                                                                                 |
|   New to Citizens Corporate? [ How to sign up? ]                                |
|   Hotline: 16222 | TODAY · TOMORROW · TOGETHER                                  |
+---------------------------------------------------------------------------------+
```

### 2.2 Logging In with Your Credentials
1. **User ID:** Input your corporate User ID (e.g., `ttml2023`).
2. **Password:** Input your assigned password (e.g., initial password `1`).
3. Click **LOGIN**.
4. **First-Time Password Change:**
   * If logging in for the first time or after a password reset, the system will prompt a **Mandatory Password Change** (`/account/changepassword`).
   * **Password Requirements:** Minimum 12 characters; must contain at least three of the following: uppercase letter, lowercase letter, numeric digit, and special character (`@&.-_!#^*()+`).
   * You cannot reuse any of your last 4 historical passwords.
5. **2FA OTP Verification:**
   * An OTP is dispatched to your registered mobile and email.
   * Input the 6-digit code before the 120-second countdown timer expires and click **Verify**.

> [!CAUTION]
> **Account Lockout Policy:** Entering 5 consecutive incorrect passwords locks your account. To unlock, use the self-service **Forgot Password** link or contact your Corporate Master Administrator.

---

## 📊 Chapter 3: Corporate Dashboard Navigation & Liquidity Overview

Upon successful authentication, the system lands on the **Corporate Dashboard Overview** (`/`):

```
+---------------------------------------------------------------------------------+
| CITIZENS BANK PLC | Corporate Portal                     🔔 [3] | User: ttml2023|
+---------------------------------------------------------------------------------+
| Liquidity Overview:                                                             |
|   Total Available Balance: BDT 48,250,910.45                                    |
|   Operating Accounts: 4 | Deposit Accounts: 2 | Loan Facilities: 1              |
+---------------------------------------------------------------------------------+
| Pending Action Center:                                                          |
|   ⚠️ [4] Single Fund Transfers Pending Authorization (BDT 2,450,000.00)          |
|   ⚠️ [1] Bulk Payroll Batch Pending Review (BDT 14,820,500.00)                  |
+---------------------------------------------------------------------------------+
| Quick Shortcuts:                                                                |
|   [ Single Fund Transfer ]   [ Bulk Payroll ]   [ Beneficiary Hub ]             |
|   [ Statement Inquiry ]      [ Cheque Leaves ]  [ Solvency Request ]            |
+---------------------------------------------------------------------------------+
```

### 3.1 Key Dashboard Features
* **Real-Time Portfolio Balances:** View aggregated balances across all linked operational current, savings, and SND accounts.
* **Pending Action Center:** Checkers immediately see the count and total value of batches waiting for their sign-off.
* **Notification Center (`/otherservices/notifications`):** Alerts on incoming clearing credits, debit executions, and central bank clearing window changes.

---

## 💸 Chapter 4: Single Fund Transfers & Interbank Clearing Rails

Navigate to **Fund Transfer** (`/transactions/fundtransfer`):

### 4.1 Own Account Transfers (Intra-Company)
1. Select **Own Bank** $\rightarrow$ **Own Account**.
2. **Source Account:** Select the corporate debit account. The Available Balance updates in real time.
3. **Destination Account:** Select the destination corporate account.
4. **Amount:** Enter the transfer amount in BDT.
5. **Narration:** Enter a business description (e.g., *Liquidity transfer to Payroll Operating A/C*).
6. Click **Submit**.

### 4.2 Other Account Transfers (Third-Party Citizens Bank)
1. Select **Own Bank** $\rightarrow$ **Other Account**.
2. Select the Source Account.
3. Select an existing beneficiary or input the 13-digit destination account number.
4. **Real-Time CBS Title Inquiry:** The system automatically validates the account and displays the registered **Account Holder Name** in a green card. Verify the recipient title before proceeding.
5. Enter Amount and Narration. Click **Submit**.

### 4.3 National Interbank Transfers (Other Bank)
Choose from three national clearing rails:

| Clearing Rail | Typical Speed | Value Slabs | Operational Window | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| **BEFTN** | Batch (Same/Next Day) | No Minimum Floor | 2 Central Bank Cycles | Routine vendor invoices, dividends |
| **NPSB** | **Instant (Seconds)** | Up to BDT 300,000/txn | **24/7/365** | Urgent payments, contractor settlements |
| **RTGS** | **Instant (Real-Time)**| **$\ge$ BDT 100,000.00**| **10:00 AM – 03:00 PM** (Sun–Thu)| High-value commercial disbursements |

#### Procedure for Other Bank Transfers:
1. Select **Other Bank** $\rightarrow$ Choose **BEFTN**, **NPSB**, or **RTGS**.
2. Select your Source Account and the saved Other Bank Beneficiary.
3. The system auto-populates the recipient Bank, Branch, and 9-digit Routing Number.
4. Enter Amount. For NPSB, the preview displays the switch fee and VAT. For RTGS, the system validates that the amount is $\ge$ BDT 100,000 and the current time is within 10:00 AM – 03:00 PM.
5. Click **Submit** to route to the Checker Authorization Desk.

### 4.4 Mobile Financial Services (MFS) Disbursements
1. Select **MFS** $\rightarrow$ Choose **bKash**, **Nagad**, **Rocket**, **Upay**, or **TAP**.
2. Select the saved MFS beneficiary. *(Note: Direct manual typing of wallet numbers is restricted to prevent typographical errors.)*
3. Enter Amount and Purpose. Click **Submit**.

---

## 📦 Chapter 5: Enterprise Bulk Fund Transfer & Corporate Payroll

Navigate to **Bulk Fund Transfer** (`/transactions/bulk-transfer`):

```
+---------------------------------------------------------------------------------+
|                       BULK PAYROLL & DISBURSEMENT CONSOLE                       |
+---------------------------------------------------------------------------------+
| Step 1: Select Debit Account: [ 0012034571340 - Operating Current A/C      ▼ ]  |
| Step 2: File Mapping Template: [ SAP Head Office Monthly Payroll           ▼ ]  |
| Step 3: Upload Spreadsheet:   [ Choose File: October_2026_Salaries.xlsx       ]  |
|                                                                                 |
|                           [ PARSE & VALIDATE FILE ]                             |
+---------------------------------------------------------------------------------+
```

### 5.1 Dynamic File Mapping Engine (`/settings/dynamic-file-mapping`)
Before uploading custom ERP spreadsheets for the first time:
1. Navigate to **Settings** $\rightarrow$ **Dynamic File Mapping**.
2. Upload a sample spreadsheet (`.xlsx`, `.xls`, `.csv`).
3. Map your ERP column headers to Core Banking target attributes:
   * `Account Number`, `Account Title`, `Bank Name`, `Routing Number`, `Amount`, `Narration`.
4. **Substring Parsing Rules:** If employee account numbers have company prefixes (e.g., `EMP-1234567890123-SAL`), set substring extraction: **Start Index: 5**, **Length: 13**.
5. Save the profile with a recognizable name (e.g., *Tally Vendor Settlement* or *SAP Factory Payroll*).

### 5.2 Uploading & Pre-Execution Validation
1. Go to `/transactions/bulk-transfer`, select your debit account and saved mapping profile.
2. Upload your payroll file and click **Parse & Validate File**.
3. **Syntax & Account Validation:** The portal checks every row:
   * Validates account lengths, routing numbers, and numeric values.
   * Checks internal Citizens Bank accounts to confirm they are **Active** (not dormant or frozen).
4. **Error Grid:** If any row has errors, an error report displays row numbers and exact reasons. You can download the error sheet, correct the rows, and re-upload.
5. **Batch Summary in Figures and Words:**
   * Total Record Count (e.g., `1,450 Records`).
   * Total Amount in Figures (e.g., `BDT 24,560,800.00`).
   * Total Amount in Words: *BDT Two Crore Forty-Five Lac Sixty Thousand Eight Hundred Only*.
6. Click **Submit Batch**. The system generates a Batch Tracking Reference Number (e.g., `BATCH-CZB-20261007-0042`) and routes the batch to the Checker queue.

---

## 🛡️ Chapter 6: Dual-Control & Multi-Level Authorization (Checker Guide)

Navigate to **Authorization Desk** (`/transactions/ftauthorization`):

```
+---------------------------------------------------------------------------------+
|                         PENDING AUTHORIZATION QUEUE                             |
+---------------------------------------------------------------------------------+
| [✓] Filter: [ All Transactions ▼ ]  Search: [ Batch Ref / Acc No...           ] |
+---------------------------------------------------------------------------------+
| Batch / Txn Ref    | Value Date  | Debit Account   | Channel | Total Amount     |
+--------------------+-------------+-----------------+---------+------------------+
| BATCH-20261007-0042| 07-Oct-2026 | 0012034571340   | BULK-PAY| BDT 24,560,800.00|
| TXN-EFT-9941208    | 07-Oct-2026 | 0012034571340   | BEFTN   | BDT    450,000.00|
| TXN-RTGS-110294    | 07-Oct-2026 | 0012034571340   | RTGS    | BDT  5,200,000.00|
+--------------------+-------------+-----------------+---------+------------------+
```

### 6.1 Reviewing and Approving a Transaction
1. Click **Inspect / Details** on any pending batch or single transfer.
2. Verify the recipient title, routing code, account numbers, and the amount in **both digits and words**.
3. Click **Authorize / Approve**.
4. The system presents the **2FA OTP Signing Modal**.
5. Input the 6-digit OTP received on your mobile phone and corporate email.
6. Click **Confirm Authorization**. The transaction executes against the Core Banking API, and a success confirmation appears.

### 6.2 Rejecting a Transaction
1. Click **Inspect / Details** on the transaction.
2. Click **Reject**.
3. A mandatory rejection remark dialog appears. Enter a specific reason (minimum 10 characters, e.g., *Incorrect invoice amount on row 14*).
4. Click **Confirm Rejection**. The Maker is notified, and the transaction is marked **REJECTED** in the audit trail.

---

## 📑 Chapter 7: Corporate Account Management & Statement Reconciliation

### 7.1 In-Depth Account Details (`/account/account-details`)
* Inspect individual corporate accounts with real-time balance breakdowns:
  * **Ledger Balance:** Book balance.
  * **Available Balance:** Usable funds.
  * **Lien / Hold Amount:** Funds held for Letter of Credit margins or bank guarantees.
* **Cheque Leaf Ledger:** Inspect all physical cheque leaves issued against your account:
  * `Issued`, `In-Clearing (BACPS)`, `Honored`, `Stopped`, or `Bounced`.

### 7.2 Generating Account Statements (`/account/statement`)
1. Select the Account.
2. Choose a date range: Preset options (*Today, Last 7 Days, Last 1 Month, Last 3 Months, Financial Year*) or custom dates.
3. Click **Generate Preview**. The grid displays up to 500 rows per page with search-within-results.
4. **Export Options:**
   * Click **Download PDF** for an official, signed statement generated via `CloudNetReportAPI`.
   * Click **Download Excel** for a `.xlsx` spreadsheet for ERP general ledger reconciliation.

### 7.3 Official Transaction Receipts (`/account/transaction-receipt`)
* Download printable vouchers containing the bank logo, CBS Transaction ID, clearing batch reference, value date, and amount in figures and words.

---

## 👥 Chapter 8: Beneficiary Directory Management Hub

Navigate to **Beneficiary Hub** (`/beneficiary/beneficiary`):

```
+---------------------------------------------------------------------------------+
|                        BENEFICIARY DIRECTORY MANAGEMENT                         |
+---------------------------------------------------------------------------------+
| [ Own Bank (CZB) ]   [ Other Commercial Bank ]   [ Mobile Wallets (MFS) ]       |
+---------------------------------------------------------------------------------+
| [+ Add New Beneficiary]             Search: [ Name / Nickname / Account...    ] |
+---------------------------------------------------------------------------------+
```

### 8.1 Adding a Beneficiary
* **Own Bank (Citizens Bank):** Enter the 13-digit account number. The system verifies the Account Title via CBS. Assign a Nickname and complete 2FA OTP verification.
* **Other Bank:** Select Account or Card. Input Account Title, Account Number, select Bank $\rightarrow$ District $\rightarrow$ Branch. The system auto-populates the 9-digit routing number. Verify via OTP.
* **MFS:** Select provider (bKash, Nagad, Rocket, Upay, TAP). Input the wallet number (11 digits, or 12 digits for Rocket). Assign a Nickname and verify via OTP.

> [!IMPORTANT]
> **Field Locking Policy:** Once a beneficiary is authorized, core routing fields (Account Number, Bank, Branch, Routing Number, Wallet Number) are **permanently locked**. Users can only edit the Nickname. If an account number changes, delete the payee and re-enroll.

---

## 📝 Chapter 9: Corporate Service Requests ("Requests Desk")

### 9.1 Bank Solvency Certificate Requisition (`/myservices/banksolvencyrequest`)
1. Select the Account.
2. Enter Certificate Purpose (e.g., *International Tender Bid Reference*).
3. Specify currency preference (BDT, USD, EUR equivalent).
4. Choose delivery mode: Collection at Branch or Certified Digital PDF.
5. Submit for Maker-Checker authorization.

### 9.2 Tax Return Proof (PSR) Document Upload (`/myservices/tax-document-upload`)
1. In compliance with National Board of Revenue (NBR) rules, upload your annual **Proof of Submission of Return (PSR)** acknowledgment slip.
2. Select Assessment Year, input Tax Circle, and attach the PDF slip ($\le 5\text{ MB}$).
3. Submitting this proof ensures your accounts retain the standard **10% withholding tax rate** instead of the **20% non-compliance penalty rate**.

### 9.3 Service Request Log (`/myservices/request-log`)
* Monitor the real-time status of all submitted tickets with color-coded badges:
  * `Pending` (Amber), `In-Review` (Blue), `Approved / Completed` (Green), `Rejected` (Red).

---

## ⚙️ Chapter 10: Corporate Administration & User Management

*This section is intended for Corporate Master Administrators.*

### 10.1 Provisioning Child Operators (`/usermanagement/usercreation-request`)
1. Click **Add New User**.
2. Enter Full Name, Official Employee ID, Department, Corporate Email, and Mobile Number.
3. Assign a Role:
   * **Maker:** Can draft single transfers, bulk files, and requests.
   * **Checker:** Can review and authorize transactions using 2FA OTP.
   * **Viewer:** Read-only access to balances, statements, and receipts.
4. **Split-Channel Credential Delivery:** The system dispatches the temporary User ID to the employee's Email, and the temporary Password via SMS.

### 10.2 User Account Permission Matrix (`/usermanagement/useraccountpermission`)
1. Select the Child Operator.
2. Specify which specific corporate bank accounts the user can access.
3. **Set Account-Level Monetary Limits:**
   * Single Transaction Cap (e.g., `BDT 1,000,000.00`).
   * Daily Cumulative Volume Cap (e.g., `BDT 5,000,000.00`).
   * Daily Transaction Count Limit (e.g., `20 Transactions/Day`).

### 10.3 Approval Slabs & Designation Setup
* Build multi-level approval hierarchies via `/settings/authorizationlevel`.
* Map custom designation titles (e.g., *GM Accounts*, *Finance Director*) via `/settings/orgauthlevelname`.

---

## 🔒 Chapter 11: Audit Trails & Enterprise Cybersecurity Governance

### 11.1 Immutable User Activity Log (`/activity/useractivity`)
The platform maintains an immutable audit trail recording every user action:
* **Timestamp:** ISO 8601 server timestamp.
* **User ID:** Identifier of the operator (e.g., `ttml2023`).
* **Originating IP Address:** Captured dynamically via `UserIPUrl`.
* **Action Category:** Login, Logout, Transfer Initiated, Beneficiary Added, Batch Authorized.
* **Status:** `SUCCESS`, `FAILED`, or `REVOKED`.

### 11.2 Best Practices for Corporate Cyber Hygiene
1. **Never Share Credentials:** Every corporate operator must use their own User ID.
2. **Verify Account Titles:** Always confirm the recipient Account Title retrieved during CBS inquiry.
3. **Check Words vs Figures:** Before authorizing bulk payroll, confirm that the amount in words matches your approved payroll register.
4. **Phishing Awareness:** Citizens Bank will never ask for your password or OTP over the phone or email. Report suspicious activity to **16222**.

---

## 🗺️ Chapter 12: Complete Application Routing & Role Permissions Map

| URL Route | Feature / Screen | Route Guard | Required Permission Code |
| :--- | :--- | :--- | :--- |
| `/login` | Corporate User Login | Public | None |
| `/selfregistration` | Corporate Client Self-Registration | Public | None |
| `/passwordrecovery` | Self-Service Password Reset | Public | None |
| `/useridrecovery` | User ID Recovery | Public | None |
| `/instruction` | Sign-Up Guidelines & Terms | Public | None |
| `/aboutus` | About Citizens Bank PLC | Public | None |
| `/privacypolicy` | Privacy Policy & Data Protection | Public | None |
| `/` | Corporate Dashboard Overview | `AuthGuard` | Authenticated Session |
| `/account/account-details` | Account Details & Cheque History | `AuthGuard` | Authenticated Session |
| `/account/statement` | Statement Inquiry & PDF/Excel Export | `AuthGuard` | Authenticated Session |
| `/account/financial-transactions` | Fund Transfer Transaction History | `AuthGuard` | Authenticated Session |
| `/account/transaction-receipt` | Official Transaction Receipt Slip | `AuthGuard` | Authenticated Session |
| `/account/changepassword` | Change User Password | `AuthGuard` | Authenticated Session |
| `/transactions/fundtransfer` | Single Fund Transfer (EFT/NPSB/RTGS/MFS)| `RoleGuard` | `CORP_FUND_TRANSFER` |
| `/transactions/bulk-transfer` | Bulk Payroll & Vendor Batch Transfer | `RoleGuard` | `CORP_BULK_FUND_TRANSFER` |
| `/transactions/ftauthorization` | Multi-Level Transaction Authorization | `RoleGuard` | `CORP_FUND_TRANSFER_AUTHORIZATION`|
| `/beneficiary/beneficiary` | Beneficiary Directory Management | `AuthGuard` | Authenticated Session |
| `/myservices/banksolvencyrequest` | Solvency Certificate Request | `AuthGuard` | Authenticated Session |
| `/myservices/tax-document-upload` | Tax Return Proof (PSR) Slip Upload | `AuthGuard` | Authenticated Session |
| `/myservices/request-log` | Service Request Tracking Console | `AuthGuard` | Authenticated Session |
| `/usermanagement/usercreation-request`| Create Corporate Child Operators | `RoleGuard` | `CORP_ADD_NEW_USER` |
| `/usermanagement/useraccountpermission`| User Account Permission & Limits | `RoleGuard` | `CORP_ADD_EDT_USER_ACC_SETTINGS` |
| `/settings/authorizationlevel` | Corporate Approval Hierarchy Setup | `RoleGuard` | `CORP_ADD_EDT_ACC_LVL` |
| `/settings/orgauthlevelname` | Org Designation Customization | `AuthGuard` | Authenticated Session |
| `/settings/dynamic-file-mapping` | Custom Spreadsheet Column Parser | `RoleGuard` | `CORP_ADD_EDT_DYNAMIC_FILE_MAPPING` |
| `/activity/useractivity` | Immutable User Activity Audit Trail | `AuthGuard` | Authenticated Session |
| `/profile/detailprofile` | Corporate Detailed KYC & Contacts | `AuthGuard` | Authenticated Session |
| `/otherservices/notifications` | Notifications & Announcements | `AuthGuard` | Authenticated Session |
| `/securityadvice` | Information Security Guidelines | `AuthGuard` | Authenticated Session |

---

## ❓ Chapter 13: Operational Checklists, Troubleshooting & FAQs

### 13.1 Daily Operational Checklist

#### For Corporate Makers:
* [ ] Log in and verify available balances on the dashboard.
* [ ] Verify that payroll/settlement spreadsheets match the saved Dynamic File Mapping profile.
* [ ] Check row validation errors and ensure total amounts in words match your internal payroll register.
* [ ] Submit batches and note the generated Batch Reference Number for tracking.

#### For Corporate Checkers:
* [ ] Log in and inspect the Pending Authorization Queue (`/transactions/ftauthorization`).
* [ ] Compare recipient account numbers, account titles, and amounts in words against approved payment vouchers.
* [ ] Enter the 2FA OTP promptly within the 120-second validity window.
* [ ] Review the confirmation slip and verify execution.

### 13.2 Frequently Asked Questions (FAQ)

**Q1: Why is my RTGS transfer disabled?**  
*RTGS clearing is only permitted on banking business days between 10:00 AM and 03:00 PM BST for amounts $\ge$ BDT 100,000. Outside these hours, use NPSB (up to BDT 300,000) or BEFTN.*

**Q2: Can a Maker authorize their own transfer?**  
*No. The system strictly enforces dual-control segregation of duties. Transactions must be authorized by an independent Checker.*

**Q3: What should I do if I enter the wrong password 5 times?**  
*Your account will be locked for security. Click "Forgot password?" on the login page or ask your Corporate Administrator to reset your profile.*

**Q4: How do I change an existing beneficiary's account number?**  
*Due to field locking rules, core financial routing fields are immutable. Delete the existing payee and re-enroll the beneficiary with the updated details.*

---

## 📞 Support Contacts & Emergency Escalation

* **24/7 Corporate Customer Care:** **16222**
* **Corporate Banking Division:** Citizens Bank PLC, Head Office, Motijheel, Dhaka, Bangladesh.
* **Email:** `corporate.support@citizensbankbd.com` / `ibank.support@citizensbankbd.com`
* **Website:** `https://www.citizensbankbd.com/`
