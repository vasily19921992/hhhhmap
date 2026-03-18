import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Globe, LogOut, User } from 'lucide-react';

const Header = () => {
  const { currentUser, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ru' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const translations = {
    en: {
      home: 'Home',
      dashboard: 'Dashboard',
      map: 'Find Masters',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout'
    },
    ru: {
      home: 'Главная',
      dashboard: 'Панель',
      map: 'Найти мастеров',
      login: 'Войти',
      signup: 'Регистрация',
      logout: 'Выйти'
    }
  };

  const t = translations[language];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">MasterMap</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {currentUser ? (
              <>
                {userType === 'master' && (
                  <Link to="/master/dashboard" className="text-gray-700 hover:text-amber-600 transition-colors">
                    {t.dashboard}
                  </Link>
                )}
                {userType === 'client' && (
                  <Link to="/client/map" className="text-gray-700 hover:text-amber-600 transition-colors">
                    {t.map}
                  </Link>
                )}
                <Button onClick={logout} variant="ghost" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.logout}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-amber-600 transition-colors">
                  {t.login}
                </Link>
                <Link to="/signup">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    {t.signup}
                  </Button>
                </Link>
              </>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;