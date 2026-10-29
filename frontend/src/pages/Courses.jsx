import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest } from '../lib/api'

// Fallback images are used when a course has no thumbnail in MongoDB.
const courseImages = {
  'cloud-computing':
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=85',

  linux:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=85',

  python:
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900&auto=format&fit=crop&q=85',

  database:
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop&q=85',

  networking:
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&auto=format&fit=crop&q=85',

  docker:
    'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=900&auto=format&fit=crop&q=85',

  'git-and-github':
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&auto=format&fit=crop&q=85',
}

const defaultImage =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=85'

function getCourseImage(course) {
  return (
    course.thumbnailUrl ||
    courseImages[course.slug] ||
    defaultImage
  )
}

function Courses() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    apiRequest('/courses')
      .then((data) => {
        if (active) {
          setCourses(
            Array.isArray(data.courses) ? data.courses : []
          )
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load courses.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return courses

    return courses.filter((course) =>
      [
        course.title,
        course.description,
        course.category,
        course.level,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [courses, search])

  return (
    <div className="catalogue-page">
      <Navbar />

      <main>
        {/* Catalogue introduction */}
        <section className="catalogue-hero">
          <div className="catalogue-hero-content">
            <span className="catalogue-eyebrow">
              YOUR LEARNING JOURNEY
            </span>

            <h1>
              Discover Your Next
              <br />
              <span>Learning Path.</span>
            </h1>

            <p>
              Explore cloud computing, Linux, Python, networking,
              and other IT fundamentals. Build your skills one lesson
              at a time.
            </p>

            <div className="catalogue-highlights">
              <span>
                <b>✓</b> Beginner-friendly
              </span>
              <span>
                <b>✓</b> Learn at your pace
              </span>
              <span>
                <b>✓</b> Track your progress
              </span>
            </div>
          </div>

          <div className="catalogue-hero-decoration" aria-hidden="true">
            <div className="catalogue-decoration-cloud">☁</div>
            <div className="catalogue-decoration-card">
              <span>✦</span>
              <div>
                <strong>Keep growing</strong>
                <small>Learn. Build. Grow.</small>
              </div>
            </div>
          </div>
        </section>

        {/* Course catalogue */}
        <section className="catalogue-content">
          <div className="catalogue-heading-row">
            <div>
              <span className="catalogue-section-label">
                EXPLORE & LEARN
              </span>

              <h2>Explore Courses</h2>

              <p>
                Find a subject that matches your learning goals.
              </p>
            </div>

            {!loading && (
              <div className="catalogue-count">
                <strong>{filteredCourses.length}</strong>
                <span>
                  {filteredCourses.length === 1
                    ? ' course'
                    : ' courses'}
                </span>
              </div>
            )}
          </div>

          <div className="catalogue-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search by course, subject, or skill..."
              aria-label="Search courses"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className="catalogue-message catalogue-error">
              <strong>We couldn't load the courses.</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {loading && !error && (
            <div className="catalogue-message">
              Loading your learning paths...
            </div>
          )}

          {!loading && !error && filteredCourses.length === 0 && (
            <div className="catalogue-message">
              <h3>No courses found</h3>
              <p>Try searching for another subject or skill.</p>
              <button
                type="button"
                onClick={() => setSearch('')}
              >
                View All Courses
              </button>
            </div>
          )}

          {!loading && !error && filteredCourses.length > 0 && (
            <div className="catalogue-grid">
              {filteredCourses.map((course) => (
                <article
                  className="catalogue-card"
                  key={course._id}
                >
                  <Link
                    to={`/courses/${course.slug}`}
                    className="catalogue-image"
                    aria-label={`View ${course.title}`}
                  >
                    <img
                      src={getCourseImage(course)}
                      alt={`${course.title} learning`}
                      loading="lazy"
                    />

                    <span className="catalogue-image-shade" />

                    <span className="catalogue-image-category">
                      {course.category || 'IT FUNDAMENTALS'}
                    </span>

                    <span className="catalogue-image-level">
                      {course.level || 'Beginner'}
                    </span>
                  </Link>

                  <div className="catalogue-card-body">
                    <div className="catalogue-card-category">
                      {course.category || 'Learning Path'}
                    </div>

                    <h3>
                      <Link to={`/courses/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>

                    <p className="catalogue-description">
                      {course.description}
                    </p>

                    <div className="catalogue-card-meta">
                      <span>
                        <span aria-hidden="true">▤</span>
                        {course.lessonCount ?? 0}{' '}
                        {(course.lessonCount ?? 0) === 1
                          ? 'lesson'
                          : 'lessons'}
                      </span>

                      <span
                        className={
                          course.isPremium
                            ? 'catalogue-price premium'
                            : 'catalogue-price'
                        }
                      >
                        {course.isPremium
                          ? `₹${course.price}`
                          : 'Free'}
                      </span>
                    </div>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="catalogue-course-link"
                    >
                      View Course
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Learning benefits */}
        <section className="catalogue-benefits">
          <div>
            <span className="catalogue-benefit-icon">▤</span>
            <strong>Structured Learning</strong>
            <p>Follow lessons organized by subject.</p>
          </div>

          <div>
            <span className="catalogue-benefit-icon">✓</span>
            <strong>Practice & Review</strong>
            <p>Strengthen your knowledge with quizzes.</p>
          </div>

          <div>
            <span className="catalogue-benefit-icon">↗</span>
            <strong>Keep Progressing</strong>
            <p>Build skills one step at a time.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Courses