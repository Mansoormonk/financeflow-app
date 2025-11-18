# Design Guidelines: Personal Finance Management App

## Design Approach

**System-Based Approach: Material Design 3 Principles**
This data-intensive mobile application demands a design system that excels at information density, clear hierarchy, and touch interactions. Material Design 3 provides the foundation with customizations for financial data visualization.

**Key Design Principles:**
- Mobile-first data density: Maximize information visibility without overwhelming users
- Clear visual hierarchy: Numbers and key metrics must stand out instantly
- Touch-optimized interactions: Minimum 44px tap targets, generous spacing between interactive elements
- Scannable layouts: Users should grasp financial status at a glance

## Typography System

**Font Family:** Inter (via Google Fonts CDN)
- Primary: Inter for all text (excellent number legibility and screen readability)

**Type Scale:**
- Dashboard Headers: text-2xl font-bold (key metrics, section titles)
- Numeric Data (Large): text-3xl font-semibold (total balance, net worth)
- Numeric Data (Medium): text-xl font-medium (income, expenses, debt amounts)
- Numeric Data (Small): text-base font-medium (list items, table values)
- Labels/Captions: text-sm font-normal (category names, dates, descriptions)
- Micro Text: text-xs font-normal (chart labels, timestamps)

**Hierarchy Strategy:**
- Currency amounts always bold or semibold
- Positive values indicated by upward trend icons, negative by downward (avoid color dependency)
- Tabular numbers (font-variant-numeric: tabular-nums) for aligned numeric columns

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 (cards, containers)
- Section spacing: space-y-6 (between dashboard sections)
- Element margins: gap-4 (grids, flex layouts)
- Tight spacing: gap-2 (button groups, inline elements)
- Page padding: px-4 (mobile), px-6 (tablet+)

**Grid System:**
- Mobile (base): Single column, full-width cards
- Tablet (md:): 2-column grids for metric cards
- Desktop (lg:): 3-column dashboard layout (sidebar + main + widgets)

**Container Strategy:**
- Max width: max-w-7xl for desktop
- Mobile: Full-width with px-4 padding
- Cards: Consistent border-radius rounded-xl

## Component Library

### Navigation
**Bottom Navigation Bar** (mobile-first):
- Fixed bottom navigation with 5 primary tabs: Dashboard, Income, Expenses, Debts, Reports
- Icon + label format, 20% width each
- Active state: filled icon variant
- Use Heroicons library (via CDN)

**Header Bar:**
- Fixed top with app title, notification icon, and settings
- Height: h-16
- Shadow on scroll: shadow-md

### Dashboard Components

**Metric Cards:**
- Elevated cards (shadow-lg) with rounded-xl corners
- Structure: Icon (top-left) + Label (text-sm) + Value (text-3xl font-semibold) + Change indicator (text-xs with arrow icon)
- Padding: p-6
- Minimum height: min-h-32

**Chart Containers:**
- Full-width cards with p-4 padding
- Chart title: text-lg font-semibold mb-4
- Legends: Horizontal layout below chart with text-sm
- Minimum height for charts: min-h-64

### Data Visualization

**Chart Types (use Chart.js library):**
1. Line Charts: Income/expense trends over time
2. Doughnut Charts: Expense category breakdown
3. Bar Charts: Monthly income vs expenses comparison
4. Area Charts: Net worth progression
5. Progress Bars: Debt payoff progress, budget utilization

**Chart Design Standards:**
- Grid lines: Subtle, minimal (0.1 opacity)
- Data labels: Show on hover/touch only
- Responsive: Maintain aspect ratio, reduce detail on mobile
- Touch interactions: 44px minimum touch target for chart points

### Forms & Input

**Input Fields:**
- Height: h-12 (touch-optimized)
- Border: border-2 with rounded-lg
- Label: text-sm font-medium mb-2
- Numeric inputs: Right-aligned text for currency
- Date pickers: Native mobile date input

**Buttons:**
- Primary: h-12 with px-6, rounded-lg, text-base font-medium
- Secondary: h-10 with px-4, rounded-md
- Icon buttons: w-12 h-12 rounded-full (touch targets)
- Floating Action Button (FAB): Fixed bottom-right for quick entry actions

### Lists & Tables

**Transaction Lists:**
- Each row: py-4 with border-b
- Structure: Icon (left) + Description & Category (center, stacked) + Amount (right, bold)
- Swipe actions on mobile: Archive, Edit, Delete

**Debt Cards:**
- Expanded card format with creditor name, amount owed, interest rate, due date
- Visual progress bar showing payment completion
- Mini chart showing payment history

**Data Tables (for reports):**
- Sticky header row
- Alternating subtle backgrounds for rows
- Right-aligned numeric columns
- Horizontal scroll on mobile for wide tables

### Modal & Overlays

**Bottom Sheets (mobile):**
- Slide-up panels for forms and filters
- Drag handle at top: w-12 h-1 rounded-full centered
- Max height: 90vh with scroll

**Date Range Picker:**
- Quick select buttons: This Month, Last Month, Last 3 Months, Custom
- Calendar view for custom ranges

### Icons

**Heroicons Library (outline style default, solid for active states):**
- Navigation: home, currency-dollar, credit-card, chart-bar, document-text
- Actions: plus, pencil, trash, filter, download
- Status: arrow-trending-up, arrow-trending-down, check-circle, exclamation-circle
- Categories: shopping-cart, home, car, heart (healthcare), film, etc.

## Animations

**Minimal, Purposeful Animations:**
- Page transitions: 200ms ease-in-out
- Chart animations: 800ms on initial load only
- Number counter: Animate large totals on dashboard load (1 second duration)
- Micro-interactions: Button press scale (0.98), no hover effects (mobile-first)

**Avoid:**
- Continuous animations
- Scroll-triggered effects
- Complex transitions

## Images

**No Hero Images or Decorative Photography**
This is a utility application focused on data and functionality. All visual elements should be:
- Icons representing categories and actions
- Charts and graphs for data visualization
- No background images or hero sections

## Accessibility

**Touch Targets:** Minimum 44px for all interactive elements
**Contrast:** Ensure text/background contrast meets WCAG AA standards (especially for numeric data)
**Labels:** All form inputs properly labeled, aria-labels for icon-only buttons
**Focus States:** Clear focus indicators for keyboard navigation (desktop use)
**Screen Reader Support:** Proper semantic HTML, ARIA labels for charts and dynamic content

## Mobile-First Optimizations

- Thumb-zone optimization: Primary actions in bottom 40% of screen
- Single-column layouts on mobile, progressive enhancement for larger screens
- Bottom navigation for quick access
- FAB for fastest common action (add income/expense)
- Minimize scrolling on dashboard: Most critical data above fold
- Pull-to-refresh for data updates
- Offline state indicators