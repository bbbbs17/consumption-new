"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PiggyBank, CheckCircle, Loader2 } from "lucide-react"

export default function SuccessPage() {
    const router = useRouter()
    const [status, setStatus] = useState("processing") // processing, success, error

    useEffect(() => {
        const url = new URL(window.location.href)
        const token = url.searchParams.get("token")

        if (token) {
            localStorage.setItem("token", token)
            setStatus("success")

            // 3초 후 자동으로 대시보드로 이동
            setTimeout(() => {
                router.push("/user")
            }, 3000)
        } else {
            setStatus("error")
        }
    }, [router])

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
                <Card className="w-full max-w-md border-0 shadow-xl">
                    <CardHeader className="text-center space-y-4">
                        {status === "processing" && (
                            <>
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                                <CardTitle className="text-2xl font-bold">로그인 처리 중</CardTitle>
                                <CardDescription>잠시만 기다려주세요...</CardDescription>
                            </>
                        )}

                        {status === "success" && (
                            <>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-green-600">로그인 성공!</CardTitle>
                                <CardDescription>구글 로그인이 완료되었습니다. 곧 대시보드로 이동합니다.</CardDescription>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <PiggyBank className="w-8 h-8 text-red-600" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-red-600">로그인 실패</CardTitle>
                                <CardDescription>토큰이 없습니다. 다시 로그인해주세요.</CardDescription>
                            </>
                        )}
                    </CardHeader>

                    {status === "success" && (
                        <CardContent className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-700 text-center">3초 후 자동으로 대시보드로 이동합니다</p>
                            </div>
                            <Button
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={() => router.push("/user")}
                            >
                                지금 이동하기
                            </Button>
                        </CardContent>
                    )}

                    {status === "error" && (
                        <CardContent>
                            <Button
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={() => router.push("/login")}
                            >
                                로그인 페이지로 이동
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </main>
        </div>
    )
}
