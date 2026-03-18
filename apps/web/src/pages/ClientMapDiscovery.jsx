import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Marker, Popup, Circle } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import LeafletMap from '@/components/LeafletMap.jsx';
import LocationSearch from '@/components/LocationSearch.jsx';
import { getCategoryIcon, userLocationIcon } from '@/lib/mapUtils.js';
import { MapPin, Filter, Navigation } from 'lucide-react';

const CATEGORIES = [
  'all', 'plumber', 'electrician', 'tutor', 'hairdresser', 'mover',
  'cleaner', 'carpenter', 'painter', 'mechanic', 'gardener'
];

const ClientMapDiscovery = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [locationSource, setLocationSource] = useState('manual');
  const [showLocationDialog, setShowLocationDialog] = useState(true);
  const [masters, setMasters] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: 'all',
    minRating: 0,
    maxPrice: 1000
  });

  useEffect(() => {
    // Check for saved location preference
    const savedLoc = localStorage.getItem('preferredLocation');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        setLocation(parsed.coords);
        setLocationSource(parsed.source);
        setShowLocationDialog(false);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!showLocationDialog) {
      fetchMasters();
    }
  }, [location, showLocationDialog]);

  useEffect(() => {
    applyFilters();
  }, [masters, filters]);

  const saveLocationPreference = (coords, source) => {
    localStorage.setItem('preferredLocation', JSON.stringify({ coords, source }));
  };

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLoc);
          setLocationSource('gps');
          saveLocationPreference(newLoc, 'gps');
          setShowLocationDialog(false);
          toast({
            title: 'Location Found',
            description: 'Using your current location'
          });
        },
        (error) => {
          toast({
            title: 'Location Access Denied',
            description: 'Please search for your location manually',
            variant: 'destructive'
          });
        }
      );
    }
  };

  const handleManualLocationSelect = (coords) => {
    setLocation(coords);
    setLocationSource('manual');
    saveLocationPreference(coords, 'manual');
    setShowLocationDialog(false);
  };

  const fetchMasters = async () => {
    setLoading(true);
    try {
      const result = await pb.collection('masters').getList(1, 50, {
        filter: "subscriptionStatus='active'",
        $autoCancel: false
      });
      setMasters(result.items);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...masters];

    if (filters.category !== 'all') {
      filtered = filtered.filter(m => 
        m.categories && m.categories.includes(filters.category)
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(m => (m.rating || 0) >= filters.minRating);
    }

    if (filters.maxPrice < 1000) {
      filtered = filtered.filter(m => {
        const primaryService = m.services?.find(s => s.isPrimary);
        return primaryService && primaryService.price <= filters.maxPrice;
      });
    }

    setFilteredMasters(filtered);
  };

  return (
    <>
      <Helmet>
        <title>Find Masters - MasterMap</title>
        <meta name="description" content="Discover service specialists near you" />
      </Helmet>

      <Header />

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your Location</DialogTitle>
            <DialogDescription>
              We need your location to show nearby service specialists.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button onClick={requestGeolocation} className="w-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center">
              <Navigation className="w-4 h-4 mr-2" />
              Use My Current Location
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or search manually</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <LocationSearch onSelect={handleManualLocationSelect} placeholder="Enter city or address..." />
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
        <div className="w-full md:w-80 bg-white border-r overflow-y-auto p-4 space-y-4 z-10 shadow-md md:shadow-none">
          <div className="mb-4">
            <LocationSearch onSelect={handleManualLocationSelect} placeholder="Change location..." />
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Minimum Rating: {filters.minRating}
            </label>
            <Slider
              value={[filters.minRating]}
              onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
              min={0}
              max={5}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Max Price: ${filters.maxPrice}
            </label>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={(value) => setFilters({ ...filters, maxPrice: value[0] })}
              min={0}
              max={1000}
              step={10}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                Location: {locationSource === 'gps' ? 'GPS (Current)' : 'Manual Search'}
              </span>
            </div>
            <Button onClick={fetchMasters} className="w-full bg-amber-600 hover:bg-amber-700">
              Refresh Results
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Found {filteredMasters.length} masters
            </p>
          </div>
        </div>

        <div className="flex-1 relative z-0">
          <LeafletMap 
            center={location} 
            zoom={12} 
            className="w-full h-full"
          >
            <Marker position={location} icon={userLocationIcon}>
              <Popup>Your Location</Popup>
            </Marker>

            {filteredMasters.map((master) => {
              const masterLocation = [
                master.serviceLocation?.[0] || 0,
                master.serviceLocation?.[1] || 0
              ];
              const primaryService = master.services?.find(s => s.isPrimary);
              const category = master.categories?.[0] || 'other';

              return (
                <React.Fragment key={master.id}>
                  <Marker
                    position={masterLocation}
                    icon={getCategoryIcon(category)}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 min-w-[200px]">
                        <h3 className="font-bold text-lg mb-1">{master.profileName}</h3>
                        {primaryService && (
                          <div className="text-sm mb-2">
                            <span className="font-medium">{primaryService.name}</span>
                            <span className="text-amber-600 font-bold ml-2">${primaryService.price}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mb-3 capitalize">
                          {category} • {master.rating ? `${master.rating.toFixed(1)} ★` : 'New'}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={() => window.location.href = `/master/${master.id}`}
                        >
                          View Profile
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle 
                    center={masterLocation} 
                    radius={(master.radius || 10) * 1000} 
                    pathOptions={{ 
                      color: '#f59e0b', 
                      fillColor: '#f59e0b', 
                      fillOpacity: 0.1,
                      weight: 1
                    }} 
                  />
                </React.Fragment>
              );
            })}
          </LeafletMap>

          {filteredMasters.length === 0 && !loading && !showLocationDialog && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
              <Card className="shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-600 font-medium">No masters found in this area</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or location</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientMapDiscovery;