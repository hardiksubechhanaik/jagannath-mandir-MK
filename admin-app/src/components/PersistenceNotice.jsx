import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function PersistenceNotice() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    api.get('/health')
      .then(({ data }) => setMode(data.persistence || 'mongodb'))
      .catch(() => setMode(null));
  }, []);

  if (!mode || mode === 'mongodb') return null;

  return (
    <div className="persist-banner" role="status">
      <strong>Dev storage mode.</strong>{' '}
      Gallery, blogs, and festivals are backed up locally on this computer while the backend runs.
      For a live deployed site, use MongoDB with <code>USE_MEMORY_DB=false</code>.
    </div>
  );
}
