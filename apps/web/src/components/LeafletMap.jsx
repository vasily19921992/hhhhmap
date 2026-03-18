import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

export const DefaultTileLayer = () => (
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
);

// Helper component to update map center when props change
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

export const LeafletMap = ({ center, zoom = 13, children, style, className }) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={style} 
      className={className}
      scrollWheelZoom={true}
    >
      <DefaultTileLayer />
      <MapUpdater center={center} zoom={zoom} />
      {children}
    </MapContainer>
  );
};

export default LeafletMap;