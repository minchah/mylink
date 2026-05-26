import Link from "next/link";

export default function Home() {
  const links = [
    { id: 1, title: "GitHub", url: "https://github.com", icon: "💻" },
    { id: 2, title: "Instagram", url: "https://instagram.com", icon: "📸" },
    { id: 3, title: "Youtube", url: "https://youtube.com", icon: "🎬" },
    { id: 4, title: "Blog", url: "https://myblog.com", icon: "✍️" },
  ];

  // Helper to generate random star styles
  const stars = Array.from({ length: 40 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 2 + 1}px`,
    duration: `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 5}s`,
  }));

  return (
    <main className="relative min-h-screen flex flex-col items-center py-16 px-4 overflow-hidden bg-[#020617]">
      {/* Stars Background */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              "--duration": star.duration,
              animationDelay: star.delay,
            } as any}
          />
        ))}
      </div>

      {/* Nebula Effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] z-0 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] z-0 animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/20 mx-auto mb-4 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            🙌
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Minha Park</h1>
          <p className="text-blue-200/80 mt-2 font-medium">Minha's link</p>
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-blue-500/20 active:scale-[0.98]"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="font-semibold text-white text-lg">{link.title}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/mypage" className="text-sm text-blue-300/60 hover:text-blue-300 transition-colors underline decoration-blue-300/30">
            링크 관리하기
          </Link>
        </div>
      </div>
    </main>
  );
}