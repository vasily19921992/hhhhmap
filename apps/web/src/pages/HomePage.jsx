import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import { MapPin, Users, Star, Shield } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    en: {
      hero: {
        title: 'Connect with Service Specialists',
        subtitle: 'Find trusted professionals near you on the map',
        cta: 'Get Started'
      },
      features: {
        title: 'Why Choose MasterMap?',
        map: {
          title: 'Map-Based Discovery',
          description: 'Find service specialists based on your location with our interactive map'
        },
        verified: {
          title: 'Verified Professionals',
          description: 'All masters are verified through blockchain payment system'
        },
        reviews: {
          title: 'Real Reviews',
          description: 'Read authentic reviews from real clients to make informed decisions'
        },
        easy: {
          title: 'Easy Contact',
          description: 'Connect directly with specialists via phone, WhatsApp, or social media'
        }
      },
      howItWorks: {
        title: 'How It Works',
        client: {
          title: 'For Clients',
          step1: 'Sign up and set your location',
          step2: 'Browse specialists on the map',
          step3: 'View profiles and reviews',
          step4: 'Contact your chosen master'
        },
        master: {
          title: 'For Masters',
          step1: 'Create your profile',
          step2: 'Add your services and location',
          step3: 'Verify with blockchain payment',
          step4: 'Get discovered by clients'
        }
      }
    },
    ru: {
      hero: {
        title: 'Найдите специалистов по услугам',
        subtitle: 'Находите проверенных профессионалов рядом с вами на карте',
        cta: 'Начать'
      },
      features: {
        title: 'Почему MasterMap?',
        map: {
          title: 'Поиск на карте',
          description: 'Находите специалистов по услугам на основе вашего местоположения'
        },
        verified: {
          title: 'Проверенные профессионалы',
          description: 'Все мастера проверены через систему блокчейн-платежей'
        },
        reviews: {
          title: 'Настоящие отзывы',
          description: 'Читайте подлинные отзывы от реальных клиентов'
        },
        easy: {
          title: 'Легкий контакт',
          description: 'Связывайтесь напрямую через телефон, WhatsApp или соцсети'
        }
      },
      howItWorks: {
        title: 'Как это работает',
        client: {
          title: 'Для клиентов',
          step1: 'Зарегистрируйтесь и укажите местоположение',
          step2: 'Просматривайте специалистов на карте',
          step3: 'Смотрите профили и отзывы',
          step4: 'Свяжитесь с выбранным мастером'
        },
        master: {
          title: 'Для мастеров',
          step1: 'Создайте свой профиль',
          step2: 'Добавьте услуги и местоположение',
          step3: 'Подтвердите через блокчейн-платеж',
          step4: 'Вас найдут клиенты'
        }
      }
    }
  };

  const t = translations[language];

  return (
    <>
      <Helmet>
        <title>MasterMap - Connect with Service Specialists</title>
        <meta name="description" content="Find trusted service professionals near you on the map. Connect with verified masters for plumbing, electrical, tutoring, and more." />
      </Helmet>

      <Header />

      <div
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497263727523-79ce39ca8cb4)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            {t.hero.subtitle}
          </p>
          <Button
            onClick={() => navigate('/signup')}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300"
          >
            {t.hero.cta}
          </Button>
        </div>
      </div>

      <div className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            {t.features.title}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.features.map.title}
                </h3>
                <p className="text-gray-600">
                  {t.features.map.description}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.features.verified.title}
                </h3>
                <p className="text-gray-600">
                  {t.features.verified.description}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.features.reviews.title}
                </h3>
                <p className="text-gray-600">
                  {t.features.reviews.description}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.features.easy.title}
                </h3>
                <p className="text-gray-600">
                  {t.features.easy.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            {t.howItWorks.title}
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {t.howItWorks.client.title}
                </h3>
                <div className="space-y-4">
                  {[
                    t.howItWorks.client.step1,
                    t.howItWorks.client.step2,
                    t.howItWorks.client.step3,
                    t.howItWorks.client.step4
                  ].map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {t.howItWorks.master.title}
                </h3>
                <div className="space-y-4">
                  {[
                    t.howItWorks.master.step1,
                    t.howItWorks.master.step2,
                    t.howItWorks.master.step3,
                    t.howItWorks.master.step4
                  ].map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg"></div>
            <span className="text-2xl font-bold">MasterMap</span>
          </div>
          <p className="text-gray-400">
            © 2026 MasterMap. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;