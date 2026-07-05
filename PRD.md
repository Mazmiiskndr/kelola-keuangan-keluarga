# Product Requirements Document

# Kelola Keuangan Keluarga

Kelola Keuangan Keluarga is a Laravel, React, Inertia, and PWA-based family finance management application. The product helps individuals, couples, and families track money, understand monthly cash flow, manage accounts, record major expenses, monitor budgets, pay debts, set saving goals, and receive AI-assisted financial recommendations.

The long-term goal is not only to record transactions, but to reduce friction in daily tracking and help families make better financial decisions from real data. The website remains the main setup and reporting interface, while WhatsApp becomes a fast daily input channel.

## 1. Product Vision

Many families fail to track finances because manual entry is tiring. This product should make financial awareness possible even when users do not record every small transaction.

The product should support two tracking modes:

- Detailed tracking: users record income, expenses, transfers, debts, savings, and budgets through the website or WhatsApp.
- Lazy tracking: users record only major expenses and balance snapshots, then the system shows `untracked money` to reveal spending that was not recorded.
- Click-first tracking: users tap learned transaction suggestions from their own history so repeated expenses such as `Rokok`, `Bensin`, or `Kopi` can be reviewed and saved without retyping the form.

The system should help users answer:

- How much money do I have now?
- How much income came in this month?
- How much expense was recorded?
- How much budget remains?
- What are the largest expenses?
- How much money is not yet tracked?
- What actions can improve next month?

## 2. Target Users

### Individual User

Users who manage their own income, expenses, bank accounts, e-wallets, debts, and saving goals.

### Couple or Family Member

Users who share part of their finances with a spouse or family, while keeping some transactions private.

### Family Admin

The person responsible for monitoring family-level cash flow, shared expenses, debts, budgets, and reports.

### Family Viewer

A family member who can view selected family reports but cannot manage all finance data.

## 3. Product Scope

### In Scope

- User authentication.
- Financial profile.
- Family and member management.
- Roles and permissions.
- Financial accounts: cash, bank, e-wallet, credit card, loan, investment, saving goal account.
- Income transactions.
- Expense transactions.
- Smart click-first transaction suggestions from the user's own history.
- Saving transactions.
- Transfers between accounts.
- Categories.
- Monthly budgets.
- Saving goals.
- Debts and installments.
- Debt payments that affect expenses and balances.
- Dashboard for individuals.
- Dashboard for families.
- Monthly reports.
- Largest expense analysis.
- CSV export.
- In-app notifications.
- Smart reminders.
- PWA installability.
- AI financial insights.
- WhatsApp chatbot for family MVP through `whatsapp-web.js`.
- Lazy tracking and `untracked money`.
- Audit logs for important activity.

### Out of Scope for MVP

- Direct bank or e-wallet integration.
- Open banking.
- Automatic bill payments.
- Automatic investment execution.
- Native Android app.
- Native iOS app.
- Public production WhatsApp bot using Meta Cloud API.
- WhatsApp group chat automation.
- OCR receipt scanning.
- Complex real-time multi-currency exchange.
- Company payroll.
- Robo-advisor features that tell users exactly what asset to buy or sell.

## 4. Core Product Principles

- The backend is the source of truth for all financial calculations.
- Every money mutation must be atomic.
- Website, PWA, and WhatsApp must write to the same Laravel finance services.
- WhatsApp is an input and notification channel, not a separate finance system.
- The system must support users who are too busy or too lazy to record every small transaction.
- Reports must clearly distinguish recorded expenses from untracked money.
- AI may explain and recommend, but it must not create source-of-truth numbers.
- Family privacy must be enforced from the beginning.

## 5. User Roles and Permissions

### Roles

- Personal User.
- Family Member.
- Family Admin.
- Family Viewer.

### High-Level Permissions

| Capability | Personal User | Family Member | Family Admin | Family Viewer |
| --- | --- | --- | --- | --- |
| Manage own accounts | Yes | Yes | Yes | No |
| Manage own transactions | Yes | Yes | Yes | No |
| Manage shared family accounts | No | Depending access | Yes | No |
| View personal reports | Yes | Yes | Yes | No |
| View family reports | No | Depending access | Yes | Yes, limited |
| Manage family members | No | No | Yes | No |
| Run AI analysis | Yes | Depending access | Yes | No |

### Privacy Rules

- Private transactions are visible only to their owner.
- Family transactions are visible according to family access rules.
- Shared-goal transactions are visible only to users who have access to that goal.
- Family reports must not expose private member details unless the current user has permission.
- WhatsApp commands must follow the same permissions as website actions.

## 6. Main Modules

### 6.1 Authentication

Features:

- Register.
- Login.
- Logout.
- Forgot password.
- Reset password.
- Email verification when enabled.

Acceptance criteria:

- Guests are redirected to login for protected routes.
- Authenticated users are redirected from `/` to dashboard.
- Session, CSRF, and remember-me behavior follow Laravel conventions.

### 6.2 Financial Profile

Stores user-level finance assumptions.

Fields:

- Monthly income target.
- Household size.
- Risk profile.
- Main currency.
- Financial priorities.

Acceptance criteria:

- Profile can be created and updated.
- AI and reports can use the profile as contextual data.

### 6.3 Financial Accounts

Accounts represent where money exists or moves.

Types:

- Cash.
- Bank.
- E-wallet.
- Credit card.
- Loan.
- Investment.
- Saving goal account.

Fields:

- Name.
- Bank name.
- Account holder name.
- Account number.
- Type.
- Initial balance.
- Current balance.
- Currency.
- Owner.
- Family.
- Visibility.
- Active/archive status.

Acceptance criteria:

- Users can create, update, and archive accounts.
- Account balance changes automatically when transactions, transfers, savings, or debt payments are recorded.
- Accounts with financial history should not be permanently deleted.

### 6.4 Categories

Categories classify income and expenses.

Default income categories:

- Salary.
- Bonus.
- Business.

Default expense categories:

- Food and Drinks.
- Monthly Groceries.
- Transportation.
- Housing.
- Utilities and Internet.
- Education.
- Health.
- Debt Installments.
- Entertainment.
- Subscriptions.
- Saving.
- Investment.
- Other.

Acceptance criteria:

- Default categories are bootstrapped for each user.
- Users can create custom categories.
- Category type must match transaction type.
- WhatsApp parser must reuse existing user categories.

### 6.5 Transactions

Transaction types:

- `income`.
- `expense`.
- `saving`.

Fields:

- User.
- Family.
- Financial account.
- Category.
- Saving goal when type is `saving`.
- Type.
- Amount.
- Transaction date.
- Merchant/title.
- Description.
- Tags.
- Visibility.
- Need type.
- Metadata.

Acceptance criteria:

- Income increases account balance.
- Expense decreases account balance.
- Saving transaction updates saving goal progress and may move balance between source and target accounts.
- Transaction create/update/delete must recalculate affected balances correctly.
- Insufficient balance must reject expense or saving movements that require cash.
- Website-created and WhatsApp-created transactions must use the same backend services.
- The website/PWA transaction page provides a Quick Add flow with type buttons, frequent title suggestions, learned amount presets, and a compact review-before-save panel.
- Tapping a suggestion must prefill merchant/title, category, account, amount, need type, and today's date, but it must not save until the user taps `Simpan Transaksi`.
- Suggestions must be derived from the authenticated user's own transaction history only.
- Suggestions must skip deleted transactions, inactive or deleted accounts, missing or deleted categories, category/type mismatches, inaccessible accounts, and inactive saving goals.
- The existing full transaction form remains available as a fallback for manual details.

### 6.6 Transfers

Transfers move money between accounts and do not count as income or expense.

Acceptance criteria:

- Source account decreases.
- Target account increases.
- Transfer is not counted as spending or income in reports.
- Transfer must reject insufficient source balance.

### 6.7 Budgets

Budgets help users control spending by category and period.

Fields:

- User or family.
- Category.
- Amount.
- Period type.
- Period start and end.

Acceptance criteria:

- Budget usage is calculated from expense transactions.
- Transfers do not reduce budget.
- Saving may be tracked as financial allocation, not consumption spending.
- Family budget follows visibility rules.

### 6.8 Lazy Tracking and Untracked Money

Lazy tracking supports users who do not want to record every small transaction.

Concept:

- Users record opening balance.
- Users record income.
- Users record major expenses.
- Users record current balance snapshots.
- The system calculates the money gap that has not been tracked.

Formula for one account:

```text
untracked_money =
  opening_balance
  + recorded_income
  + transfer_in
  - recorded_expense
  - transfer_out
  - current_balance
```

For all accounts together, transfers between the user's own accounts must not double-count spending.

Example:

```text
Opening balance: Rp5,000,000
Current balance: Rp3,000,000
Recorded expenses: Rp1,500,000
Untracked money: Rp500,000
```

Bot/report message:

```text
There is Rp500,000 of spending not yet tracked this month.
```

Acceptance criteria:

- Untracked money is displayed as an indicator, not a final transaction.
- The system must not automatically create an expense from untracked money.
- A future adjustment transaction requires explicit user confirmation.
- Reports must distinguish recorded expense from untracked money.

### 6.9 Saving Goals

Users can define target savings.

Fields:

- Name.
- Target amount.
- Current amount.
- Target date.
- Priority.
- Linked target account.
- Status.

Acceptance criteria:

- Saving transactions update saving goal progress.
- Progress is recalculated when saving transactions change.
- AI recommendations consider debt obligations before recommending saving allocation.

### 6.10 Debts and Installments

Debt records represent loans, installments, credit cards, or paylater obligations.

Fields:

- Name.
- Type.
- Lender.
- Principal amount.
- Outstanding amount.
- Monthly payment.
- Minimum payment.
- Interest rate.
- Start date.
- Tenor.
- Due day.
- Next due date.
- Payment account.
- Category.
- Include in monthly expense.
- Status.

Acceptance criteria:

- Debt payment creates an expense transaction.
- Debt payment reduces outstanding amount.
- Due installments are included in mandatory expense analysis.
- Debt due reminder must avoid duplicate notifications.

### 6.11 Reports

Reports summarize financial condition by period.

Report outputs:

- Total balance.
- Income.
- Expense.
- Cash flow.
- Debt due.
- Outstanding debt.
- Budget total.
- Saving target.
- Saving progress.
- Expense by category.
- Largest expenses.
- Account breakdown.
- Six-month trend.
- Upcoming debts.
- Family member breakdown when allowed.
- Untracked money when balance snapshots exist.

Acceptance criteria:

- Reports follow selected period.
- Family reports follow permission rules.
- Private data must not leak in family reports.
- CSV export follows the same permission rules.

### 6.12 Dashboard

Dashboard should answer the current financial condition quickly.

Widgets:

- Total balance.
- Monthly income.
- Monthly expense.
- Cash flow.
- Debt due.
- Account balances.
- Expense trend.
- Expense categories.
- Largest expenses.
- Saving progress.
- Budget usage.
- Untracked money.
- Quick menu.

Acceptance criteria:

- Dashboard must be responsive.
- Dashboard data must come from backend metrics.
- Dashboard must be usable as a PWA on mobile.

### 6.13 Family Management

Features:

- Create family.
- Add existing users as members.
- Set role.
- Remove member.
- Shared account visibility.
- Family dashboard and reports.

Acceptance criteria:

- Family admin can manage family members.
- Family member can record transactions using permitted shared accounts.
- Family reports include active members only.
- Inactive members should not affect current family reports.

### 6.14 Notifications and Reminders

Notification types:

- Daily transaction reminder.
- Salary day saving reminder.
- Debt due reminder.
- Budget near limit.
- Saving goal behind schedule.
- Negative cash flow.
- Unusual spending.
- Weekly summary.
- Monthly summary.

Channels:

- In-app notification.
- Email in later phase.
- Web push in later phase.
- WhatsApp private chat through bot.

Acceptance criteria:

- Users can configure notification preferences.
- Important notifications must not spam.
- Reminder should not repeat unnecessarily.

### 6.15 WhatsApp Chatbot

The WhatsApp chatbot is a family-only MVP input channel using `whatsapp-web.js`.

Provider decision:

- Use `whatsapp-web.js` first.
- This is free and suitable for personal/family use.
- It is not treated as a public production integration.
- The architecture must allow migration to Meta WhatsApp Cloud API later.

Architecture:

- Node.js gateway handles WhatsApp Web connection.
- Laravel handles all parsing, validation, finance logic, persistence, reporting, and reminders.
- Node gateway forwards incoming private messages to Laravel.
- Laravel returns replies through the gateway.

Supported chat inputs:

```text
Beli bensin 50rb
bensin 50k
bensin 50.000
bensin 50000
```

All examples must parse to:

```text
amount: 50000
category: Transportation
type: expense
merchant/title: Bensin
```

Supported amount formats:

- `50rb`.
- `50ribu`.
- `50k`.
- `50.000`.
- `50000`.
- `1jt`.
- `1 juta`.
- `1,5jt`.

Parser behavior:

- Remove common verbs such as `beli`, `bayar`, `buat`, and `jajan`.
- Use the remaining text as merchant/title.
- Match categories from user categories and defaults.
- Map examples:
  - `bensin`, `tol`, `parkir`, `gojek`, `grab` -> Transportation.
  - `nasgor`, `makan`, `kopi`, `warung`, `ayam` -> Food and Drinks.
  - `gaji`, `salary`, `bonus` -> Income categories.
- If category is uncertain, use Other and mention it in confirmation.

Confirm-before-save flow:

```text
User: bensin 50k
Bot: Record expense Bensin Rp50,000, category Transportation, from Cash? Reply OK or Batal.
User: OK
Bot: Recorded. Cash balance is now Rp...
```

Rules:

- Free-form messages create drafts only.
- Save only when user replies `OK`.
- Cancel when user replies `Batal`.
- Draft expires after a short period such as 15 minutes.
- Unknown phone number receives setup/help response.
- Duplicate WhatsApp message IDs must not create duplicate drafts or transactions.

Smart reminder:

- Default time: 21:00 WIB.
- Message: `Any expenses today? Record them quickly.`
- Max once per day per user.
- Skip if the user already recorded a transaction that day.
- User can disable reminder.

Budget and report commands:

- `budget` shows opening balance, income, recorded expense, current balance, remaining budget, and untracked money.
- `report` shows current month summary.
- `saldo awal 5jt` records opening balance snapshot.
- `saldo sekarang 3jt` records current balance snapshot.
- `batal` cancels active draft.

Acceptance criteria:

- WhatsApp-created transactions appear on website.
- WhatsApp-created transactions affect balances, budgets, dashboard, and reports.
- WhatsApp input follows the same account permission and family visibility rules.
- Reminder is not spammy.
- WhatsApp session and secrets are never committed to Git.

### 6.16 AI Insights

AI helps users understand finances and take action.

AI features:

- Monthly analysis.
- Saving recommendation.
- Spending recommendation.
- Debt analysis.
- Family financial summary when allowed.
- Action plan generation.
- Later: AI chat, AI classification, anomaly detection.

Rules:

- AI receives backend-computed metrics.
- AI must mention the analysis period.
- AI must distinguish actual data from estimates.
- AI must not provide guaranteed investment claims.
- AI must not reveal private family member data.
- AI output must be validated before storage.

### 6.17 Export and Backup

Formats:

- CSV in MVP.
- Excel later.
- PDF later.

Acceptance criteria:

- User can export transactions and reports.
- Family admin can export family reports only according to permissions.
- Export should create audit log entries.

### 6.18 PWA

The PWA makes the web app installable on Android and iPhone.

Requirements:

- Web app manifest.
- Icons.
- Theme color.
- Standalone display.
- Service worker.
- Offline fallback.
- Static asset caching.
- Online-first financial persistence.
- Mobile responsive layout.
- iPhone Add to Home Screen guide.

Rules:

- Do not cache private financial responses by default.
- Do not treat offline financial mutation as saved.
- Offline drafts must be clearly marked as unsaved.

## 7. Data Model

### Existing Core Tables

#### users

- id.
- name.
- email.
- password.
- email_verified_at.
- remember_token.
- timestamps.

#### financial_profiles

- id.
- user_id.
- monthly_income.
- household_size.
- risk_profile.
- priorities.
- timestamps.

#### families

- id.
- owner_user_id.
- name.
- currency.
- timestamps.

#### family_members

- id.
- family_id.
- user_id.
- role.
- status.
- joined_at.
- timestamps.

#### financial_accounts

- id.
- user_id.
- family_id.
- name.
- bank_name.
- account_holder_name.
- account_number.
- type.
- initial_balance.
- current_balance.
- currency.
- visibility.
- is_active.
- timestamps.
- soft deletes.

#### categories

- id.
- user_id.
- family_id.
- parent_id.
- name.
- type.
- color.
- icon.
- is_default.
- is_essential.
- is_savable.
- is_lifestyle.
- timestamps.
- soft deletes.

#### finance_transactions

- id.
- user_id.
- family_id.
- financial_account_id.
- category_id.
- saving_goal_id.
- type.
- amount.
- transaction_date.
- description.
- merchant.
- tags.
- visibility.
- need_type.
- is_recurring.
- recurring_rule_id.
- metadata.
- timestamps.
- soft deletes.

#### transfers

- id.
- user_id.
- family_id.
- from_account_id.
- to_account_id.
- amount.
- transfer_date.
- description.
- timestamps.

#### budgets

- id.
- user_id.
- family_id.
- category_id.
- period_type.
- period_start.
- period_end.
- amount.
- timestamps.

#### saving_goals

- id.
- user_id.
- family_id.
- financial_account_id.
- name.
- target_amount.
- current_amount.
- target_date.
- priority.
- status.
- timestamps.

#### debts

- id.
- user_id.
- family_id.
- name.
- type.
- lender.
- principal_amount.
- outstanding_amount.
- monthly_payment.
- minimum_payment.
- interest_rate.
- start_date.
- tenor_months.
- remaining_tenor_months.
- due_day.
- next_due_date.
- payment_account_id.
- category_id.
- auto_generate_expense.
- include_in_monthly_expense.
- status.
- timestamps.

#### debt_payments

- id.
- debt_id.
- user_id.
- family_id.
- finance_transaction_id.
- payment_account_id.
- amount.
- principal_amount.
- interest_amount.
- fee_amount.
- due_date.
- paid_at.
- status.
- notes.
- timestamps.

#### ai_analyses

- id.
- user_id.
- family_id.
- period_start.
- period_end.
- analysis_type.
- input_snapshot.
- metrics_snapshot.
- result_summary.
- recommendations.
- model_name.
- status.
- timestamps.

#### ai_recommendations

- id.
- ai_analysis_id.
- user_id.
- family_id.
- type.
- title.
- description.
- category_id.
- estimated_saving_amount.
- confidence_score.
- status.
- due_date.
- timestamps.

#### notifications

- id.
- type.
- notifiable_type.
- notifiable_id.
- data.
- read_at.
- timestamps.

#### audit_logs

- id.
- actor_user_id.
- family_id.
- action.
- entity_type.
- entity_id.
- old_values.
- new_values.
- ip_address.
- user_agent.
- created_at.

### New Tables for WhatsApp and Lazy Tracking

#### whatsapp_user_settings

- id.
- user_id.
- phone.
- is_enabled.
- verified_at.
- default_financial_account_id.
- default_visibility.
- default_need_type.
- daily_reminder_time.
- last_reminder_sent_at.
- timestamps.

#### whatsapp_transaction_drafts

- id.
- user_id.
- financial_account_id.
- category_id.
- raw_message.
- parsed_payload.
- confidence_score.
- status.
- expires_at.
- confirmed_at.
- finance_transaction_id.
- provider_message_id.
- timestamps.

#### whatsapp_message_logs

- id.
- provider.
- provider_message_id.
- from_phone.
- user_id.
- direction.
- body.
- status.
- processed_at.
- timestamps.

#### balance_snapshots

- id.
- user_id.
- financial_account_id.
- period_month.
- snapshot_type.
- amount.
- snapshot_date.
- source.
- timestamps.

## 8. API and Routes

### Web Routes

- `/` custom login page for guests.
- `/dashboard`.
- `/accounts`.
- `/categories`.
- `/transactions`.
- `GET /transactions` includes smart transaction suggestions as an Inertia prop.
- `/transfers`.
- `/budgets`.
- `/saving-goals`.
- `/debts`.
- `/reports`.
- `/reports/export`.
- `/ai-insights`.
- `/families`.
- `/settings/profile`.
- `/settings/password`.
- `/settings/appearance`.
- `/settings/whatsapp`.

### Internal WhatsApp Routes

Laravel endpoints used by the Node gateway:

- `POST /internal/whatsapp/messages`.
- `POST /internal/whatsapp/status`.

Node gateway endpoints used by Laravel:

- `POST /send-message`.
- `GET /health`.

Internal API rules:

- Use a shared secret or request signature.
- Do not use browser session authentication for internal gateway calls.
- Incoming payload must include `message_id`, `from_phone`, `body`, `timestamp`, and `provider`.
- Laravel must process messages idempotently by `message_id`.
- Node gateway must reject unauthenticated public requests.

## 9. Architecture

### Backend Layering

Controllers:

- Receive request.
- Validate input.
- Check authorization.
- Call service/action.
- Return redirect, Inertia response, JSON, or stream response.

Services:

- Own business logic.
- Own financial calculations.
- Own database transactions.
- Reused by controllers, jobs, commands, tests, and WhatsApp handlers.

Jobs/Commands:

- Run reminders.
- Run AI analysis.
- Run exports.
- Run background notification work.

### Required Core Services

- `TransactionService`.
- `TransactionSuggestionService`.
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

### WhatsApp Architecture

```text
WhatsApp private chat
  -> Node gateway using whatsapp-web.js
  -> Laravel internal endpoint
  -> WhatsAppCommandService
  -> Parser or report/reminder handler
  -> Existing finance services
  -> Database
  -> Laravel reply
  -> Node gateway
  -> WhatsApp user
```

Rules:

- Node gateway is transport only.
- Laravel owns all finance behavior.
- Gateway provider must be replaceable.

## 10. Validation Rules

### Transaction Validation

- Amount must be numeric and greater than 0.
- Type must be `income`, `expense`, or `saving`.
- Transaction date must be a valid date.
- Account must be owned by the user or accessible through family permissions.
- Category must match transaction type.
- Saving goal is required for saving transactions.
- Visibility must be valid.
- Need type must be valid.
- Merchant/title is required for normal transaction input.
- Quick Add suggestions are read-only presets and must still submit through the normal transaction validation and `TransactionService`.
- Quick Add must not trust client-provided suggestion IDs for authorization or money movement.

### WhatsApp Input Validation

- Message must come from a verified or linked WhatsApp number.
- Parser must find a valid amount before creating a draft.
- Amount must normalize to integer rupiah.
- Draft must have valid account, category, type, amount, and user.
- `OK` only confirms the current active draft for the same user.
- Expired drafts cannot be saved.
- Unknown phone number must receive setup/help response.
- Duplicate message IDs must not create duplicate records.

### Family Access Validation

- User can always use their own active account.
- User can use family-related accounts only through active membership and existing rules.
- Family visibility is applied when a transaction uses a shared family account or another family member's accessible account.

## 11. Non-Functional Requirements

### Security

- No secrets in Git.
- No OpenAI API keys in frontend.
- No WhatsApp session files in Git.
- Internal gateway routes require secret/signature validation.
- All family access must be checked.
- Authenticated financial data must not be cached publicly.

### Performance

- Dashboard and reports should load quickly for normal household usage.
- Monthly reports should stay efficient with indexed transaction queries.
- Large exports may become async later.

### Reliability

- Financial mutations must be atomic.
- Balance recalculation must be possible.
- WhatsApp duplicate messages must be idempotent.
- WhatsApp session logout should not corrupt finance data.

### Privacy

- Private transactions must remain private.
- Family reports must anonymize or hide details when permission does not allow detail view.
- WhatsApp replies should be concise and avoid exposing another member's private data.

## 12. Testing Strategy

### Required Tests

- Transaction service updates balances.
- Expense cannot make account balance negative.
- Transaction update/delete recalculates balances.
- Transaction suggestions use only the authenticated user's own history.
- Transaction suggestions choose the most frequent merchant/title details, category, account, need type, and amount.
- Transaction suggestions exclude deleted, inactive, mismatched, and inaccessible records.
- `/transactions` includes suggestion props without leaking another user's merchants.
- Transfer moves balances correctly.
- Debt payment creates expense and reduces outstanding debt.
- Monthly report totals are correct.
- Family report includes active members only.
- Unauthorized user cannot use unrelated accounts.
- Shared family account follows access rules.
- AI fallback works without OpenAI key.
- WhatsApp parser handles `50rb`, `50ribu`, `50k`, `50.000`, `50000`, `1jt`, `1 juta`, and `1,5jt`.
- WhatsApp draft is created, confirmed, canceled, and expired correctly.
- WhatsApp-created transaction updates account balance through `TransactionService`.
- Reminder sends at most once per day and skips users with transactions that day.
- Untracked money calculation is correct.

### Manual Checks

- PWA installability.
- Mobile dashboard layout.
- Offline fallback.
- WhatsApp QR login.
- WhatsApp session persistence.
- WhatsApp message send/receive.

## 13. Roadmap

### Phase 0 - Foundation

- Laravel 13 setup.
- React + Inertia setup.
- Auth.
- Database.
- Core layout.
- PWA shell.
- Testing setup.

### Phase 1 - Core Finance

- Accounts.
- Categories.
- Income.
- Expense.
- Smart click-first Quick Add transaction entry.
- Saving transactions.
- Transfers.
- Balance updates.
- Basic dashboard.
- Reports.

### Phase 2 - Family, Debt, Budget, Savings

- Family management.
- Family access rules.
- Budgets.
- Saving goals.
- Debts.
- Debt payments.
- Family dashboard.
- Family reports.

### Phase 3 - AI MVP

- Financial metrics.
- AI monthly analysis.
- Saving recommendation.
- Spending recommendation.
- Debt recommendation.
- Action plans.

### Phase 4 - WhatsApp and Lazy Tracking

- `whatsapp-web.js` gateway.
- WhatsApp user settings.
- WhatsApp parser.
- Transaction drafts.
- Confirm-before-save.
- Smart daily reminder at 21:00 WIB.
- Balance snapshots.
- Untracked money.
- Budget/report commands.

### Phase 5 - Advanced Finance and AI

- Emergency fund detail.
- Manual investment portfolio.
- Recurring transactions.
- Email notifications.
- PDF/Excel export.
- AI chat.
- AI classification.
- AI anomaly detection.

### Future Production WhatsApp Migration

- Replace `whatsapp-web.js` gateway with Meta WhatsApp Cloud API.
- Keep Laravel WhatsApp command and finance services unchanged.
- Add official webhook verification, template messages, and production compliance.

## 14. MVP Definition

### MVP P0

- Register, login, logout, reset password.
- Financial accounts.
- Categories.
- Income.
- Expense.
- Transfers.
- Debts and debt payments.
- Budgets.
- Saving goals.
- Personal dashboard.
- Basic family management.
- Basic family dashboard.
- Monthly reports.
- CSV export.
- PWA installability.
- Authorization rules.
- Important tests.

### P1 After MVP

- AI monthly analysis.
- AI saving and spending recommendations.
- WhatsApp chatbot with `whatsapp-web.js`.
- Smart WhatsApp reminder.
- Lazy tracking.
- Untracked money.
- Better family permissions.
- Email notifications.

### P2 Later

- OCR receipts.
- Bank/e-wallet integration.
- Native mobile app.
- Advanced investment portfolio.
- Predictive cash flow.
- Public production WhatsApp integration.

## 15. Success Metrics

- Users record at least major expenses consistently.
- Users can save repeated transactions with taps and minimal typing.
- Users understand monthly cash flow without recording every small transaction.
- WhatsApp input reduces friction compared to website-only input.
- Dashboard and reports show accurate recorded data.
- Untracked money helps identify missing spending.
- No cross-user or cross-family data leaks.
- AI recommendations are based on backend-calculated metrics.

## 16. Key Product Decisions

- Start with Laravel 13, React 19, Inertia 3, Tailwind CSS 4, MySQL, and PWA.
- Use Laravel services as the single finance domain layer.
- Keep React focused on UI.
- Start WhatsApp integration with `whatsapp-web.js` for family-only MVP.
- Keep WhatsApp provider behind a gateway contract for later Meta Cloud API migration.
- Do not start with direct bank integration.
- Do not make AI a free-form finance authority before deterministic metrics are reliable.
- Use online-first persistence for financial data.
- Treat untracked money as a visibility feature, not an automatic transaction.

## 17. Definition of Done

- Main flows are implemented with validation and authorization.
- Financial mutations use database transactions.
- Account balances remain consistent.
- Reports match transaction data and permissions.
- WhatsApp bot saves only confirmed drafts.
- WhatsApp reminders avoid spam.
- Untracked money calculation is tested.
- No secrets are committed.
- Relevant tests pass.
- Documentation stays updated when architecture changes.
