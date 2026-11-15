# CivicEye Design Guidelines

## Design Approach
**Selected Approach:** Custom Design System with Material Design Principles  
**Justification:** CivicEye is a data-intensive, utility-focused civic platform requiring consistent, accessible patterns for dashboard interfaces, maps, charts, and forms. The application demands clarity over decoration, with information hierarchy and usability as primary concerns.

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary Blue: `210 85% 45%` (Trust, civic authority)
- Success Green: `142 70% 45%` (Resolved issues, positive actions)
- Neutral Grey: `220 15% 25%` (Text, borders)
- Background: `0 0% 98%` (Main surface)
- Surface: `0 0% 100%` (Cards, panels)
- Border: `220 13% 91%`
- Text Primary: `220 15% 25%`
- Text Secondary: `220 10% 50%`

**Dark Mode:**
- Primary Blue: `210 80% 60%`
- Success Green: `142 65% 55%`
- Neutral Grey: `220 15% 85%`
- Background: `220 15% 10%`
- Surface: `220 15% 14%`
- Border: `220 15% 25%`
- Text Primary: `220 15% 90%`
- Text Secondary: `220 10% 65%`

**Status Colors (both modes adjust lightness):**
- Open/Pending: `35 90% 55%` (Amber)
- In Progress: `210 85% 55%` (Blue)
- Resolved: `142 70% 50%` (Green)
- Violation: `0 75% 55%` (Red)

### B. Typography
**Font Families:**
- Primary: 'Inter' (UI, body text, data)
- Monospace: 'JetBrains Mono' (codes, IDs, technical data)

**Scale:**
- Display/Hero: text-4xl font-bold (36px)
- Page Title: text-3xl font-semibold (30px)
- Section Header: text-2xl font-semibold (24px)
- Card Title: text-lg font-semibold (18px)
- Body: text-base font-normal (16px)
- Caption/Meta: text-sm font-normal (14px)
- Small/Label: text-xs font-medium (12px)

### C. Layout System
**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4, p-6
- Section spacing: gap-6, gap-8
- Card margins: m-4, mb-6
- Icon spacing: mr-2, ml-3

**Dashboard Structure:**
- Sidebar: Fixed w-64 with collapsible option (w-16 when collapsed)
- Main content: ml-64 with max-w-7xl container
- Cards: Rounded corners (rounded-lg), shadow-sm elevation
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for stat cards

### D. Component Library

**Navigation:**
- Sidebar: Fixed left navigation with role-specific menu items, active state with primary blue background and rounded
- Top bar: Search, notifications bell, profile dropdown (right-aligned)
- Breadcrumbs: For deep navigation paths

**Dashboard Cards:**
- Stat Cards: White/dark surface, border-l-4 with status color accent, large number display, icon in top-right
- Chart Cards: Full-width with title header, Chart.js visualizations, legend below
- Map Card: Full viewport height option for issue locations, Leaflet with custom markers

**Data Display:**
- Tables: Striped rows, hover states, sortable headers, pagination footer
- Issue Cards: Grid layout with image thumbnail, status badge, location pin, timestamp
- Status Badges: Rounded-full px-3 py-1 with appropriate status colors

**Forms:**
- Input Fields: Consistent h-10 height, rounded border, focus ring with primary color
- Upload Zone: Dashed border, drag-drop area, preview thumbnail
- Dropdowns: Custom styled selects with icons
- Buttons: Primary (filled blue), Secondary (outline), Ghost (text only)

**Maps:**
- Marker Clusters: Color-coded by issue type and status
- Info Windows: Card-style popups with issue preview and "View Details" link
- Legend: Bottom-left overlay with category filters

**Overlays:**
- Modals: Centered, max-w-2xl, backdrop blur
- Toast Notifications: Top-right positioned, auto-dismiss, color-coded by type
- Image Viewer: Full-screen overlay with close button, zoom controls

**AI Assistant:**
- Floating button: Bottom-right, rounded-full with chat icon
- Chat panel: Slide-in from right, w-96, messages in bubbles (user vs bot)

### E. Animations
Use sparingly:
- Transitions: transition-colors duration-200 for hover states
- Slide-ins: For modals and chat panel (transform and opacity)
- Loading states: Subtle pulse for skeleton screens
- NO scroll animations or complex motion

---

## Role-Specific Design Notes

**Citizen Interface:**
- Emphasis on simplicity and mobile-first design
- Large touch targets for report buttons (min h-12)
- Image-first issue cards with prominent status
- Reward wallet with progress visualization

**Authority Dashboard:**
- Data density prioritized over whitespace
- Quick action buttons on table rows
- Heatmap visualization for issue hotspots
- Priority queue with color-coded urgency

**Admin Dashboard:**
- System metrics in prominent stat cards
- User management table with role badges
- Analytics charts with date range filters
- Logs table with search and export functionality

---

## Images

**Where to Use Images:**
1. **Issue Report Cards:** Thumbnail previews (aspect-ratio-square, rounded)
2. **Authority Image Viewer:** Full resolution display for AI violator detection
3. **User Avatars:** Profile circles (w-10 h-10 rounded-full)
4. **Empty States:** Illustrations for "no issues reported" states
5. **Map Markers:** Custom icons for different issue categories

**No Hero Images:** This is a dashboard application. Landing/login pages use centered forms with logo, not hero imagery.

---

## Accessibility & Quality Standards
- WCAG AA contrast ratios for all text
- Keyboard navigation for all interactive elements
- Screen reader labels for icons and actions
- Consistent dark mode across inputs, charts, and maps
- Loading states for all async operations
- Error messages with clear recovery actions