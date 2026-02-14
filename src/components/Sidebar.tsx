import { Link, useLocation } from 'react-router-dom';
import { Home, Box, Menu, BookOpen, Users, Calendar, UserCheck, GraduationCap, CreditCard, Settings, Building2, User, ClipboardCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const { theme } = useTheme();
  const { branch, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Theme-based color classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800',
          border: 'border-gray-600/50',
          headerBg: 'from-gray-700/50 to-gray-800/50',
          activeBg: 'from-blue-600/20 to-blue-500/10',
          activeBorder: 'border-blue-500',
          activeGradient: 'from-blue-400 to-blue-600',
          activeShadow: 'shadow-blue-500/20',
          hoverBg: 'hover:bg-gray-700/50',
          iconColor: 'text-blue-400',
          iconGlow: 'bg-blue-400/20',
        };
      case 'dark':
        return {
          bg: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
          border: 'border-slate-700/50',
          headerBg: 'from-slate-800/50 to-slate-900/50',
          activeBg: 'from-blue-600/20 to-blue-500/10',
          activeBorder: 'border-blue-500',
          activeGradient: 'from-blue-400 to-blue-600',
          activeShadow: 'shadow-blue-500/20',
          hoverBg: 'hover:bg-slate-700/50',
          iconColor: 'text-blue-400',
          iconGlow: 'bg-blue-400/20',
        };
      case 'blue':
        return {
          bg: 'bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900',
          border: 'border-blue-700/50',
          headerBg: 'from-blue-800/50 to-blue-900/50',
          activeBg: 'from-blue-600/30 to-blue-500/20',
          activeBorder: 'border-blue-400',
          activeGradient: 'from-blue-300 to-blue-500',
          activeShadow: 'shadow-blue-400/30',
          hoverBg: 'hover:bg-blue-700/50',
          iconColor: 'text-blue-300',
          iconGlow: 'bg-blue-300/20',
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-b from-green-900 via-green-800 to-green-900',
          border: 'border-green-700/50',
          headerBg: 'from-green-800/50 to-green-900/50',
          activeBg: 'from-green-600/30 to-green-500/20',
          activeBorder: 'border-green-400',
          activeGradient: 'from-green-300 to-green-500',
          activeShadow: 'shadow-green-400/30',
          hoverBg: 'hover:bg-green-700/50',
          iconColor: 'text-green-300',
          iconGlow: 'bg-green-300/20',
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900',
          border: 'border-purple-700/50',
          headerBg: 'from-purple-800/50 to-purple-900/50',
          activeBg: 'from-purple-600/30 to-purple-500/20',
          activeBorder: 'border-purple-400',
          activeGradient: 'from-purple-300 to-purple-500',
          activeShadow: 'shadow-purple-400/30',
          hoverBg: 'hover:bg-purple-700/50',
          iconColor: 'text-purple-300',
          iconGlow: 'bg-purple-300/20',
        };
      default:
        return {
          bg: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
          border: 'border-slate-700/50',
          headerBg: 'from-slate-800/50 to-slate-900/50',
          activeBg: 'from-blue-600/20 to-blue-500/10',
          activeBorder: 'border-blue-500',
          activeGradient: 'from-blue-400 to-blue-600',
          activeShadow: 'shadow-blue-500/20',
          hoverBg: 'hover:bg-slate-700/50',
          iconColor: 'text-blue-400',
          iconGlow: 'bg-blue-400/20',
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} ${themeClasses.bg} text-white h-screen fixed left-0 top-0 transition-all duration-300 overflow-y-auto z-50 shadow-2xl border-r ${themeClasses.border} sidebar-scrollbar`}>
      {/* Header with gradient background */}
      <div className={`p-4 ${isCollapsed ? 'flex flex-col items-center space-y-3' : 'space-y-3'} border-b ${themeClasses.border} bg-gradient-to-r ${themeClasses.headerBg} backdrop-blur-sm`}>
        {isCollapsed ? (
          <>
            <div className="flex items-center justify-center group">
              <div className="relative">
                <Box className={`w-6 h-6 ${themeClasses.iconColor} group-hover:opacity-80 transition-colors`} />
                <div className={`absolute inset-0 ${themeClasses.iconGlow} rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            </div>
            <button 
              onClick={toggleSidebar} 
              className={`p-2 ${themeClasses.hoverBg} rounded-lg transition-all duration-200 hover:scale-110 group`}
            >
              <Menu className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 group">
                <div className="relative">
                  <Box className={`w-6 h-6 ${themeClasses.iconColor} group-hover:opacity-80 transition-colors`} />
                  <div className={`absolute inset-0 ${themeClasses.iconGlow} rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-wide">
                    YuvaComputer
                  </span>
                  <span className="text-xs text-white/70 font-medium">
                    Admin
                  </span>
                </div>
              </div>
              <button 
                onClick={toggleSidebar} 
                className={`p-2 ${themeClasses.hoverBg} rounded-lg transition-all duration-200 hover:scale-110 group`}
              >
                <Menu className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Branch and Admin Info */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {branch && (
                <div className="flex items-center gap-2 group">
                  <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Building2 className="w-4 h-4 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 truncate">Branch</p>
                    <p className="text-sm font-semibold text-white truncate" title={branch.name}>
                      {branch.name}
                    </p>
                    {branch.code && (
                      <p className="text-xs text-white/50 font-mono">{branch.code}</p>
                    )}
                  </div>
                </div>
              )}
              {user && (
                <div className="flex items-center gap-2 group">
                  <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <User className="w-4 h-4 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 truncate">Admin</p>
                    <p className="text-sm font-semibold text-white truncate" title={user.name}>
                      {user.name}
                    </p>
                    {user.email && (
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <nav className="mt-6 px-2">
        <Link
          to="/"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg ${themeClasses.activeShadow}` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <Home className={`w-5 h-5 transition-colors ${isActive('/') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Dashboard
            </span>
          )}
        </Link>

        <Link
          to="/courses"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/courses') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/courses') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <BookOpen className={`w-5 h-5 transition-colors ${isActive('/courses') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/courses') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Courses
            </span>
          )}
        </Link>

        <Link
          to="/teachers"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/teachers') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/teachers') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <Users className={`w-5 h-5 transition-colors ${isActive('/teachers') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/teachers') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Teachers
            </span>
          )}
        </Link>

        <Link
          to="/batches"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/batches') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/batches') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <Calendar className={`w-5 h-5 transition-colors ${isActive('/batches') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/batches') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Batches
            </span>
          )}
        </Link>

        <Link
          to="/staff"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/staff') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/staff') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <UserCheck className={`w-5 h-5 transition-colors ${isActive('/staff') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/staff') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Staff
            </span>
          )}
        </Link>

        <Link
          to="/students"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/students') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/students') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <GraduationCap className={`w-5 h-5 transition-colors ${isActive('/students') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/students') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Students
            </span>
          )}
        </Link>

        <Link
          to="/attendance"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/attendance') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/attendance') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <ClipboardCheck className={`w-5 h-5 transition-colors ${isActive('/attendance') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/attendance') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Attendance
            </span>
          )}
        </Link>

        <Link
          to="/payments"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/payments') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/payments') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <CreditCard className={`w-5 h-5 transition-colors ${isActive('/payments') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/payments') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Payments
            </span>
          )}
        </Link>

        <Link
          to="/settings"
          className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 mb-1 rounded-lg transition-all duration-200 ${
            isActive('/settings') 
              ? `bg-gradient-to-r ${themeClasses.activeBg} border-r-4 ${themeClasses.activeBorder} shadow-lg` 
              : `${themeClasses.hoverBg} hover:translate-x-1`
          }`}
        >
          {isActive('/settings') && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeClasses.activeGradient} rounded-r-full`} />
          )}
          <Settings className={`w-5 h-5 transition-colors ${isActive('/settings') ? themeClasses.iconColor : 'text-gray-300 group-hover:text-white'}`} />
          {!isCollapsed && (
            <span className={`font-medium ${isActive('/settings') ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
              Settings
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
}
