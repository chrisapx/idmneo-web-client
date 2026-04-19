# Stripe Design Tokens (use everywhere)

## Colors
```scss
$s-dark: #1A1F36;     // primary text, headings
$s-text: #3C4257;     // body text
$s-grey: #697386;     // secondary, labels, icons
$s-border: #E3E8EE;   // all borders, dividers
$s-bg: #F7F8FA;       // page bg, hover bg
$s-white: #fff;       // card bg
$s-purple: #635BFF;   // primary action / link / focus
$s-green: #3ECF8E;    // success
$s-yellow: #F59E0B;   // warning
$s-red: #FF5A65;      // danger
```

Status pill backgrounds:
- Active: bg `#DCFCE7` text `#166534`
- Pending: bg `#FEF3C7` text `#92400E`
- Closed: bg `#FEE2E2` text `#991B1B`

## Layout principles
- Page padding: top 16px, no extra side padding (shell handles it)
- Cards: white bg, 1px `$s-border`, 8px radius, NO shadow
- Card head: 12-14px vertical padding, 16-20px horizontal, bottom border
- Section gap: 16-20px between cards
- Table cell padding: 16px horizontal, row height 44-48px

## Buttons
```scss
// Primary
.btn-primary {
  height: 32-34px; padding: 0 14px;
  border: none; border-radius: 6px;
  background: $s-purple; color: #fff;
  font-size: 13px; font-weight: 600;
  &:hover { background: darken($s-purple, 6%); }
}

// Outline
.btn-outline {
  height: 32-34px; padding: 0 14px;
  border: 1px solid $s-border; border-radius: 6px;
  background: $s-white; color: $s-text;
  font-size: 13px; font-weight: 500;
  &:hover { background: $s-bg; }
}

// Icon button (table actions)
.icon-btn {
  width: 28-30px; height: 28-30px;
  border: 1px solid $s-border; border-radius: 6px;
  background: $s-white; color: $s-grey;
  &:hover { color: $s-purple; border-color: $s-purple; background: $s-bg; }
  mat-icon { font-size: 14-16px; }
}
```

## Tables
- Header: 36-40px height, light grey bg `$s-bg`, 11px UPPERCASE bold grey letters with 0.4px letter-spacing
- Rows: 44-48px height, hover `$s-bg`, click cursor, 14px text
- Cells: 16px padding, bottom border `lighten($s-border, 2%)`
- Last row: no bottom border
- Numbers: right-aligned, `font-variant-numeric: tabular-nums`
- Status: 8px colored dot before text (NO `fa-stop` icons)
- Type/category: small soft pill
- Actions column: right-aligned, icon-only buttons, `width: 1%; white-space: nowrap`

## Form fields (Stripe input pattern)
- Label: text element ABOVE the field, 13px bold dark, 4px below
- Input: 40-44px height, 1px `$s-border`, 6px radius, white bg, 12px horizontal padding
- Focus: `border-color: $s-purple; box-shadow: 0 0 0 3px rgba($s-purple, 0.08)`
- 14px input text, grey placeholder
- Error: red border + small red text below

## Modals (forms must be MatDialog overlays)
- Width: 540px (or larger for complex forms like create-loan)
- 12px border-radius, large drop shadow
- Header: 20px padding, 18px bold title + X close button
- Body: scrollable, sections separated by border
- Sections: collapsible (first one open by default), 14px bold title with chevron
- Footer: right-aligned Cancel + Primary buttons, 14px padding, top border
- Use `MAT_DIALOG_DATA` to pass template + config data
- Component must work in both dialog AND route mode (`@Optional() MatDialogRef`)

## Empty states
```html
<div class="empty">
  <mat-icon>icon_name</mat-icon>
  <p>No X yet</p>
  <span>Helpful hint about what to do.</span>
</div>
```
- Inside white card: padding 64px 20px, icon 40px @ 25% opacity
- Title: 15px bold dark
- Hint: 13px grey

## Avatars
- Circle, `lighten($s-purple, 28%)` bg, `$s-purple` text, 700 weight
- 24px (table), 32px (card), 56px (page header)
- First letter of name, uppercase

## Page header (entity detail pages)
- Back link: `← Section name` in grey, 13px, hovers purple, mb 16px
- Avatar (56px) + name (28px bold) + meta row (status pill · meta · meta)
- Right side: outline buttons + primary "Actions" dropdown
- Below: info grid with auto-fit columns, 11px uppercase labels + 14px values
- Bottom border before tabs

## Tabs (route-based navigation)
- 42px height, 16px padding, 14px font, grey text
- Active: purple text, 2px purple bottom underline, 600 weight
- No background, no chips — just text + underline
- Use `::ng-deep` to override `.mat-mdc-tab-link` and `.mdc-tab--active` styles

## Pagination
- Default page size: 10 (set globally via `MAT_PAGINATOR_DEFAULT_OPTIONS` in `app.module.ts`)
- Page size options: [10, 25, 50, 100]
- Server-side pagination: bind `[length]`, `[pageSize]`, `[pageIndex]`, `(page)`
- Don't bind `dataSource.paginator` if doing server-side
