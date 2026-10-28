import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest } from '../lib/api'

function Courses() {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { apiRequest('/courses').then((data) => setCourses(data.courses)).catch((err) => setError(err.message)) }, [])
  return <div className="app"><Navbar /><main className="courses-page"><div className="section-heading"><span className="badge">COURSE CATALOGUE</span><h1>Learn skills that compound.</h1><p>Structured paths for cloud and software fundamentals.</p></div>{error && <p className="form-error">{error}</p>}<div className="course-grid">{courses.map((course) => <article className="course-card" key={course._id}>{course.thumbnailUrl && <img className="course-thumbnail" src={course.thumbnailUrl} alt="" /> }<span className="course-label">{course.category} · {course.level}</span><h2>{course.title}</h2><p>{course.description}</p><small>{course.lessonCount} lessons {course.isPremium ? `· ₹${course.price}` : '· Free'}</small><Link to={`/courses/${course.slug}`} className="lesson-open">View course →</Link></article>)}</div></main><Footer /></div>
}

export default Courses
