import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, X, User, LogOut, 
  ChevronDown, Calendar, Users, 
  Activity, Settings, Home 
} from 'lucide-react';
import { UserRole } from '../../types';
import { 
  ADMIN_NAV_ITEMS, 
  DOCTOR_NAV_ITEMS, 
  PATIENT_NAV_ITEMS 
} from '../../utils/constants';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get the navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case UserRole.ADMIN:
        return ADMIN_NAV_ITEMS;
      case UserRole.DOCTOR:
        return DOCTOR_NAV_ITEMS;
      case UserRole.PATIENT:
        return PATIENT_NAV_ITEMS;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Activity className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">MediCare</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500"
              >
                Home
              </Link>
              
              {user && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User profile dropdown */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 bg-white rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <div className="bg-primary-100 rounded-full p-1">
                      <User className="h-6 w-6 text-primary-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.email}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 text-xs text-gray-500">
                        Logged in as <span className="font-medium capitalize">{user.role}</span>
                      </div>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Home
              </div>
            </Link>

            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  {item.name === 'Dashboard' && <Activity className="h-5 w-5 mr-2" />}
                  {item.name.includes('Doctor') && <Users className="h-5 w-5 mr-2" />}
                  {item.name.includes('Categor') && <Settings className="h-5 w-5 mr-2" />}
                  {item.name.includes('Schedule') && <Calendar className="h-5 w-5 mr-2" />}
                  {item.name.includes('Appointment') && <Calendar className="h-5 w-5 mr-2" />}
                  {item.name}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile profile section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="px-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-full p-2">
                    <User className="h-6 w-6 text-primary-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.email}</div>
                    <div className="text-sm font-medium text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-700 hover:text-primary-500"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 text-center rounded-md text-base font-medium text-primary-600 hover:text-primary-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2 text-center rounded-md text-base font-medium bg-primary-500 text-white hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;