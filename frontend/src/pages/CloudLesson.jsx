import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function getYouTubeEmbedUrl(url) {
  if (!url) return ''

  try {
    const parsedUrl = new URL(url)

    // Standard YouTube video URL
    if (
      ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(
        parsedUrl.hostname
      )
    ) {
      const videoId = parsedUrl.searchParams.get('v')

      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`
      }

      // Already-embedded YouTube URL
      if (parsedUrl.pathname.startsWith('/embed/')) {
        return `https://www.youtube-nocookie.com${parsedUrl.pathname}`
      }
    }

    // Short YouTube URL
    if (parsedUrl.hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.slice(1)

      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`
      }
    }

    return ''
  } catch {
    return ''
  }
}

function CloudLesson() {
  // Read the lesson slug from the browser URL
  const { slug } = useParams()

  // Store the lesson returned by the backend
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const videoEmbedUrl = getYouTubeEmbedUrl(lesson?.videoUrl)
  const cloudVideoUrl = lesson?.media?.resourceType === 'video' && lesson?.media?.secureUrl
    ? lesson.media.secureUrl
    : !videoEmbedUrl && lesson?.videoUrl?.startsWith('https://res.cloudinary.com/')
      ? lesson.videoUrl
      : ''

  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Fetch the lesson whenever its URL slug changes
  useEffect(() => {
    async function fetchLesson() {
      try {
        setLoading(true)
        setError('')
        setLesson(null)
        setSelectedAnswer('')
        setSubmitted(false)

        const response = await fetch(
          `http://localhost:5000/api/lessons/${encodeURIComponent(slug)}`
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to load lesson.')
        }

        setLesson(data.lesson)
      } catch (err) {
        console.error('Error loading lesson:', err)

        setError(
          'Unable to load the lesson. Please check that your backend is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [slug])

  function checkAnswer() {
    if (!selectedAnswer) return

    setSubmitted(true)
  }

  function tryAgain() {
    setSelectedAnswer('')
    setSubmitted(false)
  }

  return (
    <div className="app">
      <Navbar />

      <main className="lesson-page">
        <div className="lesson-content">

          <Link
            to="/courses/cloud-computing"
            className="lesson-back"
          >
            ← Back to Cloud Computing
          </Link>

          {loading && (
            <p>Loading lesson from CloudNexus...</p>
          )}

          {error && (
            <div role="alert" className="lesson-callout">
              <h2>Unable to load lesson</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && lesson && (
            <>
              <span className="badge">
                {lesson.course} · LESSON{' '}
                {String(lesson.order).padStart(2, '0')}
              </span>

              <h1>{lesson.title}</h1>

              <p className="lesson-intro">
                {lesson.description}
              </p>

              {videoEmbedUrl && (
  <section className="lesson-video">
    <h2>Watch This Lesson</h2>

    <div className="video-frame">
      <iframe
        src={videoEmbedUrl}
        title={`${lesson.title} video`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>

    <p className="video-caption">
      Watch the video, then review the written explanation below.
    </p>
  </section>
)}

              {cloudVideoUrl && (
                <section className="lesson-video">
                  <h2>Watch This Lesson</h2>
                  <div className="video-frame">
                    <video controls preload="metadata" src={cloudVideoUrl}>
                      Your browser does not support video playback.
                    </video>
                  </div>
                  <p className="video-caption">Watch the video, then review the written explanation below.</p>
                </section>
              )}

              <div className="lesson-callout">
                <h2>About This Lesson</h2>

                <p>{lesson.content}</p>

                <p>
                  <strong>Difficulty:</strong> {lesson.level}
                </p>

                <p>
                  <strong>Estimated duration:</strong>{' '}
                  {lesson.durationMinutes} minutes
                </p>
              </div>

              {Array.isArray(lesson.sections) &&
  lesson.sections.length > 0 && (
    <div className="lesson-sections">
      {lesson.sections.map((section, index) => (
        <section
          className="lesson-section"
          key={`${lesson._id}-${index}`}
        >
          <h2>{section.heading}</h2>

          <p>{section.body}</p>

          {section.example && (
            <div className="example-box">
              <strong>Real-World Example</strong>

              <p>{section.example}</p>
            </div>
          )}
        </section>
      ))}
    </div>
  )}

              {lesson.slug ===
                'introduction-to-cloud-computing' && (
                <section className="quiz-box">
                  <span className="badge">
                    TEST YOUR KNOWLEDGE
                  </span>

                  <h2>Quick Quiz</h2>

                  <p className="quiz-question">
                    Which AWS service is commonly used to store
                    files as objects?
                  </p>

                  <div className="quiz-options">
                    <button
                      className={
                        selectedAnswer === 'A'
                          ? 'quiz-option selected'
                          : 'quiz-option'
                      }
                      onClick={() => {
                        setSelectedAnswer('A')
                        setSubmitted(false)
                      }}
                    >
                      A. Amazon S3
                    </button>

                    <button
                      className={
                        selectedAnswer === 'B'
                          ? 'quiz-option selected'
                          : 'quiz-option'
                      }
                      onClick={() => {
                        setSelectedAnswer('B')
                        setSubmitted(false)
                      }}
                    >
                      B. Amazon EC2
                    </button>

                    <button
                      className={
                        selectedAnswer === 'C'
                          ? 'quiz-option selected'
                          : 'quiz-option'
                      }
                      onClick={() => {
                        setSelectedAnswer('C')
                        setSubmitted(false)
                      }}
                    >
                      C. Amazon Route 53
                    </button>
                  </div>

                  <button
                    className="primary-btn quiz-submit"
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                  >
                    Check Answer
                  </button>

                  {submitted && (
                    <div
                      className={
                        selectedAnswer === 'A'
                          ? 'quiz-feedback correct'
                          : 'quiz-feedback incorrect'
                      }
                    >
                      {selectedAnswer === 'A'
                        ? 'Correct! Amazon S3 is an object storage service.'
                        : 'Not quite. The correct answer is Amazon S3.'}

                      <button onClick={tryAgain}>
                        Try Again
                      </button>
                    </div>
                  )}
                </section>
              )}

              <div className="lesson-completion">
                <h2>Continue Learning</h2>

                <p>
                  You are learning: {lesson.title}. Return to
                  the learning path to explore other lessons.
                </p>

                <Link
                  to="/courses/cloud-computing"
                  className="primary-btn"
                >
                  Back to Learning Path →
                </Link>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CloudLesson