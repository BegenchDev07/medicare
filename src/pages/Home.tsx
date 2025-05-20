import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, UserPlus, Users, Clock } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!user) {
      navigate('/register');
    } else {
      const dashboardPath = 
        user.role === UserRole.ADMIN 
          ? '/admin/dashboard' 
          : user.role === UserRole.DOCTOR 
            ? '/doctor/dashboard' 
            : '/patient/dashboard';
      navigate(dashboardPath);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Quality Healthcare Made <span className="text-secondary-300">Simple</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Find and book appointments with qualified doctors in your area. 
              Manage your healthcare needs from the comfort of your home.
            </p>
            <div className="pt-4">
              <Button 
                onClick={handleGetStarted} 
                variant="secondary" 
                size="lg"
                className="mr-4"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => navigate('/patient/doctors')} 
                variant="ghost" 
                size="lg"
                className="bg-white/10 text-white hover:bg-white/20"
              >
                Find Doctors
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center items-center">
            <img 
              src="https://images.pexels.com/photos/3845701/pexels-photo-3845701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Doctor with patient" 
              className="rounded-lg shadow-xl max-w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our hospital management system makes healthcare access simple and efficient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-100 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Specialists</h3>
            <p className="text-gray-600">
              Search for specialists by category, see their availability, and read about their expertise.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-secondary-100 p-4 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Appointments</h3>
            <p className="text-gray-600">
              Select a convenient time from the doctor's schedule and book your appointment in seconds.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-accent-100 p-4 rounded-full mb-4">
              <Clock className="h-8 w-8 text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Your Schedule</h3>
            <p className="text-gray-600">
              View and manage your upcoming appointments and receive timely reminders.
            </p>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Medical Specialties</h2>
            <p className="mt-4 text-xl text-gray-600">
              Find the right specialist for your healthcare needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Cardiology', icon: '❤️' },
              { name: 'Dermatology', icon: '🧠' },
              { name: 'Orthopedics', icon: '🦴' },
              { name: 'Pediatrics', icon: '👶' },
              { name: 'Neurology', icon: '🧠' },
              { name: 'Dentistry', icon: '🦷' },
              { name: 'Ophthalmology', icon: '👁️' },
              { name: 'General Medicine', icon: '🩺' },
            ].map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center"
              >
                <span className="text-3xl mb-3">{category.icon}</span>
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to take control of your healthcare?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Join thousands of patients who've simplified their healthcare journey with our platform.
          </p>
          <Button 
            onClick={handleGetStarted} 
            variant="secondary" 
            size="lg"
            className="mx-2"
          >
            Get Started Now
          </Button>
          <Button 
            onClick={() => navigate('/login')} 
            variant="ghost" 
            size="lg"
            className="mx-2 bg-white/10 text-white hover:bg-white/20"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;