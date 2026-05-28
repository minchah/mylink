"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db, logFirebaseEvent } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  faviconUrl: string;
  clickCount?: number;
  isSns?: string;
};

type ProfileData = {
  displayName: string;
  bio: string;
  // SNS titles (optional)
  githubTitle?: string;
  instagramTitle?: string;
  youtubeTitle?: string;
  emailTitle?: string;
  // SNS URLs (optional)
  githubUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  emailUrl?: string;
  // Click counters (optional, default 0)
  githubClickCount?: number;
  instagramClickCount?: number;
  youtubeClickCount?: number;
  emailClickCount?: number;
};

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "Minha Park",
    bio: "my links"
  });
  const [loading, setLoading] = useState(true);

  // 프로필 정보 가져오기 (실시간)
  useEffect(() => {
    if (!db) return;
    const profileRef = doc(db, "profile", "main");
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as ProfileData);
      }
    }, (err) => {
      console.error("프로필 로드 실패:", err);
    });
    return () => unsubscribe();
  }, [db]);

  // 링크 목록 가져오기 (실시간)
  useEffect(() => {
    if (!db) return;
    const ref = collection(db, "links");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LinkItem[];
      setLinks(data);
      setLoading(false);
    }, (err) => {
      console.error("링크 로드 실패:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  // 링크 클릭 트래킹
  const handleLinkClick = async (linkItem: any) => {
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    try {
      // 1. Firebase Analytics에 이벤트 로깅
      logFirebaseEvent("link_click", {
        link_id: linkItem.id,
        link_title: linkItem.title,
        link_url: linkItem.url,
      });

      // 2. Firestore 클릭 카운트 증가 (일반 링크인 경우만 문서 카운트 증가)
      if (!linkItem.isSns) {
        const linkRef = doc(db, "links", linkItem.id);
        await updateDoc(linkRef, {
          clickCount: increment(1)
        });
      } else {
        // SNS 링크인 경우 profile/main 내 카운터 증가
        const profileRef = doc(db, "profile", "main");
        const clickField = `${linkItem.isSns}ClickCount`;
        await updateDoc(profileRef, {
          [clickField]: increment(1)
        });
      }
    } catch (e) {
      console.error("클릭 카운트 기록 실패:", e);
    }
  };

  // 일반 링크들과 SNS 링크들을 합쳐서 통합 카드 리스트 생성
  const combinedLinks = [...links];

  if (profile.githubUrl) {
    combinedLinks.push({
      id: "sns-github",
      title: profile.githubTitle || "GitHub",
      url: profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://github.com/${profile.githubUrl}`,
      faviconUrl: "",
      isSns: "github"
    });
  }
  if (profile.instagramUrl) {
    combinedLinks.push({
      id: "sns-instagram",
      title: profile.instagramTitle || "Instagram",
      url: profile.instagramUrl.startsWith("http") ? profile.instagramUrl : `https://instagram.com/${profile.instagramUrl}`,
      faviconUrl: "",
      isSns: "instagram"
    });
  }
  if (profile.youtubeUrl) {
    combinedLinks.push({
      id: "sns-youtube",
      title: profile.youtubeTitle || "YouTube",
      url: profile.youtubeUrl.startsWith("http") ? profile.youtubeUrl : `https://youtube.com/${profile.youtubeUrl}`,
      faviconUrl: "",
      isSns: "youtube"
    });
  }
  if (profile.emailUrl) {
    combinedLinks.push({
      id: "sns-email",
      title: profile.emailTitle || "Email",
      url: `mailto:${profile.emailUrl}`,
      faviconUrl: "",
      isSns: "email"
    });
  }

  // SNS 전용 아이콘 렌더링 헬퍼
  const renderSnsIcon = (snsType: string) => {
    switch (snsType) {
      case "github":
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case "instagram":
        return (
          <svg className="w-6 h-6 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        );
      case "youtube":
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case "email":
        return (
          <svg className="w-6 h-6 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center py-16 px-4 overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 z-0"></div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] z-0 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] z-0 animate-pulse" />

      <div className="w-full max-w-md relative z-10 flex-1 flex flex-col justify-between">
        <div>
          {/* 프로필 섹션 */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-white backdrop-blur-md border border-white/20 mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden">
              <svg className="w-12 h-12 fill-black" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{profile.displayName}</h1>
            <p className="text-blue-200/80 mt-2 font-medium break-all whitespace-pre-wrap">{profile.bio}</p>
          </div>

          {/* 링크 리스트 */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-white/60 animate-pulse text-sm">링크 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {combinedLinks.length === 0 ? (
                <p className="text-center text-white/40 py-8 text-sm">등록된 링크가 없습니다.</p>
              ) : (
                combinedLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    onClick={() => handleLinkClick(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-blue-500/20 active:scale-[0.98]"
                  >
                    <div className="text-white group-hover:scale-110 transition-transform duration-300">
                      {link.isSns ? (
                        renderSnsIcon(link.isSns)
                      ) : link.faviconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={link.faviconUrl} alt="favicon" className="w-6 h-6 rounded-md bg-white/10 object-cover" />
                      ) : (
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-semibold text-white text-lg">{link.title}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        {/* 하단 푸터 */}
        <div className="mt-12 text-center">
          <Link href="/mypage" className="text-sm text-blue-300/60 hover:text-blue-300 transition-colors underline decoration-blue-300/30">
            링크 관리하기
          </Link>
        </div>
      </div>
    </main>
  );
}
