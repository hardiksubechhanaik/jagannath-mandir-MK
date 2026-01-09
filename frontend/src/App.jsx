import { Routes, Route } from "react-router-dom"
import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import Donations from "./pages/Donations"
import Contact from "./pages/Contact"
import About from "./pages/About"
import Events from "./pages/Events"

import Home from "./pages/Home"
function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path ="/" element={<Home/>} />
        <Route path ="/donations" element={<Donations/>}/>
        <Route path ="/contact" element={<Contact/>}/>
        <Route path ="/about" element={<About/>}/>
        <Route path ="/events" element={<Events/>}/>

      </Routes>
      <Footer />
    </>
  )
}

export default App
