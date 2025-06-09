"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PiggyBank, UserPlus } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage("")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "회원가입 실패")
                return
            }

            setMessage("회원가입 성공!")
            setTimeout(() => {
                router.push("/login")
            }, 1500)
        } catch (err) {
            setMessage("회원가입 실패: " + err.message)
        } finally {
            setIsLoading(false)
        }
    }

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
                        <Button variant="outline" onClick={() => router.push("/login")}>
                            로그인
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
                <Card className="w-full max-w-md border-0 shadow-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
                        <CardDescription>AI 소비 도우미와 함께 스마트한 소비 습관을 만들어보세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {message && (
                            <div
                                className={`p-3 rounded-lg text-sm text-center ${
                                    message.includes("성공")
                                        ? "bg-green-50 text-green-600 border border-green-200"
                                        : "bg-red-50 text-red-600 border border-red-200"
                                }`}
                            >
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="이메일을 입력해주세요"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름을 입력해주세요"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호를 입력해주세요"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={isLoading}
                            >
                                {isLoading ? "가입 중..." : "가입하기"}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-gray-600">
                            이미 계정이 있으신가요?{" "}
                            <button onClick={() => router.push("/login")} className="text-blue-600 hover:underline font-medium">
                                로그인
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
