import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, currentUser, userType } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState('en');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const redirectPath = userType === 'master' ? '/master/setup' : '/client/map';
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, userType, navigate]);

  const translations = {
    en: {
      title: 'Create Account',
      description: 'Join MasterMap as a service provider or client',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      userType: 'I want to',
      master: 'Provide Services (Master)',
      client: 'Find Services (Client)',
      signup: 'Sign Up',
      haveAccount: 'Already have an account?',
      login: 'Login',
      success: 'Account created successfully!',
      error: 'Signup failed. Please try again.'
    },
    ru: {
      title: 'Создать аккаунт',
      description: 'Присоединяйтесь к MasterMap как мастер или клиент',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      userType: 'Я хочу',
      master: 'Предоставлять услуги (Мастер)',
      client: 'Найти услуги (Клиент)',
      signup: 'Зарегистрироваться',
      haveAccount: 'Уже есть аккаунт?',
      login: 'Войти',
      success: 'Аккаунт успешно создан!',
      error: 'Ошибка регистрации. Попробуйте снова.'
    }
  };

  const t = translations[language];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.userType);
      toast({
        title: t.success,
        description: formData.userType === 'master' ? 'Complete your profile to get started' : 'Start finding masters near you'
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
        <title>Sign Up - MasterMap</title>
        <meta name="description" content="Create your MasterMap account to connect with service specialists or offer your services" />
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
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-3">
                <Label>{t.userType}</Label>
                <RadioGroup
                  value={formData.userType}
                  onValueChange={(value) => setFormData({ ...formData, userType: value })}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="master" id="master" />
                    <Label htmlFor="master" className="cursor-pointer flex-1">{t.master}</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="cursor-pointer flex-1">{t.client}</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={loading}
              >
                {loading ? 'Creating account...' : t.signup}
              </Button>

              <p className="text-center text-sm text-gray-600">
                {t.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t.login}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SignupPage;