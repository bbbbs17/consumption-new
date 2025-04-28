"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/forgot?email=${email}`, {
        method: "POST",
      });

      if (res.ok) {
        // ✅ 성공했으면 메세지 띄우지 말고 바로 이동
        router.push(`/verify-code?email=${email}`);
      } else {
        const errorText = await res.text();
        setMessage(errorText || "인증번호 발송 실패");
      }
    } catch {
      setMessage("서버 오류가 발생했습니다.");
    }
  };



  return (
      <main className="min-h-screen bg-gray-100 flex flex-col">
        <header className="w-full p-4 bg-white shadow-md cursor-pointer" onClick={() => router.push("/")}>
          <div className="text-2xl font-bold text-gray-800 text-center">소비분석 캘린더</div>
        </header>

        <section className="flex flex-1 items-center justify-center p-6">
          <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">비밀번호 찾기</h1>

            {message && <div className="mb-4 text-blue-500 text-sm text-center">{message}</div>}

            <form onSubmit={handleSendCode} className="space-y-4">
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                  required
              />

              <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                인증번호 보내기
              </button>
            </form>
          </div>
        </section>
      </main>
  );
}
