'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../utils/auth';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get('/movies');
        setMovies(response.data.movies);
        setLoading(false);
      } catch (error) {
        console.error('获取电影数据失败:', error);
        setError('获取电影数据失败');
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4">
          电影列表
        </h1>
        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">暂无电影数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('movieReferrer', window.location.pathname);
                  }
                }}
                className="block"
              >
                <Link href={`/movies/${movie.id}`} className="bg-gray-800 rounded-lg p-4 flex items-center transition-transform duration-200 hover:scale-105 cursor-pointer">
                  <div className="flex-shrink-0 w-24 h-36 relative">
                    <Image
                      src={movie.poster_path || `https://picsum.photos/300/450?random=${movie.id}`}
                      alt={movie.zhy_title}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-6 flex-grow">
                    <h2 className="text-xl font-semibold mb-1 truncate">{movie.zhy_title}</h2>
                    <div className="mt-2 flex items-center text-sm text-gray-400">
                      <span className="mr-4">
                        <i className="fa fa-star text-yellow-400 mr-1"></i>
                        {movie.rating}
                      </span>
                      <span>
                        {movie.release_date ? movie.release_date.split('T')[0] : '未知日期'}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-300 text-sm line-clamp-2">
                      简介: {movie.description || '暂无简介'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}