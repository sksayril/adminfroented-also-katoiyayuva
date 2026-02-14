import { useState } from 'react';
import { Bell, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminLogout, ApiError } from '../services/api';
import { toast } from 'react-toastify';
import LogoutConfirmDialog from './LogoutConfirmDialog';

export default function Header() {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      await adminLogout();
      authLogout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      const apiError = error as ApiError;
      // Even if API fails, clear local state
      authLogout();
      toast.error(apiError.message || 'Logout failed. Please try again.');
      navigate('/login', { replace: true });
    } finally {
      setLogoutLoading(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-end sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative group">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 relative">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                3
              </span>
            </button>
          </div>

          {/* Messages */}
          <div className="relative group">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 relative">
              <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                5
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* User Profile */}
          <div className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {user?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                Administrator
              </span>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 group"
            title="Logout"
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </header>

      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />
    </>
  );
}
