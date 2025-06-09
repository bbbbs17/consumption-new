// src/app/premium/success/PremiumSuccessClient.js

"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"

export default function PremiumSuccessClient() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [verified, setVerified] = useState(false)
    const [error, setError] = useState("")

    const orderId = useMemo(() => searchParams.get("orderId"), [searchParams])
    const paymentKey = useMemo(() => searchParams.get("paymentKey"), [searchParams])
    const amount = useMemo(() => searchParams.get("amount"), [searchParams])

    useEffect(() => {
        if (!orderId || !paymentKey || !amount) return;

        const confirmPayment = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    setError("로그인이 필요합니다.")
                    return
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/payment/confirm`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        orderId,
                        paymentKey,
                        amount: parseInt(amount, 10)
                    }),
                })

                if (!res.ok) throw new Error("검증 실패")
                setVerified(true)
            } catch (e) {
                console.error(e)
                setError("검증 실패")
            }
        }

        confirmPayment()
    }, [orderId, paymentKey, amount])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            {verified ? (
                <>
                    <h1 className="text-3xl font-bold text-green-500 mb-4">결제가 성공적으로 완료되었습니다!</h1>
                    <p>주문번호: {orderId}</p>
                    <p>결제금액: ₩{amount}</p>
                    <button
                        onClick={() => router.push("/user")}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        홈으로 돌아가기
                    </button>
                </>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div className="text-blue-500">검증 중...</div>
            )}
        </div>
    )
}
