import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaUser, FaCalendar, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function SettingsPage() {
    const { user, partner, logout, unbindCouple } = useAuth();
    const navigate = useNavigate();
    const [showUnbindConfirm, setShowUnbindConfirm] = useState(false);
    const [unbindLoading, setUnbindLoading] = useState(false);

    const handleUnbind = async () => {
        setUnbindLoading(true);
        try {
            await unbindCouple();
            navigate('/');
        } catch (error) {
            alert('解绑失败，请重试');
        } finally {
            setUnbindLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen gradient-bg">
            <header className="bg-white shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 text-gray-500 hover:text-gray-700 transition"
                    >
                        ← 返回
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">设置</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                                <FaHeart className="text-red-500 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{user?.displayName}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-4">情侣信息</h3>
                        {partner ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                                        <span className="text-secondary-600 font-medium">
                                            {partner.displayName?.[0]?.toUpperCase() || 'P'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{partner.displayName}</p>
                                        <p className="text-xs text-gray-500">{partner.email}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-red-50 text-red-500 text-sm rounded-full">
                                    💕 已绑定
                                </span>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500 mb-3">还没有绑定情侣</p>
                                <button
                                    onClick={() => navigate('/bind')}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    立即绑定
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        <button
                            onClick={() => navigate('/bind')}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
                        >
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <FaUser className="text-blue-500" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-gray-800">情侣设置</p>
                                <p className="text-xs text-gray-500">管理情侣绑定关系</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
                        >
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                <FaCalendar className="text-green-500" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-gray-800">纪念日</p>
                                <p className="text-xs text-gray-500">设置重要日期提醒</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                    </div>

                    <div className="p-6 border-t border-gray-100 space-y-4">
                        {partner && (
                            <button
                                onClick={() => setShowUnbindConfirm(true)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 transition"
                            >
                                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                                    <FaExclamationTriangle className="text-red-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-red-600">解除情侣绑定</p>
                                    <p className="text-xs text-gray-500">解除后双方记录仍保留</p>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <FaSignOutAlt className="text-gray-500" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-gray-800">退出登录</p>
                                <p className="text-xs text-gray-500">当前账号将退出</p>
                            </div>
                        </button>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                    情侣日记 v1.0.0 💕
                </p>
            </main>

            {showUnbindConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <div className="text-center">
                            <div className="text-4xl mb-4">💔</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">确定要解除情侣绑定吗？</h3>
                            <p className="text-gray-500 mb-6">
                                解除后双方各自的日记记录仍会保留，但将无法再同步查看对方的记录。
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowUnbindConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUnbind}
                                    disabled={unbindLoading}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                                >
                                    {unbindLoading ? '处理中...' : '确认解绑'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
