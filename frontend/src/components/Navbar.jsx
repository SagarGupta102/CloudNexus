import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">☁</span>
        CloudNexus
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/courses/cloud-computing">Courses</Link>
        <Link to="/about">About</Link>
      </nav>

      <button className="login-btn">Login</button>
    </header>
  )
}

export default Navbar