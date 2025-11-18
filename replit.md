# FinanceFlow - Personal Finance Management

## Overview

FinanceFlow is a mobile-first personal finance management application designed to help users track income, expenses, debts, and overall financial health. The application provides intuitive data visualization and insights to support informed financial decision-making.

**Core Features:**
- Income tracking with categorization
- Expense management and categorization
- Debt tracking with payment history
- Financial reports and visualizations
- Dashboard with real-time financial metrics

**Technology Stack:**
- Frontend: React with TypeScript, Vite build tool
- Backend: Express.js with TypeScript
- Database: PostgreSQL via Drizzle ORM
- UI Framework: shadcn/ui components with Tailwind CSS
- State Management: TanStack Query (React Query)
- Form Handling: React Hook Form with Zod validation
- Charts: Recharts library

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- Page-based routing using Wouter (lightweight React router)
- Shared UI components from shadcn/ui library
- Custom composite components (StatCard, EmptyState, BottomNav)
- Mobile-first responsive design with bottom navigation

**State Management:**
- TanStack Query for server state management and caching
- React Hook Form for form state and validation
- Theme context for light/dark mode switching
- No global application state library - relying on server state sync

**Design System:**
- Material Design 3 principles adapted for mobile
- Inter font family for excellent number legibility
- Tailwind CSS with custom design tokens
- Touch-optimized interactions (44px minimum tap targets)
- Consistent spacing system (2, 4, 6, 8 unit scale)

**Rationale:** Mobile-first design prioritizes the primary use case of on-the-go financial tracking. TanStack Query simplifies server state synchronization and eliminates need for additional state management complexity.

### Backend Architecture

**API Design:**
- RESTful endpoints organized by resource type
- Express.js middleware for request logging and JSON parsing
- Route handlers in separate module for maintainability
- Standard HTTP status codes and error responses

**Data Layer:**
- Storage interface (IStorage) for abstraction
- In-memory storage implementation (MemStorage) for development
- Designed for future PostgreSQL implementation via Drizzle ORM
- UUID-based entity identifiers

**Schema Design:**
- Four main entities: income_entries, expenses, debts, debt_payments
- Drizzle schema definitions with Zod validation schemas
- Numeric fields use precision decimal types for financial accuracy
- Timestamp tracking for audit trails
- Foreign key relationships (debt_payments → debts)

**Rationale:** The storage abstraction pattern allows development to proceed with in-memory storage while the production database is being provisioned. This decouples data access from storage implementation.

### Build and Development

**Development Workflow:**
- Vite dev server with HMR for rapid frontend iteration
- TSX execution for backend TypeScript without transpilation
- Separate client and server build processes
- Environment-based configuration

**Production Build:**
- Vite builds optimized client bundle to dist/public
- esbuild bundles server code to dist/index.js
- Single entry point for deployment
- Static file serving from built client

**Rationale:** Vite provides superior developer experience with instant HMR. Separate build tools optimize each layer appropriately - Vite for client, esbuild for server.

### Form Validation Strategy

**Validation Approach:**
- Single source of truth: Drizzle schema definitions
- Zod schemas generated from Drizzle via drizzle-zod
- Client-side validation with React Hook Form + Zod resolver
- Server-side validation with same Zod schemas
- Type safety end-to-end with TypeScript inference

**Rationale:** Generating validation schemas from database schema prevents drift between client expectations and database constraints. Shared validation logic across client/server reduces bugs.

### Mobile Optimization

**Performance Considerations:**
- Lazy loading via code splitting
- Optimistic UI updates with TanStack Query
- Minimal JavaScript bundle size
- CSS-in-JS avoided in favor of Tailwind for smaller bundles

**UX Patterns:**
- Bottom navigation for thumb-friendly access
- Dialog-based forms for focused data entry
- Empty states with clear calls to action
- Loading skeletons for perceived performance
- Toast notifications for feedback

**Rationale:** Mobile users expect instant feedback and minimal data usage. Bottom navigation and dialog patterns align with mobile app conventions.

## External Dependencies

### Database

**Neon Serverless PostgreSQL:**
- Serverless PostgreSQL database via @neondatabase/serverless
- Connection string configured via DATABASE_URL environment variable
- Drizzle ORM for type-safe database queries
- Migration files generated in /migrations directory

**Alternative:** Application includes in-memory storage fallback for development without database provisioning.

### UI Component Library

**shadcn/ui:**
- Radix UI primitives for accessible components
- Customized with Tailwind CSS
- Components copied into project (not npm dependency)
- New York style variant with neutral color scheme

**Rationale:** shadcn/ui provides production-ready accessible components without bundle size overhead of full component libraries. Copy-paste approach allows customization.

### Third-Party Services

**Google Fonts:**
- Inter font family loaded via CDN
- Preconnect hints for performance optimization

**Recharts:**
- Chart visualizations for dashboard and reports
- Responsive containers for mobile adaptation
- Area charts, bar charts, and pie charts

### Development Tools

**Replit-Specific:**
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer for code navigation
- @replit/vite-plugin-dev-banner for development indicators

These plugins enhance the Replit development experience but are excluded from production builds.

### Form and Validation

**React Hook Form:**
- Performant form state management
- Minimal re-renders via isolated field subscriptions

**Zod:**
- Runtime type validation
- TypeScript type inference
- Schema composition and transformation

**@hookform/resolvers:**
- Bridge between React Hook Form and Zod
- Automatic error mapping

### Data Fetching

**TanStack Query:**
- Server state caching and synchronization
- Optimistic updates and automatic refetching
- Configured with infinite stale time for manual invalidation
- Custom queryFn for standardized API requests

**Rationale:** TanStack Query eliminates boilerplate for loading states, error handling, and cache invalidation. The declarative API improves code readability.