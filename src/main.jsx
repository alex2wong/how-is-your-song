import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import SongDetailPage from './pages/SongDetail/index.jsx';
import GoogleAuthCallback from './pages/GoogleAuthCallback.jsx';
// import './index.css'
import './styles/theme.css'
import { ToastProvider } from './components/ToastMessage/ToastContext.jsx';
import { BottomPlayerProvider } from './components/BottomPlayer/BottomPlayerContext.jsx';
import { AuthProvider } from './components/Auth/AuthContext.jsx';
import BottomPlayer from './components/BottomPlayer/index.jsx';
import SharePosterPage from './pages/Poster/index.jsx';
import RankPage from './pages/Rank/index.jsx';
import ApiInterceptor from './components/Auth/ApiInterceptor.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ToastProvider><App /></ToastProvider>,
  },
  {
    path: "/song/:id",
    element: <BottomPlayerProvider><ToastProvider><SongDetailPage /><BottomPlayer /></ToastProvider></BottomPlayerProvider>,
  },
  {
    path: "poster/song/:id",
    element: <BottomPlayerProvider><ToastProvider><SharePosterPage /><BottomPlayer /></ToastProvider></BottomPlayerProvider>,
  },
  {
    path: "rank",
    element: <BottomPlayerProvider><ToastProvider><RankPage /><BottomPlayer /></ToastProvider></BottomPlayerProvider>,
  },
  {
    path: "auth/google/callback",
    element: <ToastProvider><BottomPlayerProvider><AuthProvider><GoogleAuthCallback /></AuthProvider></BottomPlayerProvider></ToastProvider>,
  },
  {
    path: "payment/result",
    element: <AuthProvider><BottomPlayerProvider><ToastProvider><div style={{padding: '20px', textAlign: 'center'}}>
      <h2>支付结果</h2>
      <p>支付处理中，请稍后查看您的积分余额</p>
      <a href="/">返回首页</a>
    </div><BottomPlayer /><ApiInterceptor /></ToastProvider></BottomPlayerProvider></AuthProvider>,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)