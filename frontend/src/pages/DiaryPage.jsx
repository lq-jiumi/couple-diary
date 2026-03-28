import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { diaryAPI, uploadAPI } from '../services/api';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { FaArrowLeft, FaArrowRight, FaHeart, FaTrash, FaEdit, FaCheck, FaTimes, FaImage, FaTimesCircle } from 'react-icons/fa';

export default function DiaryPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { refreshCoupleInfo } = useAuth();

  const [entry, setEntry] = useState(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const currentDate = parseISO(date);

  useEffect(() => {
    fetchEntry();
  }, [date]);

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const response = await diaryAPI.getEntryByDate(date);
      if (response.data.entry) {
        setEntry(response.data.entry);
        setContent(response.data.entry.content || '');
        setImages(response.data.entry.images || []);
        setIsEditing(false);
      } else {
        setEntry(null);
        setContent('');
        setImages([]);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (entry) {
        await diaryAPI.updateEntry(date, { content, images });
      } else {
        await diaryAPI.createEntry({ date, content, images });
      }
      await fetchEntry();
      await refreshCoupleInfo();
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await diaryAPI.deleteEntry(date);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('删除失败，请重试');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} 超过10MB限制`);
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);
        const response = await uploadAPI.uploadImage(formData);
        setImages(prev => [...prev, response.data.image]);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePrevDay = () => {
    const prevDate = format(subDays(currentDate, 1), 'yyyy-MM-dd');
    navigate(`/diary/${prevDate}`);
  };

  const handleNextDay = () => {
    const nextDate = format(addDays(currentDate, 1), 'yyyy-MM-dd');
    navigate(`/diary/${nextDate}`);
  };

  const displayDate = format(currentDate, 'yyyy 年 M 月 d 日');

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 heart-pulse">💕</div>
          <div className="text-xl text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-500 hover:text-gray-700 transition"
          >
            ← 返回
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">{displayDate}</h1>
            <p className="text-xs text-gray-500">{format(currentDate, 'EEEE', { locale: require('date-fns/locale/zh-CN') })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {showDeleteConfirm ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💔</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确定要删除这条记录吗？</h3>
              <p className="text-gray-500 mb-6">删除后无法恢复，所有内容将被永久删除</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-500">
                <FaHeart />
                <span className="font-medium">今日记录</span>
              </div>
              {entry && !isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-red-500 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-500 hover:text-red-500 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="记录今天的美好时光..."
                  className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />

                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaImage className="text-gray-500" />
                    <span className="text-sm text-gray-600">添加图片</span>
                    {uploading && <span className="text-sm text-red-500">上传中...</span>}
                  </div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="block w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition"
                  >
                    <span className="text-gray-500">点击或拖拽上传图片</span>
                    <br />
                    <span className="text-xs text-gray-400">支持 jpg/png/webp，单张≤10MB</span>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt=""
                          className="w-full h-24 object-cover rounded-lg"
                          onClick={() => setLightboxImage(img.url)}
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimesCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (!entry) {
                        navigate('/');
                      } else {
                        fetchEntry();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <FaTimes /> 取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaCheck /> {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="prose max-w-none">
                  {content ? (
                    <p className="whitespace-pre-wrap text-gray-700">{content}</p>
                  ) : (
                    <p className="text-gray-400 italic">暂无文字记录</p>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt=""
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                        onClick={() => setLightboxImage(img.url)}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-400 hover:text-red-500 transition"
                >
                  + 添加记录
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:text-red-400 transition"
          >
            <FaTimesCircle size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
