import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import SongDetailPage from './pages/SongDetail/index.jsx';
// import './index.css'
import './styles/theme.css'
import { ToastProvider } from './components/ToastMessage/ToastContext.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ToastProvider><App /></ToastProvider>,
  },
  {
    path: "/song/:id",
    element: <ToastProvider><SongDetailPage /></ToastProvider>,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)