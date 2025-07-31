import axios from 'axios';
import Router from 'next/router';

// 根据环境变量获取 API 地址
const getApiUrl = () => {
  // 如果在浏览器环境中，优先使用环境变量
  if (typeof window !== 'undefined') {
    // 检查是否有环境变量配置的 API URL
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
  }
  
  // 默认使用本地开发地址
  return 'http://localhost:5000/api';
};

// 创建axios实例
const api = axios.create({
  baseURL: getApiUrl(),
});

// 白名单路径，这些路径不需要JWT验证
const whiteList = [
  '/login', 
  '/register',
  '/',
  '/search',
  '/hot-movies'
];

// 需要登录才能访问的路径
const protectedRoutes = [
  '/favorites',
  '/favorite-history',
  '/movies/[id]'
];

// 保存初始token，用于验证是否被修改
let originalToken = null;

// 处理token无效的情况
function handleTokenInvalid() {
  // 先清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('favorites');
  originalToken = null;
  
  // 显示提示消息
  window.alert('登录已过期，请重新登录');
  
  // 使用 Router.push 实现页面跳转
  setTimeout(() => {
    Router.push('/login');
  }, 100); // 给一个小延迟确保状态清理完成
}

// 验证token是否被修改
function isTokenModified() {
  const currentToken = localStorage.getItem('token');
  
  // 如果没有原始token，说明是首次登录，保存当前token
  if (!originalToken && currentToken) {
    originalToken = currentToken;
    return false;
  }
  
  // 如果有原始token，比较是否被修改
  if (originalToken && currentToken && originalToken !== currentToken) {
    console.log('Token has been modified:', { original: originalToken, current: currentToken });
    return true;
  }
  
  // 如果原来有token但现在没有了，也认为是被修改
  if (originalToken && !currentToken) {
    console.log('Token has been removed');
    return true;
  }
  
  // 尝试验证token的格式
  if (currentToken) {
    try {
      // 简单的格式检查，确保token是一个有效的JWT格式
      const parts = currentToken.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format');
        return true;
      }
    } catch (error) {
      console.log('Token validation error:', error);
      return true;
    }
  }
  
  return false;
}

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // 检查token是否被修改
    if (isTokenModified()) {
      handleTokenInvalid();
      return Promise.reject(new Error('Token has been modified'));
    }
    
    // 如果存在token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      handleTokenInvalid();
    }
    return Promise.reject(error);
  }
);

// 检查当前路径是否在白名单中
function isInWhiteList() {
  const currentPath = Router.pathname;
  return whiteList.some(path => currentPath === path);
}

// 检查当前路径是否需要登录
function isProtectedRoute() {
  const currentPath = Router.pathname;
  return protectedRoutes.some(path => {
    if (path.includes('[') && path.includes(']')) {
      const pathPattern = new RegExp('^' + path.replace(/\[.*?\]/g, '[^/]+') + '$');
      return pathPattern.test(currentPath);
    }
    return currentPath === path;
  });
}

// 导出API实例
export default api;

// 导出一个检查token是否有效的函数，可以在页面加载时调用
export function checkTokenValidity() {
  const token = localStorage.getItem('token');
  
  // 检查token是否被修改
  if (isTokenModified()) {
    handleTokenInvalid();
    return false;
  }

  // 如果在白名单页面，不需要进一步检查token
  if (isInWhiteList()) {
    return true;
  }
  
  // 如果是需要登录的页面且没有token，则跳转到登录页
  if (isProtectedRoute() && !token) {
    setTimeout(() => {
      Router.push('/login');
    }, 100);
    return false;
  }
  
  return true;
}

// 导出设置初始token的函数，在登录成功时调用
export function setInitialToken(token) {
  originalToken = token;
} 