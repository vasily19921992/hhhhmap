import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, currentUser, userType } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState('en');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const redirectPath = userType === 'master' ? '/master/dashboard' : '/client/map';
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, userType, navigate]);

  const translations = {
    en: {
      title: 'Welcome Back',
      description: 'Login to your MasterMap account',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      noAccount: "Don't have an account?",
      signup: 'Sign Up',
      success: 'Login successful!',
      error: 'Login failed. Please check your credentials.'
    },
    ru: {
      title: 'С возвращением',
      description: 'Войдите в свой аккаунт MasterMap',
      email: 'Email',
      password: 'Пароль',
      login: 'Войти',
      noAccount: 'Нет аккаунта?',
      signup: 'Зарегистрироваться',
      success: 'Вход выполнен успешно!',
      error: 'Ошибка входа. Проверьте данные.'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: t.success
      });
    } catch (error) {
      toast({
        title: t.error,
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - MasterMap</title>
        <meta name="description" content="Login to your MasterMap account" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={loading}
              >
                {loading ? 'Logging in...' : t.login}
              </Button>

              <p className="text-center text-sm text-gray-600">
                {t.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t.signup}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;