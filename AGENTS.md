# AGENTS.md - Project Working Rules

This file is the operating guide for AI agents and developers working on the Kelola Keuangan Keluarga project. Read it before creating or changing code.

The goal is to keep the codebase consistent, reusable, secure, easy to test, and aligned with the product vision: a family finance management app that reduces manual tracking friction, gives clear monthly financial visibility, and supports quick WhatsApp-based input for everyday use.

## 1. Communication

- Use English for project documentation, code comments, pull request notes, and implementation explanations unless the user explicitly asks for another language.
- If the user asks in Indonesian, start with an English version of the question, then answer in English unless they ask for Indonesian.
- Explain changes briefly and technically.
- If multiple solutions are possible, choose the safest option with the smallest impact and best fit for the existing architecture.
- Do not modify areas outside the requested scope unless they are truly required.

## 2. Understand Context Before Coding

Before writing or changing code:

- Read `PRD.md`.
- Read relevant files in `docs/`.
- Inspect related controllers, services, requests, models, enums, migrations, React pages, and reusable components.
- Understand the current project flow before adding new code.
- Search for existing helpers, services, DTOs, types, constants, validators, and mappers.
- Reuse or adapt existing logic before creating new logic.
- Keep changes minimal and focused.

## 3. Core Tech Stack

- Backend: Laravel 13.
- Frontend: React 19 + TypeScript.
- Bridge: Inertia 3.
- Mobile delivery: Progressive Web App.
- Styling: Tailwind CSS 4.
- UI components: shadcn/ui style components and internal Tailwind components.
- Database: MySQL.
- Queue/cache/session/rate limit: Redis when needed.
- AI: Laravel AI SDK (`laravel/ai`) with OpenAI API on the server only.
- WhatsApp family MVP: separate Node.js gateway using `whatsapp-web.js`.
- Testing: Pest or PHPUnit.
- Formatter: Laravel Pint.
- Static analysis: Larastan/PHPStan.

## 4. Engineering Principles

- SRP: each class or function should have one clear responsibility.
- DRY: avoid duplicated logic.
- KISS: prefer simple, readable solutions over unnecessary abstraction.
- SOLID when relevant.
- Business logic must be reusable and should not be locked inside controllers or React components.
- Keep functions short and names explicit.
- Match the existing naming, folder structure, request/response style, and component style.
- Avoid large refactors unless they are required to solve the task safely.

## 5. Laravel Backend Rules

- Controllers must stay thin.
- Input validation must use Form Request classes when the input is not trivial.
- Authorization must use policies, gates, or established access services.
- Core business logic belongs in services or actions.
- Complex API responses should use resources if needed.
- Use enums for fixed values such as transaction type, visibility, family role, account type, need type, debt status, and recommendation status.
- Use database transactions for operations that mutate balances, transactions, debts, debt payments, savings, transfers, or money-related aggregates.
- Do not calculate important financial values directly in controllers.
- Avoid magic strings, magic numbers, unchecked errors, and duplicated literals.
- Every cross-user or family operation must check permission.
- Never expose secrets, API keys, or internal tokens to the frontend.

## 6. React Frontend Rules

- Use small, reusable React components.
- Separate pages, layouts, feature components, and base UI components.
- Do not place complex financial rules in React.
- React should display data, manage UI interactions, and submit actions to Laravel.
- Use TypeScript interfaces/types for important props and data structures.
- Use Inertia Link/Form patterns for SPA-like navigation.
- Keep authenticated layouts and finance forms PWA-ready for mobile, tablet, and desktop.
- Do not rely on hover-only interactions for important actions.
- Avoid unnecessary global state and excessive prop drilling.
- Reusable finance UI should be shared through components such as money display, badges, selects, charts, filters, empty states, and stat cards.

## 7. PWA Rules

- The app must work as a normal website and as an installable PWA.
- Provide a web app manifest, app icons, theme color, service worker, and safe offline fallback.
- Use online-first persistence for financial data.
- Do not cache authenticated financial responses by default.
- Do not mark offline financial mutations as saved before they reach the Laravel server.
- Offline drafts may exist only if clearly marked as unsaved.
- Clear sensitive browser cache/storage on logout when applicable.
- Web push notification is a later feature because browser and OS support varies.

## 8. AI and OpenAI Rules

- `OPENAI_API_KEY` must exist only on the Laravel server through `.env`.
- Never expose OpenAI keys in React, browser bundles, logs, API responses, or Git.
- AI provider/model configuration belongs in `config/ai.php`.
- Use Laravel AI SDK for OpenAI integration.
- Backend services must compute financial numbers before data is sent to AI.
- AI may generate narratives, insights, recommendations, and action plans, but it must not be the source of truth for financial calculations.
- AI output must be validated before storage.
- AI endpoints must be rate limited.
- Heavy AI work should run through queues.

## 9. Finance Domain Rules

- Income increases account balance.
- Expense decreases account balance.
- Saving transactions may move balance and update saving goal progress.
- Transfers move balance between accounts and must not count as income or expense.
- Debt installments are mandatory expenses.
- Debt payments must create expense transactions and reduce outstanding debt.
- Saving and investment recommendations must consider minimum installments first.
- Family reports must only use data permitted by visibility and access rules.
- WhatsApp-created transactions must use the same Laravel services as website-created transactions.
- `Untracked money` is only a balance-gap indicator. It is not an automatic expense unless the user explicitly confirms an adjustment transaction.

## 10. WhatsApp Bot Rules

- The first WhatsApp provider is `whatsapp-web.js`.
- This provider is only for the personal/family MVP, not public production scale.
- The WhatsApp gateway must be a separate Node.js process.
- Node gateway responsibilities are limited to QR login, WhatsApp session handling, receiving messages, forwarding messages to Laravel, and sending Laravel-generated replies.
- Do not put finance logic, final parsing, transaction validation, permission checks, balance calculation, report logic, budget logic, or AI logic in the Node gateway.
- Laravel services own all WhatsApp command parsing, transaction drafts, validation, authorization, persistence, reports, reminders, and untracked-money calculation.
- Build the WhatsApp provider behind a gateway contract so Meta WhatsApp Cloud API can replace `whatsapp-web.js` later without rewriting finance logic.
- Free-form WhatsApp messages must not create final transactions immediately.
- Create a transaction draft and save only after the user replies `OK`.
- The parser must support at least these amount formats: `50rb`, `50ribu`, `50k`, `50.000`, `50000`, `1jt`, `1 juta`, and `1,5jt`.
- Default smart reminder time is 21:00 WIB.
- Reminder must be anti-spam: at most once per day per user, and skipped if the user already recorded a transaction that day.
- WhatsApp session data, QR auth data, internal secrets, tokens, and private phone numbers must not be committed.
- Internal endpoints between Laravel and the Node gateway must use shared secret/signature validation and idempotency by `message_id`.

## 11. UI/UX Rules

- The dashboard should be modern, calm, scannable, and suitable for financial data.
- Use sidebar navigation for authenticated desktop layouts.
- Sidebar must adapt to mobile drawer or mobile-friendly navigation.
- `/` must show the custom login page for guests and redirect authenticated users to dashboard.
- Support light, dark, and system theme modes.
- Theme toggle must be available on login, app header, and appearance settings.
- Vuexy Admin may be used only as visual inspiration, not copied.
- Do not copy Vuexy source code, assets, colors, or design directly.
- Main pages must be responsive on desktop and mobile.
- Tables, filters, charts, summary cards, forms, and empty states must be visually consistent.
- Financial data should be easy to read. Avoid clutter.

## 12. Testing and Quality Gate

Minimum tests for important features:

- `TransactionService`.
- `AccountBalanceService`.
- `DebtService`.
- `DebtPaymentService`.
- `BudgetService`.
- `SavingGoalService`.
- `FinancialMetricService`.
- `AiAnalysisService`.
- Family access/permission service.
- `WhatsAppTransactionParser`.
- `WhatsAppTransactionDraftService`.
- WhatsApp reminder behavior.
- Untracked-money calculation.

Before considering work complete:

- Run relevant tests.
- Run formatter when code was changed.
- Ensure no cross-user or cross-family data leak.
- Ensure no API key, token, WhatsApp session, QR auth data, or secret is committed.
- Ensure PWA manifest, service worker, and offline fallback still work when touched.
- Ensure the main finance flows are not broken.

## 13. Prohibited Changes

- Do not recreate helpers, services, or components that already exist.
- Do not perform unrelated large refactors.
- Do not put complex business logic in controllers or React components.
- Do not put finance business logic in the Node WhatsApp gateway.
- Do not put secrets in frontend code.
- Do not commit `.env`, WhatsApp session files, QR auth data, tokens, or gateway secrets.
- Do not permanently delete financial records that are needed for reports. Use soft delete/archive when appropriate.
- Do not allow AI to compute source-of-truth financial numbers without backend validation.
