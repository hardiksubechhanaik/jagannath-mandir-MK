import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrollNavigate } from '../lib/scrollNavigate';

/** Hook for <Link>/<NavLink> onClick — navigates and scrolls to top. */
export default function useScrollNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (to, event) => scrollNavigate(navigate, to, event),
    [navigate],
  );
}
