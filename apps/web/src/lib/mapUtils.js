import L from 'leaflet';

const CATEGORY_COLORS = {
  plumber: '#3b82f6', // blue
  electrician: '#eab308', // yellow
  tutor: '#22c55e', // green
  hairdresser: '#ec4899', // pink
  mover: '#f97316', // orange
  other: '#6b7280' // gray
};

export const getCategoryIcon = (category) => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export const userLocationIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});