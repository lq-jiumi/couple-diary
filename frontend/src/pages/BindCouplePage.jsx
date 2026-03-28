import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaCopy, FaLink } from 'react-icons/fa';

export default function BindCouplePage() {
  const [activeTab, setActiveTab] = useState('create');
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeData, setCodeData] = useState(null);
  const { createInviteCode, joinWithCode } = useAuth();
  const navigate = useNavigate();

  const handleCreateInvite = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await createInviteCode();
      setCodeData(data);
      setInviteCode(data.inviteCode);
    } catch (err) {
      setError(err.response?.data?.error || '创建邀请码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('请输入邀请码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await joinWithCode(joinCode.trim());
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '加入失败，邀请码无效或已过期');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeData?.inviteLink || inviteCode);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <FaHeart className="text-red-500 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">绑定情侣</h1>
          <p className="text-gray-500 mt-2">邀请你的另一半，一起记录美好时光</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('create'); setCodeData(null); setError(''); }}
            className={`flex-1 pb-3 text-center font-medium transition ${
              activeTab === 'create'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            创建邀请
          </button>
          <button
            onClick={() => { setActiveTab('join'); setJoinCode(''); setError(''); }}
            className={`flex-1 pb-3 text-center font-medium transition ${
              activeTab === 'join'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            加入情侣
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="space-y-6">
            {!codeData ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-6">
                  创建一个邀请码，发送给你的另一半
                </p>
                <button
                  onClick={handleCreateInvite}
                  disabled={loading}
                  className="bg-red-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? '生成中...' : '生成邀请码'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">邀请码</p>
                  <p className="text-2xl font-bold text-center tracking-widest text-red-500">
                    {inviteCode}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">邀请链接</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={codeData.inviteLink}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="p-2 bg-red-50 text-red-500 rounded hover:bg-red-100 transition"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  链接有效期至 {new Date(codeData.expiresAt).toLocaleString('zh-CN')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleJoinWithCode} className="space-y-6">
            <div className="text-center py-4">
              <p className="text-gray-500 mb-6">
                输入另一半发来的邀请码或链接
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邀请码
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-center text-xl tracking-widest font-medium"
                placeholder="XXXXXXXX"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !joinCode.trim()}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaLink />
              {loading ? '加入中...' : '加入情侣'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
