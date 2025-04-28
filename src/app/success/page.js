"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");

        if (token) {
            localStorage.setItem("token", token);
            alert("구글 로그인 성공!");

            // 구글은 email 정보는 서버에서 추가 저장하거나 따로 관리해야 함
            // 지금은 token만 저장하고 user 페이지로 이동
            router.push("/user");
        } else {
            alert("토큰이 없습니다. 다시 로그인 해주세요.");
            router.push("/login");
        }
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center text-lg text-gray-700">
            로그인 처리 중입니다...
        </main>
    );
}
