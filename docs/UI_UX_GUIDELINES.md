# UI/UX Guidelines

This document guides the visual and interaction design for Kelola Keuangan Keluarga. The app should feel like a practical financial tool for repeated use, not a marketing landing page.

Vuexy Admin may be used as UX inspiration for layout patterns, but do not copy its source code, assets, exact colors, or design.

## 1. Visual Direction

The interface should feel:

- Modern.
- Professional.
- Calm.
- Organized.
- Easy to scan.
- Suitable for personal and family finance.
- Comfortable for daily use.
- Natural when installed as a PWA on mobile.

Avoid visual clutter. Financial data should be readable at a glance.

## 2. Main Layout

### Desktop

- Left sidebar, fixed or collapsible.
- Header/topbar inside the content area.
- Comfortable content width.
- Dashboard grid that prioritizes the most important metrics.
- First viewport should answer the user's current financial condition.

### Mobile

- Sidebar becomes drawer or mobile navigation.
- Cards stack in one column.
- Charts remain readable.
- Tables need responsive list or compact mode.
- Use safe-area padding for iPhone.
- Keep important controls away from unsafe screen edges.
- Finance forms must work well with mobile keyboard.

## 3. Navigation

Main navigation:

- Dashboard.
- Transactions.
- Accounts.
- Categories.
- Budgets.
- Saving Goals.
- Debts.
- Reports.
- AI Insights.
- Family.
- Settings.

Future navigation/settings:

- WhatsApp settings.
- Notification preferences.

Rules:

- Use icon + label.
- Active state must be clear.
- Group items if navigation becomes long.
- Show family features according to permission.

## 4. Personal Dashboard

Priority components:

- Total balance.
- Monthly income.
- Monthly expense.
- Net cash flow.
- Debt due this month.
- Budget progress.
- Saving goal progress.
- Largest expenses.
- Expense by category.
- Income vs expense trend.
- Untracked money.
- AI insight preview.
- Quick menu.

The first viewport should answer:

- How much money do I have now?
- How much did I earn and spend this month?
- What debt is due?
- Where did most money go?
- Is there untracked money?
- What action matters most?

## 5. Family Dashboard

Priority components:

- Total family balance.
- Family income.
- Family expense.
- Family cash flow.
- Family debt due.
- Spending by member when permission allows.
- Largest family expenses.
- Family budget.
- Family saving goals.
- AI family recommendation.

Privacy:

- Do not expose private member details without permission.
- If details are hidden, show aggregate values with clear labels.

## 6. Lazy Tracking UX

Lazy tracking exists for users who do not record every small expense.

Show:

- Opening balance.
- Recorded income.
- Recorded expense.
- Current balance.
- Remaining budget.
- Untracked money.

Tone:

- Use calm wording.
- Do not shame the user.
- Make the gap actionable.

Example:

```text
Rp500,000 is not tracked this month.
```

Do not present untracked money as a confirmed expense unless the user creates an adjustment transaction.

## 7. WhatsApp UX

WhatsApp should be fast and low-friction.

Supported examples:

- `Beli bensin 50rb`.
- `bensin 50k`.
- `bensin 50.000`.
- `bensin 50000`.

Confirmation message pattern:

```text
Record expense Bensin Rp50,000, category Transportation, from Cash? Reply OK or Batal.
```

Rules:

- Keep replies short.
- Ask for confirmation before saving.
- Show category and account in confirmation.
- Tell the user when category is a fallback.
- After saving, show a short success message and updated balance.
- Use `Batal` to cancel active draft.
- For unknown phone numbers, send setup guidance without exposing data.

Reminder message:

```text
Any expenses today? Record them quickly.
```

Reminder rules:

- Default time is 21:00 WIB.
- At most once per day.
- Skip if the user already recorded a transaction that day.

## 8. Design Tokens

Recommended colors:

- Light background: white or very light slate.
- Dark background: neutral/slate dark.
- Primary: restrained blue or indigo.
- Success: green.
- Warning: amber.
- Danger: red or rose.
- Info: sky or cyan.

Financial meaning:

- Income: green.
- Expense: red or rose.
- Saving: blue or teal.
- Debt: amber/orange.
- Investment: violet or teal.
- Untracked money: amber, because it is a warning, not an error.

Avoid one-note palettes. Use color to clarify data meaning.

## 9. Component Standards

Base components:

- Button.
- Input.
- Select.
- Date picker.
- Dialog/modal.
- Sheet/drawer.
- Tabs.
- Badge.
- Card.
- Table.
- Dropdown menu.
- Toast.
- Tooltip.
- Progress bar.
- Skeleton loading.

Finance components:

- Money display.
- Percentage change.
- Category badge.
- Account badge.
- Budget progress.
- Saving goal progress.
- Debt status badge.
- Untracked money indicator.
- Recommendation card.
- Financial health summary.

## 10. Chart Guidelines

Needed charts:

- Line or bar chart for income/expense trend.
- Bar chart for category comparison.
- Donut or list-style breakdown for expense composition.
- Progress chart for budget and saving goals.
- Sparkline for compact trend cards when useful.

Rules:

- Do not use 3D charts.
- Do not overload charts with too many colors.
- Money labels must be clear.
- Tooltips should show amount and percentage.
- Empty data must have a useful empty state.

## 11. Empty States

Every major page needs an empty state.

Examples:

- No transactions yet.
- No accounts yet.
- No budgets yet.
- No debts yet.
- No balance snapshots yet.
- AI needs more data.
- WhatsApp is not connected yet.

Empty states should provide a clear action, such as creating an account, adding a transaction, setting up WhatsApp, or creating a budget.

## 12. Loading and Submission States

Use:

- Thin progress indicator during Inertia navigation.
- Skeletons for cards and tables.
- Disabled submit buttons while processing.
- Clear success/error feedback.
- Optimistic UI only for safe actions.

Financial mutations should wait for server confirmation.

## 13. PWA UX

The PWA should feel like a mobile app when opened from Home Screen.

Requirements:

- Install prompt where supported.
- Manual iPhone install guide.
- Informative offline fallback.
- Update available prompt when service worker detects a new version.
- Clear app icon.
- Mobile navigation that is easy to reach.

Rules:

- Do not show install prompts too often.
- Do not request notification permission before explaining value.
- Do not show old financial data as current when offline without a clear label.

## 14. Accessibility

- Color contrast must be sufficient.
- Icon-only buttons need labels or tooltips.
- Form errors must be clear.
- Keyboard navigation should work.
- Do not rely only on color for status.
- Money values should use readable spacing and alignment.

## 15. Design Restrictions

- Do not make dashboard pages look like marketing landing pages.
- Do not add excessive decoration.
- Do not nest cards inside cards without a clear need.
- Do not copy Vuexy directly.
- Do not show too many metrics without hierarchy.
- Do not make important financial text too small.
- Do not hide essential actions behind hover-only interactions.

## 16. Theme

- Support light, dark, and system modes.
- Theme toggle must be available on login and authenticated layout.
- Use Tailwind tokens and CSS variables.
- Avoid hardcoded colors that work only in one mode.
- Check forms, selects, date pickers, tables, charts, sidebar, topbar, cards, badges, pagination, modals, and empty states in both light and dark mode.
- Theme preference should persist.
- Avoid distracting color flash during initial load.

## 17. Login Page

- `/` for guests must show the custom login page.
- Authenticated users should redirect to dashboard.
- Login page should represent the product, not default Laravel.
- Desktop may use a split visual/form layout.
- Mobile should focus on a compact form.
- Include app identity, key benefit, and theme toggle.
- Keep explanation short.
- Support remember me, forgot password, and registration when enabled.

## 18. References

- Vuexy Admin Template by Pixinvent: https://pixinvent.com/vuexy-bootstrap-html-admin-template/
- Pixinvent product catalog: https://pixinvent.com/
- MDN Progressive Web Apps: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
