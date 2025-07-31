'use client'
import { useState, useEffect, useCallback, useRef } from 'react';

// 自定义防抖函数
function useDebounce(fn, delay) {
  const timerRef = useRef(null);
  
  return useCallback((...args) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);
}

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Save search history to localStorage
  const saveToHistory = (term) => {
    if (!term.trim()) return;
    
    const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // 使用自定义防抖函数
  const debouncedSearch = useDebounce((term) => {
    onSearch(term);
    if (term.trim()) {
      saveToHistory(term);
    }
  }, 500);

  // Handle input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle history item click
  const handleHistoryClick = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="搜索电影..."
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              onSearch('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !searchTerm && (
        <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="flex justify-between items-center px-3 py-2">
              <h3 className="text-sm text-gray-400">搜索历史</h3>
              <button
                onClick={clearHistory}
                className="text-xs text-red-500 hover:text-red-400"
              >
                清除历史
              </button>
            </div>
            {searchHistory.map((term, index) => (
              <div
                key={index}
                onClick={() => handleHistoryClick(term)}
                className="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded"
              >
                <span className="text-gray-300">{term}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 