import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { RATH_ROUTE_WAYPOINTS } from '../../data/rathRoutePath.js';

export default function MapRefocusControl({ ariaLabel }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'bottomright' });

    control.onAdd = () => {
      const wrap = L.DomUtil.create('div', 'rath-map-refocus-wrap');
      const btn = L.DomUtil.create('button', 'rath-map-refocus-btn', wrap);
      btn.type = 'button';
      btn.setAttribute('aria-label', ariaLabel);
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="5.5" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      `;

      L.DomEvent.disableClickPropagation(wrap);
      L.DomEvent.on(btn, 'click', (event) => {
        L.DomEvent.preventDefault(event);
        L.DomEvent.stopPropagation(event);
        map.fitBounds(L.latLngBounds(RATH_ROUTE_WAYPOINTS), {
          padding: [32, 32],
          maxZoom: 17,
          animate: true,
        });
      });

      return wrap;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, ariaLabel]);

  return null;
}
