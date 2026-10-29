import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { clearSession, getSession } from '../lib/api'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')

  const user = getSession()

  const handleSearch = (event) => {
    event.preventDefault()
    navigate('/courses')
  }

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'S'

  return (
    <header className="site-navbar">
      {/* CloudNexus Logo */}
      <Link to="/" className="site-logo" aria-label="CloudNexus home">
        <span className="site-logo-icon">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 33H35C41 33 44 29 44 24C44 19 40 15 35 15C33 8 27 5 21 7C16 8 13 12 12 17C6 17 3 21 3 26C3 30 7 33 12 33Z"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 22V39M18 33L24 39L30 33"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="site-logo-text">
          <span className="site-logo-name">
            Cloud<span>Nexus</span>
          </span>
          <small>L M S</small>
        </span>
      </Link>

      {/* Main Navigation */}
      <nav className="site-nav-links" aria-label="Main navigation">
        <Link
          to="/"
          className={location.pathname === '/' ? 'active' : ''}
        >
          Home
        </Link>

        <Link
          to="/courses"
          className={location.pathname.startsWith('/courses') ? 'active' : ''}
        >
          Courses
        </Link>

        <Link to="/#about">About</Link>
      </nav>

      {/* Course Search */}
      <form className="site-search" onSubmit={handleSearch}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </svg>

        <input
          type="search"
          placeholder="Search courses..."
          aria-label="Search courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="submit" aria-label="Browse courses">
          →
        </button>
      </form>

      {/* Authentication / User Controls */}
      <div className="site-nav-actions">
        {user ? (
          <>
            <Link to="/dashboard" className="site-dashboard-link">
              Dashboard
            </Link>

            <div className="site-user">
              <span className="site-user-avatar">{initials}</span>

              <span className="site-user-info">
                <strong>{user.name || 'Learner'}</strong>
                <small>Student</small>
              </span>
            </div>

            <button
              type="button"
              className="site-login-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="site-login-button">
              Login
            </Link>

            <Link to="/register" className="site-register-button">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar