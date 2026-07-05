import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import Overview from './pages/Overview.jsx';
import Gallery from './pages/Gallery.jsx';
import Blogs from './pages/Blogs.jsx';
import Festivals from './pages/Festivals.jsx';
import Timings from './pages/Timings.jsx';
import Donations from './pages/Donations.jsx';
import Messages from './pages/Messages.jsx';
import Settings from './pages/Settings.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardLayout />
          </Protected>
        }
      >
        <Route index element={<Overview />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="festivals" element={<Festivals />} />
        <Route path="timings" element={<Timings />} />
        <Route path="donations" element={<Donations />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
