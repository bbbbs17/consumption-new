"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PiggyBank, Shield } from "lucide-react"

function VerifyCodeForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const [code, setCode] = useState("")
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleVerify = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/verify?email=${email}&code=${code}`, {
                method: "POST",
            })

            const data = await res.text()

            if (!res.ok) {
                setMessage(data || "인증 실패")
                return
            }
            setMessage(data)
            router.push(`/reset-password?email=${email}`)
        } catch {
            setMessage("서버 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md border-0 shadow-xl">
            <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">인증번호 입력</CardTitle>
                <CardDescription>{email}로 전송된 인증번호를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {message && (
                    <div
                        className={`p-3 rounded-lg text-sm text-center ${
                            message.includes("실패") || message.includes("오류")
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">인증번호</Label>
                        <Input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="6자리 인증번호를 입력해주세요"
                            className="text-center text-lg tracking-widest"
                            maxLength={6}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "인증 중..." : "인증하기"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function VerifyCodePage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <PiggyBank className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                AI 소비 도우미
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
                <Suspense
                    fallback={
                        <Card className="w-full max-w-md border-0 shadow-xl">
                            <CardContent className="flex items-center justify-center p-8">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">로딩 중...</p>
                                </div>
                            </CardContent>
                        </Card>
                    }
                >
                    <VerifyCodeForm />
                </Suspense>
            </main>
        </div>
    )
}
