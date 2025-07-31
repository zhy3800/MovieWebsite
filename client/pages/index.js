'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../utils/auth';

export default function HomePage() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const moviesPerPage = 10;

  useEffect(() => {
    // 检查用户是否已登录
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // 检查本地存储中是否有保存的页码
    const savedPage = localStorage.getItem('lastMovieListPage');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
    
    fetchMovies(savedPage ? parseInt(savedPage, 10) : currentPage);
  }, []);

  useEffect(() => {
    fetchMovies(currentPage);
    // 保存当前页码到本地存储
    localStorage.setItem('lastMovieListPage', currentPage.toString());
  }, [currentPage]);

  const fetchMovies = async (page) => {
    try {
      const response = await api.get('/movies', {
        params: {
          page: page,
          limit: moviesPerPage
        }
      });
      setMovies(response.data.movies);
      setTotalPages(Math.ceil(response.data.total / moviesPerPage));
      setLoading(false);
    } catch (error) {
      console.error('获取电影数据失败:', error);
      setError('获取电影数据失败');
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleMovieClick = (movieId) => {
    // 保存当前页码到本地存储
    localStorage.setItem('lastMovieListPage', currentPage.toString());
    // 保存当前页面路径到 localStorage
    localStorage.setItem('movieReferrer', '/');
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
            onClick={() => fetchMovies(currentPage)}
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
      {/* Hero Section */}
      <div className="relative h-[500px] bg-black">
        <Image
          src="/微信图片_20240510160316.jpg"
          alt="电影天堂"
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">电影天堂</h1>
          <p className="text-xl mb-8">发现最新、最热门的电影，享受视觉盛宴</p>
          <Link
            href="/movies"
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            浏览电影
          </Link>
        </div>
      </div>

      {/* Hot Movies Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
          <span className="w-1 h-8 bg-red-600 mr-4"></span>
          最新电影
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id}
              onClick={() => handleMovieClick(movie.id)}
              className="bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 cursor-pointer"
            >
              <div className="relative h-[300px]">
                <Image
                  src={movie.poster_path || `https://picsum.photos/300/400?random=${movie.id}`}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{movie.zhy_title}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <span>{movie.release_date?.split('T')[0]}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400 mr-1"></i>
                    <span>{movie.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              上一页
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // 显示当前页附近的页码和首尾页
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 2
                  );
                })
                .map((page, index, array) => {
                  // 添加省略号
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-md ${
                            currentPage === page
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-md ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}