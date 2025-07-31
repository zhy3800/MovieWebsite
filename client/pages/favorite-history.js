'use client'
import { useEffect, useState } from 'react';
import api from '../utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function FavoriteHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchFavoriteHistory(user.id);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  const fetchFavoriteHistory = async (userId) => {
    try {
      const response = await api.get(`/favorites/history/${userId}`);
      setHistory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('获取收藏历史失败:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4">收藏历史记录</h1>
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">暂无收藏历史记录</p>
            <Link href="/" className="btn-primary">
              去发现好电影
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div
                key={record.id}
                className="bg-gray-800 rounded-lg p-4 flex items-center"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('movieReferrer', window.location.pathname);
                  }
                }}
              >
                <div className="flex-shrink-0 w-24 h-36 relative">
                  <Image
                    src={record.poster_path || `https://picsum.photos/300/450?random=${record.movie_id}`}
                    alt={record.zhy_title}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="ml-6 flex-grow">
                  <Link 
                    href={`/movies/${record.movie_id}`}
                    className="text-xl font-semibold hover:text-red-500 transition-colors"
                  >
                    {record.zhy_title}
                  </Link>
                  <div className="mt-2 flex items-center text-sm text-gray-400">
                    <span className="mr-4">
                      <i className="fa fa-star text-yellow-400 mr-1"></i>
                      {record.rating}
                    </span>
                    <span>
                      {record.release_date ? record.release_date.split('T')[0] : '未知日期'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`px-2 py-1 rounded text-sm ${
                      record.action === 'add' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {record.action === 'add' ? '收藏' : '取消收藏'}
                    </span>
                    <span className="ml-4 text-sm text-gray-400">
                      {formatDate(record.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}