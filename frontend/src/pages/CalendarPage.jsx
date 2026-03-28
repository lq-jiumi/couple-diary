import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { diaryAPI } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCog, FaHeart, FaSignOutAlt } from 'react-icons/fa';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, partner, logout } = useAuth();
  const navigate = useNavigate();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await diaryAPI.getEntries(year, month);
      const entriesMap = {};
      response.data.entries.forEach(entry => {
        entriesMap[entry.date] = entry;
      });
      setEntries(entriesMap);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleGoToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    navigate(`/diary/${dateStr}`);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = getDay(monthStart);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const hasEntry = !!entries[dateStr];
      const isCurrentDay = isToday(day);

      days.push(
        <div
          key={dateStr}
          onClick={() => handleDateClick(day)}
          className={`relative h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all calendar-day ${
            isCurrentDay
              ? 'bg-red-500 text-white font-bold shadow-lg'
              : hasEntry
              ? 'bg-red-50 hover:bg-red-100'
              : 'hover:bg-gray-100'
          }`}
        >
          <span className={hasEntry && !isCurrentDay ? 'text-red-500' : ''}>
            {format(day, 'd')}
          </span>
          {hasEntry && (
            <span className="absolute bottom-1 text-red-500 text-xs">❤</span>
          )}
        </div>
      );
    });

    return days;
  };

  return (
    <div className="min-h-screen gradient-bg">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaHeart className="text-red-500 text-xl" />
            <h1 className="text-xl font-bold text-gray-800">情侣日记</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">
              {partner ? `${user?.displayName} 💕 ${partner.displayName}` : user?.displayName}
            </span>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              <FaCog />
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                {format(currentMonth, 'yyyy 年 M 月', { locale: zhCN })}
              </h2>
              <button
                onClick={handleGoToToday}
                className="px-3 py-1 text-sm bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
              >
                今天
              </button>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {loading ? (
              <div className="col-span-7 py-12 text-center text-gray-500">
                加载中...
              </div>
            ) : (
              renderCalendarDays()
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>今天</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>有记录</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          点击任意日期开始记录 💕
        </div>
      </main>
    </div>
  );
}
