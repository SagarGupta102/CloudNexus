import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest, getSession } from '../lib/api'

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { apiRequest('/learning/dashboard').then(setData).catch((err) => setError(err.message)) }, [])
  if (!getSession()) return <Navigate to="/login?next=/dashboard" replace />
  return <div className="app"><Navbar /><main className="dashboard-page">
    <div className="dashboard-heading"><div><span className="badge">YOUR LEARNING SPACE</span><h1>Keep building your skills.</h1></div><Link className="primary-btn" to="/courses">Browse courses</Link></div>
    {error && <p className="form-error">{error}</p>}
    {!data && !error && <p>Loading your dashboard...</p>}
    {data && <><section><h2>Enrolled courses</h2><div className="dashboard-grid">{data.enrollments.length ? data.enrollments.map((item) => <article className="dashboard-card" key={item._id}><h3>{item.course.title}</h3><p>{item.course.description}</p><div className="progress-track"><span style={{ width: `${item.progressPercentage}%` }} /></div><small>{item.progressPercentage}% complete</small><Link to={`/courses/${item.course.slug}`}>Continue learning →</Link></article>) : <p>You have not enrolled in a course yet.</p>}</div></section><section><h2>Recommended for you</h2><div className="dashboard-grid">{data.recommendations.map((course) => <article className="dashboard-card" key={course._id}><span className="course-label">{course.category}</span><h3>{course.title}</h3><p>{course.description}</p><Link to={`/courses/${course.slug}`}>View course →</Link></article>)}</div></section></>}
  </main><Footer /></div>
}

export default Dashboard
