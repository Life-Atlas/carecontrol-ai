import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import TodayView from '@/pages/TodayView'
import Dashboard from '@/pages/Dashboard'
import Schedule from '@/pages/Schedule'
import Profile from '@/pages/Profile'
import StaffView from '@/pages/StaffView'
import WeekView from '@/pages/WeekView'

function AppRoutes() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cc-bg">
        <div className="text-cc-accent text-xl animate-pulse">CareControl AI</div>
      </div>
    )
  }

  // Not logged in → login
  if (!session) {
    return (
      <Routes>
        <Route path="/staff" element={<StaffView />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  // Logged in but no profile → onboarding
  if (!profile) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // Brukare → Today View as default
  if (profile.role === 'brukare') {
    return (
      <Routes>
        <Route path="/today" element={<TodayView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/week" element={<WeekView />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    )
  }

  // Anhörig → Dashboard as default
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/today" element={<TodayView />} />
      <Route path="/week" element={<WeekView />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
