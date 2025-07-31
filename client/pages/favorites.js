'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchFavorites(user.id);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  const fetchFavorites = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/favorites/user/${userId}`);
      setFavorites(response.data);
      setLoading(false);
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4">我的收藏</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">暂无收藏的电影</p>
            <Link href="/" className="btn-primary">
              去发现好电影
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((movie) => (
              <Link href={`/movies/${movie.movie_id}`} key={movie.movie_id} className="movie-card">
                <div className="relative">
                  <Image
                    src={movie.poster_path || `https://picsum.photos/300/450?random=${movie.movie_id}`}
                    alt={movie.zhy_title}
                    width={300}
                    height={450}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {movie.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{movie.zhy_title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-1">
                    {movie.release_date ? movie.release_date.split('T')[0] : '未知日期'}
                  </p>
                  <div className="flex items-center text-yellow-400 text-sm">
                    <i className="fa fa-star mr-1"></i>
                    <span>{movie.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 