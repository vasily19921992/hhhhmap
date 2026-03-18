import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';

const LocationSearch = ({ onSelect, placeholder = "Search location..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
          const data = await res.json();
          setResults(data);
        } catch (error) {
          console.error("Error fetching location:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 bg-white"
        />
      </div>
      
      {results.length > 0 && (
        <div className="absolute z-[1000] w-full bg-white mt-1 border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((r, i) => (
            <div
              key={i}
              className="p-3 hover:bg-gray-50 cursor-pointer text-sm flex items-start space-x-2 border-b last:border-0"
              onClick={() => {
                onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
                setQuery(r.display_name.split(',')[0]); // Just show the main part
                setResults([]);
              }}
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{r.display_name}</span>
            </div>
          ))}
        </div>
      )}
      
      {isSearching && (
        <div className="absolute z-[1000] w-full bg-white mt-1 border rounded-md shadow-lg p-3 text-sm text-gray-500 text-center">
          Searching...
        </div>
      )}
    </div>
  );
};

export default LocationSearch;