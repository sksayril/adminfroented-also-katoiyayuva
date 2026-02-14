import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminLogin, LoginRequest, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect if already authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use email or adminId (both are accepted by API)
      const credentials: LoginRequest = {
        email: formData.email || undefined,
        adminId: formData.email || undefined,
        password: formData.password,
      };

      const response = await adminLogin(credentials);
      
      // Update auth context
      login(response);
      
      // Show success toast
      toast.success('Login successful! Welcome back.');
      
      // Redirect to dashboard on success
      navigate('/', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      let errorMessage = '';
      
      if (apiError.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (apiError.status === 403) {
        errorMessage = 'Account disabled or access denied.';
      } else if (apiError.status === 400) {
        errorMessage = 'Please fill in all required fields.';
      } else {
        errorMessage = apiError.message || 'An error occurred. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Illustration */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-700 to-slate-800 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          {/* Brand Name */}
          <div className="relative z-10 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Branch Admin
            </h2>
            <h3 className="text-xl md:text-2xl font-semibold text-blue-300">
              Yuva Computer
            </h3>
          </div>
          
          {/* Illustration Area */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-block mb-8">
                {/* Person Illustration */}
                <div className="w-48 h-48 mx-auto relative">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                      <LogIn className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-blue-400/40 rounded-full blur-xl"></div>
                <div className="absolute -right-8 bottom-1/4 w-20 h-20 bg-blue-500/40 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="relative z-10 mt-8">
            <p className="text-slate-300 text-sm leading-relaxed">
              Welcome to Yuva Computer Branch Admin Portal. Access your branch management dashboard to oversee operations, manage resources, and monitor performance. Secure login ensures only authorized administrators can access branch-specific data and administrative functions.
            </p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            {/* Brand Name for Mobile */}
            <div className="mb-6 md:hidden">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Branch Admin
              </h2>
              <h3 className="text-xl font-semibold text-slate-700">
                Yuva Computer
              </h3>
            </div>

            {/* Welcome Badge */}
            <div className="mb-6">
              <span className="inline-block bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full">
                Welcome back
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-slate-900 mb-8">
              Login your account
            </h1>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Admin ID Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email or Admin ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-300 focus:border-slate-700 focus:outline-none transition-colors bg-transparent"
                    placeholder="Enter your email or admin ID"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border-b-2 border-slate-300 focus:border-slate-700 focus:outline-none transition-colors bg-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold py-3 px-6 rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
