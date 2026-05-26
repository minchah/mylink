# 마이링크 (MyLink)

> AI 코딩으로 만든 개인 링크 관리 서비스

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-orange?logo=firebase)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://mylink-ashy.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 📌 프로젝트 소개

링크트리처럼 여러 링크를 한 페이지에 모아서 관리하고 공유할 수 있는 서비스입니다.

**한양대학교 바이브 코딩 과정**에서 AI 도구를 활용하여 제작했습니다.  
`mylink.vercel.app/닉네임` 하나의 링크로 나의 모든 SNS, 블로그, 포트폴리오를 공유해 보세요!

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 구글 소셜 로그인 | Firebase Authentication 기반 1초 가입 |
| 👤 프로필 페이지 | 이름, 소개글 설정 및 수정 |
| 🔗 링크 CRUD | 링크 추가 / 인라인 수정 / 삭제 |
| 🌐 파비콘 자동 추출 | Google Favicon API로 아이콘 자동 세팅 |
| 📎 URL 자동 포맷팅 | `https://` 누락 시 자동 완성 |
| 🌍 퍼블릭 프로필 | `/닉네임` URL로 누구나 접근 가능 |
| 📋 링크 공유 | 프로필 URL 원클릭 복사 |
| 📱 반응형 디자인 | 모바일 최적화 UI |
| 🚀 Vercel 배포 | GitHub 연동 자동 배포 |

---

## 🛠 사용한 도구

- **Next.js** — 웹사이트 만드는 프레임워크
- **Firebase Authentication** — 구글 소셜 로그인
- **Firebase Firestore** — 실시간 데이터 저장 (DB)
- **Vercel** — 전 세계 배포 (무료)
- **Tailwind CSS** — 스타일링
- **AI 도구 (Gemini, Claude, Cursor)** — AI와 함께 코딩

---

## 🗂 데이터베이스 구조

Firebase Firestore 서브컬렉션 구조를 사용합니다.

```
users/
  └── {userId}/               ← Firebase Auth UID
        ├── displayName       ← 닉네임 (URL 슬러그로 사용)
        ├── bio               ← 소개글
        ├── createdAt         ← 가입일
        └── links/
              └── {linkId}/   ← 자동 생성 ID
                    ├── title       ← 링크 버튼 텍스트
                    ├── url         ← 목적지 URL
                    ├── faviconUrl  ← 파비콘 이미지 URL
                    └── createdAt   ← 추가일 (정렬용)
```

---

## 📁 프로젝트 구조

```
mylink/
├── app/
│   ├── page.tsx            ← 로그인 화면 (랜딩)
│   ├── mypage/
│   │   └── page.tsx        ← 관리자 대시보드
│   └── [nickname]/
│       └── page.tsx        ← 퍼블릭 프로필 페이지
├── lib/
│   └── firebase.ts         ← Firebase 초기화 설정
└── docs/
    ├── PRD.md              ← 제품 요구사항 정의서
    ├── USER_SCENARIO.md    ← 사용자 시나리오
    └── WIREFRAME.md        ← 와이어프레임
```

---

## 🚀 배포 주소

**🌐 Live Demo: [https://mylink-ashy.vercel.app/](https://mylink-ashy.vercel.app/)**

나만의 링크 페이지: `https://mylink-ashy.vercel.app/닉네임`

---

## 💻 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/minchah/mylink.git
cd mylink

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

---

## 📖 배운 점

- **AI에게 물어보면서 코딩하기** — 모르는 부분을 AI와 대화하며 해결
- **웹사이트 만들고 배포하기** — Next.js + Vercel로 실제 서비스 런칭
- **로그인 기능 구현하기** — Firebase Authentication으로 구글 소셜 로그인
- **데이터베이스 설계하기** — Firestore 서브컬렉션 구조로 실시간 데이터 저장
- **PRD 작성하기** — 기능 개발 전 문서로 요구사항을 정리하는 방법

---

## 📄 문서

- [PRD (제품 요구사항 정의서)](./docs/PRD.md)
- [사용자 시나리오](./docs/USER_SCENARIO.md)
- [와이어프레임](./docs/WIREFRAME.md)

---

<p align="center">
  Made with 🤖 AI + ☕ 커피 @ 한양대학교 바이브 코딩
</p>
