**Mobile UI Overhaul — Human Guide**

- **Purpose:** Summarize the mobile-first UI migration implemented on the `mobile` branch for the Kifayti WebApp. This doc helps engineers, QA, and designers understand what's changed, how to verify it, and next steps.

**Overview:**
- The project adds a mobile-first layer to the existing React+Redux codebase while preserving architecture and desktop UX.
- Approach: keep desktop JSX unchanged where possible, expose mobile-friendly components / CSS, and add conditional rendering using a single breakpoint hook `useIsMobile` (threshold: 768px).

**Scope (high level):**
- Mobile infrastructure: `src/components/mobile/*` (hook + shared mobile components + `mobile.css`).
- Converted several pages from desktop tables/lists to mobile cards or stacked controls.
- Kept routing, role/permission checks, and API calls intact.

**What changed (key files):**
- `src/components/mobile/` — mobile primitives and styles (new)
- `src/components/PageHeader.jsx` — compact mobile header
- `src/components/table/UnifiedListTable.jsx` + CSS — added card mode and mobile styling
- `src/pages/ManageParameters/ManageParameters.jsx` — mobile card view for parameters
- `src/pages/ShowAlarms/ShowAlarms.jsx` — mobile alarm cards
- `src/pages/userprofile2/UserProfile.jsx` — replaced custom window-width logic with `useIsMobile` and added mobile layout tweaks
- `src/pages/kfre/KfreList.jsx` — mobile tweaks + full-width calculate button
- `src/pages/login/Login.jsx` — tightened login card spacing on small screens
- `src/pages/alimentMaster/Ailment Master/AilmentMaster.jsx` — responsive toolbar + UnifiedListTable cards
- `src/pages/adminDashboard/components/CommentContainer.jsx` — fullscreen mobile modal and compact card items
- `src/components/sidebar/Sidebar.jsx` — already included a `renderMobile` bottom bar; no change required
- `src/components/mobile/mobile.css` — global mobile styles for many admin pages and chat responsiveness

**Design patterns & conventions used:**
- Central mobile detector: import `useIsMobile` and use `const { isMobile } = useIsMobile();`
- Mobile-first CSS is placed in `src/components/mobile/mobile.css` and scoped to either `.mobile-*` classes or via `@media (max-width: 768px)` rules.
- Prefer CSS-only adjustments for complex UI (e.g., split chat panels) to minimize JSX churn and preserve desktop behavior.
- For data-dense tables, add a `cards` displayMode to `UnifiedListTable` so lists auto-convert to cards on mobile.

**How to run / verify locally:**
1. Install dependencies (if not already):

```powershell
cd "c:\Users\himan\intern\kifayti-webapp1.worktrees\mobile"
npm install
```

2. Start dev server:

```powershell
npm start
```

3. Or build a production bundle:

```powershell
npm run build
```

4. Manual verification checklist (select pages to check on phone width or responsive simulator):
- Patient list → displays card list with avatar, metadata and actions.
- Patient details → sticky compact header, tabs render as icon-only pills.
- Parameters → mobile card list with edit/delete and range/graph metadata.
- Alarms → card-based list with status badge and compact action buttons.
- Chat (Admin & Doctor) → chat list stacks above messages; messages pane expands; inputs are compact.
- Admin pages that use `admin-*` classes (Ailment Master, Admin Management, etc.) → toolbar stacks, search full-width.

**Testing / QA notes:**
- Verify role-specific controls (Edit/Delete) are still hidden/shown according to `state.permission`.
- Confirm no routing regressions; navigation and back buttons behave the same.
- Test keyboard/focus flows in modals on mobile.
- Check upload / camera components on mobile devices (FileUploadWithCamera preview).

**Performance & accessibility:**
- Keep images thumbnails lightweight; prefer `img` with `loading="lazy"` where applicable.
- Touch sizes increased: buttons and tappable areas = min 44×44px where possible.
- Ensure color contrast for badges and status pills matches design tokens.

**Design tokens & breakpoints reference:**
- Breakpoint used: 768px (mobile threshold)
- Design tokens are in `src/design-system/tokens` and `src/Styles/variables.css`.

**Next steps / outstanding work:**
- Review `ManageParameters.jsx` and other large forms for UX optimization on very small screens (≤ 380px).
- Add unit/integration tests for components converted to mobile variants.
- Review Sidebar interactions on very narrow devices to ensure maximum 3-5 important nav items in bottom bar.

**Contact / owner:**
- Repo: `jayPatel029/kifayti-webapp1` (branch: `mobile`) — reach out to the author who made the mobile branch if you need details.


---

(End of human guide)