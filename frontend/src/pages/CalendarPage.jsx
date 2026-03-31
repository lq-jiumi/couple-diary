import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { diaryAPI } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCog, FaHeart, FaSignOutAlt, FaCalendar, FaBook, FaCamera, FaStar, FaHome } from 'react-icons/fa';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, partner, logout } = useAuth();
  const navigate = useNavigate();
  
  // 假设在一起的开始日期，实际应该从数据库获取
  const relationshipStartDate = new Date('2023-09-18');
  const daysTogether = differenceInDays(new Date(), relationshipStartDate) + 1;

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
    <div className="min-h-screen bg-[#fef9f3]">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaHeart className="text-red-500 text-xl" />
            <span className="text-gray-600">情侣日常</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-500 transition">首页</button>
            <button onClick={() => navigate('/diary')} className="text-gray-600 hover:text-red-500 transition">日记</button>
            <button className="text-gray-600 hover:text-red-500 transition">回忆库</button>
            <button className="text-gray-600 hover:text-red-500 transition">心愿单</button>
            <button onClick={() => navigate('/settings')} className="text-gray-600 hover:text-red-500 transition">设置</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 在一起天数展示 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">👩</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-sm">我们已相爱</p>
              <h1 className="text-4xl font-bold text-red-500 mb-2">{daysTogether}天</h1>
              <p className="text-gray-400 text-sm">从 {format(relationshipStartDate, 'yyyy年MM月dd日')} 开始</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">👨</span>
            </div>
          </div>
          
          {/* 即将到来的纪念日 */}
          <div className="mt-6 bg-red-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <FaCalendar className="text-red-500" />
                即将到来的纪念日
              </h3>
            </div>
            <div className="bg-white rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                  🎁
                </div>
                <div>
                  <p className="font-medium">一周年</p>
                  <p className="text-sm text-gray-500">还有 30 天</p>
                </div>
              </div>
              <div className="w-1/3 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 快速入口 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            快速入口
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <button onClick={() => navigate('/diary')} className="bg-red-50 rounded-xl p-4 text-center hover:bg-red-100 transition">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mx-auto mb-2">
                <FaBook className="text-xl" />
              </div>
              <p className="text-sm font-medium">日常记录</p>
              <p className="text-xs text-gray-500">记录美好时光</p>
            </button>
            <button className="bg-red-50 rounded-xl p-4 text-center hover:bg-red-100 transition">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mx-auto mb-2">
                <FaCalendar className="text-xl" />
              </div>
              <p className="text-sm font-medium">纪念日</p>
              <p className="text-xs text-gray-500">重要的日子</p>
            </button>
            <button className="bg-red-50 rounded-xl p-4 text-center hover:bg-red-100 transition">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mx-auto mb-2">
                <FaStar className="text-xl" />
              </div>
              <p className="text-sm font-medium">心愿清单</p>
              <p className="text-xs text-gray-500">未来的约定</p>
            </button>
            <button className="bg-red-50 rounded-xl p-4 text-center hover:bg-red-100 transition">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mx-auto mb-2">
                <FaCamera className="text-xl" />
              </div>
              <p className="text-sm font-medium">回忆库</p>
              <p className="text-xs text-gray-500">珍藏的时光</p>
            </button>
          </div>
        </div>

        {/* 图片展示 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20couple%20playing%20by%20the%20river%20with%20sheep%20and%20dog%2C%20blue%20sky%2C%20green%20grass%2C%20cute%20style&image_size=landscape_4_3" 
              alt="和你一起看过的风景" 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600">和你一起看过的风景，都是最美的画面</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20couple%20riding%20scooter%20under%20cherry%20blossoms%2C%20cute%20style%2C%20happy%20expression&image_size=landscape_4_3" 
              alt="只要有你在身边" 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600">只要有你在身边，每一天都是好天气</p>
            </div>
          </div>
        </div>

        {/* 日历部分 */}
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
