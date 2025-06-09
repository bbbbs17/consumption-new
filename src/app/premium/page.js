"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, Crown } from "lucide-react"
import Script from "next/script"

export default function PremiumPage() {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        try {
            setLoading(true)

            const token = localStorage.getItem("token")
            if (!token) {
                alert("로그인이 필요합니다.")
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/payment/prepare`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: 100,
                    orderName: "AI 소비 프리미엄 구독"
                }),
            })

            if (!res.ok) throw new Error("결제 준비 실패")
            const data = await res.json()

            // ✅ TossPayments SDK 호출 (v1 기준)
            const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""
            const tossPayments = window.TossPayments(clientKey)

            await tossPayments.requestPayment("CARD", {
                amount: data.amount,
                orderId: data.orderId,
                orderName: data.orderName,
                customerName: "회원님",
                successUrl: `${window.location.origin}/premium/success`,
                failUrl: `${window.location.origin}/premium/fail`,
            })

        } catch (e) {
            alert("결제 실패")
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* ✅ v1 SDK로 변경 */}
            <Script src="https://js.tosspayments.com/v1/payment"></Script>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <Card className="max-w-md w-full shadow-lg">
                    <CardHeader className="flex flex-col items-center space-y-4">
                        <Crown className="w-16 h-16 text-yellow-400" />
                        <CardTitle className="text-2xl font-bold text-center">AI 프리미엄 구독</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center text-muted-foreground">
                            💎 프리미엄 기능을 사용하여 <br /> 소비 분석을 더욱 심층적으로 경험해보세요!
                        </div>
                        <div className="text-center text-3xl font-bold text-blue-600">₩100</div>
                        <Button className="w-full" onClick={handlePayment} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            결제하기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
