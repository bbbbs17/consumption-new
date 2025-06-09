"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { PiggyBank, LogIn, Chrome } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.message || "로그인 실패")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("userEmail", data.email)

      router.push("/user")
    } catch (err) {
      setMessage("서버 오류 발생. 다시 시도하세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE}/oauth2/authorization/google`
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
              <Button variant="outline" onClick={() => router.push("/signup")}>
                회원가입
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">로그인</CardTitle>
              <CardDescription>계정에 로그인하여 소비 분석을 시작하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                  <div className="p-3 rounded-lg text-sm text-center bg-red-50 text-red-600 border border-red-200">
                    {message}
                  </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
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

                <div className="flex items-center space-x-2">
                  <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    아이디 저장
                  </Label>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">또는</span>
                </div>
              </div>

              <Button onClick={handleGoogleLogin} variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                <Chrome className="w-4 h-4 mr-2" />
                구글로 간편 로그인
              </Button>

              <div className="flex justify-between text-sm">
                <button onClick={() => router.push("/signup")} className="text-blue-600 hover:underline font-medium">
                  회원가입
                </button>
                <button
                    onClick={() => router.push("/forgot-password")}
                    className="text-blue-600 hover:underline font-medium"
                >
                  비밀번호 찾기
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  )
}
