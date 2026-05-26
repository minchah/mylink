import Link from "next/link";

export default function Home() {
  const links = [
    { id: 1, title: "GitHub", url: "https://github.com", icon: "💻" },
    { id: 2, title: "인스타그램", url: "https://instagram.com", icon: "📸" },
    { id: 3, title: "유튜브", url: "https://youtube.com", icon: "🎬" },
    { id: 4, title: "블로그", url: "https://myblog.com", icon: "✍️" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-purple-400 mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">
            🙌
          </div>
          <h1 className="text-2xl font-bold text-gray-800">박민하</h1>
          <p className="text-gray-500 mt-2">안녕하세요! 개발을 배우고 있어요 😊</p>
        </div>

        <div className="space-y-3">
          {links.map((link) => (

            <a key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] hover:bg-yellow-50 transition-all"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="font-semibold text-gray-800 text-lg">{link.title}</span>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/mypage" className="text-sm text-gray-400 hover:text-gray-600 underline">
            링크 관리하기
          </Link>
        </div>

      </div>
    </main >
  );
}