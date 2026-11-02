import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest, getSession } from '../lib/api'

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
  const { courseSlug, lessonSlug, slug } = useParams()
  const currentLessonSlug = lessonSlug || slug
  const coursePath = `/courses/${courseSlug || 'cloud-computing'}`

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
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [quizResult, setQuizResult] = useState(null)
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const [quizError, setQuizError] = useState('')
  const [completionStatus, setCompletionStatus] = useState('')
  const [completionError, setCompletionError] = useState('')
  const session = getSession()

  // Fetch the lesson whenever its URL slug changes
  useEffect(() => {
    async function fetchLesson() {
      try {
        setLoading(true)
        setError('')
        setLesson(null)
        setSelectedAnswers([])
        setQuizResult(null)
        setQuizError('')
        setCompletionStatus('')
        setCompletionError('')

        const data = await apiRequest(
          `/lessons/${encodeURIComponent(currentLessonSlug)}`
        )

        setLesson(data.lesson)
      } catch (err) {
        console.error('Error loading lesson:', err)

        setError(err.message || 'Unable to load the lesson.')
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [currentLessonSlug])

  function selectAnswer(questionIndex, optionIndex) {
    setSelectedAnswers((answers) => {
      const nextAnswers = [...answers]
      nextAnswers[questionIndex] = optionIndex
      return nextAnswers
    })
    setQuizResult(null)
    setQuizError('')
  }

  async function submitQuiz() {
    const questions = lesson?.quiz?.questions || []
    if (!lesson || selectedAnswers.length !== questions.length || selectedAnswers.some((answer) => answer === undefined)) {
      return
    }

    try {
      setQuizSubmitting(true)
      setQuizError('')
      const result = await apiRequest(`/learning/lessons/${lesson._id}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ answers: selectedAnswers })
      })
      setQuizResult(result)
    } catch (err) {
      setQuizError(err.message || 'Unable to submit the quiz.')
    } finally {
      setQuizSubmitting(false)
    }
  }

  async function completeLesson() {
    if (!lesson || !session) return

    try {
      setCompletionError('')
      const result = await apiRequest(`/learning/lessons/${lesson._id}/complete`, {
        method: 'POST'
      })
      setCompletionStatus(
        `Lesson completed. Course progress: ${result.progressPercentage}%.`
      )
    } catch (err) {
      setCompletionError(err.message || 'Unable to record lesson completion.')
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="lesson-page">
        <div className="lesson-content">

          <Link
            to={coursePath}
            className="lesson-back"
          >
            ← Back to Course
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

              <section className="lesson-completion">
                <h2>Track Your Progress</h2>
                {session ? (
                  <>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={completeLesson}
                      disabled={Boolean(completionStatus)}
                    >
                      {completionStatus ? 'Lesson Completed' : 'Mark Lesson Complete'}
                    </button>
                    {completionStatus && (
                      <p role="status">{completionStatus}</p>
                    )}
                    {completionError && (
                      <p role="alert" className="quiz-feedback incorrect">
                        {completionError}
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`}>
                      Log in
                    </Link>{' '}
                    to track your progress.
                  </p>
                )}
              </section>

              {lesson.quiz?.questions?.length > 0 && (
                <section className="quiz-box">
                  <span className="badge">
                    TEST YOUR KNOWLEDGE
                  </span>

                  <h2>Quick Quiz</h2>

                  {lesson.quiz.questions.map((question, questionIndex) => (
                    <div className="quiz-question" key={question._id || questionIndex}>
                      <p>
                        {questionIndex + 1}. {question.question}
                      </p>

                      <div className="quiz-options">
                        {question.options.map((option, optionIndex) => (
                          <button
                            type="button"
                            className={
                              selectedAnswers[questionIndex] === optionIndex
                                ? 'quiz-option selected'
                                : 'quiz-option'
                            }
                            key={`${question._id || questionIndex}-${optionIndex}`}
                            onClick={() => selectAnswer(questionIndex, optionIndex)}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="primary-btn quiz-submit"
                    onClick={submitQuiz}
                    disabled={
                      quizSubmitting ||
                      selectedAnswers.length !== lesson.quiz.questions.length ||
                      selectedAnswers.some((answer) => answer === undefined)
                    }
                  >
                    {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>

                  {quizError && (
                    <p className="quiz-feedback incorrect" role="alert">
                      {quizError}
                    </p>
                  )}

                  {quizResult && (
                    <div className={`quiz-feedback ${quizResult.passed ? 'correct' : 'incorrect'}`} role="status">
                      <strong>
                        {quizResult.passed ? 'Passed' : 'Not passed'}
                      </strong>
                      <p>
                        Score: {quizResult.score}% (passing score: {lesson.quiz.passingPercentage}%)
                      </p>
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
                  to={coursePath}
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