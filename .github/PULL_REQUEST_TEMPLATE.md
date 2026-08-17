## 📝 Description
Provide a concise summary of the changes made and the motivation behind them.

Fixes #(issue)

---

## 🛠️ Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 📱 Android App update
- [ ] ⚡ Performance improvement
- [ ] 🎨 UI / UX refinement
- [ ] 📚 Documentation / SEO update
- [ ] 🔒 Security hardening

---

## 🔍 Architecture & Client-Side Safety Checklist
Push44 is a **100% client-side zero-backend** application. Please verify:
- [ ] **No Backend Code**: I have NOT added Express/Fastify servers, remote databases, or server-side session stores.
- [ ] **No `server/` Directories**: All API utilities are located under `src/lib/`, never `src/lib/server/`.
- [ ] **SSR Safe**: Any browser-specific APIs (`localStorage`, `window`, `navigator`) are wrapped in `useEffect` or client-side checks to prevent hydration mismatches.
- [ ] **No Secret Leaks**: No personal tokens, API keys, or private environment variables are committed.

---

## 🧪 Testing & Verification
- [ ] Tested locally with `bun dev` (or `bun run build`)
- [ ] Verified on mobile / desktop viewports
- [ ] TypeScript type checks pass with 0 errors
- [ ] Verified that credentials remain strictly in local storage
