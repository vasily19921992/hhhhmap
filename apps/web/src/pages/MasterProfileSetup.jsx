import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Marker, Circle, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import LeafletMap from '@/components/LeafletMap.jsx';
import LocationSearch from '@/components/LocationSearch.jsx';
import { getCategoryIcon } from '@/lib/mapUtils.js';
import { Trash2, Plus } from 'lucide-react';

const CATEGORIES = [
  'plumber', 'electrician', 'tutor', 'hairdresser', 'mover',
  'cleaner', 'carpenter', 'painter', 'mechanic', 'gardener',
  'photographer', 'chef', 'trainer', 'massage', 'other'
];

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const MasterProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    profileName: '',
    phone: '',
    categories: [],
    customTags: '',
    services: [],
    serviceLocation: { lat: 40.7128, lng: -74.0060 },
    radius: 10,
    contacts: {
      phone: '',
      whatsapp: '',
      telegram: '',
      instagram: ''
    }
  });

  const [newService, setNewService] = useState({
    name: '',
    price: '',
    description: '',
    isPrimary: false
  });

  const validateStep = () => {
    if (step === 1) {
      if (!formData.profileName || !formData.phone || formData.categories.length === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return false;
      }
    }

    if (step === 3) {
      const hasPrimary = formData.services.some(s => s.isPrimary);
      if (!hasPrimary) {
        toast({
          title: 'Primary Service Required',
          description: 'Please select exactly one primary service',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) {
      toast({
        title: 'Invalid Service',
        description: 'Please enter service name and price',
        variant: 'destructive'
      });
      return;
    }

    setFormData({
      ...formData,
      services: [...formData.services, { ...newService, price: parseFloat(newService.price) }]
    });

    setNewService({ name: '', price: '', description: '', isPrimary: false });
  };

  const handleRemoveService = (index) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const handleSetPrimary = (index) => {
    setFormData({
      ...formData,
      services: formData.services.map((service, i) => ({
        ...service,
        isPrimary: i === index
      }))
    });
  };

  const handleLocationSelect = (coords) => {
    setFormData({
      ...formData,
      serviceLocation: coords
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      await pb.collection('masters').create({
        userId: currentUser.id,
        profileName: formData.profileName,
        phone: formData.phone,
        categories: formData.categories,
        customTags: formData.customTags.split(',').map(t => t.trim()).filter(t => t),
        services: formData.services,
        serviceLocation: [formData.serviceLocation.lat, formData.serviceLocation.lng],
        radius: formData.radius,
        contacts: formData.contacts,
        subscriptionStatus: 'inactive'
      }, { $autoCancel: false });

      toast({
        title: 'Profile Saved!',
        description: 'Your profile has been created successfully'
      });

      navigate('/master/dashboard');
    } catch (error) {
      if (error.status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Please login again',
          variant: 'destructive'
        });
        navigate('/login');
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

  return (
    <>
      <Helmet>
        <title>Setup Profile - MasterMap</title>
        <meta name="description" content="Complete your master profile setup" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                Master Profile Setup - Step {step} of 4
              </CardTitle>
              <div className="flex space-x-2 mt-4">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full ${
                      s <= step ? 'bg-amber-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileName">Profile Name *</Label>
                    <Input
                      id="profileName"
                      value={formData.profileName}
                      onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
                      placeholder="Your professional name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <Label>Categories * (Select multiple)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, categories: [...formData.categories, cat] });
                              } else {
                                setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat) });
                              }
                            }}
                          />
                          <span className="capitalize">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customTags">Custom Tags (comma-separated)</Label>
                    <Input
                      id="customTags"
                      value={formData.customTags}
                      onChange={(e) => setFormData({ ...formData, customTags: e.target.value })}
                      placeholder="experienced, certified, fast"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Search Location</Label>
                    <LocationSearch onSelect={handleLocationSelect} />
                  </div>

                  <div>
                    <Label className="mb-2 block">Or click on map to set exact location</Label>
                    <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 relative z-0">
                      <LeafletMap center={formData.serviceLocation} zoom={12} className="h-full w-full">
                        <MapClickHandler onMapClick={handleLocationSelect} />
                        <Marker 
                          position={formData.serviceLocation} 
                          icon={getCategoryIcon(formData.categories[0] || 'other')} 
                        />
                        <Circle
                          center={formData.serviceLocation}
                          radius={formData.radius * 1000}
                          pathOptions={{
                            fillColor: '#f59e0b',
                            fillOpacity: 0.2,
                            color: '#f59e0b',
                            weight: 2
                          }}
                        />
                      </LeafletMap>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Selected Coordinates: {formData.serviceLocation.lat.toFixed(4)}, {formData.serviceLocation.lng.toFixed(4)}
                    </p>
                  </div>

                  <div>
                    <Label>Service Radius: {formData.radius} km</Label>
                    <Slider
                      value={[formData.radius]}
                      onValueChange={(value) => setFormData({ ...formData, radius: value[0] })}
                      min={1}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold mb-3">Add New Service</h3>
                    <div className="space-y-3">
                      <Input
                        placeholder="Service name"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Price (USD)"
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      />
                      <Button onClick={handleAddService} className="w-full bg-amber-600 hover:bg-amber-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Your Services (Select one as primary) *</Label>
                    {formData.services.length === 0 ? (
                      <p className="text-gray-500 text-sm mt-2">No services added yet</p>
                    ) : (
                      <RadioGroup
                        value={formData.services.findIndex(s => s.isPrimary).toString()}
                        onValueChange={(value) => handleSetPrimary(parseInt(value))}
                      >
                        <div className="space-y-2 mt-2">
                          {formData.services.map((service, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                              <RadioGroupItem value={index.toString()} id={`service-${index}`} />
                              <Label htmlFor={`service-${index}`} className="flex-1 cursor-pointer">
                                <div className="font-medium">{service.name}</div>
                                <div className="text-sm text-gray-600">${service.price}</div>
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveService(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contacts.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        contacts: { ...formData.contacts, phone: e.target.value }
                      })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.contacts.whatsapp}
                      onChange={(e) => setFormData({
                        ...formData,
                        contacts: { ...formData.contacts, whatsapp: e.target.value }
                      })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      value={formData.contacts.telegram}
                      onChange={(e) => setFormData({
                        ...formData,
                        contacts: { ...formData.contacts, telegram: e.target.value }
                      })}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.contacts.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        contacts: { ...formData.contacts, instagram: e.target.value }
                      })}
                      placeholder="@username"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Previous
                  </Button>
                )}

                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="ml-auto bg-amber-600 hover:bg-amber-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-auto bg-amber-600 hover:bg-amber-700"
                  >
                    {loading ? 'Saving...' : 'Complete Setup'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MasterProfileSetup;