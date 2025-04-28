"use client";

import { useEffect, useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, addMonths, subMonths,
} from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

function getTopCategories(data) {
  const categoryTotals = {};
  Object.values(data).flat().forEach(({ category, amount }) => {
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });
  return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, value]) => ({ name, value }));
}

function getYearlyMonthlyTotals(data, year) {
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
    month: `${year}-${String(i + 1).padStart(2, '0')}`,
    total: 0
  }));

  for (const [dateStr, entries] of Object.entries(data)) {
    const date = new Date(dateStr);
    if (date.getFullYear() === year) {
      const monthIndex = date.getMonth(); // 0-based
      const sum = entries.reduce((acc, cur) => acc + cur.amount, 0);
      monthlyTotals[monthIndex].total += sum;
    }
  }
  return monthlyTotals;
}

function getTimeSlot(hour) {
  if (hour < 6) return { label: "새벽", range: "00시~06시" };
  if (hour < 12) return { label: "오전", range: "06시~12시" };
  if (hour < 18) return { label: "오후", range: "12시~18시" };
  return { label: "저녁/야간", range: "18시~24시" };
}

export default function Dashboard() {
  const [email, setEmail] = useState(null);
  const [balance, setBalance] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [manualReason, setManualReason] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [showBalancePopup, setShowBalancePopup] = useState(false);
  const [fixedIncomes, setFixedIncomes] = useState([]); // 고정 수입 목록 저장

  // 고정 수입 모달 상태
  const [showFixedIncomeModal, setShowFixedIncomeModal] = useState(false);
  const [fixedAmount, setFixedAmount] = useState('');
  const [fixedDescription, setFixedDescription] = useState('');
  const [fixedDay, setFixedDay] = useState(1);

// 가변 수입/지출 모달 상태
  const [showVariableIncomeModal, setShowVariableIncomeModal] = useState(false);
  const [variableAmount, setVariableAmount] = useState('');
  const [variableReason, setVariableReason] = useState('');

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setSelectedItem(null);
    setNewItem('');
    setNewAmount('');
    setNewPlace('');
    setNewTime('');
  };


  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [habitualInfo, setHabitualInfo] = useState(null);
  const [consumptionData, setConsumptionData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false);
  const [chartMonth, setChartMonth] = useState(new Date().getMonth() + 1);
  const handleEdit = (item) => {
    setEditMode(true);
    setSelectedItem(item);
    setNewItem(item.category);
    setNewAmount(item.amount);
    setNewPlace(item.place);
    setNewTime(item.time); // time은 "HH:mm" 형식
    setModalOpen(true);
  };




  const [newItem, setNewItem] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newTime, setNewTime] = useState('');

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const consumptionList = selectedKey ? consumptionData[selectedKey] || [] : [];
  const selectedTotal = consumptionList.reduce((acc, cur) => acc + cur.amount, 0);
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  const thisMonthTotal = Object.entries(consumptionData).reduce((acc, [key, list]) => {
    if (key.startsWith(format(currentDate, 'yyyy-MM'))) {
      return acc + list.reduce((a, c) => a + c.amount, 0);
    }
    return acc;
  }, 0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  useEffect(() => {
    if (email) { // email이 세팅된 다음에만 실행
      fetchBalance(email);
      fetchBalanceHistory(email, new Date().getFullYear(), new Date().getMonth() + 1);
      fetchConsumption(email);
      fetchHabitual(email);
      fetchFixedIncomes(email);
    }
  }, [email]); // email 변화 감지



  const fetchBalance = async (email) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ 토큰 없음");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance?email=${email}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.status === 404) {
        setShowInitialBalanceModal(true);
        return;
      }

      const text = await res.text();
      if (!text) {
        console.warn("⚠️ 서버 응답 비어있음");
        return;
      }
      const data = JSON.parse(text);

      setBalance(data.totalAmount);
      setLastUpdated(data.lastUpdated);
    } catch (e) {
      console.error("잔고 조회 실패", e);
    }
  };




  const saveFixedIncome = async () => {
    if (!email) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const payload = {
      email,
      description: fixedDescription,
      amount: parseInt(fixedAmount),
      dayOfMonth: parseInt(fixedDay),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-income/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ 토큰 추가
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("고정 수입 저장 실패");

      alert("고정 수입이 등록되었습니다.");
      setShowFixedIncomeModal(false);
      setFixedAmount('');
      setFixedDescription('');
      setFixedDay(1);
      fetchBalance(email); // 잔고 갱신
      fetchFixedIncomes(email); // 고정 수입 갱신
    } catch (e) {
      alert("고정 수입 저장 오류");
    }
  };


  const saveVariableIncome = async () => {
    if (!email) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const payload = {
      email,
      reason: variableReason,
      amountChange: parseInt(variableAmount),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ 토큰 추가
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("가변 수입/지출 저장 실패");

      alert("변동 수입/지출이 반영되었습니다.");
      setShowVariableIncomeModal(false);
      setVariableReason('');
      setVariableAmount('');
      fetchBalance(email); // 잔고 갱신
    } catch (e) {
      alert("변동 수입/지출 저장 오류");
    }
  };


  const handleAddConsumption = async () => {
    if (!email || !newItem || !newAmount || !newPlace || !newTime || !selectedDate) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const payload = {
      email,
      item: newItem,
      amount: parseInt(newAmount),
      place: newPlace,
      localDateTime: `${format(selectedDate, 'yyyy-MM-dd')}T${newTime}:00`,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("등록 실패");

      alert("소비 내역이 추가되었습니다.");
      closeModal();
      fetchConsumption(email);
    } catch (e) {
      alert("소비 추가 실패");
    }
  };
  const handleDelete = async (id) => {
    if (!email) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");

      alert("삭제되었습니다.");
      fetchConsumption(email);
    } catch (e) {
      alert("삭제 실패");
    }
  };


  const handleUpdateConsumption = async () => {
    if (!email || !newItem || !newAmount || !newPlace || !newTime || !selectedItem) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const payload = {
      id: selectedItem.id,
      email,
      item: newItem,
      amount: parseInt(newAmount),
      place: newPlace,
      localDateTime: `${format(selectedDate, 'yyyy-MM-dd')}T${newTime}:00`,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("수정 실패");

      alert("소비 내역이 수정되었습니다.");
      closeModal();
      fetchConsumption(email);
    } catch (e) {
      alert("소비 수정 실패");
    }
  };



  const fetchBalanceHistory = async (email, year, month) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ 토큰 없음");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/history?email=${email}&year=${year}&month=${month}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("불러오기 실패");

      const data = await res.json();

      if (Array.isArray(data)) {
        setBalanceHistory(data);           // 정상 응답 처리
      } else {
        console.warn("응답이 배열이 아님, 빈 배열로 처리");
        setBalanceHistory([]);             // 예외 상황 fallback
      }
    } catch (e) {
      console.error("잔고 이력 불러오기 실패", e);
      setBalanceHistory([]);               // 네트워크 에러 fallback
    }
  };





  const fetchConsumption = async (email) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/check?email=${email}`);
      const data = await res.json();
      const grouped = {};
      data.forEach(item => {
        const key = item.localDateTime.split("T")[0];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          id: item.id,
          category: item.item,
          amount: item.amount,
          place: item.place,
          time: item.localDateTime.split("T")[1].slice(0, 5),
        });
      });
      setConsumptionData(grouped);
    } catch (e) {
      console.error("소비 데이터 불러오기 실패", e);
    }
  };

  const fetchHabitual = async (email) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/consumption/analysis?email=${email}`);
      const data = await res.json();
      const habituals = data.filter(d => d.habitual);
      if (habituals.length > 0) {
        const recent = habituals.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0];
        const hour = new Date(recent.dateTime).getHours();
        const timeSlot = getTimeSlot(hour);
        setHabitualInfo(`현재 사용자는 ${timeSlot.label} (${timeSlot.range})에 '${recent.item}'를 자주 소비합니다.`);
      }
    } catch (e) {
      console.error("습관 분석 실패", e);
    }
  };

  const handleManualBalanceChange = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reason: manualReason,
          amountChange: parseInt(manualAmount),
        }),
      });
      if (!res.ok) throw new Error("요청 실패");
      alert("잔고 변경 완료");
      setManualReason("");
      setManualAmount("");
      fetchBalance(email);
      fetchBalanceHistory(email);
    } catch (e) {
      alert("잔고 변경 실패");
    }
  };

  const fetchFixedIncomes = async (email) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/fixed-income?email=${email}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",  // ✅ 추가
        },
      });

      if (!res.ok) throw new Error("고정 수입 불러오기 실패");

      const data = await res.json();
      setFixedIncomes(data);
    } catch (e) {
      console.error("고정 수입 조회 실패", e);
      setFixedIncomes([]); // 실패 시 빈 배열
    }
  };


  const openHistoryPopup = () => setShowBalancePopup(true);
  const closeHistoryPopup = () => setShowBalancePopup(false);

  return (
      <main className="min-h-screen bg-white p-6 relative">
        {/* 상단 프로필 */}
        <div className="absolute top-4 right-6 flex items-center space-x-4">
          <span className="text-sm text-gray-800 font-medium">{email}</span>
          <button
              onClick={() => {
                localStorage.removeItem("userEmail");
                window.location.href = "/";
              }}
              className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            로그아웃
          </button>
        </div>

        <div className="text-center text-3xl font-bold mb-6 text-gray-900">AI 소비 도우미</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 🧾 이번 달 소비 총합 */}
          <div className="border rounded-xl bg-white shadow-sm p-4">
            <h3 className="text-sm text-gray-600 font-semibold mb-1">📊 이번 달 소비 총합</h3>
            <div className="text-2xl font-bold text-blue-700">₩{thisMonthTotal.toLocaleString()}</div>
          </div>

          {/* ❗ 습관성 소비 감지됨 */}
          <div className="border rounded-xl bg-white shadow-sm p-4">
            <h3 className="text-sm text-gray-600 font-semibold mb-1">❗ 습관성 소비 감지됨</h3>
            <div className="text-sm text-gray-800">{habitualInfo || "분석 정보 없음"}</div>
          </div>

          {/* 📉 예산 초과 경고 */}
          <div className="border rounded-xl bg-white shadow-sm p-4">
            <h3 className="text-sm text-gray-600 font-semibold mb-1">📉 이번 달 예산 초과 예상</h3>
            <div className="text-sm text-orange-500 font-semibold">
              ₩{(thisMonthTotal > 100000 ? thisMonthTotal - 100000 : 0).toLocaleString()} 초과 경고
            </div>
          </div>
        </div>


        {/* 💵 현재 잔고 */}
        <div className="bg-white border rounded-xl p-4 shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">💵 현재 잔고</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-green-600">₩{balance?.toLocaleString() || 0}</span>
            <span className="text-sm text-gray-500">
          최근 변경: {lastUpdated ? format(new Date(lastUpdated), "yyyy-MM-dd HH:mm") : "-"}
        </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
                className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2 text-sm font-medium"
                onClick={() => setShowFixedIncomeModal(true)}
            >
              고정 수입 등록 및 관리
            </button>
            <button
                className="bg-purple-600 hover:bg-purple-700 text-white rounded px-3 py-2 text-sm font-medium"
                onClick={() => setShowVariableIncomeModal(true)}
            >
              가변 수입/지출 추가
            </button>
          </div>


          <button
              onClick={openHistoryPopup}
              className="mt-4 text-sm text-blue-500 underline hover:text-blue-700"
          >
            월별 잔고 이력 보기
          </button>
          {/* 📆 이번 달 고정 수입 */}
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 text-gray-800">📆 이번 달 고정 수입</h3>
            {fixedIncomes.length === 0 ? (
                <p className="text-sm text-gray-500">등록된 고정 수입이 없습니다.</p>
            ) : (
                <ul className="space-y-2">
                  {fixedIncomes.map((income) => (
                      <li
                          key={income.id}
                          className="flex flex-wrap items-center gap-x-2 border-b pb-1 text-sm text-gray-800"
                      >
                        <span className="font-semibold">{income.description}</span>
                        <span className="text-gray-500">{income.dayOfMonth}일</span>
                        <span
                            className={`font-semibold ${
                                income.status === "반영완료" ? "text-green-500" : "text-orange-500"
                            }`}
                        >
        [{income.status}]
      </span>
                        <span className="text-green-600 font-bold">
        ₩{income.amount.toLocaleString()}
      </span>
                      </li>
                  ))}
                </ul>

            )}
          </div>


          <button
              onClick={() => setShowInitialBalanceModal(true)}
              className="mt-2 text-sm text-red-500 underline hover:text-red-700"
          >
            초기 잔고 재설정
          </button>


        </div>

        {/* 잔고 이력 팝업 */}
        {showBalancePopup && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white w-[400px] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
                <h3 className="text-lg font-bold mb-4 text-gray-800">📅 월별 잔고 이력</h3>

                {/* 🔽 연도/월 선택 */}
                <div className="flex space-x-2 mb-4">
                  <select
                      value={chartYear}
                      onChange={(e) => {
                        setChartYear(Number(e.target.value));
                        fetchBalanceHistory(email, Number(e.target.value), chartMonth);
                      }}
                      className="border rounded px-2 py-1 text-sm text-black"
                  >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>
                  <select
                      value={chartMonth}
                      onChange={(e) => {
                        setChartMonth(Number(e.target.value));
                        fetchBalanceHistory(email, chartYear, Number(e.target.value));
                      }}
                      className="border rounded px-2 py-1 text-sm text-black"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}월</option>
                    ))}
                  </select>
                </div>

                {/* 이력 목록 */}
                {balanceHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">이력이 없습니다.</p>
                ) : (
                    <ul className="space-y-3">
                      {balanceHistory.map((h, i) => (
                          <li key={i} className="flex flex-col border-b pb-2">
                            <span className="font-medium text-gray-700">사유: {h.reason}</span>
                            <span className={`text-sm ${h.amountChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {h.amountChange >= 0 ? '+' : '-'}₩{Math.abs(h.amountChange).toLocaleString()}
              </span>
                            <span className="text-xs text-gray-400">
                {format(new Date(h.createdAt), "yyyy-MM-dd HH:mm")}
              </span>
                          </li>
                      ))}
                    </ul>
                )}

                <button
                    onClick={closeHistoryPopup}
                    className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
        )}


        {/* 달력 + 소비 내역 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border shadow-sm col-span-2">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-500">←</button>
              <span className="font-semibold text-lg text-gray-800">
            {format(currentDate, 'yyyy년 M월')}
          </span>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-500">→</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm text-center">
              {'일월화수목금토'.split('').map((day, i) => (
                  <div key={i} className="text-gray-500">{day}</div>
              ))}
              {eachDayOfInterval({start: startOfMonth(currentDate), end: endOfMonth(currentDate)}).map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const isSelected = selectedKey === key;
                const dayTotal = consumptionData[key]?.reduce((acc, cur) => acc + cur.amount, 0);
                return (
                    <div
                        key={key}
                        onClick={() => setSelectedDate(day)}
                        className={`rounded-lg px-2 py-1 cursor-pointer border text-sm text-black ${isSelected ? 'border-2 border-blue-600 bg-blue-100' : 'border-gray-300'} ${isToday(day) ? 'font-bold text-blue-700' : ''}`}
                    >
                      <div>{format(day, 'd')}</div>
                      {dayTotal && <div className="text-xs text-gray-600">₩{dayTotal.toLocaleString()}</div>}
                    </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm col-span-1">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {selectedKey ? `${format(selectedDate, 'yyyy년 M월 d일')} 소비 내역` : '날짜를 선택해주세요'}
            </h3>
            {selectedKey && (
                <>
                  <div className="bg-blue-100 text-blue-800 p-2 rounded mb-3 font-semibold text-center">
                    총합 ₩{selectedTotal.toLocaleString()}
                  </div>
                  <ul className="space-y-2">
                    {consumptionList.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                          <div className="flex flex-col text-sm text-gray-800">
                            <span>{item.category} - {item.place} ({item.time})</span>
                            <span className="font-semibold">₩{item.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:underline text-xs"
                            >
                              수정
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-500 hover:underline text-xs"
                            >
                              삭제
                            </button>
                          </div>
                        </li>
                    ))}
                  </ul>
                  <button
                      onClick={() => setModalOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 py-2 rounded font-semibold"
                  >
                    소비 추가
                  </button>
                </>
            )}
          </div>
        </div>
        {/* 소비 추가/수정 모달 */}
        {modalOpen && (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  {editMode ? "소비 수정" : "소비 추가"}
                </h2>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-2 text-black"
                    placeholder="항목 (ex. 점심)"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                />
                <input
                    type="number"
                    className="w-full border rounded px-3 py-2 mb-2 text-black"
                    placeholder="금액"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                />
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-2 text-black"
                    placeholder="장소"
                    value={newPlace}
                    onChange={e => setNewPlace(e.target.value)}
                />
                <input
                    type="time"
                    className="w-full border rounded px-3 py-2 mb-4 text-black"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                />
                <div className="flex justify-between">
                  <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-300 rounded text-sm"
                  >
                    닫기
                  </button>
                  <button
                      onClick={editMode ? handleUpdateConsumption : handleAddConsumption}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                  >
                    {editMode ? "수정 완료" : "등록"}
                  </button>
                </div>
              </div>
            </div>
        )}


        {/* 📊 소비 추이 & 주요 카테고리 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">📅 {chartYear}년 소비 추이</h3>
              <div className="space-x-2">
                <button
                    onClick={() => setChartYear(prev => prev - 1)}
                    className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                >
                  ← 작년
                </button>
                <button
                    onClick={() => setChartYear(prev => prev + 1)}
                    className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                >
                  내년 →
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getYearlyMonthlyTotals(consumptionData, chartYear)}>
                <XAxis dataKey="month" tickFormatter={(v) => v.split("-")[1] + "월"}/>
                <YAxis tickFormatter={(v) => `₩${v.toLocaleString()}`}/>
                <Tooltip formatter={(v) => `₩${v.toLocaleString()}`}/>
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 주요 소비 카테고리</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                    data={getTopCategories(consumptionData)}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                >
                  {getTopCategories(consumptionData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₩${v.toLocaleString()}`}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* ✅ 초기 잔고 설정 모달 (main 안 가장 마지막 위치에 추가) */}
        {/* ✅ 초기 잔고 설정 모달 (main 안 가장 마지막 위치에 추가) */}
        {showInitialBalanceModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg text-black relative">
                <h3 className="text-lg font-bold mb-4 text-gray-800">💡 초기 잔고 설정 또는 재설정</h3>
                <input
                    type="number"
                    placeholder="초기 잔고 입력 (₩)"
                    className="w-full border rounded px-3 py-2 mb-4 text-black"
                    onChange={(e) => setManualAmount(e.target.value)}
                />
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/finance/balance/init?email=${email}&initialAmount=${manualAmount}`, {
                          method: "POST",
                        });

                        if (!res.ok) throw new Error("초기 설정 실패");

                        alert("초기 잔고가 재설정되었습니다.");
                        setShowInitialBalanceModal(false);
                        fetchBalance(email);

                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth() + 1;
                        setChartYear(currentYear);
                        setChartMonth(currentMonth);
                        fetchBalanceHistory(email, currentYear, currentMonth);

                      } catch (e) {
                        alert("초기 설정 실패");
                      }
                    }}
                >
                  잔고 재설정 완료
                </button>

                {/* ✕ 닫기 버튼 추가 */}
                <button
                    onClick={() => setShowInitialBalanceModal(false)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

        )}
        {/* ✅ 고정 수입 모달 */}
        {showFixedIncomeModal && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-[400px] text-black relative">
                <h2 className="text-lg font-bold mb-4">📅 고정 수입 등록</h2>
                <input type="text" placeholder="수입 설명" className="w-full mb-2 px-3 py-2 border rounded"
                       value={fixedDescription} onChange={e => setFixedDescription(e.target.value)}/>
                <input type="number" placeholder="금액" className="w-full mb-2 px-3 py-2 border rounded"
                       value={fixedAmount} onChange={e => setFixedAmount(e.target.value)}/>
                <select
                    className="w-full mb-4 px-3 py-2 border rounded text-black"
                    value={fixedDay}
                    onChange={e => setFixedDay(e.target.value)}
                >
                  {Array.from({length: 31}, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}일</option>
                  ))}
                </select>

                <div className="flex justify-between">
                  <button onClick={() => setShowFixedIncomeModal(false)} className="bg-gray-300 px-4 py-2 rounded">취소
                  </button>
                  <button onClick={saveFixedIncome} className="bg-blue-600 text-white px-4 py-2 rounded">저장</button>
                </div>
              </div>
            </div>
        )}

        {/* ✅ 가변 수입/지출 모달 */}
        {showVariableIncomeModal && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-[400px] text-black relative">
                <h2 className="text-lg font-bold mb-4">💸 가변 수입/지출 입력</h2>
                <input type="text" placeholder="사유 (ex. 보너스)" className="w-full mb-2 px-3 py-2 border rounded" value={variableReason} onChange={e => setVariableReason(e.target.value)} />
                <input type="number" placeholder="금액 (+수입 / -지출)" className="w-full mb-4 px-3 py-2 border rounded" value={variableAmount} onChange={e => setVariableAmount(e.target.value)} />
                <div className="flex justify-between">
                  <button onClick={() => setShowVariableIncomeModal(false)} className="bg-gray-300 px-4 py-2 rounded">취소</button>
                  <button onClick={saveVariableIncome} className="bg-blue-600 text-white px-4 py-2 rounded">등록</button>
                </div>
              </div>
            </div>
        )}




      </main>
  );
}


