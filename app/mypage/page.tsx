"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, query, orderBy, serverTimestamp, onSnapshot, setDoc
} from "firebase/firestore";

type LinkItem = {
    id: string;
    title: string;
    url: string;
    faviconUrl: string;
    clickCount?: number;
};

const getFaviconUrl = (fullUrl: string) => {
    try {
        const urlObj = new URL(fullUrl);
        const domain = urlObj.hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return "";
    }
};

const formatUrl = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return `https://${trimmed}`;
    }
    return trimmed;
};

export default function MyPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [links, setLinks] = useState<LinkItem[]>([]);

    // 프로필 & SNS 링크 상태
    const [profileName, setProfileName] = useState("");
    const [profileBio, setProfileBio] = useState("");
    
    const [githubTitle, setGithubTitle] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [githubClicks, setGithubClicks] = useState(0);
    
    const [instagramTitle, setInstagramTitle] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [instagramClicks, setInstagramClicks] = useState(0);
    
    const [youtubeTitle, setYoutubeTitle] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubeClicks, setYoutubeClicks] = useState(0);
    
    const [emailTitle, setEmailTitle] = useState("");
    const [emailUrl, setEmailUrl] = useState("");
    const [emailClicks, setEmailClicks] = useState(0);

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");

    // 로그인 상태 감지
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Firestore 실시간 구독 (onSnapshot 사용으로 즉각 갱신)
    useEffect(() => {
        if (!user) {
            setLinks([]);
            return;
        }

        const ref = collection(db, "links");
        const q = query(ref, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data()
            })) as LinkItem[];
            setLinks(data);
        }, (err) => {
            console.error("실시간 링크 구독 실패:", err);
        });

        return () => unsubscribe();
    }, [user]);

    // 프로필 & SNS 정보 구독
    useEffect(() => {
        if (!user) return;
        const profileRef = doc(db, "profile", "main");
        const unsubscribe = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfileName(data.displayName || "");
                setProfileBio(data.bio || "");
                
                setGithubTitle(data.githubTitle || "");
                setGithubUrl(data.githubUrl || "");
                setGithubClicks(data.githubClickCount || 0);
                
                setInstagramTitle(data.instagramTitle || "");
                setInstagramUrl(data.instagramUrl || "");
                setInstagramClicks(data.instagramClickCount || 0);
                
                setYoutubeTitle(data.youtubeTitle || "");
                setYoutubeUrl(data.youtubeUrl || "");
                setYoutubeClicks(data.youtubeClickCount || 0);
                
                setEmailTitle(data.emailTitle || "");
                setEmailUrl(data.emailUrl || "");
                setEmailClicks(data.emailClickCount || 0);
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Google 로그인
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            alert("로그인에 성공했습니다! 👋");
        } catch (e) {
            console.error("로그인 실패:", e);
            alert("로그인에 실패했습니다. Firebase 설정을 확인해주세요.");
        }
    };

    // 로그아웃
    const handleLogout = async () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            await signOut(auth);
            alert("로그아웃 되었습니다.");
        }
    };

    // 프로필 & SNS 저장
    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            const profileRef = doc(db, "profile", "main");
            await setDoc(profileRef, {
                displayName: profileName.trim(),
                bio: profileBio.trim(),
                
                githubTitle: githubTitle.trim(),
                githubUrl: githubUrl.trim(),
                
                instagramTitle: instagramTitle.trim(),
                instagramUrl: instagramUrl.trim(),
                
                youtubeTitle: youtubeTitle.trim(),
                youtubeUrl: youtubeUrl.trim(),
                
                emailTitle: emailTitle.trim(),
                emailUrl: emailUrl.trim(),
                
                updatedAt: serverTimestamp(),
            }, { merge: true });
            alert("프로필 및 SNS 설정이 성공적으로 저장되었습니다! 💾");
        } catch (e) {
            console.error("프로필 저장 실패:", e);
            alert("프로필 저장 중 오류가 발생했습니다.");
        }
    };

    // 링크 추가
    const handleAdd = async () => {
        if (!title.trim()) { setError("제목을 입력해주세요"); return; }
        if (!url.trim()) { setError("주소를 입력해주세요"); return; }
        if (!user) return;

        const finalUrl = formatUrl(url);
        try {
            const ref = collection(db, "links");
            await addDoc(ref, {
                title: title.trim(),
                url: finalUrl,
                faviconUrl: getFaviconUrl(finalUrl),
                createdAt: serverTimestamp(),
                userId: user.uid,
                clickCount: 0, // 초기 클릭 수 설정
            });
            setTitle(""); setUrl(""); setError("");
            alert("링크가 성공적으로 추가되었습니다! 🎉");
        } catch (e) {
            console.error("링크 추가 실패:", e);
            alert("링크 추가 중 오류가 발생했습니다.");
        }
    };

    // 링크 삭제
    const handleDelete = async (id: string) => {
        if (!user || !window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteDoc(doc(db, "links", id));
            alert("링크가 정상적으로 삭제되었습니다.");
        } catch (e) {
            console.error("링크 삭제 실패:", e);
            alert("링크 삭제 중 오류가 발생했습니다.");
        }
    };

    // 수정 모드 진입
    const startEdit = (link: LinkItem) => {
        setEditingId(link.id);
        setEditTitle(link.title);
        setEditUrl(link.url);
    };

    // 수정 저장
    const saveEdit = async () => {
        if (!user || !editingId || !editTitle.trim() || !editUrl.trim()) return;
        const finalUrl = formatUrl(editUrl);
        try {
            await updateDoc(doc(db, "links", editingId), {
                title: editTitle.trim(),
                url: finalUrl,
                faviconUrl: getFaviconUrl(finalUrl),
            });
            setEditingId(null);
            alert("링크가 정상적으로 수정되었습니다. ✏️");
        } catch (e) {
            console.error("링크 수정 실패:", e);
            alert("링크 수정 중 오류가 발생했습니다.");
        }
    };

    // 로딩 중
    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#020617]">
                <p className="text-white/60 text-lg animate-pulse">로딩 중...</p>
            </main>
        );
    }

    // 로그인 안 된 경우
    if (!user) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center bg-[#020617] px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">마이링크 관리</h1>
                    <p className="text-white/50">Google 계정으로 로그인하여 링크를 관리하세요</p>
                </div>
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-3 bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google로 로그인
                </button>
                <Link href="/" className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors">
                    ← 공개 페이지로 돌아가기
                </Link>
            </main>
        );
    }

    // 로그인 된 경우 — 링크 관리 화면
    return (
        <main className="min-h-screen bg-[#f1f5f9] text-gray-800 flex flex-col items-center py-16 px-4">
            <div className="w-full max-w-lg">

                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">마이링크 대시보드</h1>
                        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/" className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 font-medium hover:bg-gray-50 transition-colors shadow-sm">
                            공개 페이지
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 font-medium hover:bg-red-100 transition-colors shadow-sm"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>

                {/* 프로필 & SNS 설정 폼 */}
                <div className="bg-white border-2 border-black rounded-xl p-5 mb-6 shadow-[4px_4px_0_black]">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">👤 프로필 & SNS 관리</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">표시 이름</label>
                            <input
                                type="text"
                                placeholder="예: Minha Park"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">소개글</label>
                            <input
                                type="text"
                                placeholder="한 줄 소개를 입력하세요"
                                value={profileBio}
                                onChange={(e) => setProfileBio(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">📱 SNS 퀵 링크 등록 (공개 페이지에 카드 형태로 추가됩니다)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                <label className="flex justify-between items-center font-bold text-gray-700 mb-1.5">
                                    <span>GitHub</span>
                                    <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">클릭: {githubClicks}회</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="표시 이름 (예: 나의 깃허브)"
                                    value={githubTitle}
                                    onChange={(e) => setGithubTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white mb-2 focus:outline-none focus:border-purple-400"
                                />
                                <input
                                    type="text"
                                    placeholder="깃허브 아이디 또는 전체 주소"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                                />
                            </div>
                            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                <label className="flex justify-between items-center font-bold text-gray-700 mb-1.5">
                                    <span>Instagram</span>
                                    <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">클릭: {instagramClicks}회</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="표시 이름 (예: 나의 인스타그램)"
                                    value={instagramTitle}
                                    onChange={(e) => setInstagramTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white mb-2 focus:outline-none focus:border-purple-400"
                                />
                                <input
                                    type="text"
                                    placeholder="인스타그램 아이디 또는 전체 주소"
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                                />
                            </div>
                            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                <label className="flex justify-between items-center font-bold text-gray-700 mb-1.5">
                                    <span>YouTube</span>
                                    <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">클릭: {youtubeClicks}회</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="표시 이름 (예: 유튜브 채널)"
                                    value={youtubeTitle}
                                    onChange={(e) => setYoutubeTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white mb-2 focus:outline-none focus:border-purple-400"
                                />
                                <input
                                    type="text"
                                    placeholder="유튜브 채널 아이디 또는 전체 주소"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                                />
                            </div>
                            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                <label className="flex justify-between items-center font-bold text-gray-700 mb-1.5">
                                    <span>Email</span>
                                    <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">클릭: {emailClicks}회</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="표시 이름 (예: 이메일 문의)"
                                    value={emailTitle}
                                    onChange={(e) => setEmailTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white mb-2 focus:outline-none focus:border-purple-400"
                                />
                                <input
                                    type="email"
                                    placeholder="이메일 주소 (your-email@example.com)"
                                    value={emailUrl}
                                    onChange={(e) => setEmailUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        className="w-full bg-[#10b981] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#059669] transition-colors"
                    >
                        프로필 & SNS 설정 저장
                    </button>
                </div>

                {/* 링크 추가 폼 */}
                <div className="bg-white border-2 border-black rounded-xl p-5 mb-6 shadow-[4px_4px_0_black]">
                    <h2 className="font-semibold mb-3 text-gray-800">🔗 새 링크 추가</h2>
                    <div className="mb-3">
                        <label className="block text-xs font-bold text-gray-600 mb-1">링크 제목</label>
                        <input
                            type="text"
                            placeholder="예: 내 깃허브"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-xs font-bold text-gray-600 mb-1">링크 주소 (URL)</label>
                        <input
                            type="text"
                            placeholder="예: github.com/user"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
                    <button
                        onClick={handleAdd}
                        className="w-full bg-[#5B5FC7] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#4a4eb5] transition-colors"
                    >
                        + 추가하기
                    </button>
                </div>

                {/* 링크 목록 */}
                <div className="space-y-3">
                    {links.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-400 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                            <span className="text-3xl mb-2">📭</span>
                            <p className="text-gray-600 font-medium">아직 추가된 링크가 없습니다.</p>
                            <p className="text-sm text-gray-400">첫 번째 링크를 추가해 보세요!</p>
                        </div>
                    ) : (
                        links.map((link) => (
                            <div key={link.id} className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_black] flex items-center gap-3">
                                {editingId === link.id ? (
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-0.5">링크 제목 수정</label>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="w-full border border-gray-300 rounded p-1 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-0.5">링크 주소 수정</label>
                                            <input
                                                type="text"
                                                value={editUrl}
                                                onChange={(e) => setEditUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                                                className="w-full border border-gray-300 rounded p-1 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300">✖️ 취소</button>
                                            <button onClick={saveEdit} className="text-xs px-3 py-1 bg-[#5B5FC7] text-white font-semibold rounded hover:bg-[#4a4eb5]">💾 저장</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {link.faviconUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={link.faviconUrl} alt="favicon" className="w-8 h-8 rounded-md bg-gray-100 object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center text-sm text-gray-600">🔗</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-gray-800 truncate">{link.title}</p>
                                                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                                    클릭: {link.clickCount || 0}회
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 truncate">{link.url}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => startEdit(link)} className="text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-200 transition-colors">✏️ 수정</button>
                                            <button onClick={() => handleDelete(link.id)} className="text-xs bg-red-100 text-red-500 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-200 transition-colors">🗑️ 삭제</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </main>
    );
}
