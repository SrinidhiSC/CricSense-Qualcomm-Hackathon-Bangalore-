import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Auth      from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Live      from './pages/Live'
import Players   from './pages/Players'
import History   from './pages/History'

function RequireAuth() {
  const { isAuthenticated } = useApp()
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}

function RedirectIfAuthed() {
  const { isAuthenticated } = useApp()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
}

export const router = createBrowserRouter([
  { path: '/auth', element: <RedirectIfAuthed /> },
  { path: '/',     element: <Navigate to="/auth" replace /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/live',      element: <Live /> },
      { path: '/players',   element: <Players /> },
      { path: '/history',   element: <History /> },
    ],
  },
])
