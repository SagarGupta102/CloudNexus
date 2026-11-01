import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { API_URL, apiRequest, getSession } from '../lib/api'

function CloudComputing() {
  const { slug = 'cloud-computing' } = useParams()
  const [lessons, setLessons] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const session = getSession()

  const fetchCourse = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const isDefaultCourse = slug === 'cloud-computing'
      const response = isDefaultCourse
        ? await fetch(`${API_URL}/lessons`)
        : await apiRequest(`/courses/${encodeURIComponent(slug)}`)
      const data = isDefaultCourse ? await response.json() : response

      if (isDefaultCourse && (!response.ok || !data.success)) {
        throw new Error(data.message || 'Unable to load lessons.')
      }

      setLessons(
        isDefaultCourse ? data.lessons || [] : data.course?.lessons || []
      )
      setCourse(
        data.course || {
          title: 'Cloud Computing',
          description: 'Start from the basics and build practical cloud knowledge.'
        }
      )
    } catch (err) {
      console.error('Error fetching course:', err)
      setError(
        err.message || 'Unable to load course. Please check that the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  async function loadRazorpay() {
    if (window.Razorpay) return window.Razorpay

    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'))
      document.body.appendChild(script)
    })

    return window.Razorpay
  }

  async function buyCourse() {
    if (!session) {
      window.location.assign(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`)
      return
    }

    try {
      setPurchasing(true)
      setPurchaseError('')
      const data = await apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ courseSlug: slug })
      })
      const Razorpay = await loadRazorpay()

      const checkout = new Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'CloudNexus LMS',
        description: course.title,
        order_id: data.order.id,
        handler: async (payment) => {
          try {
            await apiRequest('/payments/verify', {
              method: 'POST',
              body: JSON.stringify(payment)
            })
            await fetchCourse()
          } catch (err) {
            setPurchaseError(err.message || 'Unable to verify payment.')
          } finally {
            setPurchasing(false)
          }
        },
        modal: {
          ondismiss: () => setPurchasing(false)
        },
        prefill: {
          name: session.name || '',
          email: session.email || ''
        },
        theme: { color: '#087fdb' }
      })

      checkout.open()
    } catch (err) {
      setPurchaseError(err.message || 'Unable to start checkout.')
      setPurchasing(false)
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="course-hero">
          <span className="badge">LEARNING PATH 01</span>

          <h1>
            Learn <span>{course?.title || 'Cloud Computing'}</span>
          </h1>

          <p>
            {course?.description || 'Start from the basics and understand cloud computing through simple explanations and practical examples.'}
          </p>

          <div className="course-detail-meta">
            <span>{course?.category || 'Learning Path'}</span>
            <span>{course?.level || 'Beginner'}</span>
            {course?.isPremium && <strong>Premium · ₹{course.price}</strong>}
          </div>

          {course?.isPremium && course.isLocked ? (
            <div className="premium-course-lock">
              <strong>Premium Course · Locked Content</strong>
              <p>
                Purchase this course to unlock its approved lessons and learning content.
              </p>
              <button
                type="button"
                className="primary-btn"
                onClick={buyCourse}
                disabled={purchasing}
              >
                {purchasing ? 'Opening checkout...' : `Buy Now · ₹${course.price}`}
              </button>
              {purchaseError && <p role="alert">{purchaseError}</p>}
            </div>
          ) : (
            <a href="#lessons" className="primary-btn">
              Explore Lessons →
            </a>
          )}
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
            <p>
              {course?.isPremium && course.isLocked
                ? 'Purchase this premium course to access its published lessons.'
                : 'No published lessons are available yet.'}
            </p>
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
    to={`/courses/${slug}/${lesson.slug}`}
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