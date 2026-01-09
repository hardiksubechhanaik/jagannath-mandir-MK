import { Link } from "react-router-dom"
import { useState } from "react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-orange-600"
        >
          Shri Jagannath Mandir
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <NavLink to="/" label="Home" />
          <NavLink to="/about" label="About" />
          <NavLink to="/events" label="Events" />
          {/*<NavLink to="/gallery" label="Gallery" />*/}
          <NavLink to="/donations" label="Donations"/>
          <NavLink to="/contact" label="Contact" />
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-orange-600 text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-orange-100">
          <div className="flex flex-col px-6 py-4 space-y-4 text-gray-700 font-medium">
            <NavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
            <NavLink to="/about" label="About" onClick={() => setIsOpen(false)} />
            <NavLink to="/events" label="Events" onClick={() => setIsOpen(false)} />
            {/*<NavLink to="/gallery" label="Gallery" onClick={() => setIsOpen(false)} />*/}
            <NavLink to="/donations" label="Donation" onClick={() => setIsOpen(false)} />
            <NavLink to="/contact" label="Contact" onClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="hover:text-orange-600 transition-colors"
    >
      {label}
    </Link>
  )
}
