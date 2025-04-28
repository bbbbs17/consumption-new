"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyCodeForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/verify?email=${email}&code=${code}`, {
                method: "POST",
            });

            const data = await res.text();

            if (!res.ok) {
                setMessage(data || "인증 실패");
                return;
            }
            setMessage(data);
            router.push(`/reset-password?email=${email}`);
        } catch {
            setMessage("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">인증번호 입력</h1>

            {message && <div className="mb-4 text-blue-500 text-sm text-center">{message}</div>}

            <form onSubmit={handleVerify} className="space-y-4">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="인증번호를 입력해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                    인증하기
                </button>
            </form>
        </div>
    );
}

export default function VerifyCodePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gray-100 flex flex-col">
            <header className="w-full p-4 bg-white shadow-md cursor-pointer" onClick={() => router.push("/")}>
                <div className="text-2xl font-bold text-gray-800 text-center">소비분석 캘린더</div>
            </header>

            <section className="flex flex-1 items-center justify-center p-6">
                <Suspense fallback={<div>로딩 중...</div>}>
                    <VerifyCodeForm />
                </Suspense>
            </section>
        </main>
    );
}
