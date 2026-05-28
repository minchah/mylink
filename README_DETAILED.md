# MyLink Project – Detailed Overview

## 📖 Introduction

This document provides a **deep dive** into the **MyLink** web application – a personal link‑manager built with **Next.js (React)**, **TypeScript**, **Tailwind‑styled UI**, and **Firebase** for authentication, Firestore storage, and hosting.

It is meant to sit **alongside the primary `README.md`** in the repository, so anyone browsing the repo on GitHub can instantly see both a quick intro (the original README) **and** a comprehensive technical overview.

---

## 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **Google Sign‑In** | Users authenticate via Google OAuth using Firebase Auth. |
| **Profile & SNS Management** | Display name, bio, and quick‑link entries (GitHub, Instagram, YouTube, Email, etc.). |
| **Link CRUD** | Add, edit, delete, and track click counts for each link. |
| **Real‑time Updates** | Firestore `onSnapshot` streams updates instantly to all clients. |
| **Dark / Light UI** | Premium glass‑morphism style with vibrant gradients and smooth micro‑animations. |
| **Responsive Design** | Mobile‑first layout, works on all screen sizes. |

---

## 🛠️ Tech Stack

- **Framework**: Next.js (latest, configured via `next.config.ts`).
- **Language**: TypeScript + TSX.
- **Styling**: Tailwind‑CSS (custom utilities for glass‑morphism, gradient backgrounds, animated hover states).
- **Backend**: Firebase (Auth, Firestore, Hosting).
- **Deployment**: Vercel (custom domain) **↔** Firebase Hosting (optional redirect). 
- **Tooling**: ESLint, Prettier, `npm` scripts (`dev`, `build`, `start`).

---

## 📁 Repository Structure (relevant files)

```
📦 mylink
├─ 📂 app
│   └─ 📂 mypage
│       └─ page.tsx          # Main page UI & logic
├─ 📂 lib
│   └─ firebase.ts           # Firebase client‑side init (auth, db, analytics)
├─ 📄 firestore.rules        # Security rules (read public, write only owner)
├─ 📄 firebase.json          # Firebase hosting config (points to rules)
├─ 📄 vercel.json            # Vercel rewrites for clean routing
├─ 📄 .env.local             # Local env vars (Firebase config)
├─ 📄 README.md              # Quick start guide (original) 
└─ 📄 README_DETAILED.md    # **This file** – full technical overview
```

---

## 🔐 Firebase Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Links – public read, owner‑only write
    match /links/{docId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Profile – public read, owner‑only write
    match /profile/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

- **Why `request.resource.data.userId`?** Ensures the *incoming* document contains the correct UID, which works both for creating a new profile and for subsequent updates.
- **Links** use `resource.data.userId` because the UID already exists on the stored document.

---

## 🚀 Development Workflow

1. **Clone & Install**
   ```bash
   git clone https://github.com/minchah/mylink.git
   cd mylink
   npm ci   # installs exact versions
   ```
2. **Create `.env.local`** (copy from `.env.example` if present) and fill in your Firebase keys:
   ```text
   NEXT_PUBLIC_FIREBASE_API_KEY=…
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your‑domain.vercel.app   # <- Vercel domain after step 4
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
   NEXT_PUBLIC_FIREBASE_APP_ID=…
   ```
3. **Run locally**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` – sign‑in with Google, add links, edit profile.
4. **Add domain to Firebase**
   - In Firebase Console → Hosting → **Add custom domain** → `your‑domain.vercel.app`.
   - Follow DNS verification steps (TXT/CNAME record on Vercel).  Firebase will auto‑issue an SSL cert.
5. **Add domain to Auth authorized list**
   - Console → Authentication → **Sign‑in method** → **Authorized domains** → add the same Vercel domain.
6. **Deploy to Vercel**
   ```bash
   npx vercel@latest   # follow prompts, set the same custom domain
   ```
7. **Optional – Firebase Hosting redirect**
   - If you also want `https://my‑firebase‑host.web.app` to forward to Vercel, add a rewrite in `firebase.json`:
   ```json
   {
     "hosting": {
       "rewrites": [{ "source": "**", "destination": "https://your-domain.vercel.app" }]
     }
   }
   ```
   - Deploy with `firebase deploy --only hosting`.

---

## 📦 Production Build & Deploy

```bash
npm run build      # creates .next production bundle
npm run start      # runs the compiled server (useful for local prod testing)
```

Vercel automatically runs the build step during each deployment.

---

## 🧪 Testing Tips

- **Firestore rules** can be tested locally with the Firebase emulator suite (`firebase emulators:start`).
- Use Chrome DevTools **Network** tab to verify the OAuth flow and Firestore reads/writes.
- Check console for any `FirebaseError: Missing or insufficient permissions` – if it appears, double‑check the `userId` field is being sent (see the `handleSaveProfile` code). 

---

## 📚 Further Reading & Resources

- **Next.js Documentation** – https://nextjs.org/docs
- **Firebase Web SDK** – https://firebase.google.com/docs/web/setup
- **Vercel Custom Domains** – https://vercel.com/docs/concepts/projects/custom-domains
- **TailwindCSS Glass‑morphism** – https://tailwindcss.com/docs/customizing-colors

---

## 🤝 Contributing

Feel free to open issues or submit PRs. For major changes, open an issue first to discuss the proposed approach.

---

*This file (`README_DETAILED.md`) lives side‑by‑side with the original `README.md`. Both will appear in the repository root on GitHub, giving visitors a quick intro and a full technical guide.*
