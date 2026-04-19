# IDM Neo Web Client — Stripe Redesign Context

This file is the **persistent project context** for any Claude session working on this codebase. Read this FIRST before making any changes.

## Project
- **Type:** Angular 19 Fineract/Mifos microfinance web app
- **Stack:** Angular 19, Material 19, TypeScript 5, RxJS 7, SCSS, Tailwind, Chart.js, FontAwesome
- **Build:** `npx ng build` (always run after changes)
- **Dev:** `npm run serve:dev`
- **Tenant model:** Subdomain-based (sandbox.idmfh.com → tenant=sandbox)

## The Mission
Redesign the **entire portal** to match **Stripe Dashboard aesthetic**. Don't break a single feature. The user is building IDM Neo, a financial management platform.

## Read These FIRST
1. `.claude/stripe_design_tokens.md` — colors, sizes, button/form/card/table patterns
2. `.claude/stripe_redesign_plan.md` — complete checklist of every page/form/table to redesign + status

## Sacred Rules (NEVER violate)
- **Forms must be MatDialog modals** — see `src/app/clients/create-client/` for the pattern. Use `@Optional() MatDialogRef` and `@Optional() @Inject(MAT_DIALOG_DATA)` so component works in both dialog AND route mode.
- **Tables must use Stripe pattern** — see `src/app/clients/clients-view/general-tab/general-tab.component.html` for the reference. Status dots not fa-stop icons. Icon buttons not raised buttons. Right-aligned tabular numbers.
- **Buttons must be small** — 32-34px height, 13-14px font, 6px border-radius
- **Colors from `stripe_design_tokens.md` only** — no other purples/greys
- **Do NOT touch:**
  - API service calls (`searchByText`, `getClientTemplate`, etc.)
  - Routes or routing modules
  - Form validation rules (`Validators.required`, etc.)
  - Permission directives (`*mifosxHasPermission`)
  - Resolvers
- **Always run `npx ng build`** after each significant change. Report errors.
- **Use ::ng-deep + Material CSS variables** for child component overrides. Don't fight Material with `!important` everywhere.

## Workflow
1. Check `.claude/stripe_redesign_plan.md` for the next item
2. Read existing component files (HTML, TS, SCSS)
3. Apply Stripe tokens
4. Convert forms to MatDialog if needed
5. Build with `npx ng build`
6. Mark item DONE in plan file
7. Move to next item

## Key Files Already Done (DON'T BREAK)
- `src/app/core/shell/*` — sidebar, toolbar, footer
- `src/app/home/*` — Stripe dashboard
- `src/app/clients/clients.component.*` — list page (server-side pagination, filter chips)
- `src/app/clients/create-client/*` — modal dialog (work in progress, fields need polish)
- `src/app/clients/clients-view/clients-view.component.*` — details header
- `src/app/clients/clients-view/general-tab/*` — Stripe tables
- `src/app/clients/clients-view/address-tab/*` — card grid
- `src/app/clients/clients-view/family-members-tab/*` — card grid
- `src/app/shared/tabs/entity-notes-tab/*` — Stripe notes (used by all entities)
- `src/app/loans/loans-view/loans-view.component.*` — IN PROGRESS (header done)

## CSS Class Naming Convention
Each component uses a 2-letter prefix to scope styles:
- `cv-*` = clients-view (client details)
- `gt-*` = general-tab (client general tab)
- `at-*` = address-tab
- `fm-*` = family-members tab
- `nt-*` = notes tab
- `lv-*` = loans-view (loan details)
- `s-*` = create-client modal (and "Stripe" generic prefix)

When redesigning a new component, pick a unique 2-letter prefix.

## Dialog Pattern Reference
`src/app/clients/create-client/create-client.component.ts` shows the dual mode (dialog OR route) pattern. Copy this for every form conversion.

## When Context Window Fills Up
- Save progress to `.claude/stripe_redesign_plan.md` (mark done items with ✅)
- Compress this file as needed but keep the workflow + rules
- The next Claude session reads this file first and picks up from the plan
