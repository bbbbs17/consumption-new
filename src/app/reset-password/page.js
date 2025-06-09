"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PiggyBank, Lock } from "lucide-react"

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setMessage("비밀번호가 일치하지 않습니다.")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/reset?email=${email}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    newPassword: password,
                    confirmPassword: confirmPassword,
                }),
            })

            const data = await res.text()

            if (!res.ok) {
                setMessage(data || "비밀번호 재설정 실패")
                return
            }

            setMessage("비밀번호가 재설정되었습니다!")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
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
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">비밀번호 재설정</CardTitle>
                <CardDescription>새로운 비밀번호를 설정해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {message && (
                    <div
                        className={`p-3 rounded-lg text-sm text-center ${
                            message.includes("재설정되었습니다")
                                ? "bg-green-50 text-green-600 border border-green-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">새 비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="새 비밀번호를 입력해주세요"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호를 다시 입력해주세요"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "재설정 중..." : "비밀번호 재설정"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function ResetPasswordPage() {
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
                    <ResetPasswordForm />
                </Suspense>
            </main>
        </div>
    )
}
