import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StudentAuthProvider } from '@/context/StudentAuthContext'
import { AdminAuthProvider }   from '@/context/AdminAuthContext'
import { StudentRoute, AdminRoute } from '@/components/ProtectedRoute'

// Student pages
import LandingPage      from '@/pages/student/LandingPage'
import RegisterPage     from '@/pages/student/RegisterPage'
import LoginPage        from '@/pages/student/LoginPage'
import InstructionsPage from '@/pages/student/InstructionsPage'
import TestPage         from '@/pages/student/TestPage'
import ResultPage       from '@/pages/student/ResultPage'

// Admin pages
import AdminLoginPage     from '@/pages/admin/AdminLoginPage'
import AdminDashboard     from '@/pages/admin/AdminDashboard'
import AdminItemsPage     from '@/pages/admin/AdminItemsPage'
import AdminStudentsPage  from '@/pages/admin/AdminStudentsPage'
import AdminResultsPage   from '@/pages/admin/AdminResultsPage'
import AdminEfficiencyPage from '@/pages/admin/AdminEfficiencyPage'
import { AdminDataProvider } from './context/Admindatacontext'

export default function App() {
  return (
    <BrowserRouter>
      <StudentAuthProvider>
        <AdminAuthProvider>
          <AdminDataProvider>
          <Routes>
            {/* ── Public student routes ── */}
            <Route path="/"            element={<LandingPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/login"       element={<LoginPage />} />

            {/* ── Protected student routes ── */}
            <Route path="/instructions" element={
              <StudentRoute><InstructionsPage /></StudentRoute>
            } />
            <Route path="/test" element={
              <StudentRoute><TestPage /></StudentRoute>
            } />
            <Route path="/result" element={
              <StudentRoute><ResultPage /></StudentRoute>
            } />

            {/* ── Admin routes ── */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />
            <Route path="/admin/items" element={
              <AdminRoute><AdminItemsPage /></AdminRoute>
            } />
            <Route path="/admin/students" element={
              <AdminRoute><AdminStudentsPage /></AdminRoute>
            } />
            <Route path="/admin/results" element={
              <AdminRoute><AdminResultsPage /></AdminRoute>
            } />
            <Route path="/admin/efficiency" element={
              <AdminRoute><AdminEfficiencyPage /></AdminRoute>
            } />
          </Routes>
          </AdminDataProvider>
        </AdminAuthProvider>
      </StudentAuthProvider>
    </BrowserRouter>
  )
}
