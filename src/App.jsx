import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { endpoints } from './api/client'
import { prefetchPageData } from './hooks/usePageData'
import HashScroll from './components/HashScroll'
import MandirLoader from './components/MandirLoader'
import MelaFloatingLogo from './components/MelaFloatingLogo'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Festivals from './pages/Festivals'
import Visit from './pages/Visit'
import Deities from './pages/Deities'
import LiveDarshan from './pages/LiveDarshan'
import Donate from './pages/Donate'
import PrasadBooking from './pages/PrasadBooking'
import Blog from './pages/Blog'
import NewsletterUnsubscribe from './pages/NewsletterUnsubscribe'
import Gallery from './pages/Gallery'
import DevotionalMusic from './pages/DevotionalMusic'
import RathTracker from './pages/RathTracker'
import RathAdmin from './pages/RathAdmin'
import RathYatraWall from './pages/RathYatraWall'
import RathWallVolunteer from './pages/RathWallVolunteer'
import RathPlayground from './pages/RathPlayground'
import Login from './pages/Login'

const PREFETCH_ENDPOINTS = [
  endpoints.home,
  endpoints.visit,
  endpoints.deities,
  endpoints.festivals,
  endpoints.about,
  endpoints.contact,
  endpoints.donate,
  endpoints.liveDarshan,
];

function App() {
  useEffect(() => {
    prefetchPageData(endpoints.home);

    const schedule = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1500));
    const idleId = schedule(() => {
      PREFETCH_ENDPOINTS.forEach((endpoint) => prefetchPageData(endpoint));
    });

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <MandirLoader />
      <HashScroll />
      <MelaFloatingLogo />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/visit" element={<Visit />} />
        <Route path="/deities" element={<Deities />} />
        <Route path="/festivals" element={<Festivals />} />
        <Route path="/rath-tracker" element={<RathTracker />} />
        <Route path="/rath-tracking" element={<Navigate to="/rath-tracker" replace />} />
        <Route path="/rath-admin" element={<RathAdmin />} />
        <Route path="/rath-yatra-wall" element={<RathYatraWall />} />
        <Route path="/rath-playground" element={<RathPlayground />} />
        <Route path="/rath-wall-volunteer" element={<RathWallVolunteer />} />
        <Route path="/picture-board-volunteer" element={<RathWallVolunteer />} />
        <Route path="/volunteer" element={<RathWallVolunteer />} />
        <Route path="/live-darshan" element={<LiveDarshan />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/prasad" element={<PrasadBooking />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/devotional-music" element={<DevotionalMusic />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
