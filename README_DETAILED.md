# MyLink 프로젝트 – 상세 소개

## 📖 소개

이 문서는 **MyLink** 웹 애플리케이션에 대한 **전체적인 기술 문서** 입니다. MyLink는 개인용 링크 매니저로, **Next.js (React)**, **TypeScript**, **Tailwind‑CSS** 로 UI를 구현하고 **Firebase**(Auth, Firestore, Hosting)를 백엔드로 사용합니다.

GitHub 저장소의 `README.md` 와 함께 존재하여, 레포지토리를 탐색하는 사람들은 **간단한 소개**와 **깊이 있는 기술 설명**을 동시에 확인할 수 있습니다.

---

## 🎯 핵심 기능

| 기능 | 설명 |
|------|------|
| **구글 로그인** | Firebase Authentication 기반 구글 소셜 로그인 (1초 회원가입) |
| **프로필 & SNS 관리** | 이름, 소개글, GitHub·Instagram·YouTube·Email 등 SNS 카드 설정 및 수정 |
| **링크 CRUD** | 링크 추가 / 인라인 수정 / 삭제, 클릭 카운트 자동 증가 |
| **실시간 업데이트** | Firestore `onSnapshot` 으로 실시간 데이터 스트리밍 |
| **파비콘 자동 추출** | Google Favicon API 로 링크의 파비콘 자동 표시 |
| **URL 자동 포맷팅** | `https://` 가 없을 경우 자동으로 앞에 붙여줍니다 |
| **공개 프로필** | `/닉네임` URL 로 비회원도 프로필 및 링크를 열람 가능 |
| **다크·라이트 UI** | 프리미엄 느낌의 유리모피즘·그라디언트·마이크로 애니메이션 적용 |
| **반응형 디자인** | 모바일·태블릿·데스크톱 모두 최적화된 레이아웃 |
| **Vercel 자동 배포** | GitHub 푸시 시 Vercel 이 자동으로 배포

---

## 🛠️ 기술 스택

- **프레임워크**: Next.js (latest) – 파일 기반 라우팅, 서버 사이드 렌더링
- **언어**: TypeScript + TSX
- **스타일링**: Tailwind‑CSS (커스텀 유틸리티로 유리모피즘, 그라디언트, 마이크로 애니메이션 구현)
- **백엔드**: Firebase (Auth, Firestore, Hosting)
- **배포**: Vercel (커스텀 도메인) ↔ Firebase Hosting (옵션 리다이렉트)
- **도구**: ESLint, Prettier, npm scripts (`dev`, `build`, `start`)

---

## 📁 레포지토리 구조 (주요 파일)

```
mylink/
├─ app/
│   └─ mypage/
│       └─ page.tsx          # 마이페이지 UI·로직 (프로필·링크 관리)
├─ lib/
│   └─ firebase.ts           # Firebase 초기화 (auth, db, analytics)
├─ firestore.rules          # 보안 규칙 (읽기 공개, 쓰기 소유자 제한)
├─ firebase.json            # Firebase Hosting 설정 (rewrites 등)
├─ vercel.json              # Vercel 라우팅·rewrites
├─ .env.local               # 로컬 환경 변수 (Firebase 키)
├─ README.md                # 간단 소개 (GitHub 메인 화면)
└─ README_DETAILED.md      # **이 파일** – 전체 기술 문서
```

---

## 🔐 Firebase 보안 규칙

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Links – 공개 읽기, 소유자만 쓰기
    match /links/{docId} {
      allow read: if true;
      allow create: if request.auth != null;
      // 이미 존재하는 문서의 userId 와 인증 UID 가 일치해야 수정·삭제 가능
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Profile – 공개 읽기, 소유자만 쓰기
    match /profile/{docId} {
      allow read: if true;
      // 신규 생성·업데이트 모두 전송되는 데이터에 userId 가 포함돼야 함
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
- `request.resource.data.userId` 를 사용해 **새 문서 생성** 시에도 UID 검증이 가능하도록 했습니다.
- `links` 컬렉션은 기존 문서에 `resource.data.userId` 를 그대로 사용합니다.

---

## 🚀 개발 워크플로우

1. **클론 & 설치**
   ```bash
   git clone https://github.com/minchah/mylink.git
   cd mylink
   npm ci   # 정확한 버전 설치
   ```
2. **`.env.local` 만들기** (`.env.example` 가 있으면 복사) 그리고 Firebase 프로젝트 키 입력
   ```text
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain.vercel.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
3. **로컬 실행**
   ```bash
   npm run dev
   ```
   `http://localhost:3000` 에서 Google 로그인 → 링크 추가·프로필 수정 테스트
4. **Firebase에 커스텀 도메인 추가**
   - Firebase Console → Hosting → **Add custom domain** → Vercel 에 만든 도메인 입력
   - DNS 레코드(TXT/CNAME) 를 Vercel 에서 설정하면 자동 SSL 발급
5. **Auth 인증된 도메인 허용**
   - Console → Authentication → **Authorized domains** 에 동일 도메인 추가
6. **Vercel에 배포**
   ```bash
   npx vercel@latest   # 프롬프트 따라 진행, 커스텀 도메인 지정
   ```
7. (옵션) **Firebase Hosting 리다이렉트** – Vercel 로 이동하도록 `firebase.json` 에 rewrite 추가 후 `firebase deploy --only hosting`

---

## 📦 Production Build & Deploy

```bash
npm run build      # .next 빌드 생성
npm run start      # 로컬에서 production 서버 실행 (테스트 용도)
```
Vercel 은 배포 시 자동으로 `build` 스크립트를 실행합니다.

---

## 🧪 테스트 팁
- **Firestore 규칙**은 로컬 에뮬레이터(`firebase emulators:start`) 로 검증 가능
- Chrome DevTools **Network** 탭에서 OAuth 흐름·Firestore 읽·쓰기 요청 확인
- `FirebaseError: Missing or insufficient permissions` 가 뜨면 콘솔에 `Saving profile data:` 로그가 있는지, `userId` 가 포함됐는지 재확인

---

## 📚 추가 자료
- **Next.js Docs**: https://nextjs.org/docs
- **Firebase Web SDK**: https://firebase.google.com/docs/web/setup
- **Vercel Custom Domains**: https://vercel.com/docs/concepts/projects/custom-domains
- **TailwindCSS Glass‑morphism**: https://tailwindcss.com/docs/customizing-colors

---

## 🤝 기여 방법
- Issue 를 열어 개선점·버그를 논의 후 Pull Request 를 제출해 주세요.
- 큰 변경은 먼저 Issue 로 의도를 공유하면 리뷰가 원활합니다.

---

*이 파일(`README_DETAILED.md`) 은 `README.md` 와 함께 저장소 루트에 존재합니다. GitHub 에서는 두 파일이 모두 표시돼, 방문자는 **요약**과 **전체 기술 가이드**를 한눈에 볼 수 있습니다.*
