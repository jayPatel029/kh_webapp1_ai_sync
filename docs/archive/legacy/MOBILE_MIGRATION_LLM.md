# Mobile Migration — LLM-Oriented Specification

## Repo context
- repo: `jayPatel029/kifayti-webapp1`
- current branch: `mobile` (default branch: `main`)
- tech: React (CRA), Redux Toolkit, React Router v6, hybrid Tailwind + CSS-vars design system

## High-level goal
Make the site mobile-first following the Figma mobile screens. Preserve desktop markup where possible, add mobile-specific components/styles that only activate under the `isMobile` condition (768px threshold).

## Programmatic contract (what an automation/LLM should do)
- Use central hook `useIsMobile()` from `src/components/mobile/useIsMobile`.
- For page X, do not wholesale rewrite desktop JSX — prefer:
  - if (isMobile) return <MobileVariant/>; return <DesktopOriginal/>;
  - Or add a `displayMode` prop to `UnifiedListTable` that accepts `'table'|'cards'|'auto'` and compute `showCards = displayMode==='cards' || (displayMode!=='table' && isMobile)`.
- Centralize mobile CSS under `src/components/mobile/mobile.css`. Prefer CSS-only responsive fixes for split-panel UIs (e.g. chat) to avoid breaking desktop structure.

## Files changed (structured list)
- New/modified mobile infra:
  - src/components/mobile/useIsMobile.js — returns { isMobile, isTablet, isDesktop, width }
  - src/components/mobile/index.js — barrel export
  - src/components/mobile/mobile.css — mobile styles and admin-page responsive rules
  - src/components/mobile/MobilePageContainer.jsx, MobileHeader.jsx, MobileStatCard.jsx, MobileFilterRow.jsx, MobileDataCard.jsx, MobileBottomAction.jsx, MobileSearch.jsx — shared mobile components

- Page-level changes (examples):
  - src/components/PageHeader.jsx — mobile variant (back button, truncated breadcrumbs)
  - src/components/table/UnifiedListTable.jsx — add card mode, new props: `displayMode`, `cardTitleKey`, `cardSubtitleKey`, `cardImageKey`, `cardFieldKeys`, `onCardClick`, `cardStatusKey`, `mobileCardRender`
  - src/pages/ManageParameters/ManageParameters.jsx — mobile card list for daily/dialysis parameters
  - src/pages/ShowAlarms/ShowAlarms.jsx — mobile alarm cards
  - src/pages/userprofile2/UserProfile.jsx — migrate `windowWidth` logic to `useIsMobile` and add mobile layout rules
  - src/pages/kfre/KfreList.jsx — UI tweaks for mobile (stacking, full-width actions)
  - src/pages/login/Login.jsx — responsive spacing
  - src/pages/alimentMaster/Ailment Master/AilmentMaster.jsx — responsive toolbar + card props for `UnifiedListTable`
  - src/pages/adminDashboard/components/CommentContainer.jsx — responsive modal/cards
  - src/components/sidebar/Sidebar.jsx — already contains `renderMobile()` (bottom nav)

## Important design tokens & breakpoints
- Mobile threshold: 768px (isMobile true for width < 768)
- Other breakpoints: 320, 380, 768, 960, 1200 (defined in tokens/styles)
- Use existing variables: color tokens, spacing vars, radius tokens located in `src/design-system` and `src/Styles/variables.css`.

## LLM instructions / transformation template
When asked to convert a page to mobile:
1. Inspect the page and locate the main list/table or dense layout.
2. Identify existing shared primitives used (PageHeader, PatientDetailLayout, UnifiedListTable, FormModal, FileUploadWithCamera).
3. Add `import { useIsMobile } from '../../components/mobile/useIsMobile'` near other imports.
4. Insert `const { isMobile } = useIsMobile();` after hooks (keep `useParams`, `useNavigate`, `useSelector` intact).
5. Replace top-level content rendering with:

```jsx
if (isMobile) {
  return (
    <PatientDetailLayout ...>
      {/* mobile toolbar */}
      {/* mobile card list or stacked controls */}
    </PatientDetailLayout>
  );
}

return (
  // original desktop JSX unchanged
);
```

6. If a list comes from `UnifiedListTable`, prefer setting `displayMode='auto'` and provide `cardTitleKey`, `cardImageKey` when possible.
7. For complex split-pane UIs (chat), prefer adding CSS rules in `mobile.css` targeting the existing classes to stack and reset widths rather than altering JSX.

## Example code snippets the LLM can reuse
- Add hook import:
```jsx
import { useIsMobile } from '../../components/mobile/useIsMobile';
```
- Using the hook:
```jsx
const { isMobile } = useIsMobile();
```
- UnifiedListTable card props example:
```jsx
<UnifiedListTable
  data={items}
  displayMode="auto"
  cardTitleKey="name"
  cardImageKey="avatar"
  cardFieldKeys={["email","phone"]}
/>
```

## Tests & verification (automation checklist)
- `npm install` then `npm run build` completes with exit code 0.
- Smoke test pages render in mobile and desktop widths with no console-errors.
- `UnifiedListTable` should render `<table>` at desktop widths and `.list-table__cards-container` at mobile widths.

## Constraints & guardrails
- Do not remove or refactor authentication/permission checks.
- Avoid renaming or deleting exported component APIs — prefer adding props.
- Prefer minimal changes to desktop JSX; keep regression risk low.
- Preserve existing CSS class names so tests and selectors continue to work.

## Next automated tasks for an LLM
- Convert any remaining large pages using the above template (e.g., `ShowAlarms`, `UserProfile`, `ManageParameters`) — these were completed in the `mobile` branch but others may remain.
- Run `grep` for `admin-toolbar` and ensure mobile CSS rules in `mobile.css` cover them.
- Add unit tests for `UnifiedListTable` to assert card rendering when `isMobile=true`.

---

(End of LLM-oriented spec)