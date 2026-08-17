# Contributing to Push44

Thank you for your interest in contributing to Push44! We welcome contributions from developers around the world to expand AI builder support, improve performance, and enhance developer code ownership.

---

## 🛠️ Development Setup

Push44 is built with **TanStack Start / Router**, **React 19**, **Vite 8**, **Tailwind CSS 4**, and **Bun**.

### Prerequisites
- [Bun](https://bun.sh) (v1.1+ recommended)
- Node.js (v20+)
- Git

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/Push44.git
cd Push44
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Start Local Development Server
```bash
bun dev
```
Visit `http://localhost:5173` to see the live app.

### 4. Android APK Development (Optional)
If contributing to the native Android WebView integration:
- Requirements: Android SDK 34, JDK 17
```bash
cd android
./gradlew assembleDebug
```

---

## 📐 Architecture Rules for Contributors

1. **Zero Backend Constraint**: Never introduce backend servers, Express/Fastify processes, or remote databases. Push44 is 100% client-side.
2. **Directory Placement**: Never place code in a directory matching `**/server/**` (blocked by `@lovable.dev/vite-tanstack-config`). All API helpers live in `src/lib/*.ts`.
3. **SSR Hydration Safety**: Client-specific state (reading `localStorage`, `window.innerWidth`, `navigator.userAgent`) must be inside `useEffect`, not evaluated directly at component render time.
4. **Package Manager**: Always use `bun` (never `npm` or `yarn`).

---

## 🚀 Submitting a Pull Request

1. **Create a branch**:
   ```bash
   git checkout -b feat/support-new-platform
   ```
2. **Commit with Conventional Commits**:
   - `feat: add export support for ExampleAI`
   - `fix: resolve auth token refresh issue`
   - `docs: update SEO guides`
3. **Verify Build**:
   ```bash
   bun run generate-seo
   bun run build
   ```
4. **Push & Open a Pull Request** targeting the `main` branch.
