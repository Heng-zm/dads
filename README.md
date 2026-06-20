# EXE File Remover — Telegram Mini App Frontend

A professional cybersecurity dashboard Mini App for the EXE File Remover Security Bot. Built with React + TypeScript + Vite + Tailwind CSS + shadcn/ui.

---

## Features

- Auto-login via Telegram WebApp `initData`
- Full dark/light theme via Telegram theme params
- Mobile-first responsive UI with bottom navigation
- Haptic feedback on key actions
- Telegram BackButton & MainButton integration
- All 13 pages fully implemented with real API calls
- Skeleton loading states everywhere
- Graceful error handling (401, 403, 404, network)

---

## Project Structure

```
src/
  main.tsx               # Entry point
  App.tsx                # Root component + routing + auth gate
  vite-env.d.ts          # Vite env types
  index.css              # Global styles + Telegram theme vars
  lib/
    api.ts               # All API calls + TypeScript types
    telegram.ts          # Telegram WebApp SDK wrapper
    utils.ts             # Helper utilities
  hooks/
    useTelegram.ts       # Telegram SDK state hook
    useAuth.ts           # Auth session hook
    useApi.ts            # Generic data fetching + mutation hooks
  components/
    ui/                  # shadcn-style UI primitives
      button.tsx
      card.tsx
      badge.tsx
      tabs.tsx
      form-elements.tsx  # Switch, Input, Label, Select, Skeleton, Alert, Textarea
      dialog.tsx
      avatar.tsx
    layout/
      AppShell.tsx       # Page wrapper with header + bottom nav
      BottomNav.tsx      # Mobile bottom navigation
      Header.tsx         # Sticky top header with logo
    common/
      index.tsx          # LoadingScreen, EmptyState, StatCard, HealthDot, etc.
  pages/
    Dashboard.tsx        # Home — profile card, stats, quick actions
    Groups.tsx           # My groups list
    GroupDetail.tsx      # Group admin panel (9 tabs)
    ScannerTest.tsx      # File name scanner test
    Feedback.tsx         # User feedback form
    Settings.tsx         # App settings
    DeveloperDashboard.tsx  # Owner-only dev panel (5 tabs)
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd exe-remover-miniapp
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed — default points to the production API
```

`.env`:
```
VITE_API_BASE=https://exe-file-remover.onrender.com
```

### 3. Run Locally

```bash
npm run dev
# App runs on http://localhost:5173
```

> **Note:** The app will show "Please open this app from Telegram" when accessed directly in a browser, because Telegram `initData` is unavailable. Use ngrok (see below) for local Telegram testing.

### 4. Build for Production

```bash
npm run build
# Output in /dist
```

---

## shadcn/ui Setup Commands

All shadcn components are already included in `src/components/ui/`. If you want to add more components using the CLI:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge tabs switch label input select textarea skeleton alert dialog avatar toast
```

---

## Deploying to Render (Static Site)

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Static Site**.
3. Connect your GitHub repo.
4. Set these options:

| Setting | Value |
|---|---|
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Environment Variable** | `VITE_API_BASE = https://exe-file-remover.onrender.com` |

5. Click **Deploy**. Render gives you a public HTTPS URL like `https://exe-remover-miniapp.onrender.com`.

### Optional: `_redirects` file for SPA routing

Create `public/_redirects`:
```
/* /index.html 200
```

This ensures React Router handles all routes correctly on Render.

---

## Connecting as a Telegram Mini App

### Step 1 — Get your bot token

You need a Telegram bot. If you don't have one, create it via [@BotFather](https://t.me/BotFather):
```
/newbot
```

### Step 2 — Set the Mini App URL

In [@BotFather](https://t.me/BotFather), send:
```
/newapp
```
Or to add a Mini App to an existing bot:
```
/myapps → select your bot → Edit web app URL
```

Set the URL to your deployed frontend:
```
https://exe-remover-miniapp.onrender.com
```

### Step 3 — Add a Menu Button (optional but recommended)

```
/mybots → select your bot → Bot Settings → Menu Button
```
Set the button URL to your Mini App URL.

### Step 4 — Enable `initData` validation on your backend

Your backend at `https://exe-file-remover.onrender.com` already accepts:
```
Authorization: tma <initData>
```

Telegram sends `initData` as a URL-encoded string. Your backend should validate it using the bot token (HMAC-SHA256 with `WebAppData` as the key). This ensures only real Telegram users can authenticate.

### Step 5 — Test

Open Telegram → find your bot → press the Menu button (or use the link `https://t.me/YourBotUsername/app`).

---

## Local Development with Telegram (ngrok)

To test with real Telegram `initData` locally:

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, expose it via ngrok
npx ngrok http 5173

# 3. Copy the HTTPS ngrok URL (e.g. https://abc123.ngrok.io)
# 4. Set it as your Mini App URL in BotFather
# 5. Open the bot in Telegram → tap Menu
```

---

## API Authentication Flow

Every API request includes:

```typescript
headers: {
  "Authorization": `tma ${window.Telegram.WebApp.initData}`,
  "Content-Type": "application/json"
}
```

The auth flow on app launch:

```
App opens → initTelegramApp() → POST /api/auth/session (with initData)
→ Backend validates Telegram signature → Returns UserProfile
→ App renders Dashboard
```

Error handling:
- `401` → "Session expired. Please reopen from Telegram."
- `403` → "You do not have permission."
- `404` → "Resource not found."
- Network error → retry button shown

---

## Pages & API Endpoints

| Page | Method | Endpoint |
|---|---|---|
| Auth | POST | `/api/auth/session` |
| Dashboard | POST | `/api/auth/session` (user profile) |
| My Groups | GET | `/api/me/groups` |
| Group Overview | GET / PATCH | `/api/groups/{chat_id}` / `/api/groups/{chat_id}/settings` |
| Formats | GET/POST/DELETE | `/api/groups/{chat_id}/formats/allowed` + `/blocked` |
| Trusted Hashes | GET/POST/DELETE | `/api/groups/{chat_id}/trusted-hashes` |
| Incidents | GET | `/api/groups/{chat_id}/incidents` |
| Incident Action | POST | `/api/incidents/{token}/action` |
| Risk | GET | `/api/groups/{chat_id}/risk` |
| Admins | GET | `/api/groups/{chat_id}/admins` |
| Health | GET | `/api/groups/{chat_id}/health` |
| Logs | GET | `/api/groups/{chat_id}/logs` |
| Scanner Test | POST | `/api/scan/name` |
| Feedback | POST | `/api/feedback` |
| Dev Overview | GET | `/api/developer/overview` |
| Dev Users | GET | `/api/developer/users` |
| Dev Groups | GET | `/api/developer/groups` |
| Dev Feedback | GET | `/api/developer/feedback` |
| Runtime Config | GET / PATCH | `/api/developer/runtime-config` |

---

## Telegram SDK Features Used

| Feature | Usage |
|---|---|
| `initData` | Auth header for every API call |
| `initDataUnsafe.user` | Pre-populate user info |
| `colorScheme` | Auto dark/light mode |
| `themeParams` | Telegram brand colors |
| `HapticFeedback` | Impact + notification feedback on actions |
| `BackButton` | Group detail ← back navigation |
| `MainButton` | Save actions (optional, wired in group settings) |
| `expand()` | Full-screen on open |
| `ready()` | Signal Telegram the app has loaded |
| `openLink()` | Open external URLs safely |

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| @radix-ui/* | latest | Accessible primitives |
| lucide-react | 0.368 | Icons |
| react-router-dom | 6 | Routing |
| sonner | 1.4 | Toast notifications |
| class-variance-authority | 0.7 | Component variants |
| tailwindcss-animate | latest | Animations |
# dads
