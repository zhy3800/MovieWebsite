'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from '../components/SearchBar';
import api from '../utils/auth';

export default function MovieSearchPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const moviesPerPage = 3; // 减少每页显示数量，更容易测试分页功能

  const handleSearch = async (searchTerm, page = 1) => {
    if (!searchTerm.trim()) {
      setMovies([]);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }

    setSearchQuery(searchTerm);
    setLoading(true);
    setError(null);

    try {
      console.log(`搜索: ${searchTerm}, 页码: ${page}, 每页: ${moviesPerPage}`);
      const response = await api.get('/search/movies', {
        params: {
          query: searchTerm,
          page,
          limit: moviesPerPage
        }
      });

      console.log('搜索结果:', response.data);
      setMovies(response.data.movies);
      setTotalResults(response.data.total);
      // 确保至少有一页
      const calculatedTotalPages = Math.max(1, Math.ceil(response.data.total / moviesPerPage));
      setTotalPages(calculatedTotalPages);
      console.log(`总结果: ${response.data.total}, 总页数: ${calculatedTotalPages}`);
      setCurrentPage(page);
    } catch (err) {
      console.error('搜索错误:', err);
      setError('搜索时发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    console.log(`切换到页码: ${page}`);
    setCurrentPage(page);
    window.scrollTo(0, 0);
    handleSearch(searchQuery, page);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">电影搜索</h1>
          
          {/* Search Section */}
          <div className="mb-8">
            <SearchBar onSearch={(term) => handleSearch(term)} />
            
            {/* Results Count */}
            {totalResults > 0 && (
              <div className="text-gray-400 text-center mt-4 mb-4">
                找到 {totalResults} 个结果，当前第 {currentPage}/{totalPages} 页
              </div>
            )}
            
            {/* Pagination Controls */}
            {!loading && searchQuery && (
              <div className="flex justify-center items-center mt-4 space-x-2">
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
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 2
                      );
                    })
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 rounded-md ${
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
                          className={`w-8 h-8 rounded-md ${
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
                  disabled={currentPage === totalPages || totalResults === 0}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === totalPages || totalResults === 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  下一页
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-red-500 text-center py-4">
              {error}
            </div>
          )}

          {/* Results Grid */}
          {!loading && movies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {movies.map((movie) => (
                <Link 
                  href={`/movies/${movie.id}`} 
                  key={movie.id}
                  onClick={() => {
                    // 保存当前搜索页面路径到 localStorage
                    localStorage.setItem('movieReferrer', '/search');
                  }}
                >
                  <div className="bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                    <div className="relative h-[400px]">
                      <Image
                        src={movie.poster_path || `https://picsum.photos/300/400?random=${movie.id}`}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{movie.zhy_title}</h3>
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
                </Link>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {!loading && searchQuery && movies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">未找到相关电影</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}