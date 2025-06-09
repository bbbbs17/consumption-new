"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PiggyBank, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/forgot?email=${email}`, {
        method: "POST",
      })

      if (res.ok) {
        router.push(`/verify-code?email=${email}`)
      } else {
        const errorText = await res.text()
        setMessage(errorText || "인증번호 발송 실패")
      }
    } catch {
      setMessage("서버 오류가 발생했습니다.")
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
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">비밀번호 찾기</CardTitle>
              <CardDescription>가입하신 이메일 주소로 인증번호를 보내드립니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                  <div className="p-3 rounded-lg text-sm text-center bg-red-50 text-red-600 border border-red-200">
                    {message}
                  </div>
              )}

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="가입하신 이메일을 입력해주세요"
                      required
                  />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                >
                  {isLoading ? "발송 중..." : "인증번호 보내기"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                계정이 기억나셨나요?{" "}
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
