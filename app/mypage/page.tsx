"use client";

import { useState } from "react";
import Link from "next/link";

export default function MyPage() {
    const [links, setLinks] = useState([
        { id: 1, title: "GitHub", url: "https://github.com", icon: "💻" },
        { id: 2, title: "Instagram", url: "https://instagram.com", icon: "📸" },
        { id: 3, title: "Youtube", url: "https://youtube.com", icon: "🎬" },
        { id: 4, title: "Blog", url: "https://myblog.com", icon: "✍️" },
    ]);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    const handleAdd = () => {
        if (!title.trim()) { setError("제목을 입력해주세요"); return; }
        if (!url.trim()) { setError("주소를 입력해주세요"); return; }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            setError("주소는 https:// 로 시작해야 합니다");
            return;
        }
        setLinks([...links, { id: Date.now(), title: title.trim(), url: url.trim(), icon: "🔗" }]);
        setTitle(""); setUrl(""); setError("");
    };

    const handleDelete = (id: number) => {
        setLinks(links.filter((l) => l.id !== id));
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center py-16 px-4">
            <div className="w-full max-w-md">

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">내 링크 관리</h1>
                    <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">
                        공개 페이지 보기
                    </Link>
                </div>

                {/* 추가 폼 */}
                <div className="bg-white border-2 border-black rounded-xl p-4 mb-6 shadow-[4px_4px_0_black]">
                    <h2 className="font-semibold mb-3">링크 추가</h2>
                    <input
                        type="text"
                        placeholder="링크 제목 (예: 내 인스타그램)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 mb-2 text-sm focus:outline-none focus:border-purple-400"
                    />
                    <input
                        type="text"
                        placeholder="링크 주소 (https://...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
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

                {/* 링크 목록 */}
                <div className="space-y-3">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_black] flex items-center gap-3"
                        >
                            <span className="text-xl">{link.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{link.title}</p>
                                <p className="text-xs text-gray-400 truncate">{link.url}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(link.id)}
                                className="text-xs bg-red-100 text-red-500 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-200 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}