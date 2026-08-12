# EasyStore Mobile

React Native (Expo) client for the EasyStore marketplace — buyer storefront, vendor dashboard, staff POS, and platform admin in one app.

## Stack

- Expo SDK 57 + Expo Router (file-based routing)
- Redux Toolkit + RTK Query (mirrors the web app's API layer)
- TypeScript strict — zero `any`
- expo-secure-store (JWT), AsyncStorage + redux-persist (guest cart, sale cart)
- socket.io-client (messaging), expo-camera (barcode), expo-web-browser (Paystack)
- react-native-gifted-charts (analytics), react-hook-form + zod

## Getting started

```bash
npm install
npx expo start        # scan the QR with Expo Go
npx expo start --android
```

### API base URL

Defaults to `http://localhost:3000`. Override per environment:

```bash
# .env (project root of easystore-mobile)
EXPO_PUBLIC_API_URL=https://api.eazystore.com.ng
```

Note: Android emulators reach the host machine at `http://10.0.2.2:3000`.

## Architecture

```
src/app/             Expo Router routes (file-based)
  (auth)/            login, signup, verify-otp, forgot/reset password
  (storefront)/      buyer tabs: home, search, cart, account
  (vendor)/          vendor dashboard: products, orders, customers, staff, POS,
                     sales-history, payouts, school-zones, analytics, settings
  (staff)/           permission-gated POS + sales history + settings
  (admin)/           platform overview, users, vendors, orders, transactions,
                     payouts, installments, zones, broadcasts, notifications,
                     reports, logs, analytics, access control
  product/ store/ zone/ category/ …   shared routes for all personas
src/api/             RTK Query slices (auth, product, order, cart, store, staff,
                     admin, installment, zone, messaging, upload, …)
src/components/ui     theme-driven UI kit (Button, Input, Modal, Select, Card,
                     Skeleton, EmptyState, StatsCard, Form* wrappers, Toast)
src/components/shared ProductCard, PaginatedList, StatusBadge, ImageUpload, …
src/features/        Redux slices (auth, ui, cart, saleCart)
src/theme/           brand theme (#17c06e), light/dark
src/types/           API entity types (mirrors web types/)
src/utils/           money (kobo→NGN), error, validators, upload, permissions
```

## Personas (role-based routing)

| account_type | Landing | Notes |
|---|---|---|
| `user` | `/home` storefront | browse, cart, checkout, orders, installments, messaging |
| `vendor` | `/vendor` | store management incl. POS sales terminal |
| `staff` | `/staff` | POS only — nav gated by `GET /staff/permissions` |
| `admin` | `/admin` | platform management |

## Verification

```bash
npx tsc --noEmit         # strict typecheck — must be clean
npx expo lint            # eslint — must be clean
npx expo export --platform android   # production bundle check
```

## Repo conventions

- Commits are per-iteration (`Iter N: …`) — see `git log`.
- Build outputs (`dist/`, `dist-export/`) are gitignored — never committed.
- Full feature tracklist and iteration log: `../EASYSTORE-MOBILE-TRACKLIST.md`
