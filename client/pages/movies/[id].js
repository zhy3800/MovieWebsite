'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/auth';

// 添加函数来验证token有效性
function validateToken(token) {
  if (!token) return false;
  try {
    // 检查token是否为JWT格式（三部分，用.分隔）
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // 尝试解码token的payload部分
    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64);
      JSON.parse(jsonPayload);
      return true;
    } catch (e) {
      console.error('Token格式无效');
      return false;
    }
  } catch (error) {
    console.error('Token验证失败:', error);
    return false;
  }
}

export default function MovieDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]); // State for comments
  const [newCommentText, setNewCommentText] = useState(''); // State for new comment input
  const [currentUser, setCurrentUser] = useState(null); // State for current logged-in user
  const [isFavorited, setIsFavorited] = useState(false); // State for favorite status
  const [message, setMessage] = useState(''); // State for feedback message
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
  const [userRating, setUserRating] = useState(0); // 用户评分
  const [hasRated, setHasRated] = useState(false); // 用户是否已评分
  const [hoverRating, setHoverRating] = useState(0); // 鼠标悬停时的评分
  const [previousPage, setPreviousPage] = useState('/'); // 默认返回首页

  // 显示提示信息的函数
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000); // 3秒后自动清除消息
  };
  
  // 处理token无效的情况
  const handleInvalidToken = () => {
    // 先清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    
    // 重置状态
    setCurrentUser(null);
    setIsFavorited(false);
    
    // 显示提示消息
    alert('登录已过期，请重新登录');
    
    // 使用 router.push 实现无刷新跳转
    setTimeout(() => {
      router.push('/login');
    }, 100); // 给一个小延迟确保状态清理完成
  };

  useEffect(() => {
    if (!id) return;
    fetchMovieDetails();
    fetchComments(id); // Fetch comments after getting movie ID

    // 记录上一页的路径
    if (typeof window !== 'undefined') {
      // 从 localStorage 中获取上一页路径
      const referrer = localStorage.getItem('movieReferrer');
      if (referrer) {
        setPreviousPage(referrer);
      }
    }

    // Read user from localStorage on component mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // 验证token
    if (token && !validateToken(token)) {
      handleInvalidToken();
      return;
    }
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        // 如果用户已登录，检查收藏状态
        checkFavoriteStatus(user.id, id);
        // 检查用户评分状态
        checkUserRating(user.id, id);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        // Token校验失败后清除本地存储并重新登录
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('favorites');
        setCurrentUser(null);
        router.push('/login');
      }
    }

  }, [id, router]);

  const fetchMovieDetails = async () => {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data);
      setLoading(false);
    } catch (error) {
      console.error('获取电影详情失败:', error);
      setLoading(false);
    }
  };

  // 检查用户评分状态
  const checkUserRating = async (userId, movieId) => {
    if (!userId || !movieId) return;
    
    // 验证token
    const token = localStorage.getItem('token');
    if (!token || !validateToken(token)) {
      handleInvalidToken();
      return;
    }
    
    try {
      const response = await api.get(`/movies/${movieId}/user-rating/${userId}`);
      if (response.data.rated) {
        setHasRated(true);
        setUserRating(response.data.rating);
      } else {
        setHasRated(false);
        setUserRating(0);
      }
    } catch (error) {
      console.error('获取用户评分状态失败:', error);
      showMessage('获取评分状态失败', 'error');
    }
  };

  // 处理用户评分
  const handleRating = async (rating) => {
    if (!currentUser) {
      showMessage('请先登录才能评分', 'error');
      return;
    }

    // 验证token
    const token = localStorage.getItem('token');
    if (!token || !validateToken(token)) {
      handleInvalidToken();
      return;
    }

    if (!id) {
      showMessage('电影ID无效', 'error');
      return;
    }

    try {
      // 先更新本地状态，提供即时反馈
      setUserRating(rating);
      setHasRated(true);

      await api.post(`/movies/${parseInt(id)}/rate`, {
        user_id: currentUser.id,
        rating: rating
      });

      showMessage('评分成功！');
      
      // 刷新电影详情以获取更新后的平均评分
      fetchMovieDetails();
    } catch (error) {
      console.error('评分失败:', error);
      // 如果请求失败，回滚状态
      setUserRating(0);
      setHasRated(false);
      showMessage(error.response?.data?.error || '评分失败，请稍后重试', 'error');
    }
  };

  // Function to fetch comments
  const fetchComments = async (movieId) => {
    try {
      const response = await api.get(`/comments/${movieId}`);
      setComments(response.data); // Set comments state with fetched data
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  // Function to handle posting a new comment
  const handlePostComment = async (e) => {
    e.preventDefault();

    // Get the actual user ID from currentUser state
    const userId = currentUser?.id; // Use optional chaining in case currentUser is null

    if (!userId) {
      showMessage('请先登录才能发表评论', 'error');
      return;
    }

    // 验证token
    const token = localStorage.getItem('token');
    if (!token || !validateToken(token)) {
      handleInvalidToken();
      return;
    }

    if (!newCommentText.trim()) {
      showMessage('评论内容不能为空', 'error');
      return;
    }

    try {
      await api.post('/comments', {
        movie_id: id,
        user_id: userId,
        comment_text: newCommentText,
      });
      setNewCommentText(''); // Clear the input field
      fetchComments(id); // Refresh comments after posting
      showMessage('评论发表成功');
    } catch (error) {
      console.error('发表评论失败:', error);
      showMessage('发表评论失败', 'error');
    }
  };

  // 检查收藏状态
  const checkFavoriteStatus = async (userId, movieId) => {
    // 验证token
    const token = localStorage.getItem('token');
    if (!token || !validateToken(token)) {
      handleInvalidToken();
      return;
    }
    
    try {
      // 先尝试从本地存储获取收藏状态
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
      
      // 如果本地存储有此电影的收藏状态，先使用它
      if (localFavorites[movieId] !== undefined) {
        setIsFavorited(localFavorites[movieId]);
      }
      
      // 然后从服务器获取最新状态
      const response = await api.get(`/favorites/check/${userId}/${movieId}`);
      setIsFavorited(response.data.isFavorited);
      
      // 更新本地存储
      localFavorites[movieId] = response.data.isFavorited;
      localStorage.setItem('favorites', JSON.stringify(localFavorites));
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  // 处理收藏/取消收藏
  const handleFavoriteClick = async () => {
    if (!currentUser) {
      showMessage('请先登录才能收藏电影', 'error');
      return;
    }

    // 验证token
    const token = localStorage.getItem('token');
    if (!token || !validateToken(token)) {
      handleInvalidToken();
      return;
    }

    if (!id) {
      showMessage('电影ID无效', 'error');
      return;
    }

    try {
      // 先更新本地状态，提供即时反馈
      const newStatus = !isFavorited;
      setIsFavorited(newStatus);
      
      // 更新本地存储
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
      localFavorites[id] = newStatus;
      localStorage.setItem('favorites', JSON.stringify(localFavorites));

      if (newStatus) {
        // 添加收藏
        await api.post('/favorites', {
          user_id: currentUser.id,
          movie_id: parseInt(id)  // 确保id是数字
        });
        showMessage('已成功添加到收藏');
      } else {
        // 取消收藏
        await api.delete(`/favorites/${currentUser.id}/${parseInt(id)}`);  // 确保id是数字
        showMessage('已成功取消收藏');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      
      // 如果API请求失败，回滚本地状态
      setIsFavorited(!isFavorited);
      
      // 回滚本地存储
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
      localFavorites[id] = !isFavorited;
      localStorage.setItem('favorites', JSON.stringify(localFavorites));
      
      showMessage(error.response?.data?.error || '操作失败', 'error');
    }
  };

  // 渲染星级评分组件
  const renderStarRating = () => {
    return (
      <div className="flex flex-col items-start mb-6 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium mb-2 text-white flex items-center">
          <i className="fas fa-star text-yellow-400 mr-2"></i>
          我的评分
        </h3>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`text-3xl focus:outline-none px-1 transform hover:scale-110 transition-all duration-200 ${
                !currentUser ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              disabled={!currentUser}
            >
              <i
                className={`${
                  star <= (hoverRating || userRating) ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-500'
                } transition-colors duration-200 ${
                  star <= (hoverRating || userRating) ? 'animate-pulse' : ''
                }`}
                style={{
                  transform: `scale(${star <= (hoverRating || userRating) ? 1.1 : 1})`,
                  transition: 'transform 0.2s ease'
                }}
              ></i>
            </button>
          ))}
          <span className="ml-4 text-lg font-bold text-white bg-gray-700/50 backdrop-blur-sm px-3 py-1 rounded-full">
            {hoverRating || userRating || '?'}/5
          </span>
        </div>
        {!currentUser && (
          <p className="text-sm text-gray-400 mt-2 flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            请登录后评分
          </p>
        )}
        {currentUser && hasRated && (
          <p className="text-sm text-green-400 mt-2 flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            您已评分 {userRating}/5，点击星星可以修改评分
          </p>
        )}
      </div>
    );
  };

  // 处理返回按钮点击
  const handleGoBack = () => {
    router.push(previousPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto py-16 text-center">
          <p>电影不存在</p>
          <Link href="/" className="btn-primary inline-block mt-4">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 显示提示消息 */}
      {message && (
        <div className={`fixed top-4 right-4 ${messageType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-out flex items-center`}>
          <i className={`${messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'} mr-2`}></i>
          {message}
        </div>
      )}
      
      <main className="container mx-auto py-12">
        {/* 返回按钮 */}
        <button 
          onClick={handleGoBack}
          className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          返回
        </button>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Movie Details Section */}
          <div className="lg:w-1/3">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={movie.poster_path || `https://picsum.photos/500/750?random=${movie.id}`}
                alt={movie.title}
                width={500}
                height={750}
                className="w-full"
                fetchpriority="high"
              />
            </div>
          </div>
          <div className="lg:w-2/3">
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium bg-red-600 text-white px-3 py-1 rounded-full">
                {movie.rating ? (typeof movie.rating === 'number' ? movie.rating.toFixed(1) : movie.rating) : 'N/A'}
              </span>
              <div className="flex items-center ml-4 text-yellow-400">
                <i className="fas fa-star"></i>
                <span className="ml-1">{movie.rating ? (typeof movie.rating === 'number' ? movie.rating.toFixed(1) : movie.rating) : 'N/A'}</span>
                <span className="ml-1 text-gray-400">/ 5</span>
              </div>
              <span className="ml-4 text-gray-400">
                {movie.release_date ? movie.release_date.split('T')[0] : '未知日期'}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4">{movie.zhy_title}</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">简介</h3>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2">导演</h3>
                <p className="text-gray-300">{movie.director || '未知'}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">主演</h3>
                <p className="text-gray-300">{movie.cast || '未知'}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">类型</h3>
                <p className="text-gray-300">{movie.genres || '未知'}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">片长</h3>
                <p className="text-gray-300">{movie.runtime ? `${movie.runtime} 分钟` : '未知'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.split(',').map((genre, index) => (
                <span key={index} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {genre.trim()}
                </span>
              ))}
            </div>
            
            {/* 添加评分组件 */}
            {renderStarRating()}
            
            <div className="flex gap-4">
              <button
                onClick={() => window.open(movie.trailer_url, '_blank')}
                className="btn-primary flex items-center"
              >
                <i className="fas fa-play-circle mr-2"></i> 观看预告片
              </button>
              <button
                onClick={handleFavoriteClick}
                className={`favorite-button ${
                  isFavorited ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
                } text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center`}
              >
                <i className={`favorite-icon ${isFavorited ? 'fas fa-heart heart-beat' : 'far fa-heart'} mr-2`}></i>
                {isFavorited ? '取消收藏' : '加入收藏'}
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6 border-l-4 border-red-600 pl-4">评论</h3>

          {/* Comment Form - conditionally render based on login status */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">发表评论</h4>
            <form onSubmit={handlePostComment}>
              <textarea
                className="w-full p-4 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                rows="4"
                placeholder="写下你的评论..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
              >
                发表评论
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div>
            {comments.length === 0 ? (
              <p className="text-gray-400">暂无评论</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-800 rounded-md p-6 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="font-bold text-red-400">{comment.username || '匿名用户'}</span>
                    <span className="ml-4 text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{comment.comment_text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}