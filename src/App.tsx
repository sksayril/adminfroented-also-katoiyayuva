import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Teachers from './pages/Teachers';
import Batches from './pages/Batches';
import Staff from './pages/Staff';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import CRM from './pages/CRM';
import Default from './pages/Default';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen bg-gray-100">
                  <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

                  <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                    <Header />

                    <main>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/teachers" element={<Teachers />} />
                        <Route path="/batches" element={<Batches />} />
                        <Route path="/staff" element={<Staff />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/default" element={<Default />} />
                        <Route path="/crm" element={<CRM />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/page-layouts" element={<Default />} />
                        <Route path="/widget" element={<Default />} />
                        <Route path="/basic" element={<Default />} />
                        <Route path="/advance" element={<Default />} />
                        <Route path="/extra" element={<Default />} />
                        <Route path="/animations" element={<Default />} />
                        <Route path="/icons" element={<Default />} />
                        <Route path="/form" element={<Default />} />
                        <Route path="/form-picker" element={<Default />} />
                        <Route path="/bootstrap-table" element={<Default />} />
                        <Route path="/data-table" element={<Default />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
