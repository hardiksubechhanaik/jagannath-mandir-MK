import { Navigate } from 'react-router-dom';

export default function SpecialTimings() {
  return <Navigate to="/timings?view=special" replace />;
}
