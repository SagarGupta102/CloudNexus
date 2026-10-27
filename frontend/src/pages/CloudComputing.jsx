import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function CloudComputing() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:5000/api/lessons'
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to load lessons.')
        }

        setLessons(data.lessons)
      } catch (err) {
        console.error('Error fetching lessons:', err)
        setError(
          'Unable to load lessons. Please check that the backend is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="course-hero">
          <span className="badge">LEARNING PATH 01</span>

          <h1>
            Learn <span>Cloud Computing</span>
          </h1>

          <p>
            Start from the basics and understand cloud computing
            through simple explanations and practical examples.
          </p>

          <a href="#lessons" className="primary-btn">
            Explore Lessons →
          </a>
        </section>

        <section className="course-lessons" id="lessons">
          <div className="section-heading">
            <h2>Your Learning Roadmap</h2>
            <p>
              Learn cloud computing step by step, from beginner
              concepts to AWS fundamentals.
            </p>
          </div>

          {loading && (
            <p>
              Loading lessons from CloudNexus database...
            </p>
          )}

          {error && (
            <p role="alert">
              {error}
            </p>
          )}

          {!loading && !error && lessons.length === 0 && (
            <p>No published lessons are available yet.</p>
          )}

          {!loading && !error && lessons.length > 0 && (
            <div className="lesson-list">
              {lessons.map((lesson) => (
                <article
                  className="lesson-card"
                  key={lesson._id}
                >
                  <span className="lesson-number">
                    {String(lesson.order).padStart(2, '0')}
                  </span>

                  <div>
                    <h3>{lesson.title}</h3>

                    <p>{lesson.description}</p>

                    <span className="lesson-level">
                      {lesson.level} · {lesson.durationMinutes} minutes
                    </span>

                    <div>
  <Link
    to={`/courses/cloud-computing/${lesson.slug}`}
    className="lesson-open"
  >
    Start Lesson →
  </Link>
</div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="back-link">
            <Link to="/">
              ← Back to Home
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CloudComputing