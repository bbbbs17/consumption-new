"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from "date-fns"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Line, Legend, LineChart } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    Wallet,
    MapPin,
    Plus,
    Edit,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    PiggyBank,
    AlertTriangle,
    History,
    X,
} from "lucide-react"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"]

function getTopCategories(data) {
    const categoryTotals = {}
    Object.values(data)
        .flat()
        .forEach(({ category, amount }) => {
            categoryTotals[category] = (categoryTotals[category] || 0) + amount
        })
    return Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, value]) => ({ name, value }))
}

function getMonthlyDataByType(data, year, type) {
    const monthly = Array.from({ length: 12 }, (_, i) => ({
        month: `${year}-${String(i + 1).padStart(2, "0")}`,
        value: 0,
    }))

    for (const [dateStr, entries] of Object.entries(data)) {
        const date = new Date(dateStr)
        if (date.getFullYear() === year) {
            const monthIdx = date.getMonth()
            const filtered = entries.filter((e) => e.type === type)
            const sum = filtered.reduce((acc, cur) => acc + cur.amount, 0)
            monthly[monthIdx].value += sum
        }
    }

    return monthly
}

function getTimeSlot(hour) {
    if (hour < 6) return { label: "새벽", range: "00시~06시" }
    if (hour < 12) return { label: "오전", range: "06시~12시" }
    if (hour < 18) return { label: "오후", range: "12시~18시" }
    return { label: "저녁/야간", range: "18시~24시" }
}

export default function Dashboard() {
    const [email, setEmail] = useState(null)
    const [balance, setBalance] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [balanceHistory, setBalanceHistory] = useState([])
    const [manualReason, setManualReason] = useState("")
    const [manualAmount, setManualAmount] = useState("")
    const [showBalancePopup, setShowBalancePopup] = useState(false)
    const [fixedIncomes, setFixedIncomes] = useState([])

    const [mapInstance, setMapInstance] = useState(null)

    const [consumptionType, setConsumptionType] = useState("EXPENSE")
    const [monthlyViewType, setMonthlyViewType] = useState("EXPENSE")

    const [placeName, setPlaceName] = useState("")
    const [address, setAddress] = useState("")
    const [latitude, setLatitude] = useState(null)
    const [longitude, setLongitude] = useState(null)
    const [showMapModal, setShowMapModal] = useState(false)

    const [searchKeyword, setSearchKeyword] = useState("")
    const [searchResults, setSearchResults] = useState([])

    const [fixedExpenses, setFixedExpenses] = useState([])
    const [showFixedExpenseModal, setShowFixedExpenseModal] = useState(false)
    const [fixedExpenseAmount, setFixedExpenseAmount] = useState("")
    const [fixedExpenseDescription, setFixedExpenseDescription] = useState("")
    const [fixedExpenseDay, setFixedExpenseDay] = useState(1)
    const [editingExpense, setEditingExpense] = useState(null)

    const [showFixedIncomeModal, setShowFixedIncomeModal] = useState(false)
    const [fixedAmount, setFixedAmount] = useState("")
    const [fixedDescription, setFixedDescription] = useState("")
    const [fixedDay, setFixedDay] = useState(1)

    const [showVariableIncomeModal, setShowVariableIncomeModal] = useState(false)
    const [variableAmount, setVariableAmount] = useState("")
    const [variableReason, setVariableReason] = useState("")

    const [currentDate, setCurrentDate] = useState(() => new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [habitualInfo, setHabitualInfo] = useState(null)
    const [consumptionData, setConsumptionData] = useState({})
    const [modalOpen, setModalOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [chartYear, setChartYear] = useState(new Date().getFullYear())
    const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false)
    const [chartMonth, setChartMonth] = useState(new Date().getMonth() + 1)

    const [newItem, setNewItem] = useState("")
    const [newAmount, setNewAmount] = useState("")
    const [newTime, setNewTime] = useState("")
    const [editingIncome, setEditingIncome] = useState(null)

    const closeModal = () => {
        setModalOpen(false)
        setEditMode(false)
        setSelectedItem(null)
        setNewItem("")
        setNewAmount("")
        setNewTime("")
        setPlaceName("")
        setAddress("")
        setLatitude(null)
        setLongitude(null)
    }

    const handleEdit = (item) => {
        setEditMode(true)
        setSelectedItem(item)
        setNewItem(item.category)
        setNewAmount(item.amount)
        setNewTime(item.time)
        setModalOpen(true)
    }

    const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
    const consumptionList = selectedKey ? consumptionData[selectedKey] || [] : []
    const selectedTotal = consumptionList.reduce((acc, cur) => {
        return acc + (cur.type === "INCOME" ? cur.amount : -cur.amount)
    }, 0)

    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })
    const thisMonthTotal = Object.entries(consumptionData).reduce((acc, [key, list]) => {
        if (key.startsWith(format(currentDate, "yyyy-MM"))) {
            return acc + list.filter((c) => c.type === "EXPENSE").reduce((a, c) => a + c.amount, 0)
        }
        return acc
    }, 0)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedEmail = localStorage.getItem("userEmail")
            if (storedEmail) {
                setEmail(storedEmail)
            }
        }
    }, [])

    useEffect(() => {
        if (showMapModal && typeof window !== "undefined") {
            const onLoadKakaoMap = () => {
                const container = document.getElementById("map")
                if (!container) return

                const lat = latitude ?? 37.5665
                const lng = longitude ?? 126.978
                const center = new window.kakao.maps.LatLng(lat, lng)

                const options = {
                    center: center,
                    level: 3,
                }
                const map = new window.kakao.maps.Map(container, options)
                setMapInstance(map)

                // ✅ 최초 로딩 시 마커 한 개 찍기
                new window.kakao.maps.Marker({
                    position: center,
                    map: map,
                })

                const geocoder = new window.kakao.maps.services.Geocoder()

                window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
                    const latlng = mouseEvent.latLng
                    setLatitude(latlng.getLat())
                    setLongitude(latlng.getLng())

                    // 클릭 시 마커 찍기
                    new window.kakao.maps.Marker({
                        position: latlng,
                        map: map,
                    })

                    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
                        if (status === window.kakao.maps.services.Status.OK) {
                            const addr = result[0].road_address?.address_name || result[0].address.address_name
                            setAddress(addr)
                            setPlaceName(result[0].address?.region_3depth_name || "선택된 위치")
                        }
                    })
                })
            }

            if (window.kakao?.maps?.load) {
                window.kakao.maps.load(onLoadKakaoMap)
            }
        }
    }, [showMapModal, latitude, longitude])


    useEffect(() => {
        if (email) {
            fetchBalance(email)
            fetchBalanceHistory(email, new Date().getFullYear(), new Date().getMonth() + 1)
            fetchConsumption(email)
            fetchHabitual(email)
            fetchFixedIncomes(email)
            fetchFixedExpenses(email)
        }
    }, [email])

    const fetchBalance = async (email) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                console.error("❌ 토큰 없음")
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance?email=${email}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.status === 404) {
                setShowInitialBalanceModal(true)
                return
            }

            const text = await res.text()
            if (!text) {
                console.warn("⚠️ 서버 응답 비어있음")
                return
            }
            const data = JSON.parse(text)

            setBalance(data.totalAmount)
            setLastUpdated(data.lastUpdated)
        } catch (e) {
            console.error("잔고 조회 실패", e)
        }
    }

    const handleSearchPlace = async () => {
        if (!searchKeyword) {
            alert("검색어를 입력해주세요.")
            return
        }

        try {
            const token = localStorage.getItem("token")
            // 백엔드 프록시를 통해 카카오 API 호출
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/kakao/search?query=${encodeURIComponent(searchKeyword)}`,
                {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                }
            )

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            const result = await res.json()

            const places = result.keywordResult?.documents || result.documents || []

            if (places.length === 0) {
                alert("검색 결과가 없습니다.")
                return
            }

            setSearchResults(places)

            const first = places[0]
            const lat = Number.parseFloat(first.y)
            const lng = Number.parseFloat(first.x)
            const latLng = new window.kakao.maps.LatLng(lat, lng)

            if (mapInstance) {
                mapInstance.setCenter(latLng)
                new window.kakao.maps.Marker({
                    position: latLng,
                    map: mapInstance,
                })
            }

            setLatitude(lat)
            setLongitude(lng)
            setAddress(first.road_address_name || first.address_name)
            setPlaceName(first.place_name || first.address_name)
        } catch (e) {
            console.error("카카오 검색 실패:", e)
            alert("주소 검색 중 오류가 발생했습니다.")
        }
    }

    const fetchFixedExpenses = async (email) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-expense?email=${email}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!res.ok) throw new Error("고정 지출 불러오기 실패")

            const data = await res.json()
            setFixedExpenses(data)
        } catch (e) {
            console.error("고정 지출 조회 실패", e)
            setFixedExpenses([])
        }
    }

    const saveFixedExpense = async () => {
        if (!email) return
        const token = localStorage.getItem("token")
        if (!token) {
            alert("로그인 정보가 없습니다.")
            return
        }

        const payload = {
            email,
            description: fixedExpenseDescription,
            amount: Number.parseInt(fixedExpenseAmount),
            dayOfMonth: Number.parseInt(fixedExpenseDay),
        }

        const isEditing = editingExpense !== null
        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-expense/${editingExpense.id}`
            : `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-expense/add`

        const method = isEditing ? "PUT" : "POST"

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error(isEditing ? "수정 실패" : "등록 실패")

            alert(isEditing ? "수정 완료!" : "등록 완료!")
            setShowFixedExpenseModal(false)
            setEditingExpense(null)
            setFixedExpenseAmount("")
            setFixedExpenseDescription("")
            setFixedExpenseDay(1)
            fetchBalance(email)
            fetchFixedExpenses(email)
        } catch (e) {
            alert("저장 중 오류 발생")
        }
    }

    const saveFixedIncome = async () => {
        if (!email) return
        const token = localStorage.getItem("token")
        if (!token) {
            alert("로그인 정보가 없습니다.")
            return
        }

        const payload = {
            email,
            description: fixedDescription,
            amount: Number.parseInt(fixedAmount),
            dayOfMonth: Number.parseInt(fixedDay),
        }

        const isEditing = editingIncome !== null
        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-income/${editingIncome.id}`
            : `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-income/add`

        const method = isEditing ? "PUT" : "POST"

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error(isEditing ? "수정 실패" : "등록 실패")

            alert(isEditing ? "수정 완료!" : "등록 완료!")
            setShowFixedIncomeModal(false)
            setEditingIncome(null)
            setFixedAmount("")
            setFixedDescription("")
            setFixedDay(1)
            fetchBalance(email)
            fetchFixedIncomes(email)
        } catch (e) {
            alert("저장 중 오류 발생")
        }
    }

    const saveVariableIncome = async () => {
        if (!email) return

        const token = localStorage.getItem("token")
        if (!token) {
            alert("로그인 정보가 없습니다.")
            return
        }

        const payload = {
            email,
            reason: variableReason,
            amountChange: Number.parseInt(variableAmount),
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/change`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("가변 수입/지출 저장 실패")

            alert("변동 수입/지출이 반영되었습니다.")
            setShowVariableIncomeModal(false)
            setVariableReason("")
            setVariableAmount("")
            fetchBalance(email)
        } catch (e) {
            alert("변동 수입/지출 저장 오류")
        }
    }

    const handleAddConsumption = async () => {
        if (
            !email ||
            !newItem ||
            !newAmount ||
            !placeName ||
            !address ||
            latitude === null ||
            longitude === null ||
            !newTime ||
            !selectedDate
        ) {
            alert("모든 항목을 입력해주세요.")
            return
        }
        const token = localStorage.getItem("token")  // ✅ 이 줄 추가

        const payload = {
            email,
            item: newItem,
            amount: Number.parseInt(newAmount),
            placeName: placeName,
            address: address,
            latitude: latitude,
            longitude: longitude,
            localDateTime: `${format(selectedDate, "yyyy-MM-dd")}T${newTime}:00`,
            type: consumptionType,
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/post`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },

                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errorText = await res.text()
                if (errorText.includes("잔고")) {
                    alert("현재 잔고가 부족합니다. 먼저 잔고를 설정해주세요!")
                } else {
                    alert("소비 추가 실패")
                }
                throw new Error(errorText)
            }
            alert("소비 내역이 추가되었습니다.")
            closeModal()
            await fetchConsumption(email)
            fetchBalance(email)
        } catch (e) {
            console.error("소비 추가 에러:", e)
        }
    }

    const handleDelete = async (id) => {
        if (!email) return
        if (!confirm("정말 삭제하시겠습니까?")) return

        const token = localStorage.getItem("token")
        if (!token) {
            alert("로그인 정보가 없습니다.")
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (!res.ok) throw new Error("삭제 실패")

            alert("삭제되었습니다.")
            fetchConsumption(email)
        } catch (e) {
            alert("삭제 실패")
        }
    }


    const handleUpdateConsumption = async () => {
        if (
            !email ||
            !newItem ||
            !newAmount ||
            !newTime ||
            !selectedItem ||
            !placeName ||
            !address ||
            latitude === null ||
            longitude === null
        ) {
            alert("모든 항목을 입력해주세요.")
            return
        }

        const token = localStorage.getItem("token")
        if (!token) {
            alert("로그인 정보가 없습니다.")
            return
        }
        const payload = {
            id: selectedItem.id,
            email,
            item: newItem,
            amount: Number.parseInt(newAmount),
            placeName: placeName,
            address: address,
            latitude: latitude,
            longitude: longitude,
            localDateTime: `${format(selectedDate, "yyyy-MM-dd")}T${newTime}:00`,
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.text()
                throw new Error(err || "수정 실패")
            }

            alert("소비 내역이 수정되었습니다.")
            closeModal()
            fetchConsumption(email)
        } catch (e) {
            console.error("수정 에러:", e)
            alert("소비 수정 실패")
        }
    }

    const fetchBalanceHistory = async (email, year, month) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                console.error("❌ 토큰 없음")
                return
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/history?email=${email}&year=${year}&month=${month}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            )

            if (!res.ok) throw new Error("불러오기 실패")

            const data = await res.json()

            if (Array.isArray(data)) {
                setBalanceHistory(data)
            } else {
                console.warn("응답이 배열이 아님, 빈 배열로 처리")
                setBalanceHistory([])
            }
        } catch (e) {
            console.error("잔고 이력 불러오기 실패", e)
            setBalanceHistory([])
        }
    }

    const fetchConsumption = async (email) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                console.error("❌ 토큰 없음")
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/check?email=${email}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) throw new Error("소비 데이터 불러오기 실패")

            const data = await res.json()
            const grouped = {}
            data.forEach((item) => {
                const key = item.localDateTime.split("T")[0]
                if (!grouped[key]) grouped[key] = []
                grouped[key].push({
                    id: item.id,
                    category: item.item,
                    amount: item.amount,
                    place: item.place,
                    placeName: item.place,
                    time: item.localDateTime.split("T")[1].slice(0, 5),
                    type: item.type,
                })
            })


            setConsumptionData(grouped)
        } catch (e) {
            console.error("소비 데이터 불러오기 실패", e)
        }
    }

    const fetchHabitual = async (email) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                console.error("❌ 토큰 없음")
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/analysis?email=${email}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) throw new Error("습관 분석 불러오기 실패")

            const data = await res.json()
            const habituals = data.filter((d) => d.habitual)
            if (habituals.length > 0) {
                const recent = habituals.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0]
                const hour = new Date(recent.dateTime).getHours()
                const timeSlot = getTimeSlot(hour)
                setHabitualInfo(`현재 사용자는 ${timeSlot.label} (${timeSlot.range})에 '${recent.item}'를 자주 소비합니다.`)
            }
        } catch (e) {
            console.error("습관 분석 실패", e)
        }
    }


    const handleManualBalanceChange = async () => {
        if (!email) return
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                console.error("❌ 토큰 없음")
                return
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/change`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    reason: manualReason,
                    amountChange: Number.parseInt(manualAmount),
                }),
            })
            if (!res.ok) throw new Error("요청 실패")
            alert("잔고 변경 완료")
            setManualReason("")
            setManualAmount("")
            fetchBalance(email)
            fetchBalanceHistory(email)
        } catch (e) {
            alert("잔고 변경 실패")
        }
    }

    const fetchFixedIncomes = async (email) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-income?email=${email}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!res.ok) throw new Error("고정 수입 불러오기 실패")

            const data = await res.json()
            setFixedIncomes(data)
        } catch (e) {
            console.error("고정 수입 조회 실패", e)
            setFixedIncomes([])
        }
    }

    const openHistoryPopup = () => setShowBalancePopup(true)
    const closeHistoryPopup = () => setShowBalancePopup(false)

    return (
        <>
            <Script
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=services`}
                strategy="afterInteractive"
            />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <PiggyBank className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    AI 소비 도우미
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="text-sm">
                                    {email}
                                </Badge>
                                <Button
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:brightness-110"
                                    size="sm"
                                    onClick={() => {
                                        window.location.href = "/premium";
                                    }}
                                >
                                    프리미엄 구독
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        localStorage.removeItem("userEmail")
                                        window.location.href = "/"
                                    }}
                                >
                                    로그아웃
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-100">이번 달 소비 총합</CardTitle>
                                <TrendingDown className="h-4 w-4 text-blue-200" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₩{thisMonthTotal.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-amber-100">습관성 소비 감지</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-amber-200" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm">{habitualInfo || "분석 정보 없음"}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-100">예산 초과 경고</CardTitle>
                                <TrendingUp className="h-4 w-4 text-red-200" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-semibold">
                                    ₩{(thisMonthTotal > 100000 ? thisMonthTotal - 100000 : 0).toLocaleString()} 초과
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Balance Section */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Wallet className="h-5 w-5" />
                                <span>현재 잔고</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-green-600">₩{balance?.toLocaleString() || 0}</div>
                                <div className="text-sm text-muted-foreground">
                                    최근 변경: {lastUpdated ? format(new Date(lastUpdated), "yyyy-MM-dd HH:mm") : "-"}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={() => {
                                        setEditingIncome(null)
                                        setFixedAmount("")
                                        setFixedDescription("")
                                        setFixedDay(1)
                                        setShowFixedIncomeModal(true)
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    고정 수입 관리
                                </Button>
                                <Button
                                    onClick={() => {
                                        setEditingExpense(null)
                                        setFixedExpenseAmount("")
                                        setFixedExpenseDescription("")
                                        setFixedExpenseDay(1)
                                        setShowFixedExpenseModal(true)
                                    }}
                                    variant="destructive"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    고정 지출 관리
                                </Button>
                                <Button variant="outline" onClick={openHistoryPopup}>
                                    <History className="w-4 h-4 mr-2" />
                                    잔고 이력
                                </Button>
                                <Button variant="outline" onClick={() => setShowInitialBalanceModal(true)}>
                                    초기 잔고 재설정
                                </Button>
                            </div>

                            {/* Fixed Incomes */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">이번 달 고정 수입</h3>
                                {fixedIncomes.length === 0 ? (
                                    <p className="text-muted-foreground">등록된 고정 수입이 없습니다.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {fixedIncomes.map((income) => (
                                            <div
                                                key={income.id}
                                                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border"
                                            >
                                                <div className="space-y-1">
                                                    <div className="font-semibold">{income.description}</div>
                                                    <div className="text-sm text-muted-foreground">{income.dayOfMonth}일</div>
                                                    <Badge variant={income.status === "반영완료" ? "default" : "secondary"}>
                                                        {income.status === "반영완료" ? "초기 잔고에 이미포함" : "다음 달 반영 예정"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-lg font-bold text-green-600">₩{income.amount.toLocaleString()}</div>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingIncome(income)
                                                                setFixedDescription(income.description)
                                                                setFixedAmount(income.amount)
                                                                setFixedDay(income.dayOfMonth)
                                                                setShowFixedIncomeModal(true)
                                                            }}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={async () => {
                                                                if (confirm("정말 삭제하시겠습니까?")) {
                                                                    const token = localStorage.getItem("token")
                                                                    await fetch(
                                                                        `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-income/${income.id}`,
                                                                        {
                                                                            method: "DELETE",
                                                                            headers: { Authorization: `Bearer ${token}` },
                                                                        },
                                                                    )
                                                                    alert("삭제되었습니다.")
                                                                    fetchFixedIncomes(email)
                                                                    fetchBalance(email)
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fixed Expenses */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">이번 달 고정 지출</h3>
                                {fixedExpenses.length === 0 ? (
                                    <p className="text-muted-foreground">등록된 고정 지출이 없습니다.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {fixedExpenses.map((expense) => (
                                            <div
                                                key={expense.id}
                                                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border"
                                            >
                                                <div className="space-y-1">
                                                    <div className="font-semibold">{expense.description}</div>
                                                    <div className="text-sm text-muted-foreground">{expense.dayOfMonth}일</div>
                                                    <Badge variant={expense.status === "반영완료" ? "default" : "secondary"}>
                                                        {expense.status === "반영완료" ? "초기잔고에 이미포함" : "다음 달 반영 예정"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-lg font-bold text-red-600">₩{expense.amount.toLocaleString()}</div>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingExpense(expense)
                                                                setFixedExpenseDescription(expense.description)
                                                                setFixedExpenseAmount(expense.amount)
                                                                setFixedExpenseDay(expense.dayOfMonth)
                                                                setShowFixedExpenseModal(true)
                                                            }}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={async () => {
                                                                if (confirm("정말 삭제하시겠습니까?")) {
                                                                    const token = localStorage.getItem("token")
                                                                    await fetch(
                                                                        `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-expense/${expense.id}`,
                                                                        {
                                                                            method: "DELETE",
                                                                            headers: { Authorization: `Bearer ${token}` },
                                                                        },
                                                                    )
                                                                    alert("삭제되었습니다.")
                                                                    fetchFixedExpenses(email)
                                                                    fetchBalance(email)
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calendar and Consumption */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Calendar */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>{format(currentDate, "yyyy년 M월")}</span>
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-2 text-sm text-center mb-4">
                                    {"일월화수목금토".split("").map((day, i) => (
                                        <div key={i} className="font-medium text-muted-foreground py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {(() => {
                                        const daysArray = []
                                        const firstDay = startOfMonth(currentDate)
                                        const lastDay = endOfMonth(currentDate)
                                        const firstWeekday = firstDay.getDay()

                                        for (let i = 0; i < firstWeekday; i++) {
                                            daysArray.push(<div key={`empty-${i}`} className="h-16" />)
                                        }

                                        eachDayOfInterval({ start: firstDay, end: lastDay }).forEach((day) => {
                                            const key = format(day, "yyyy-MM-dd")
                                            const isSelected = selectedKey === key
                                            const dayTotal = consumptionData[key]?.reduce(
                                                (acc, cur) => acc + (cur.type === "INCOME" ? cur.amount : -cur.amount),
                                                0,
                                            )

                                            daysArray.push(
                                                <div
                                                    key={key}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={`h-16 p-2 rounded-lg cursor-pointer border-2 transition-all hover:shadow-md ${
                                                        isSelected ? "border-blue-500 bg-blue-50" : "border-transparent hover:border-gray-200"
                                                    } ${isToday(day) ? "bg-blue-100 font-bold" : "bg-white"}`}
                                                >
                                                    <div className="text-sm font-medium">{format(day, "d")}</div>
                                                    {typeof dayTotal === "number" && dayTotal !== 0 && (
                                                        <div className={`text-xs font-medium ${dayTotal >= 0 ? "text-green-600" : "text-red-500"}`}>
                                                            ₩{Math.abs(dayTotal).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>,
                                            )
                                        })

                                        return daysArray
                                    })()}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Daily Consumption */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedKey ? `${format(selectedDate, "M월 d일")} 소비 내역` : "날짜를 선택해주세요"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedKey && (
                                    <>
                                        {/* Summary */}
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="bg-green-100 text-green-700 p-2 rounded text-center">
                                                <div className="font-medium">수입</div>
                                                <div>
                                                    ₩
                                                    {consumptionList
                                                        .filter((i) => i.type === "INCOME")
                                                        .reduce((a, c) => a + c.amount, 0)
                                                        .toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-red-100 text-red-600 p-2 rounded text-center">
                                                <div className="font-medium">지출</div>
                                                <div>
                                                    ₩
                                                    {consumptionList
                                                        .filter((i) => i.type === "EXPENSE")
                                                        .reduce((a, c) => a + c.amount, 0)
                                                        .toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">
                                                <div className="font-medium">총합</div>
                                                <div>₩{selectedTotal.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Consumption List */}
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {consumptionList.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{item.category}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center space-x-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{item.placeName}</span>
                                                            <span>•</span>
                                                            <span>{item.time}</span>
                                                        </div>
                                                        <div
                                                            className={`text-sm font-semibold ${item.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                                                        >
                                                            {item.type === "INCOME" ? "+" : "-"}₩{item.amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Button className="w-full" onClick={() => setModalOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            수입/지출 추가
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5" />
                                    <span>월별 소비 추이 ({chartYear}년)</span>
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Select value={monthlyViewType} onValueChange={setMonthlyViewType}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INCOME">수입</SelectItem>
                                            <SelectItem value="EXPENSE">지출</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm" onClick={() => setChartYear((prev) => prev - 1)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setChartYear((prev) => prev + 1)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={getMonthlyDataByType(consumptionData, chartYear, monthlyViewType)}>
                                    <XAxis dataKey="month" tickFormatter={(v) => v.split("-")[1] + "월"} />
                                    <YAxis tickFormatter={(v) => `₩${v.toLocaleString()}`} />
                                    <Tooltip formatter={(v) => `₩${v.toLocaleString()}`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </main>

                {/* Modals */}
                {/* Consumption Modal */}
                <Dialog
                    open={modalOpen} // ✅ 지도 모달은 별도로 처리
                    onOpenChange={(isOpen) => setModalOpen(isOpen)}
                >


                <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editMode ? "소비 수정" : "소비 추가"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex space-x-4">
                                <Label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="EXPENSE"
                                        checked={consumptionType === "EXPENSE"}
                                        onChange={() => setConsumptionType("EXPENSE")}
                                    />
                                    <span>지출</span>
                                </Label>
                                <Label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="INCOME"
                                        checked={consumptionType === "INCOME"}
                                        onChange={() => setConsumptionType("INCOME")}
                                    />
                                    <span>수입</span>
                                </Label>
                            </div>
                            <Input placeholder="항목 (ex. 점심)" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                            <Input
                                type="number"
                                placeholder="금액"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                            />
                            <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                            <div className="space-y-2">
                                <Button className="w-full" variant="outline" onClick={() => setShowMapModal(true)}>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    장소 선택
                                </Button>
                                {placeName && (
                                    <div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded">
                                        📍 {placeName}
                                        <br />📌 {address}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={closeModal}>
                                    취소
                                </Button>
                                <Button onClick={editMode ? handleUpdateConsumption : handleAddConsumption}>
                                    {editMode ? "수정 완료" : "등록"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Map Modal */}
                {showMapModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">장소 선택</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowMapModal(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex mt-3 space-x-2">
                                    <Input
                                        placeholder="장소 또는 주소 검색"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                handleSearchPlace()
                                            }
                                        }}
                                    />
                                    <Button onClick={handleSearchPlace}>
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 p-4">
                                <div id="map" className="w-full h-full rounded-lg" />
                            </div>
                            {searchResults.length > 0 && (
                                <div className="p-4 border-t max-h-40 overflow-y-auto">
                                    <p className="font-medium mb-2">검색 결과</p>
                                    <div className="space-y-2">
                                        {searchResults.map((place, idx) => (
                                            <div
                                                key={idx}
                                                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                                                onClick={() => {
                                                    const lat = Number.parseFloat(place.y)
                                                    const lng = Number.parseFloat(place.x)
                                                    const latLng = new window.kakao.maps.LatLng(lat, lng)

                                                    if (mapInstance) {
                                                        mapInstance.setCenter(latLng)
                                                        new window.kakao.maps.Marker({
                                                            position: latLng,
                                                            map: mapInstance,
                                                        })
                                                    }

                                                    setLatitude(lat)
                                                    setLongitude(lng)
                                                    setAddress(place.road_address_name || place.address_name)
                                                    setPlaceName(place.place_name || place.address_name)
                                                }}
                                            >
                                                <div className="font-medium">{place.place_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {place.road_address_name || place.address_name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="p-4 border-t">
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        if (!placeName || !address || latitude === null || longitude === null) {
                                            alert("장소를 선택해주세요.")
                                            return
                                        }
                                        setShowMapModal(false)
                                        setModalOpen(true)  // 🔥 명시적으로 다시 소비 추가 모달 유지
                                    }}
                                >
                                    선택 완료
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Balance History Modal */}
                {showBalancePopup && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>월별 잔고 이력</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={closeHistoryPopup}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex space-x-2">
                                    <Select
                                        value={chartYear.toString()}
                                        onValueChange={(value) => {
                                            setChartYear(Number(value))
                                            fetchBalanceHistory(email, Number(value), chartMonth)
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                                <SelectItem key={y} value={y.toString()}>
                                                    {y}년
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={chartMonth.toString()}
                                        onValueChange={(value) => {
                                            setChartMonth(Number(value))
                                            fetchBalanceHistory(email, chartYear, Number(value))
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                    {i + 1}월
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="overflow-y-auto">
                                {balanceHistory.length === 0 ? (
                                    <p className="text-muted-foreground">이력이 없습니다.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {balanceHistory.map((h, i) => (
                                            <div key={i} className="p-3 border rounded-lg">
                                                <div className="font-medium">{h.reason}</div>
                                                <div className={`text-sm ${h.amountChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                                                    {h.amountChange >= 0 ? "+" : "-"}₩{Math.abs(h.amountChange).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(h.createdAt), "yyyy-MM-dd HH:mm")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Initial Balance Modal */}
                {showInitialBalanceModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>초기 잔고 설정</CardTitle>
                                <CardDescription>초기 잔고를 설정하거나 재설정합니다.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    type="number"
                                    placeholder="초기 잔고 입력 (₩)"
                                    onChange={(e) => setManualAmount(e.target.value)}
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowInitialBalanceModal(false)}>
                                        취소
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(
                                                    `${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/init?email=${email}&initialAmount=${manualAmount}`,
                                                    {
                                                        method: "POST",
                                                    },
                                                )

                                                if (!res.ok) throw new Error("초기 설정 실패")

                                                alert("초기 잔고가 재설정되었습니다.")
                                                setShowInitialBalanceModal(false)
                                                fetchBalance(email)

                                                const currentYear = new Date().getFullYear()
                                                const currentMonth = new Date().getMonth() + 1
                                                setChartYear(currentYear)
                                                setChartMonth(currentMonth)
                                                fetchBalanceHistory(email, currentYear, currentMonth)
                                            } catch (e) {
                                                alert("초기 설정 실패")
                                            }
                                        }}
                                    >
                                        잔고 재설정 완료
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Fixed Income Modal */}
                {showFixedIncomeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>{editingIncome ? "고정 수입 수정" : "고정 수입 등록"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="수입 설명"
                                    value={fixedDescription}
                                    onChange={(e) => setFixedDescription(e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="금액"
                                    value={fixedAmount}
                                    onChange={(e) => setFixedAmount(e.target.value)}
                                />
                                <Select value={fixedDay.toString()} onValueChange={setFixedDay}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="날짜 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                {i + 1}일
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowFixedIncomeModal(false)}>
                                        취소
                                    </Button>
                                    <Button onClick={saveFixedIncome}>{editingIncome ? "수정 완료" : "저장"}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Fixed Expense Modal */}
                {showFixedExpenseModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>{editingExpense ? "고정 지출 수정" : "고정 지출 등록"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="지출 설명"
                                    value={fixedExpenseDescription}
                                    onChange={(e) => setFixedExpenseDescription(e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="금액"
                                    value={fixedExpenseAmount}
                                    onChange={(e) => setFixedExpenseAmount(e.target.value)}
                                />
                                <Select value={fixedExpenseDay.toString()} onValueChange={setFixedExpenseDay}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="날짜 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                {i + 1}일
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowFixedExpenseModal(false)}>
                                        취소
                                    </Button>
                                    <Button variant="destructive" onClick={saveFixedExpense}>
                                        {editingExpense ? "수정 완료" : "저장"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Variable Income Modal */}
                {showVariableIncomeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>가변 수입/지출 입력</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="사유 (ex. 보너스)"
                                    value={variableReason}
                                    onChange={(e) => setVariableReason(e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="금액 (+수입 / -지출)"
                                    value={variableAmount}
                                    onChange={(e) => setVariableAmount(e.target.value)}
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowVariableIncomeModal(false)}>
                                        취소
                                    </Button>
                                    <Button onClick={saveVariableIncome}>등록</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    )
}
