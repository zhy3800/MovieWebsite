'use client'
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api, { setInitialToken } from '../utils/auth';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const syncFavorites = async (userId) => {
    try {
      // 从服务器获取用户收藏列表
      const response = await api.get(`/favorites/user/${userId}`);
      const favorites = response.data;
      
      // 创建本地收藏数据对象
      const localFavorites = {};
      
      // 将每个收藏的电影ID添加到本地存储
      favorites.forEach(favorite => {
        localFavorites[favorite.movie_id] = true;
      });
      
      // 保存到本地存储
      localStorage.setItem('favorites', JSON.stringify(localFavorites));
    } catch (error) {
      console.error('同步收藏数据失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    const { username, password } = formData;
    if (!username || !password) {
      setError('请填写所有字段');
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post('/users/login', { username, password });
      const { token, user } = response.data;
      
      // 保存token和用户信息到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 设置初始token用于验证
      setInitialToken(token);
      
      // 同步收藏数据
      await syncFavorites(user.id);
      
      // 重定向到首页
      router.push('/');
    } catch (error) {
      console.error('登录失败:', error);
      setError(error.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">登录您的账户</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            或{' '}
            <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
              注册新账户
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}