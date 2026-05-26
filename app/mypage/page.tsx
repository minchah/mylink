"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedListener,
  db,
} from "../../lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

type LinkItem = {
  id: string; // Firestore doc id
  title: string;
  url: string;
  faviconUrl: string;
};

export default function MyPage() {
  // Auth state
  const [user, setUser] = useState<any>(null);

  // Profile (optional, kept local for now)
  const [displayName, setDisplayName] = useState("leo");
  const [bio, setBio] = useState("소개글을 입력하세요...");

  // Links from Firestore
  const [links, setLinks] = useState<LinkItem[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChangedListener((u) => setUser(u));
    return () => unsub();
  }, []);

  // Firestore listener – only when logged in
  useEffect(() => {
    if (!user) {
      setLinks([]);
      return;
    }
    const linksRef = collection(db, "users", user.uid, "links");
    const q = query(linksRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));
      setLinks(data as LinkItem[]);
    });
    return () => unsub();
  }, [user]);

  // Helpers
  const formatUrl = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const getFaviconUrl = (fullUrl: string) => {
    try {
      const domain = new URL(fullUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return "";
    }
  };

  // Add link
  const handleAdd = async () => {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!url.trim()) {
      setError("주소를 입력해주세요");
      return;
    }
    const finalUrl = formatUrl(url);
    try {
      await addDoc(collection(db, "users", user.uid, "links"), {
        title: title.trim(),
        url: finalUrl,
        faviconUrl: getFaviconUrl(finalUrl),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
    setTitle("");
    setUrl("");
    setError("");
  };

  // Delete link
  const handleDelete = async (id: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "links", id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Start edit
  const startEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  // Save edit
  const saveEdit = async () => {
    if (!editTitle.trim() || !editUrl.trim() || !editingId) return;
    const finalUrl = formatUrl(editUrl);
    try {
      await updateDoc(doc(db, "users", user.uid, "links", editingId), {
        title: editTitle.trim(),
        url: finalUrl,
        faviconUrl: getFaviconUrl(finalUrl),
      });
    } catch (e) {
      console.error(e);
    }
    setEditingId(null);
  };

  // If not logged in, show login button
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
        <button
          onClick={signInWithGoogle}
          className="bg-[#5B5FC7] text-white py-2 px-6 rounded-lg font-semibold hover:bg-[#4a4eb5]"
        >
          Google 로그인
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">내 링크 관리</h1>
          <button onClick={signOutUser} className="text-sm text-gray-600 hover:underline">
            로그아웃
          </button>
        </div>

        {/* Profile Settings */}
        <div className="bg-white border-2 border-black rounded-xl p-4 mb-6 shadow-[4px_4px_0_black]">
          <h2 className="font-semibold mb-3">👤 프로필 설정</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">닉네임</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">소개글</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* New Link Form */}
        <div className="bg-white border-2 border-black rounded-xl p-4 mb-6 shadow-[4px_4px_0_black]">
          <h2 className="font-semibold mb-3">🔗 새 링크 추가</h2>
          <input
            type="text"
            placeholder="링크 제목 (예: 내 포트폴리오)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-2 text-sm focus:outline-none focus:border-purple-400"
          />
          <input
            type="text"
            placeholder="링크 주소 (예: my-portfolio.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-full border border-gray-300 rounded-lg p-2 mb-2 text-sm focus:outline-none focus:border-purple-400"
          />
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <button
            onClick={handleAdd}
            className="w-full bg-[#5B5FC7] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#4a4eb5] transition-colors"
          >
            + 추가하기
          </button>
        </div>

        {/* Link List */}
        <div className="space-y-3">
          {links.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-400 rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <span className="text-3xl mb-2">📭</span>
              <p className="text-gray-600 font-medium">아직 추가된 링크가 없습니다.</p>
              <p className="text-sm text-gray-400">첫 번째 링크를 추가해 보세요!</p>
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_black] flex items-center gap-3"
              >
                {editingId === link.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded p-1 text-sm focus:outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="w-full border border-gray-300 rounded p-1 text-sm focus:outline-none focus:border-purple-400"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-3 py-1 bg-gray-200 rounded font-semibold hover:bg-gray-300"
                      >
                        ✖️ 취소
                      </button>
                      <button
                        onClick={saveEdit}
                        className="text-xs px-3 py-1 bg-[#5B5FC7] text-white font-semibold rounded hover:bg-[#4a4eb5]"
                      >
                        💾 저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Favicon */}
                    {link.faviconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={link.faviconUrl} alt="favicon" className="w-8 h-8 rounded-md bg-gray-100 object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center text-sm">🔗</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{link.title}</p>
                      <p className="text-xs text-gray-400 truncate">{link.url}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(link)}
                        className="text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        ✏️ 수정
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-xs bg-red-100 text-red-500 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        🗑️ 삭제
                      </button>
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