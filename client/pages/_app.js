import '../styles/globals.css';
import Navbar from '../components/navbar';
import { useEffect } from 'react';
import { Router } from 'next/router';
import NProgress from 'nprogress';
import '../styles/nprogress.css'; 
import { checkTokenValidity } from '../utils/auth';

NProgress.configure({ showSpinner: false }); // Optional: disable the default spinner

// Timer variable to store the start time of the loading animation
let timer;
const minimumDisplayTime = 300; // Set your minimum display time in milliseconds (e.g., 300ms)

Router.events.on('routeChangeStart', () => {
  // Clear any previous timer
  clearTimeout(timer);
  // Record the start time
  NProgress.start();
  timer = setTimeout(() => {
    // If the route change is still happening after minimumDisplayTime,
    // we don't do anything here. The done() call will be handled by routeChangeComplete or routeChangeError.
    // This timeout is mainly to ensure done() is not called too early if route change is very fast.
  }, minimumDisplayTime);
});

Router.events.on('routeChangeComplete', () => {
  // Calculate elapsed time
  const elapsed = Date.now() - NProgress.startTime;
  const remaining = minimumDisplayTime - elapsed;

  if (remaining > 0) {
    // If less than minimumDisplayTime has passed, wait for the remaining time
    timer = setTimeout(() => {
      NProgress.done();
    }, remaining);
  } else {
    // If more than minimumDisplayTime has passed, just call done()
    NProgress.done();
  }
});

Router.events.on('routeChangeError', () => {
  // Similar logic as routeChangeComplete to ensure minimum display time on error
  const elapsed = Date.now() - NProgress.startTime;
  const remaining = minimumDisplayTime - elapsed;

  if (remaining > 0) {
    timer = setTimeout(() => {
      NProgress.done();
    }, remaining);
  } else {
    NProgress.done();
  }
});

function MyApp({ Component, pageProps }) {
  // Although we are using useEffect to attach event listeners, 
  // the Router events are global and only need to be attached once.
  // The effect cleanup would remove them on unmount, which is fine here.

  // 初始化主题
  useEffect(() => {
    // 在客户端运行时初始化主题
    if (typeof window !== 'undefined') {
      // 检查本地存储中的主题设置
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // 如果有保存的主题设置，使用它；否则，使用系统偏好
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
  }, []);

  useEffect(() => {
    // 首次加载时检查token有效性
    if (typeof window !== 'undefined') {
      checkTokenValidity();
    }

    // 在每次路由变化完成后检查token有效性
    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        checkTokenValidity();
      }
    };

    // 添加定期检查token的机制
    const tokenCheckInterval = setInterval(() => {
      if (typeof window !== 'undefined') {
        checkTokenValidity();
      }
    }, 1000); // 每秒检查一次

    // 添加storage事件监听器，检测localStorage的变化
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        checkTokenValidity();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    Router.events.on('routeChangeComplete', handleRouteChange);
    Router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      // Cleanup listeners and intervals
      clearInterval(tokenCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      Router.events.off('routeChangeComplete', handleRouteChange);
      Router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;