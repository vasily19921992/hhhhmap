import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, MessageCircle } from 'lucide-react';

const MasterProfileCard = ({ master }) => {
  const navigate = useNavigate();

  const primaryService = master.services?.find(s => s.isPrimary);
  const rating = master.rating || 0;
  const reviewCount = master.reviews || 0;

  if (master.subscriptionStatus !== 'active') {
    return (
      <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 opacity-60">
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">Profile Inactive</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{master.profileName}</h3>
            {primaryService && (
              <div className="flex items-center space-x-2">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                  {primaryService.name}
                </Badge>
                <span className="text-lg font-semibold text-amber-600">
                  ${primaryService.price}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 mb-4">
          {rating > 0 ? (
            <>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">No reviews yet</span>
          )}
        </div>

        {master.phone && (
          <div className="flex items-center space-x-2 text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{master.phone}</span>
          </div>
        )}

        {master.contacts?.whatsapp && (
          <div className="flex items-center space-x-2 text-gray-700">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">WhatsApp available</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => navigate(`/master/${master.id}`)}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MasterProfileCard;