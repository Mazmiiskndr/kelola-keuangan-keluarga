# MVP Backlog

This backlog breaks the PRD into implementation phases. P0 focuses on the core web/PWA finance product. WhatsApp and lazy tracking are planned as an early P1 because they directly address the main product friction: users are often too lazy to record every transaction manually.

## 1. Foundation

Priority: P0

- Set up Laravel 13.
- Set up React 19 + TypeScript.
- Set up Inertia 3.
- Set up Tailwind CSS 4.
- Set up shadcn/ui style primitives.
- Set up MySQL.
- Set up Redis configuration for queue/cache/session when needed.
- Set up auth.
- Set up base policies or access services.
- Set up app layout with sidebar and responsive shell.
- Set up PWA manifest, icons, service worker, and offline fallback.
- Set up Laravel Pint.
- Set up Pest/PHPUnit.
- Set up Larastan/PHPStan.
- Set up CI or local quality commands.

Definition of Done:

- User can register, login, and logout.
- Protected pages require authentication.
- Authenticated layout is available.
- PWA manifest and offline fallback exist.
- Test and format commands are documented.

## 2. Core Finance

Priority: P0

- Financial account CRUD.
- Category CRUD.
- Income transactions.
- Expense transactions.
- Saving transactions.
- Transfers between accounts.
- Automatic balance updates.
- Soft delete/archive for important financial records.
- Basic audit log structure.

Definition of Done:

- Income increases balance.
- Expense decreases balance.
- Saving transaction updates saving goal progress and balance when needed.
- Transfer does not count as income or expense.
- Balance mutations use database transactions.
- Account balances can be recalculated.

## 3. Debts and Installments

Priority: P0

- Debt CRUD.
- Debt payment flow.
- Outstanding debt calculation.
- Monthly installment calculation.
- Paid/unpaid installment status.
- Debt payment creates expense transaction.
- Basic due-date notification.
- Debt-to-income ratio.

Definition of Done:

- Debt payment reduces account balance.
- Debt payment reduces outstanding debt.
- Debt installment appears as mandatory expense.
- Reports and AI metrics include debt obligations correctly.

## 4. Budgets and Saving Goals

Priority: P0

- Monthly budget by category.
- Total monthly budget.
- Saving goals.
- Budget progress.
- Saving progress.
- Budget near-limit alert foundation.

Definition of Done:

- User can see budget usage.
- User can see categories that exceed budget.
- User can see saving goal progress.
- Budget calculations are based on recorded expense transactions.

## 5. Personal Dashboard

Priority: P0

- Summary cards.
- Income vs expense trend.
- Expense by category.
- Largest expenses.
- Debt due this month.
- Budget progress.
- Saving goal progress.
- AI insight preview placeholder.
- Quick menu to transactions, accounts, categories, budgets, saving goals, debts, reports, AI insights, and family.

Definition of Done:

- Dashboard answers current monthly financial condition.
- Data can be filtered by period when supported.
- Layout is responsive.
- Dashboard is usable as a PWA on mobile.
- Quick menu links to the correct pages.

## 6. PWA MVP

Priority: P0

- Web app manifest.
- App icons.
- Theme color.
- Standalone display mode.
- Service worker.
- Offline fallback page.
- Static asset caching.
- Install prompt where supported.
- Manual iPhone install guide.
- Safe-area support.
- Online-first save flow.
- Offline submit warning for financial forms.
- Sensitive cache/storage cleanup on logout where applicable.

Definition of Done:

- App can be installed on Android where supported.
- App can be added to iPhone Home Screen.
- Offline fallback appears when network is unavailable.
- Authenticated finance data is not cached carelessly.
- Online changes are saved to Laravel/MySQL and visible across devices.
- Offline submit is not marked as successful.

## 7. Family Management

Priority: P0

- Create family.
- Add existing user as member.
- Role: admin, member, viewer.
- Active/inactive membership.
- Private/family/shared visibility.
- Basic family dashboard.

Definition of Done:

- Family admin can manage members.
- Family reports follow permissions.
- Private member data does not appear without permission.
- Inactive members are excluded from active reports.

## 8. Reports

Priority: P0

- Monthly cash flow report.
- Category report.
- Largest expense report.
- Debt report.
- Saving goal report.
- CSV export.

Definition of Done:

- Reports follow selected period.
- Reports use backend metrics.
- Export follows permissions.
- Family report does not leak private data.

## 9. AI MVP

Priority: P1 unless explicitly prioritized earlier.

- Install and configure Laravel AI SDK.
- Document `OPENAI_API_KEY` in `.env.example` without a secret value.
- Build financial metric snapshot.
- Build monthly analysis agent.
- Build saving recommendation agent.
- Build spending recommendation agent.
- Build debt analysis agent.
- Store AI analysis output.
- Rate limit AI endpoints.
- Run heavy AI analysis through queue.

Definition of Done:

- AI uses backend-calculated metrics.
- AI does not compute source-of-truth financial numbers.
- AI considers debt obligations before savings/investment suggestions.
- AI output is structured and stored.
- App can fallback when OpenAI key is missing.

## 10. WhatsApp Chatbot and Lazy Tracking

Priority: P1, recommended early after core finance is stable.

- Add separate Node.js gateway using `whatsapp-web.js`.
- Use QR login and persistent local auth.
- Forward incoming private messages to Laravel.
- Send Laravel-generated replies back through the gateway.
- Add internal Laravel endpoint for WhatsApp messages.
- Add shared-secret validation between Laravel and gateway.
- Add WhatsApp user settings.
- Add phone-to-user matching.
- Add parser for amount formats: `50rb`, `50ribu`, `50k`, `50.000`, `50000`, `1jt`, `1 juta`, and `1,5jt`.
- Add keyword category mapping, for example fuel/parking/ride-hailing to Transportation.
- Add transaction draft confirmation flow.
- Save only after user replies `OK`.
- Add cancel flow with `Batal`.
- Add draft expiry.
- Add daily smart reminder at 21:00 WIB.
- Skip reminder if user already recorded a transaction that day.
- Add balance snapshots.
- Add untracked-money calculation.
- Add `budget` and `report` WhatsApp commands.

Definition of Done:

- Node gateway contains no finance business logic.
- Laravel owns parsing, validation, permission, persistence, and replies.
- `bensin 50rb`, `bensin 50k`, `bensin 50.000`, and `bensin 50000` produce the same amount.
- WhatsApp-created transactions use existing `TransactionService`.
- WhatsApp-created transactions affect balance, budget, dashboard, and reports.
- Reminder is sent at most once per day per user.
- Untracked money is displayed as a gap, not an automatic transaction.
- Gateway secrets and session data are not committed.

## 11. UI Polish

Priority: P0 for theme basics, P1 for advanced polish.

- Light, dark, and system theme modes.
- Theme toggle on login page.
- Theme toggle in authenticated header.
- Theme setting page.
- Custom login page at `/` for guests.
- Redirect authenticated users from `/` to dashboard.
- Collapsible sidebar.
- Notification dropdown.
- Better empty states.
- Skeleton loading.
- Responsive table/list mode.
- WhatsApp settings page when WhatsApp feature begins.

Definition of Done:

- UI is consistent and modern.
- Dashboard is comfortable on desktop and mobile.
- Theme preference persists.
- Main pages are readable in light and dark mode.

## 12. Advanced Finance

Priority: P1/P2

- Emergency fund detail.
- Manual investment portfolio.
- Recurring transactions.
- Export PDF/Excel.
- Email notifications.
- Adjustment transaction for confirmed untracked-money gap.

## 13. AI Advanced

Priority: P2

- AI chat.
- AI classification.
- AI anomaly detection.
- Predictive cash flow.
- Action plan evaluation.

## 14. Future Production WhatsApp Migration

Priority: P2 or production-readiness phase.

- Replace `whatsapp-web.js` gateway with Meta WhatsApp Cloud API.
- Keep Laravel WhatsApp services unchanged.
- Add official webhook verification.
- Add template-message support where required.
- Add production compliance and monitoring.

Definition of Done:

- Provider swap does not rewrite finance domain logic.
- Laravel still owns command parsing and transaction creation.
- Existing WhatsApp tests still pass through provider abstraction.
