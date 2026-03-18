import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Marker, Circle } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import LeafletMap from '@/components/LeafletMap.jsx';
import { getCategoryIcon } from '@/lib/mapUtils.js';
import { Star, Phone, MessageCircle, Instagram, Send } from 'lucide-react';

const MasterDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [master, setMaster] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterDetails();
    fetchReviews();
  }, [id]);

  const fetchMasterDetails = async () => {
    try {
      const data = await pb.collection('masters').getOne(id, { $autoCancel: false });
      setMaster(data);
    } catch (error) {
      if (error.status === 404) {
        toast({
          title: 'Not Found',
          description: 'Master profile not found',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const result = await pb.collection('reviews').getList(1, 50, {
        filter: `masterId="${id}"`,
        $autoCancel: false
      });
      setReviews(result.items);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleContact = () => {
    toast({
      title: '🚧 Chat Feature Coming Soon',
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
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

  if (!master) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-gray-600">Master not found</p>
        </div>
      </>
    );
  }

  const primaryService = master.services?.find(s => s.isPrimary);
  const otherServices = master.services?.filter(s => !s.isPrimary) || [];
  const serviceLocation = {
    lat: master.serviceLocation?.[0] || 0,
    lng: master.serviceLocation?.[1] || 0
  };
  const category = master.categories?.[0] || 'other';
  const radius = (master.radius || 10) * 1000; // Convert km to meters

  return (
    <>
      <Helmet>
        <title>{`${master.profileName} - MasterMap`}</title>
        <meta name="description" content={`View ${master.profileName}'s profile and services`} />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl text-gray-900 mb-2">{master.profileName}</CardTitle>
                  <div className="flex items-center space-x-1 mb-3">
                    {master.rating > 0 ? (
                      <>
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">{master.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({master.reviews} reviews)</span>
                      </>
                    ) : (
                      <span className="text-gray-500">No reviews yet</span>
                    )}
                  </div>
                  {master.subscriptionStatus === 'active' ? (
                    <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Service</h3>
                {primaryService && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{primaryService.name}</h4>
                          {primaryService.description && (
                            <p className="text-sm text-gray-600 mt-1">{primaryService.description}</p>
                          )}
                        </div>
                        <span className="text-2xl font-bold text-amber-600">${primaryService.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {otherServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Services</h3>
                  <div className="grid gap-3">
                    {otherServices.map((service, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{service.name}</h4>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                            </div>
                            <span className="text-lg font-semibold text-gray-900">${service.price}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {master.phone && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Phone className="w-5 h-5" />
                      <span>{master.phone}</span>
                    </div>
                  )}
                  {master.contacts?.whatsapp && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <MessageCircle className="w-5 h-5" />
                      <span>WhatsApp: {master.contacts.whatsapp}</span>
                    </div>
                  )}
                  {master.contacts?.telegram && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Send className="w-5 h-5" />
                      <span>Telegram: {master.contacts.telegram}</span>
                    </div>
                  )}
                  {master.contacts?.instagram && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Instagram className="w-5 h-5" />
                      <span>Instagram: {master.contacts.instagram}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Area</h3>
                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 relative z-0">
                  <LeafletMap center={serviceLocation} zoom={11} className="h-full w-full">
                    <Marker position={serviceLocation} icon={getCategoryIcon(category)} />
                    <Circle
                      center={serviceLocation}
                      radius={radius}
                      pathOptions={{
                        fillColor: '#f59e0b',
                        fillOpacity: 0.2,
                        color: '#f59e0b',
                        weight: 2
                      }}
                    />
                  </LeafletMap>
                </div>
              </div>

              <Button onClick={handleContact} className="w-full bg-amber-600 hover:bg-amber-700">
                Contact Master
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          by {review.clientName || 'Anonymous'}
                        </span>
                      </div>
                      {review.text && <p className="text-gray-700">{review.text}</p>}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.created).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MasterDetailPage;