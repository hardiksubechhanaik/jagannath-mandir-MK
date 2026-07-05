import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HashScroll from './components/HashScroll'
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
import Gallery from './pages/Gallery'
import RathTracker from './pages/RathTracker'
import RathAdmin from './pages/RathAdmin'
import RathYatraWall from './pages/RathYatraWall'
import RathWallVolunteer from './pages/RathWallVolunteer'
import RathPlayground from './pages/RathPlayground'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
