"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBank, TrendingUp, BarChart3, Shield, Users, Star, ArrowRight } from "lucide-react"

export default function Home() {
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
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => router.push("/login")}>
                  로그인
                </Button>
                <Button onClick={() => router.push("/signup")}>회원가입</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              소비를 기록하고,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              패턴을 파악하세요
            </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI 기반 소비 분석 플랫폼으로 스마트한 지출 습관을 만들어보세요. 위치 기반 소비 패턴 분석과 개인화된
              인사이트를 제공합니다.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => router.push("/signup")}
              >
                무료로 시작하기
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
                로그인
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>스마트 분석</CardTitle>
                <CardDescription>AI가 당신의 소비 패턴을 분석하여 개인화된 인사이트를 제공합니다.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>시각적 리포트</CardTitle>
                <CardDescription>직관적인 차트와 그래프로 소비 현황을 한눈에 파악할 수 있습니다.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>안전한 보안</CardTitle>
                <CardDescription>금융 데이터는 최고 수준의 보안으로 안전하게 보호됩니다.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">간단한 3단계로 시작하세요</h2>
              <p className="text-lg text-gray-600">복잡한 설정 없이 바로 사용할 수 있습니다</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">회원가입 & 초기 설정</h3>
                <p className="text-gray-600">간단한 회원가입 후 초기 잔고를 설정하세요</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">소비 내역 기록</h3>
                <p className="text-gray-600">지도에서 위치를 선택하고 소비 내역을 간편하게 기록하세요</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI 분석 확인</h3>
                <p className="text-gray-600">개인화된 소비 패턴 분석과 인사이트를 확인하세요</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">이미 많은 분들이 사용하고 있어요</h2>
              <p className="text-lg text-gray-600">데이터로 증명된 효과</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,000+</div>
                <div className="text-gray-600">활성 사용자</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
                <div className="text-gray-600">평균 지출 절약</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">10,000+</div>
                <div className="text-gray-600">분석된 소비 패턴</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">4.8★</div>
                <div className="text-gray-600">사용자 만족도</div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">사용자 후기</h2>
              <p className="text-lg text-gray-600">실제 사용자들의 생생한 경험담</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    위치 기반 소비 분석이 정말 유용해요. 어디서 얼마나 쓰는지 한눈에 보여서 지출 관리가 쉬워졌어요!
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">김○○님</div>
                      <div className="text-sm text-gray-500">직장인</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    AI 분석으로 제가 몰랐던 소비 패턴을 발견했어요. 덕분에 한 달에 20만원 정도 절약하고 있어요.
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">이○○님</div>
                      <div className="text-sm text-gray-500">대학생</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    고정 수입/지출 관리 기능이 정말 편해요. 매월 자동으로 계산되니까 가계부 쓰는 시간이 확 줄었어요.
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold">박○○님</div>
                      <div className="text-sm text-gray-500">주부</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">지금 바로 시작해보세요</h2>
            <p className="text-xl mb-8 opacity-90">스마트한 소비 습관, 오늘부터 만들어보세요</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => router.push("/signup")}
                  className="bg-white text-blue-600 hover:bg-gray-100"
              >
                무료 회원가입
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="border-white text-black hover:bg-white/10 font-semibold"
              >
                로그인하기
              </Button>
            </div>
          </div>
        </main>
      </div>
  )
}
