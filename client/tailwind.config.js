// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // 启用基于类的深色模式
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#111827', // 深色模式背景色
        },
        light: {
          bg: '#f8fafc', // 浅色模式背景色
          text: '#1e293b', // 浅色模式文本色
        },
        dark: {
          bg: '#111827', // 深色模式背景色
          text: '#f8fafc', // 深色模式文本色
        }
      },
    },
  },
  plugins: [],
}