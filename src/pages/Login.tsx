import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import Alert from '../components/common/Alert';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {    
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const user:any = await login(email, password);      
      showNotification('success', 'Successfully logged in!');
      
      // Redirect based on user role
      switch (user.role) {
        case UserRole.ADMIN:
          navigate('/admin/dashboard');
          break;
        case UserRole.DOCTOR:
          navigate('/doctor/dashboard');
          break;
        case UserRole.PATIENT:
          navigate('/patient/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Login error:', err);
      }

      const errorMessage = err?.message?.toLowerCase() || '';
      
      if (errorMessage.includes('invalid login credentials') || 
          errorMessage.includes('invalid_credentials') ||
          errorMessage.includes('auth/invalid-email') ||
          errorMessage.includes('auth/wrong-password')) {
        showNotification('error', 'Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.includes('email not confirmed')) {
        showNotification('error', 'Please confirm your email address before logging in.');
      } else if (errorMessage.includes('invalid email')) {
        showNotification('error', 'Please enter a valid email address.');
      } else if (errorMessage.includes('rate limit') || 
                 errorMessage.includes('too many requests')) {
        showNotification('error', 'Too many login attempts. Please try again later.');
      } else if (errorMessage.includes('network') || 
                 errorMessage.includes('connection')) {
        showNotification('error', 'Network error. Please check your internet connection.');
      } else if (errorMessage.includes('user not found')) {
        showNotification('error', 'No account found with this email address.');
      } else {
        showNotification('error', 'An error occurred while signing in. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            dismissible={true} 
            onDismiss={() => setError(null)}
          />
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
            />
            
            <div className="relative">
              <FormField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            icon={<LogIn size={18} />}
          >
            Sign in
          </Button>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;