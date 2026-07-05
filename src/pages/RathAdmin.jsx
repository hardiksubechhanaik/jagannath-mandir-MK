import { Navigate } from 'react-router-dom';

/** Legacy URL — sends volunteers to the unified login with GPS tab. */
export default function RathAdmin() {
  return <Navigate to="/rath-wall-volunteer?tab=gps" replace />;
}
