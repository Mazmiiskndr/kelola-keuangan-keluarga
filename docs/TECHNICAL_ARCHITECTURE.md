# Technical Architecture

This document defines the technical direction for Kelola Keuangan Keluarga. The application is a Laravel-first family finance system with React/Inertia UI, PWA delivery, AI-assisted insights, and a WhatsApp chatbot for low-friction daily input.

## 1. Architecture Goals

- Keep finance business logic reusable, testable, and centralized.
- Keep controllers thin and services responsible for domain behavior.
- Preserve family permissions and privacy from the beginning.
- Make WhatsApp an input channel, not a separate finance engine.
- Allow the initial `whatsapp-web.js` provider to be replaced by Meta WhatsApp Cloud API later.
- Keep AI separate from deterministic financial calculations.
- Keep the frontend modern and SPA-like while preserving Laravel routing, validation, and authorization.

## 2. Core Stack

- Backend: Laravel 13.
- Frontend: React 19 + TypeScript.
- Bridge: Inertia 3.
- Styling: Tailwind CSS 4.
- UI components: shadcn/ui style primitives and internal finance components.
- Database: MySQL.
- Queue/cache/session/rate limit: Redis when needed.
- PWA: manifest, service worker, offline fallback, installable app shell.
- AI: Laravel AI SDK with OpenAI API on the server only.
- WhatsApp MVP: separate Node.js gateway using `whatsapp-web.js`.
- Testing: Pest or PHPUnit.
- Formatting/static analysis: Laravel Pint and Larastan/PHPStan.

## 3. Recommended Structure

```text
app/
  Actions/
  Ai/
    Agents/
  Data/
  Enums/
  Http/
    Controllers/
    Requests/
    Resources/
  Jobs/
  Models/
  Notifications/
  Policies/
  Services/
    Ai/
    Finance/
    Reports/
    WhatsApp/

resources/
  js/
    components/
      finance/
      layout/
      ui/
    hooks/
    layouts/
    pages/
    types/
    lib/

public/
  icons/
  offline.html
  manifest.webmanifest
  service-worker.js

whatsapp-gateway/
  src/
  package.json
  .env.example
```

## 4. Backend Layering

### Controllers

Controllers should:

- Receive requests.
- Use Form Requests when validation is non-trivial.
- Check authorization through policies, gates, or access services.
- Call services or actions.
- Return Inertia responses, redirects, JSON, or streamed downloads.

Controllers must not contain complex financial calculations.

### Form Requests

Form Requests should:

- Validate inputs.
- Normalize simple input values.
- Authorize requests when appropriate.

Examples:

- `StoreFinanceTransactionRequest`.
- `StoreFinancialAccountRequest`.
- `StoreBudgetRequest`.
- `StoreDebtRequest`.
- `StoreDebtPaymentRequest`.
- Future: `StoreWhatsAppSettingRequest`.

### Services

Services own business rules and should be reusable from controllers, jobs, commands, tests, and WhatsApp handlers.

Core services:

- `TransactionService`.
- `AccountBalanceService`.
- `TransferService`.
- `DebtPaymentService`.
- `FinancialMetricService`.
- `ReportService`.
- `CategoryBootstrapService`.
- `FamilyAccessService`.
- `AiAnalysisService`.
- `WhatsAppCommandService`.
- `WhatsAppTransactionParser`.
- `WhatsAppTransactionDraftService`.
- `WhatsAppReplyService`.
- `WhatsAppGateway`.

### Actions

Actions are useful for focused workflows with clear input/output:

- Create expense transaction.
- Record debt payment.
- Generate monthly finance snapshot.
- Build AI finance context.
- Process WhatsApp incoming message.
- Send daily WhatsApp reminder.
- Calculate untracked money.

### Enums

Use enums for fixed values:

- `TransactionType`.
- `AccountType`.
- `Visibility`.
- `FamilyRole`.
- `NeedType`.
- `DebtType`.
- `DebtStatus`.
- `RecommendationStatus`.
- `AiAnalysisType`.
- Future: `WhatsAppDraftStatus`, `BalanceSnapshotType`.

## 5. Finance Domain Rules

Core finance is the most important domain.

- Income increases account balance.
- Expense decreases account balance.
- Saving transactions update saving goal progress and may move balance between accounts.
- Transfers do not count as income or expense.
- Debt payments create expense transactions and reduce outstanding debt.
- Debt installments are mandatory expenses.
- Budget usage is calculated from expense transactions.
- Family reports must respect visibility and permissions.
- All balance-changing operations must be atomic.
- Balance recalculation must be possible when a transaction changes.

## 6. Lazy Tracking and Untracked Money

The product supports users who do not record every small transaction.

Balance snapshots:

- Opening balance snapshot, usually at the start of the month.
- Current balance snapshot, usually from a user message such as `saldo sekarang 3jt`.

Account-level formula:

```text
untracked_money =
  opening_balance
  + recorded_income
  + transfer_in
  - recorded_expense
  - transfer_out
  - current_balance
```

For all accounts together, internal transfers between the user's own accounts must not double-count spending.

Rules:

- `Untracked money` is a warning/indicator, not an automatic expense.
- The system must ask for explicit confirmation before turning a gap into an adjustment transaction.
- Reports must distinguish recorded expense from untracked money.

## 7. WhatsApp Architecture

The first WhatsApp integration uses `whatsapp-web.js` because the initial use case is personal/family-only and needs a free, practical bot.

### Provider Decision

- MVP provider: `whatsapp-web.js`.
- Runtime: separate Node.js service.
- Login: QR code with persistent local auth.
- Future production provider: Meta WhatsApp Cloud API.

### Separation of Responsibilities

Node gateway may only:

- Connect to WhatsApp Web.
- Handle QR login and session.
- Receive private messages.
- Forward messages to Laravel.
- Send replies generated by Laravel.
- Expose a health endpoint.

Laravel must own:

- Phone-to-user resolution.
- Command classification.
- Amount parsing.
- Category matching.
- Transaction drafts.
- Confirmation flow.
- Permission checks.
- Transaction creation.
- Reports.
- Reminders.
- Untracked-money calculation.

### Message Flow

```text
WhatsApp user
  -> whatsapp-web.js gateway
  -> POST /internal/whatsapp/messages
  -> WhatsAppCommandService
  -> Parser / draft / report / reminder handler
  -> Existing finance services
  -> Database
  -> Laravel reply
  -> POST /send-message on Node gateway
  -> WhatsApp user
```

### Internal Endpoints

Laravel endpoints:

- `POST /internal/whatsapp/messages`.
- `POST /internal/whatsapp/status`.

Node gateway endpoints:

- `POST /send-message`.
- `GET /health`.

Rules:

- Use shared secret or signature validation.
- Never rely on browser sessions for internal gateway calls.
- Payloads must include `message_id`, `from_phone`, `body`, `timestamp`, and `provider`.
- Laravel processing must be idempotent by `message_id`.
- Session files and secrets must never be committed.

## 8. WhatsApp Parsing Rules

Supported amount formats:

- `50rb`.
- `50ribu`.
- `50k`.
- `50.000`.
- `50000`.
- `1jt`.
- `1 juta`.
- `1,5jt`.

Examples:

```text
Beli bensin 50rb
bensin 50k
bensin 50.000
bensin 50000
```

Expected parsed draft:

```text
amount: 50000
type: expense
category: Transportation
merchant: Bensin
```

Rules:

- Remove common verbs such as `beli`, `bayar`, `buat`, and `jajan`.
- Use existing user categories and defaults.
- If category is uncertain, use Other and mention that in confirmation.
- Free-form text must create a draft only.
- Save only after the user replies `OK`.
- Cancel when the user replies `Batal`.
- Expire stale drafts, for example after 15 minutes.

## 9. Frontend Architecture

### Layout

The authenticated layout should include:

- Sidebar navigation.
- Header/topbar.
- Main content area.
- User menu.
- Notification entry.
- Responsive mobile drawer.
- PWA install guidance when appropriate.

### Pages

Inertia pages live in `resources/js/pages`.

Important pages:

- Dashboard.
- Transactions.
- Accounts.
- Categories.
- Budgets.
- Saving goals.
- Debts.
- Reports.
- AI insights.
- Families.
- Settings.
- Future WhatsApp settings.

### Reusable Components

Reusable finance components should include:

- Money display.
- Stat card.
- Finance badge.
- Finance select.
- Currency input.
- Date picker input.
- Progress row.
- Simple charts.
- Empty state.
- Form error.

## 10. PWA Architecture

The PWA allows the website to feel like a mobile app without native Android or iOS development.

Components:

- Web app manifest.
- Icons.
- Theme color.
- Service worker.
- Offline fallback.
- Static asset caching.
- Standalone display mode.
- iPhone install guide.

Caching strategy:

- Static assets: cache-first.
- Offline fallback: cache-first.
- Authenticated pages and finance APIs: network-only by default.
- Public pages: network-first or stale-while-revalidate when safe.

Rules:

- Do not cache private financial responses by default.
- Do not mark offline mutations as saved.
- Drafts must be clearly labeled as unsaved if offline support is added later.

## 11. AI Architecture

Use two layers:

- `FinancialMetricService` calculates deterministic metrics.
- Laravel AI agents generate narratives, recommendations, and action plans.

AI flow:

1. User requests analysis.
2. Backend computes financial metrics.
3. Snapshot is stored.
4. Job calls AI agent.
5. Structured output is validated.
6. Result is stored.
7. UI displays the analysis.

Rules:

- AI must not be the source of truth for financial numbers.
- AI must respect family permissions.
- AI output must mention period and data sufficiency.
- OpenAI keys must stay on the server.

## 12. Security Architecture

- All major models should have policies or equivalent access rules.
- Every mutation endpoint must validate authorization.
- Private member data must not leak into family reports.
- OpenAI API key is server-only.
- WhatsApp internal routes require shared secret/signature validation.
- WhatsApp session data must be outside Git.
- Exports should create audit logs.
- File uploads must validate MIME type and size.
- Service worker must not store private finance data without an explicit secure offline design.
- Logout should clear sensitive browser cache/storage when applicable.

## 13. Testing Strategy

Prioritize tests for:

- Financial calculations.
- Transaction create/update/delete balance effects.
- Transfer balance effects.
- Debt payment behavior.
- Budget and report summaries.
- Family permission boundaries.
- AI service with fake provider or fallback.
- WhatsApp parser amount formats.
- WhatsApp draft confirmation/cancel/expiry.
- WhatsApp idempotency by `message_id`.
- WhatsApp reminder anti-spam rules.
- Untracked-money calculation.
- PWA installability and offline fallback manually.

## 14. Routing and Authentication Entry Point

- `/` is the guest login entry point.
- Authenticated users visiting `/` redirect to dashboard.
- The login page is rendered through Inertia.
- Authentication should keep Laravel starter-kit behavior for session, CSRF, remember me, forgot password, and rate limiting.
- Default Laravel welcome page is not used.

## 15. Theme Architecture

- Supported modes: light, dark, and system.
- React uses the existing appearance hook as the main source of theme preference.
- Theme preference is stored consistently.
- The root document receives/removes `dark` class so Tailwind variants work globally.
- New components must use theme-compatible color tokens.
- Do not hardcode colors that work only in one mode.
