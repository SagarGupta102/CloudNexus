import { Link, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../lib/api'

function Navbar() {
  const navigate = useNavigate()
  const user = getSession()
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">☁</span>
        CloudNexus
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && ['admin', 'instructor'].includes(user.role) && <Link to="/manage-media">Media</Link>}
      </nav>

      {user ? (
        <button className="login-btn" onClick={() => { clearSession(); navigate('/') }}>
          Log out
        </button>
      ) : (
        <Link to="/login" className="login-btn">Login</Link>
      )}
    </header>
  )
}

export default Navbar