"use client";

export default function Home() {
  return (
      <main className="min-h-screen bg-gray-100 flex flex-col">
        {/* 상단 앱 이름 */}
        <header className="w-full p-4 bg-white shadow-md">
          <div
              className="text-2xl font-bold text-gray-800 text-center cursor-pointer"
              onClick={() => router.push("/")}
          >
            소비분석 캘린더
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center p-6">
          <div className="text-center text-gray-800 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              소비를 기록하고, 패턴을 파악하세요
            </h1>
            <p className="text-gray-600 mb-8">
              AI 기반 소비 분석 플랫폼으로 스마트한 지출 습관을 만들어보세요.
            </p>

            <div className="flex justify-center gap-4">
              <a
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                회원가입
              </a>
              <a
                  href="/login"
                  className="border border-gray-800 hover:bg-gray-800 hover:text-white text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
              >
                로그인
              </a>
            </div>
          </div>
        </section>
      </main>
  );
}
