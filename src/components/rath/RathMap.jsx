import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import {
  RATH_ROUTE_END,
  RATH_ROUTE_START,
  RATH_ROUTE_STYLE,
  RATH_ROUTE_UNDERLAY_STYLE,
  RATH_ROUTE_WAYPOINTS,
} from '../../data/rathRoutePath.js';
import {
  RATH_MAP_CENTER,
  RATH_MAP_ZOOM,
  createRathEndIcon,
  createRathStartIcon,
  createRathTrackerIcon,
  getRemainingRouteWaypoints,
} from '../../lib/rathTracker.js';
import MapTextLabel from './MapTextLabel.jsx';
import MapRefocusControl from './MapRefocusControl.jsx';
import { CENTRAL_PARK, MARKET_AREA } from '../../data/rathMapZones.js';

function MapRecenter({ lat, lng, active }) {
  const map = useMap();

  useEffect(() => {
    if (active && lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
    }
  }, [active, lat, lng, map]);

  return null;
}

function MapFitRoute({ active }) {
  const map = useMap();

  useEffect(() => {
    if (!active) {
      map.fitBounds(RATH_ROUTE_WAYPOINTS, { padding: [32, 32], maxZoom: 17 });
    }
  }, [active, map]);

  return null;
}

export default function RathMap({ lat, lng, live, popupText, refocusLabel }) {
  const hasPosition = lat != null && lng != null;
  const center = hasPosition ? [lat, lng] : RATH_MAP_CENTER;
  const startIcon = createRathStartIcon();
  const endIcon = createRathEndIcon();
  const trackerIcon = createRathTrackerIcon();
  const showLive = hasPosition && live;

  // When live: only draw the route still ahead of the Rath.
  // When offline: show the full planned path.
  const routeWaypoints = useMemo(() => {
    if (showLive) {
      return getRemainingRouteWaypoints(RATH_ROUTE_WAYPOINTS, lat, lng);
    }
    return RATH_ROUTE_WAYPOINTS;
  }, [showLive, lat, lng]);

  // Remount only when the planned route definition changes — not on every GPS tick.
  const mapKey = RATH_ROUTE_WAYPOINTS.map((point) => point.join(',')).join('|');

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={RATH_MAP_ZOOM}
      className="rath-leaflet-map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline positions={routeWaypoints} pathOptions={RATH_ROUTE_UNDERLAY_STYLE} />
      <Polyline positions={routeWaypoints} pathOptions={RATH_ROUTE_STYLE} />

      <MapTextLabel position={CENTRAL_PARK.center} text={CENTRAL_PARK.name} />
      <MapTextLabel position={MARKET_AREA.center} text={MARKET_AREA.name} />

      <Marker position={RATH_ROUTE_START} icon={startIcon} zIndexOffset={100}>
        <Popup>Start — Shree Jagannath Mandir</Popup>
      </Marker>
      <Marker position={RATH_ROUTE_END} icon={endIcon} zIndexOffset={100}>
        <Popup>Destination — Gundicha Mandir</Popup>
      </Marker>

      <MapFitRoute active={showLive} />
      <MapRecenter lat={lat} lng={lng} active={showLive} />
      <MapRefocusControl ariaLabel={refocusLabel} />

      {showLive ? (
        <Marker position={[lat, lng]} icon={trackerIcon} zIndexOffset={200}>
          <Popup>{popupText}</Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
