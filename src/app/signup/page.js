"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "회원가입 실패");
                return;
            }

            alert("회원가입 성공!");
            router.push("/");
        } catch (err) {
            alert("회원가입 실패: " + err.message);
        }
    };

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

            <section className="flex flex-1 items-center justify-center">
                <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">회원가입</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력해주세요"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름을 입력해주세요"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력해주세요"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4"
                        >
                            가입하기
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}
