'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../utils/auth';

export default function HotMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchHotMovies();
  }, []);

  const fetchHotMovies = async () => {
    try {
      setLoading(true);
      console.log('开始请求热门电影数据...');
      
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // 获取所有电影
      const url = '/movies';
      console.log('请求URL:', url);
      
      const response = await api.get(url, config);
      console.log('API响应数据:', response.data);
      
      const movieData = response.data.movies || response.data;
      
      // 获取每部电影的统计数据
      const moviesWithStats = await Promise.all(movieData.map(async (movie) => {
        try {
          // 获取收藏数和评论数
          const [favoritesRes, commentsRes] = await Promise.all([
            api.get(`/favorites/count/${movie.id}`),
            api.get(`/comments/count/${movie.id}`)
          ]);
          
          return {
            ...movie,
            favorites_count: favoritesRes.data.count || 0,
            comments_count: commentsRes.data.count || 0,
            // 计算热度分数：收藏数*0.4 + 评论数*0.3 + 评分*0.3
            hot_score: (favoritesRes.data.count * 0.4) + 
                      (commentsRes.data.count * 0.3) + 
                      ((movie.rating || 0) * 0.3)
          };
        } catch (error) {
          console.error(`获取电影 ${movie.id} 的统计数据失败:`, error);
          return {
            ...movie,
            favorites_count: 0,
            comments_count: 0,
            hot_score: (movie.rating || 0) * 0.3
          };
        }
      }));
      
      // 按热度分数排序并取前3名
      const sortedMovies = moviesWithStats
        .sort((a, b) => b.hot_score - a.hot_score)
        .slice(0, 3);
      
      setMovies(sortedMovies);
      setError(null);
    } catch (error) {
      console.error('获取热门电影失败:', error);
      let errorMessage = '无法加载热门电影，请稍后再试';
      if (error.response) {
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应数据:', error.response.data);
        errorMessage = `服务器错误 (${error.response.status}): ${error.response.data?.message || '未知错误'}`;
      } else if (error.request) {
        console.error('未收到响应');
        errorMessage = '无法连接到服务器，请检查服务器是否运行';
      } else {
        console.error('请求错误:', error.message);
        errorMessage = `请求错误: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    // 保存当前页面路径到 localStorage
    localStorage.setItem('movieReferrer', '/hot-movies');
    // 导航到电影详情页
    router.push(`/movies/${movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={fetchHotMovies}
            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-16">
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors text-lg"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          返回
        </button>
        
        <h1 className="text-4xl font-bold text-white mb-12 flex items-center">
          <span className="w-2 h-10 bg-red-600 mr-4"></span>
          热门电影 TOP 3
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {movies.map((movie, index) => (
            <div 
              key={movie.id}
              onClick={() => handleMovieClick(movie.id)}
              className="bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 cursor-pointer"
            >
              <div className="relative">
                <div className="relative h-[400px]">
                  <Image
                    src={movie.poster_path || `https://picsum.photos/300/400?random=${movie.id}`}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xl font-bold w-12 h-12 rounded-full flex items-center justify-center">
                  #{index + 1}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {movie.zhy_title || movie.title}
                </h3>
                
                {/* 评分星星 */}
                <div className="flex items-center mb-3">
                  <span className="text-yellow-400 text-xl mr-2">★</span>
                  <span className="text-yellow-400 font-bold text-xl">{movie.rating || 0}</span>
                </div>
                
                {/* 收藏和评论数据 */}
                <div className="flex items-center space-x-4 mb-3">
                  {/* 收藏数 */}
                  <div className="flex items-center">
                    <span className="text-red-500 text-xl mr-2">❤</span>
                    <span className="text-white">{movie.favorites_count || 0} 收藏</span>
                  </div>
                  
                  {/* 评论数 */}
                  <div className="flex items-center">
                    <span className="text-blue-900 text-xl mr-2" style={{ color: '#0047AB' }}>💬</span>
                    <span className="text-white">{movie.comments_count || 0} 评论</span>
                  </div>
                </div>
                
                {/* 上映日期 */}
                <div className="text-gray-400 mt-4">
                  上映日期: {movie.release_date?.split('T')[0] || movie.year || '未知'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {movies.length === 0 && !loading && !error && (
          <div className="text-center text-white py-12">
            <p className="text-xl">暂无热门电影</p>
          </div>
        )}
      </div>
    </div>
  );
}