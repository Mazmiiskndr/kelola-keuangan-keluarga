# PWA Requirements

This document defines the Progressive Web App requirements for Kelola Keuangan Keluarga. The PWA is the mobile delivery strategy for the web app, while WhatsApp is a separate daily input channel.

## 1. Goal

The PWA should allow users to:

- Access the app as a normal website.
- Install the app on Android where supported.
- Add the app to iPhone Home Screen.
- Use the finance dashboard and forms comfortably on mobile.
- Keep all final financial data saved on the Laravel server.

## 2. MVP Scope

PWA is P0.

MVP features:

- Web app manifest.
- App icons.
- Theme color.
- Standalone display mode.
- Service worker.
- Offline fallback.
- Static asset caching.
- Install prompt for supported browsers.
- Manual iPhone install guide.
- Responsive mobile layout.
- Safe-area support for iPhone.
- Online-first financial persistence.

Out of scope for MVP:

- Native Android app.
- Native iOS app.
- Offline-first full transaction input.
- Background sync for financial mutations.
- Web push notification as the main reminder channel.
- WhatsApp bot implementation inside the service worker or browser.

## 3. Data Persistence Model

The installed PWA connects to the same Laravel application and MySQL database as the website.

When online:

- User submits a finance action from React/Inertia.
- Laravel validates input.
- Laravel checks authorization.
- Laravel runs business logic in services.
- Data is saved to MySQL.
- The same data is visible from website, PWA, and WhatsApp-created records.

When offline:

- The PWA cannot save final financial changes to the server.
- The app must not show offline financial changes as successfully saved.
- If local draft support is added later, drafts must be clearly marked as unsaved.
- The user should be asked to retry when online.

Future offline plan:

- Local draft transactions.
- Sync queue.
- Conflict resolution.
- Local encryption.
- Per-item sync status: draft, pending, saved, failed.

## 4. Platform Targets

### Android

- Modern browsers that support install prompts.
- Home Screen installation.
- Standalone app display where supported.

### iPhone

- Add to Home Screen through Safari share menu.
- Correct app icon.
- Safe-area layout.
- Manual install guide because iOS install prompts are limited.

Notes:

- PWA support varies by browser and OS version.
- Web push should remain P1 because permission and support differ across platforms.

## 5. Manifest Requirements

Manifest must include:

- `name`.
- `short_name`.
- `description`.
- `start_url`.
- `scope`.
- `display`.
- `background_color`.
- `theme_color`.
- `icons`.

Recommended values:

- `display`: `standalone`.
- `start_url`: `/dashboard`.
- `scope`: `/`.
- Icons: at least 192x192 and 512x512.
- Include maskable icon.

## 6. Service Worker Requirements

Service worker must:

- Cache app shell and static assets.
- Provide offline fallback.
- Avoid caching authenticated finance responses by default.
- Use a clear update strategy.
- Allow sensitive cache cleanup on logout when applicable.

Initial strategy:

- Static assets: cache-first.
- Offline fallback: cache-first.
- Authenticated pages/API: network-only.
- Public pages: network-first or safe stale-while-revalidate.

## 7. Security and Privacy

Required rules:

- Do not store OpenAI API key in browser.
- Do not store WhatsApp gateway secrets in browser.
- Do not cache private transaction data without a secure offline design.
- Do not store sensitive finance data in localStorage unless there is a clear need.
- Clear sensitive storage on logout when applicable.
- Final finance data must come from the server database, not only browser cache.
- Offline mode must never silently create final finance records.

## 8. Relationship With WhatsApp

WhatsApp is not part of the PWA runtime.

- WhatsApp input comes through a separate Node.js `whatsapp-web.js` gateway.
- Laravel processes WhatsApp messages and saves confirmed records.
- Once saved, WhatsApp-created transactions appear in the same PWA dashboard and reports.
- PWA may provide WhatsApp settings UI.
- PWA must not hold WhatsApp session files, QR auth data, or gateway secrets.

## 9. Mobile UX Requirements

- Dashboard must be easy to scan on mobile.
- Sidebar should become a drawer or mobile-friendly navigation.
- Primary actions must be reachable.
- Finance forms must be comfortable with the mobile keyboard.
- Offline state must be clear.
- Unsaved changes must be clearly marked.
- iPhone install guide must be concise.
- Do not request notification permission too early.
- Untracked-money warnings should be concise and not alarming.

## 10. Testing Checklist

- Manifest is valid.
- Icons render correctly.
- Install prompt appears where supported.
- iPhone Add to Home Screen works.
- Standalone mode works.
- Offline fallback appears when network is unavailable.
- Logout cleans sensitive cache/storage where applicable.
- Dashboard does not overflow on mobile.
- Finance forms are usable on mobile.
- Online changes save to Laravel/MySQL.
- Offline submit is not marked as saved.
- No API keys or secrets are present in frontend bundle.
- WhatsApp-created transactions appear correctly in PWA views after server save.

## 11. Roadmap

P1:

- Web push notification.
- Budget and debt reminders through push.
- Update available prompt.
- App shortcuts.
- WhatsApp settings UI in app settings.

P2:

- Offline transaction drafts.
- Background sync.
- Native wrapper if the PWA is validated but app store distribution is needed.

## 12. References

- MDN Progressive Web Apps: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- Apple Safari Web Content Guide: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
- Apple WWDC - What's new in web apps: https://developer.apple.com/videos/play/wwdc2023/10120/
