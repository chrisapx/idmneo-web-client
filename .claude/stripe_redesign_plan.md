# Stripe Redesign Master Plan

> **Status legend:** ✅ done · 🚧 in progress · ⬜ todo

## ✅ DONE
- Shell: sidebar (always visible, hover-flyout in compact, brand dropdown), top bar (search + grid/help/+ icons + Setup guide), footer (Stripe icon row), tightened page padding
- Home/dashboard: Stripe layout with Today section, charts, sidebar cards (Quick Actions, System Info)
- **Clients list page**: Stripe Customers — title + pill button, segmented tabs, filter chips with popovers (Name/Status/Office/More), table with avatars + status pills + tabular numbers, server-side pagination (default 10)
- **Create Client form**: MatDialog overlay with collapsible sections, skeleton loading
- **Client details header**: avatar + name + meta + Edit/Applications/Actions buttons, info grid, tabs
- **Client General tab**: 2-stat summary, conditional sections, Stripe tables, icon buttons, status dots
- **Client Address tab**: card grid with edit/toggle icon buttons
- **Client Family Members tab**: card grid with avatars
- **Shared Notes tab** (entity-notes-tab): Stripe composer + clean note cards (used by clients, loans, savings, groups)
- **Toolbar polish**: removed settings, Help opens widget panel, Setup guide → Help center
- **Reports sidebar**: expandable group with categories (All, Client, Loan, Savings, Accounting, Fund)
- **Sidebar labels**: Savings → Deposits, Balances → Accounting; added SMS Campaigns, Bulk Import, Audit Trails
- **Loans details header**: Stripe icon + product name + status pill + meta + Actions menu, info grid (Outstanding, Arrears, etc.), Stripe tabs

## 🚧 IN PROGRESS
- Global CSS overrides applied (main.scss): buttons, cards, tables, filters, pagination, tabs, progress bars
- list-layout.scss rewritten: transparent container, Stripe table styling, tighter padding
- stripe-tab.scss mixin: applied to 60+ SCSS files across all modules
- Template rewrites needed for many pages (HTML still uses old patterns even though CSS fixes appearance)

## ⬜ CLIENT MODULE (remaining)
- ⬜ Client Identities tab (`src/app/clients/clients-view/identities-tab/`)
- ⬜ Client Documents tab (uses shared `entity-documents-tab`)
- ⬜ Client Datatables tab (`src/app/clients/clients-view/datatable-tab/`)
- ⬜ Client Charges Overview (`src/app/clients/clients-view/charges-overview/`)
- ⬜ Edit Client → MatDialog modal
- ⬜ All client custom dialogs:
  - Upload Image, Capture Image, Delete Image
  - Upload Signature, View Signature, Delete Signature
  - Unassign Staff
- ⬜ All client actions (`src/app/clients/clients-view/client-actions/`):
  - activate, close, reject, withdraw, transfer
  - assign-staff, unassign-staff
  - add-charge, create-collateral, edit-collateral
  - undo-rejection, undo-transfer, accept-transfer, reject-transfer
  - reactivate, update-default-savings
  - upload-image/signature

## ⬜ LOANS MODULE
- 🚧 Loan details header (DONE)
- ⬜ Loan tabs (apply Stripe table pattern):
  - General tab
  - Account Details
  - Repayment Schedule
  - Original Schedule
  - Transactions
  - Charges
  - Loan Collateral
  - Loan Tranche Details
  - Term Variations
  - Overdue Charges
  - Delinquency Tags
  - Deferred Income
  - Buy-Down Fees
  - Floating Interest Rates
  - Reschedule Loan
  - Loan Documents (shared)
  - Notes (shared, already done)
  - Standing Instructions
  - External Asset Owner
- ⬜ Create Loan Account (`src/app/loans/create-loans-account/`) → MatDialog modal
- ⬜ Edit Loan Account → MatDialog
- ⬜ All loan action components → MatDialog modals:
  - approve-loan, disburse, disburse-to-savings-account
  - make-repayment, undo-approval, undo-disbursal
  - reject-loan, prepay-loan, waive-interest
  - add-loan-charge, adjust-loan-charge
  - add-collateral, create-guarantor, view-guarantors
  - assign-loan-officer, add-interest-pause
  - loan-reschedule, edit-repayment-schedule, loan-reamortize
  - charge-off, write-off-page, undo-write-off
  - foreclosure, close-as-rescheduled, loans-account-close
  - recovery-repayment, loan-reaging, withdrawn-by-client
  - loan-credit-balance-refund, loan-screen-reports
  - asset-transfer-loan

## ⬜ SAVINGS / DEPOSITS MODULE
- ⬜ `src/app/savings/savings-view/` — header + tabs
- ⬜ Savings sub-tabs:
  - General, Transactions, Charges, Standing Instructions, Documents, Notes
- ⬜ Fixed deposits (`src/app/deposits/fixed-deposits/`)
- ⬜ Recurring deposits (`src/app/deposits/recurring-deposits/`)
- ⬜ Create savings/fixed/recurring → MatDialog
- ⬜ All savings actions → MatDialog modals:
  - Approve, Activate, Deposit, Withdrawal, Close
  - Calculate Interest, Post Interest, Block Account
  - Hold Amount, Release Amount, etc.

## ⬜ SHARES MODULE
- ⬜ `src/app/shares/` — list, details, create, all actions

## ⬜ GROUPS MODULE
- ⬜ Groups list (Stripe Customers pattern)
- ⬜ Group details page (header + tabs)
- ⬜ All group tabs and actions
- ⬜ Create group → MatDialog

## ⬜ CENTERS MODULE
- ⬜ Same treatment as groups

## ⬜ ACCOUNTING MODULE
- ⬜ Main accounting page
- ⬜ Journal entries list
- ⬜ Create journal entry → MatDialog
- ⬜ Chart of accounts (tree view)
- ⬜ Frequent postings
- ⬜ Accounting rules + create dialog
- ⬜ Closing entries

## ⬜ PRODUCTS MODULE
- ⬜ Main products page
- ⬜ Loan products list + details
- ⬜ Saving products list + details
- ⬜ Fixed/Recurring/Share products
- ⬜ Charges list + dialog
- ⬜ Loan provisioning criteria
- ⬜ Tax components / groups
- ⬜ Floating rates
- ⬜ Manage funds
- ⬜ Audit trails
- ⬜ Products mix

## ⬜ ORGANIZATION MODULE
- ⬜ Main organization page
- ⬜ Offices (tree + list)
- ⬜ Employees + create dialog
- ⬜ Currencies
- ⬜ Holidays + create dialog
- ⬜ Bulk import
- ⬜ Loan provisioning entries
- ⬜ Payment types + create dialog
- ⬜ SMS campaigns + create dialog
- ⬜ Standing instructions
- ⬜ Adhoc query
- ⬜ Working days
- ⬜ Password preferences
- ⬜ Tellers / cashier
- ⬜ Investor / fund mapping

## ⬜ SYSTEM MODULE
- ⬜ Main system page
- ⬜ Users + roles + permissions
- ⬜ Codes
- ⬜ Data tables
- ⬜ Audit trails
- ⬜ Reports (Pentaho config)
- ⬜ Maker checker tasks
- ⬜ Manage hooks
- ⬜ Entity datatable checks
- ⬜ Global configurations
- ⬜ Account number preferences
- ⬜ External services (S3, SMS, email, notifications)
- ⬜ Two factor configuration
- ⬜ Surveys
- ⬜ Manage scheduler jobs
- ⬜ Business date configuration

## ⬜ REPORTS MODULE
- ⬜ Reports list page
- ⬜ Run report page (chart, table, parameters)

## ⬜ OTHER PAGES
- ⬜ Navigation page (Office/Center/Group/Client tree)
- ⬜ Search page
- ⬜ Settings page
- ⬜ Profile page
- ⬜ Notifications tray
- ⬜ Tasks
- ⬜ Templates
- ⬜ Collections
- ⬜ Configuration wizard
- ⬜ Account transfers
- ⬜ Checker inbox / approvals

## ⬜ SHARED COMPONENTS
- ⬜ `entity-documents-tab` — Stripe document list
- ⬜ `entity-datatables-tab` — Stripe datatable view
- ⬜ `delete-dialog` — Stripe confirm modal
- ⬜ `form-dialog` — Stripe form dialog wrapper
- ⬜ `notifications-tray` dropdown

## METHODOLOGY
For each redesign:
1. Read existing component files
2. Apply Stripe tokens (see `stripe_design_tokens.md`)
3. Convert forms → MatDialog (use `@Optional() MatDialogRef` pattern from `create-client.component.ts`)
4. Use small icon buttons in tables
5. Status dots/pills (no `fa-stop` icons)
6. `npx ng build` to verify
7. Mark item ✅ in this plan
8. Move to next

## DON'T BREAK
- API service calls
- Routes
- Form validation
- Permission directives (`*mifosxHasPermission`)
- Translation pipes
- Resolvers
