"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "로그인 실패");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email);

      alert("로그인 성공!");
      router.push("/user");
    } catch (err) {
      alert("서버 오류 발생. 다시 시도하세요.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE}/oauth2/authorization/google`;
  };

  return (
      <main className="min-h-screen bg-gray-100 flex flex-col">
        <header className="w-full p-4 bg-white shadow-md">
          <div
              className="text-2xl font-bold text-gray-800 text-center cursor-pointer"
              onClick={() => router.push("/")}
          >
            소비분석 캘린더
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center">
          <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">로그인</h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
              />
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
              />
              <div className="flex items-center space-x-2 text-sm">
                <input type="checkbox" id="rememberMe" className="w-4 h-4" />
                <label htmlFor="rememberMe" className="text-gray-600">
                  아이디 저장
                </label>
              </div>
              <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                로그인
              </button>
            </form>

            <div className="my-6 border-t border-gray-300"></div>

            <button
                onClick={handleGoogleLogin}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg"
            >
              구글로 간편 로그인
            </button>

            <div className="flex justify-between text-sm text-gray-500 mt-6">
              <a href="/signup" className="hover:underline">
                회원가입
              </a>
              <a href="/forgot-password" className="hover:underline">
                비밀번호 찾기
              </a>
            </div>
          </div>
        </section>
      </main>
  );
}
