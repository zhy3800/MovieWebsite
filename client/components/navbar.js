'use client'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // 检查用户登录状态的函数
  const checkUserLoginStatus = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // 初始检查
    checkUserLoginStatus();
    
    // 添加路由变化事件监听器，每次路由变化时重新检查登录状态
    const handleRouteChange = () => {
      checkUserLoginStatus();
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // 监听存储变化事件，处理在其他标签页中可能发生的登录/登出
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUserLoginStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 清理函数
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="navbar text-white dark:text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              MovieWeb
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className={`transition-colors ${router.pathname === '/' ? 'text-red-500 font-medium' : 'hover:text-red-500 dark:hover:text-red-500'}`}>
                首页
              </Link>
              <Link href="/search" className={`transition-colors ${router.pathname === '/search' ? 'text-red-500 font-medium' : 'hover:text-red-500 dark:hover:text-red-500'}`}>
                搜索
              </Link>
              <Link href="/movies" className={`transition-colors ${router.pathname === '/movies' ? 'text-red-500 font-medium' : 'hover:text-red-500 dark:hover:text-red-500'}`}>
                电影列表
              </Link>
              <Link href="/hot-movies" className={`transition-colors ${router.pathname === '/hot-movies' ? 'text-red-500 font-medium' : 'hover:text-red-500 dark:hover:text-red-500'}`}>
                热门电影
              </Link>
              {isLoggedIn && (
                <>
                  <Link href="/favorites" className={`transition-colors ${router.pathname === '/favorites' ? 'text-red-500 font-medium' : 'hover:text-red-500 dark:hover:text-red-500'}`}>
                    我的收藏
                  </Link>
                  <Link href="/favorite-history" className={`transition-colors ${router.pathname === '/favorite-history' ? 'text-red-500 font-medium' : 'hover:text-red-500 dark:hover:text-red-500'}`}>
                    收藏记录
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <span className="text-gray-300 dark:text-gray-300">欢迎, {user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-red-500 dark:hover:text-red-500 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}