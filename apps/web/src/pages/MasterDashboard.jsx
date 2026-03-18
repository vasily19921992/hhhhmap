import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Calendar, Edit, Eye, CreditCard, Star } from 'lucide-react';

const MasterDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [masterId, setMasterId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchSubscriptionStatus();
    }
  }, [currentUser]);

  const fetchSubscriptionStatus = async () => {
    try {
      const master = await pb.collection('masters').getFirstListItem(`userId="${currentUser.id}"`, { $autoCancel: false });
      setMasterId(master.id);

      const expiryDate = master.subscriptionExpiryDate ? new Date(master.subscriptionExpiryDate) : null;
      const now = new Date();
      const daysRemaining = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;

      setSubscriptionStatus({
        status: master.subscriptionStatus,
        expiryDate: master.subscriptionExpiryDate,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0
      });
    } catch (error) {
      if (error.status === 401) {
        toast({
          title: 'Session expired',
          description: 'Please login again',
          variant: 'destructive'
        });
        navigate('/login');
      } else if (error.status === 404) {
        // Master profile not found, redirect to setup
        navigate('/master/setup');
      } else {
        console.error('Error fetching subscription:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    toast({
      title: '🚧 Edit Profile Feature',
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const handleViewAsClient = () => {
    if (masterId) {
      navigate(`/master/${masterId}`);
    }
  };

  const handleRenewSubscription = () => {
    navigate('/master/payment');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </>
    );
  }

  const isActive = subscriptionStatus?.status === 'active';
  const daysRemaining = subscriptionStatus?.daysRemaining || 0;

  return (
    <>
      <Helmet>
        <title>Master Dashboard - MasterMap</title>
        <meta name="description" content="Manage your master profile and subscription" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Master Dashboard</h1>
            <Badge className={isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
              {isActive ? 'Active' : 'Expired'}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Subscription Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isActive ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium text-gray-900">
                        {subscriptionStatus.expiryDate ? new Date(subscriptionStatus.expiryDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Days Remaining:</span>
                      <span className="font-medium text-gray-900">{daysRemaining} days</span>
                    </div>
                    {daysRemaining < 7 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          ⚠️ Your subscription expires soon. Renew to keep your profile active.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium mb-2">Subscription Expired</p>
                      <p className="text-sm text-red-700">
                        Your profile is not visible to clients. Renew your subscription to reactivate.
                      </p>
                    </div>
                    <Button
                      onClick={handleRenewSubscription}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Renew Subscription
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Profile Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={handleViewAsClient}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!masterId}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile as Client
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-amber-600">0</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">0</p>
                  <p className="text-sm text-gray-600">Reviews</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">0.0</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Stats tracking coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MasterDashboard;