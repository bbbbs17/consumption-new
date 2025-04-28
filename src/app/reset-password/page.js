"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/reset?email=${email}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    newPassword: password,
                    confirmPassword: confirmPassword
                }),
            });

            const data = await res.text();

            if (!res.ok) {
                setMessage(data || "비밀번호 재설정 실패");
                return;
            }
            setMessage(data);
            alert("비밀번호가 재설정되었습니다. 다시 로그인하세요.");
            router.push("/login");
        } catch {
            setMessage("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">비밀번호 재설정</h1>

            {message && <div className="mb-4 text-red-500 text-sm text-center">{message}</div>}

            <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                    required
                />

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                    비밀번호 재설정
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gray-100 flex flex-col">
            <header className="w-full p-4 bg-white shadow-md cursor-pointer" onClick={() => router.push("/")}>
                <div className="text-2xl font-bold text-gray-800 text-center">소비분석 캘린더</div>
            </header>

            <section className="flex flex-1 items-center justify-center p-6">
                <Suspense fallback={<div>로딩 중...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </section>
        </main>
    );
}
