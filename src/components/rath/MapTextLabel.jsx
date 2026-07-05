import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function MapTextLabel({ position, text }) {
  const map = useMap();
  const [lat, lng] = position;

  useEffect(() => {
    let marker = null;

    const mount = () => {
      marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'rath-map-text-label-wrap',
          html: `<span class="rath-map-text-label">${text}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
        zIndexOffset: 75,
      });
      marker.addTo(map);
    };

    map.whenReady(mount);

    return () => {
      marker?.remove();
    };
  }, [map, lat, lng, text]);

  return null;
}
