import { Children, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { apiRequest, clearSession, getSession } from '../lib/api'
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Image,
  Search,
  Settings,
  Trash2,
  Upload,
  Users,
  Video,
  Plus,
} from 'lucide-react'
import './InstructorDashboard.css'

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'create-course', label: 'Create Course', icon: Plus },
  { id: 'lessons', label: 'Lessons', icon: ClipboardList },
  { id: 'enrollments', label: 'Student Enrollments', icon: Users },
  { id: 'media', label: 'Media Library', icon: FolderOpen },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function InstructorDashboard() {
  const navigate = useNavigate()
  const user = getSession()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return <Navigate to="/login?next=/instructor/dashboard" replace />
  }

  if (!['instructor', 'admin'].includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
  }

  function logout() {
    clearSession()
    navigate('/login')
  }

  function selectSection(section) {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  const firstName = user.name?.trim()?.split(/\s+/)[0] || 'Instructor'
  const activeItem = navigationItems.find((item) => item.id === activeSection)

  return (
    <div className="instructor-dashboard">
      {sidebarOpen && (
        <button
          type="button"
          className="instructor-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`instructor-sidebar ${sidebarOpen ? 'is-open' : ''}`}
      >
        <div className="instructor-brand">
          <span className="instructor-brand-mark">✦</span>
          <span>
            <strong>
              Cloud<span>Nexus</span>
            </strong>
            <small>INSTRUCTOR SPACE</small>
          </span>
        </div>

        <div className="instructor-sidebar-label">WORKSPACE</div>
        <nav className="instructor-nav" aria-label="Instructor navigation">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`instructor-nav-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => selectSection(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activeSection === id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>

        <div className="instructor-sidebar-footer">
          <button
            type="button"
            className="instructor-nav-item instructor-logout"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <p>Learn. Build. Grow.</p>
        </div>
      </aside>

      <main className="instructor-main">
        <header className="instructor-header">
          <button
            type="button"
            className="instructor-menu-button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="instructor-header-copy">
            <span>INSTRUCTOR SPACE</span>
            <h1>{activeItem?.label || 'Overview'}</h1>
          </div>
          <div className="instructor-profile">
            <span className="instructor-avatar">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.name || 'Instructor'}</strong>
              <small>Instructor</small>
            </div>
          </div>
        </header>

        <div className="instructor-content">
          {activeSection === 'overview' && (
            <InstructorOverview
              firstName={firstName}
              selectSection={selectSection}
            />
          )}

          {activeSection === 'create-course' && (
            <CreateCourseContent
              onCourseCreated={() => selectSection('courses')}
            />
          )}

          {activeSection === 'courses' && (
            <MyCoursesContent
              onCreateCourse={() => selectSection('create-course')}
            />
          )}

          {activeSection === 'lessons' && (
            <LessonManagementContent />
          )}

          {activeSection === 'enrollments' && <InstructorEnrollmentsContent />}
          {activeSection === 'media' && (
            <InstructorMediaContent navigate={navigate} />
          )}
          {activeSection === 'performance' && <InstructorPerformanceContent />}
          {activeSection === 'settings' && <InstructorSettingsContent />}
        </div>
      </main>
    </div>
  )
}

function LessonManagementContent() {
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(createLessonForm())

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await apiRequest('/courses/mine')
        const availableCourses = Array.isArray(data.courses) ? data.courses : []
        setCourses(availableCourses)
        if (availableCourses.length > 0) {
          setSelectedCourse(availableCourses[0].title)
        }
      } catch (err) {
        setError(err.message || 'Unable to load your courses.')
      } finally {
        setLoadingCourses(false)
      }
    }

    loadCourses()
  }, [])

  useEffect(() => {
    async function loadLessons() {
      if (!selectedCourse) {
        setLessons([])
        return
      }

      setLoadingLessons(true)
      try {
        const data = await apiRequest('/lessons/mine')
        const courseLessons = Array.isArray(data.lessons)
          ? data.lessons.filter((lesson) => lesson.course === selectedCourse)
          : []
        setLessons(courseLessons)
      } catch (err) {
        setError(err.message || 'Unable to load lessons.')
      } finally {
        setLoadingLessons(false)
      }
    }

    loadLessons()
  }, [selectedCourse])

  function updateForm(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function updateSection(index, field, value) {
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section
      )
    }))
  }

  function updateQuestion(index, field, value) {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      )
    }))
  }

  function updateQuestionOption(questionIndex, optionIndex, value) {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option
              )
            }
          : question
      )
    }))
  }

  function addSection() {
    setForm((previous) => ({
      ...previous,
      sections: [...previous.sections, { heading: '', body: '', example: '' }]
    }))
  }

  function removeSection(index) {
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.filter((_, sectionIndex) => sectionIndex !== index)
    }))
  }

  function addQuestion() {
    setForm((previous) => ({
      ...previous,
      questions: [...previous.questions, createQuizQuestion()]
    }))
  }

  function removeQuestion(index) {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.filter((_, questionIndex) => questionIndex !== index)
    }))
  }

  async function submitLesson(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedCourse) {
      setError('Select one of your courses before creating a lesson.')
      return
    }

    setLoading(true)
    try {
      const data = await apiRequest('/lessons', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          course: selectedCourse,
          description: form.description,
          order: Number(form.order),
          durationMinutes: Number(form.durationMinutes),
          level: form.level,
          videoUrl: form.videoUrl,
          content: form.content,
          sections: form.sections.filter((section) => section.heading.trim() && section.body.trim()),
          quiz: {
            passingPercentage: Number(form.passingPercentage),
            questions: form.questions
              .filter((question) => question.question.trim())
              .map((question) => ({
                question: question.question.trim(),
                options: question.options.map((option) => option.trim()),
                correctOption: Number(question.correctOption),
                explanation: question.explanation.trim()
              }))
          }
        })
      })

      setSuccess(data.message || 'Lesson created successfully. It is awaiting publication.')
      setForm(createLessonForm())
      await refreshLessons(selectedCourse)
    } catch (err) {
      setError(err.message || 'Unable to create lesson.')
    } finally {
      setLoading(false)
    }
  }

  async function refreshLessons(courseTitle = selectedCourse) {
    if (!courseTitle) return

    setLoadingLessons(true)
    try {
      const data = await apiRequest('/lessons/mine')
      setLessons(
        Array.isArray(data.lessons)
          ? data.lessons.filter((lesson) => lesson.course === courseTitle)
          : []
      )
    } catch (err) {
      setError(err.message || 'Unable to refresh lessons.')
    } finally {
      setLoadingLessons(false)
    }
  }

  return (
    <section className="instructor-section instructor-lesson-management">
      <div className="instructor-section-heading">
        <div>
          <span className="instructor-eyebrow">LESSON MANAGEMENT</span>
          <h2>Create and organize lessons</h2>
          <p>Lessons remain unpublished until an administrator approves them.</p>
        </div>
      </div>

      {error && <p className="instructor-form-error" role="alert">{error}</p>}
      {success && <p className="instructor-form-success" role="status">{success}</p>}

      <div className="instructor-lesson-layout">
        <form className="instructor-course-form" onSubmit={submitLesson}>
          <label>
            Course *
            {loadingCourses ? (
              <span className="instructor-form-note">Loading your courses...</span>
            ) : (
              <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} required>
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option value={course.title} key={course._id}>{course.title}</option>
                ))}
              </select>
            )}
          </label>

          <label>
            Lesson Title *
            <input name="title" value={form.title} onChange={updateForm} required maxLength={120} />
          </label>

          <label>
            Description *
            <textarea name="description" value={form.description} onChange={updateForm} rows={4} required />
          </label>

          <div className="instructor-form-grid">
            <label>
              Lesson Order *
              <input type="number" name="order" value={form.order} onChange={updateForm} min="1" required />
            </label>
            <label>
              Duration (minutes) *
              <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={updateForm} min="1" required />
            </label>
            <label>
              Level
              <select name="level" value={form.level} onChange={updateForm}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
          </div>

          <label>
            YouTube Video URL
            <input type="url" name="videoUrl" value={form.videoUrl} onChange={updateForm} placeholder="https://www.youtube.com/watch?v=..." />
          </label>

          <label>
            Written Lesson Content
            <textarea name="content" value={form.content} onChange={updateForm} rows={6} />
          </label>

          <LessonSections
            sections={form.sections}
            updateSection={updateSection}
            addSection={addSection}
            removeSection={removeSection}
          />

          <QuizEditor
            passingPercentage={form.passingPercentage}
            questions={form.questions}
            updateForm={updateForm}
            updateQuestion={updateQuestion}
            updateQuestionOption={updateQuestionOption}
            addQuestion={addQuestion}
            removeQuestion={removeQuestion}
          />

          <button type="submit" className="instructor-primary-button" disabled={loading || loadingCourses || courses.length === 0}>
            {loading ? 'Creating lesson...' : 'Create Lesson'}
          </button>
        </form>

        <aside className="instructor-lesson-list instructor-panel">
          <div className="instructor-section-heading compact">
            <div>
              <span className="instructor-eyebrow">EXISTING LESSONS</span>
              <h2>{selectedCourse || 'Select a course'}</h2>
            </div>
          </div>
          {loadingLessons ? (
            <p className="instructor-form-note">Loading lessons...</p>
          ) : lessons.length === 0 ? (
            <div className="instructor-panel-empty">
              <ClipboardList size={24} />
              <strong>No published lessons found</strong>
              <p>New lessons will appear here after they are approved.</p>
            </div>
          ) : (
            <div className="instructor-lesson-items">
              {lessons.map((lesson) => (
                <div className="instructor-lesson-item" key={lesson._id}>
                  <span>{String(lesson.order).padStart(2, '0')}</span>
                  <div>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.durationMinutes} minutes · {lesson.level}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function createLessonForm() {
  return {
    title: '',
    description: '',
    order: '1',
    durationMinutes: '10',
    level: 'Beginner',
    videoUrl: '',
    content: '',
    sections: [],
    passingPercentage: '70',
    questions: []
  }
}

function createQuizQuestion() {
  return {
    question: '',
    options: ['', '', '', ''],
    correctOption: '0',
    explanation: ''
  }
}

function LessonSections({ sections, updateSection, addSection, removeSection }) {
  return (
    <div className="instructor-form-group">
      <div className="instructor-form-group-heading">
        <div>
          <strong>Content Sections</strong>
          <small>Add structured explanations and examples.</small>
        </div>
        <button type="button" className="instructor-secondary-button" onClick={addSection}>Add Section</button>
      </div>
      {sections.map((section, index) => (
        <div className="instructor-repeater-card" key={`section-${index}`}>
          <div className="instructor-repeater-heading">
            <strong>Section {index + 1}</strong>
            <button type="button" className="instructor-text-button" onClick={() => removeSection(index)}>Remove</button>
          </div>
          <input value={section.heading} onChange={(event) => updateSection(index, 'heading', event.target.value)} placeholder="Section heading" required />
          <textarea value={section.body} onChange={(event) => updateSection(index, 'body', event.target.value)} placeholder="Explain this topic..." rows={3} required />
          <textarea value={section.example} onChange={(event) => updateSection(index, 'example', event.target.value)} placeholder="Optional real-world example" rows={2} />
        </div>
      ))}
    </div>
  )
}

function QuizEditor({ passingPercentage, questions, updateForm, updateQuestion, updateQuestionOption, addQuestion, removeQuestion }) {
  return (
    <div className="instructor-form-group">
      <div className="instructor-form-group-heading">
        <div>
          <strong>Lesson Quiz</strong>
          <small>Correct answers are stored for scoring and removed from student responses.</small>
        </div>
        <button type="button" className="instructor-secondary-button" onClick={addQuestion}>Add Question</button>
      </div>
      <label>
        Passing Percentage
        <input type="number" name="passingPercentage" value={passingPercentage} onChange={updateForm} min="1" max="100" />
      </label>
      {questions.map((question, index) => (
        <div className="instructor-repeater-card" key={`question-${index}`}>
          <div className="instructor-repeater-heading">
            <strong>Question {index + 1}</strong>
            <button type="button" className="instructor-text-button" onClick={() => removeQuestion(index)}>Remove</button>
          </div>
          <input value={question.question} onChange={(event) => updateQuestion(index, 'question', event.target.value)} placeholder="Question" />
          <div className="instructor-option-grid">
            {question.options.map((option, optionIndex) => (
              <label key={`option-${index}-${optionIndex}`}>
                <span>Option {String.fromCharCode(65 + optionIndex)}</span>
                <input value={option} onChange={(event) => updateQuestionOption(index, optionIndex, event.target.value)} placeholder={`Option ${optionIndex + 1}`} />
              </label>
            ))}
          </div>
          <label>
            Correct Answer
            <select value={question.correctOption} onChange={(event) => updateQuestion(index, 'correctOption', event.target.value)}>
              {question.options.map((_, optionIndex) => (
                <option value={optionIndex} key={`correct-${index}-${optionIndex}`}>Option {String.fromCharCode(65 + optionIndex)}</option>
              ))}
            </select>
          </label>
          <textarea value={question.explanation} onChange={(event) => updateQuestion(index, 'explanation', event.target.value)} placeholder="Optional answer explanation" rows={2} />
        </div>
      ))}
    </div>
  )
}


function CreateCourseContent({ onCourseCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    thumbnailUrl: '',
    isPremium: false,
    price: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = await apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          price: form.isPremium ? Number(form.price) : 0
        })
      })

      setSuccess(data.message || 'Course created successfully.')
      setForm({
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        thumbnailUrl: '',
        isPremium: false,
        price: ''
      })

      setTimeout(() => onCourseCreated(), 1000)
    } catch (err) {
      setError(err.message || 'Unable to create course.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="instructor-section">
      <div className="instructor-section-heading">
        <div>
          <span className="instructor-eyebrow">COURSE CREATION</span>
          <h2>Create a New Course</h2>
          <p>Enter the details for your new learning experience.</p>
        </div>
      </div>

      <form className="instructor-course-form" onSubmit={handleSubmit}>
        <label>
          Course Title *
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: Introduction to Cloud Computing"
            required
            maxLength={120}
          />
        </label>

        <label>
          Description *
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what students will learn..."
            required
            rows={5}
          />
        </label>

        <label>
          Category *
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Example: Cloud Computing"
            required
          />
        </label>

        <label>
          Course Level
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>

        <label>
          Thumbnail Image URL
          <input
            name="thumbnailUrl"
            value={form.thumbnailUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </label>

        <label className="instructor-course-checkbox">
          <input
            type="checkbox"
            name="isPremium"
            checked={form.isPremium}
            onChange={handleChange}
          />
          This is a premium course
        </label>

        {form.isPremium && (
          <label>
            Course Price (₹) *
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="1"
              required
            />
          </label>
        )}

        {error && <p className="instructor-form-error">{error}</p>}
        {success && <p className="instructor-form-success">{success}</p>}

        <button
          type="submit"
          className="instructor-primary-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>

        <p className="instructor-form-note">
          Newly created courses remain unpublished until an admin approves them.
        </p>
      </form>
    </section>
  )
}

function MyCoursesContent({ onCreateCourse }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await apiRequest('/courses/mine')
        setCourses(data.courses || [])
      } catch (err) {
        setError(err.message || 'Unable to load your courses.')
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  return (
    <section className="instructor-section">
      <div className="instructor-section-heading">
        <div>
          <span className="instructor-eyebrow">COURSE LIBRARY</span>
          <h2>My Courses</h2>
          <p>View the courses you have created.</p>
        </div>

        <button
          type="button"
          className="instructor-primary-button"
          onClick={onCreateCourse}
        >
          <Plus size={16} />
          Create Course
        </button>
      </div>

      {loading ? (
        <div className="instructor-empty-card">Loading your courses...</div>
      ) : error ? (
        <div className="instructor-empty-card">{error}</div>
      ) : courses.length === 0 ? (
        <div className="instructor-empty-card">
          <BookOpen size={28} />
          <h3>No courses created yet</h3>
          <p>Your courses will appear here after you create them.</p>
          <button
            type="button"
            className="instructor-primary-button"
            onClick={onCreateCourse}
          >
            Create your first course
          </button>
        </div>
      ) : (
        <div className="instructor-course-grid">
          {courses.map((course) => (
            <article className="instructor-panel" key={course._id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>Category: {course.category}</p>
              <p>Level: {course.level}</p>
              <strong>
                {course.isPublished ? 'Published' : 'Awaiting admin approval'}
              </strong>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function InstructorOverview({ firstName, selectSection }) {
  return (
    <>
      <section className="instructor-welcome">
        <div>
          <span className="instructor-eyebrow">YOUR TEACHING SPACE</span>
          <h2>Welcome back, {firstName}.</h2>
          <p>
            Build meaningful learning experiences and manage your courses
            from one focused workspace.
          </p>
        </div>
        <div className="instructor-welcome-art" aria-hidden="true">
          <BookOpen size={42} />
        </div>
      </section>

      <section className="instructor-empty-card">
        <h3>Ready to create your first course?</h3>
        <p>Start building your learning content for students.</p>
        <button
          type="button"
          className="instructor-primary-button"
          onClick={() => selectSection('create-course')}
        >
          <Plus size={16} />
          Create Course
        </button>
      </section>
    </>
  )
}

function InstructorEnrollmentsContent() {
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/courses/mine/enrollments')
      .then((data) => setEnrollments(data.enrollments || []))
      .catch((err) => setError(err.message || 'Unable to load enrollments.'))
  }, [])

  return (
    <InstructorDataSection
      title="Student Enrollments"
      description="Students enrolled in your courses."
      error={error}
      emptyMessage="No students are enrolled in your courses yet."
    >
      {enrollments.map((enrollment) => (
        <div className="instructor-panel" key={enrollment._id}>
          <strong>{enrollment.learner?.name || enrollment.learner?.email || 'Student'}</strong>
          <p>{enrollment.course?.title || 'Course unavailable'}</p>
          <small>{enrollment.paymentStatus || 'free'} access</small>
        </div>
      ))}
    </InstructorDataSection>
  )
}

function InstructorMediaContent({ navigate }) {
  const [media, setMedia] = useState([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  async function loadMedia() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/courses/mine/media')
      setMedia(data.media || [])
    } catch (err) {
      setError(err.message || 'Unable to load media.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiRequest('/courses/mine/media')
      .then((data) => {
        if (active) setMedia(data.media || [])
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load media.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filteredMedia = useMemo(() => media.filter((item) => {
    const matchesType = type === 'all' || item.targetType === type
    const text = `${item.originalName || ''} ${item.title} ${item.course || ''} ${item.format || ''}`.toLowerCase()
    return matchesType && text.includes(query.toLowerCase())
  }), [media, query, type])

  async function deleteMedia(item) {
    if (!window.confirm(`Delete the ${item.targetType} media for "${item.title}"?`)) return
    try {
      setDeletingId(`${item.targetType}-${item._id}`)
      await apiRequest(`/courses/mine/media/${item.targetType}/${item._id}`, { method: 'DELETE' })
      setMedia((current) => current.filter((entry) => entry._id !== item._id || entry.targetType !== item.targetType))
    } catch (err) {
      setError(err.message || 'Unable to delete media.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className="instructor-section">
      <div className="instructor-section-heading">
        <div>
          <span className="instructor-eyebrow">MEDIA LIBRARY</span>
          <h2>Course Media</h2>
          <p>Manage the visual and video resources attached to your courses.</p>
        </div>
        <button type="button" className="instructor-primary-button" onClick={() => navigate('/manage-media')}>
          <Upload size={16} />
          Upload media
        </button>
      </div>
      <div className="instructor-media-toolbar">
        <label className="instructor-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media..." />
        </label>
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter media type">
          <option value="all">All media</option>
          <option value="course">Course images</option>
          <option value="lesson">Lesson videos</option>
        </select>
        <button type="button" className="instructor-secondary-button" onClick={loadMedia} disabled={loading}>Refresh</button>
      </div>
      {error && <p className="instructor-form-error" role="alert">{error}</p>}
      {loading ? <div className="instructor-empty-card">Loading media library...</div> : filteredMedia.length === 0 ? (
        <div className="instructor-empty-card">
          <FolderOpen size={28} />
          <h3>{media.length ? 'No matching media' : 'Your media library is empty'}</h3>
          <p>{media.length ? 'Try another search or filter.' : 'Upload a course thumbnail or lesson video to get started.'}</p>
        </div>
      ) : (
        <div className="instructor-media-grid">
          {filteredMedia.map((item) => (
            <article className="instructor-media-card" key={`${item.targetType}-${item._id}`}>
              <div className="instructor-media-preview">
                {item.targetType === 'course' ? <img src={item.url} alt={`${item.title} thumbnail`} /> : (
                  <><Video size={34} /><span>VIDEO</span></>
                )}
              </div>
              <div className="instructor-media-card-body">
                <div>
                  <span className="instructor-media-type">{item.targetType === 'course' ? <Image size={13} /> : <Video size={13} />} {item.format || item.targetType}</span>
                  <h3>{item.originalName || item.title}</h3>
                  {item.course && <p>{item.course}</p>}
                </div>
                <small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Date unavailable'}</small>
                <button type="button" className="instructor-media-delete" onClick={() => deleteMedia(item)} disabled={deletingId === `${item.targetType}-${item._id}`}>
                  <Trash2 size={14} /> {deletingId === `${item.targetType}-${item._id}` ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function InstructorPerformanceContent() {
  const [performance, setPerformance] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/courses/mine/performance')
      .then((data) => setPerformance(data.performance))
      .catch((err) => setError(err.message || 'Unable to load performance.'))
  }, [])

  return (
    <InstructorDataSection
      title="Performance"
      description="Live teaching metrics from your courses."
      error={error}
      emptyMessage="Create a course to start tracking performance."
    >
      {performance && (
        <>
          <div className="instructor-stat-grid">
            <div className="instructor-stat-card"><span className="instructor-stat-icon"><BookOpen size={20} /></span><div><p>Total courses</p><strong>{performance.courseCount}</strong><small>Owned courses</small></div></div>
            <div className="instructor-stat-card"><span className="instructor-stat-icon"><Users size={20} /></span><div><p>Students</p><strong>{performance.studentCount}</strong><small>Unique learners</small></div></div>
            <div className="instructor-stat-card"><span className="instructor-stat-icon"><ClipboardList size={20} /></span><div><p>Enrollments</p><strong>{performance.enrollmentCount}</strong><small>Total enrollments</small></div></div>
            <div className="instructor-stat-card"><span className="instructor-stat-icon"><BarChart3 size={20} /></span><div><p>Completion rate</p><strong>{performance.completionRate}%</strong><small>Across enrollments</small></div></div>
          </div>
          <section className="instructor-panel instructor-performance-panel">
            <div className="instructor-section-heading compact"><div><h3>Course performance</h3><p>Enrollment and completion metrics by course.</p></div></div>
            {performance.courses.length === 0 ? <div className="instructor-panel-empty">No course performance data yet.</div> : performance.courses.map((course) => (
              <div className="instructor-performance-row" key={course._id}>
                <div><strong>{course.title}</strong><small>{course.students} students · {course.lessons} lessons</small></div>
                <div className="instructor-performance-bar"><span style={{ width: `${course.completionRate}%` }} /></div>
                <strong>{course.completionRate}%</strong>
              </div>
            ))}
          </section>
        </>
      )}
    </InstructorDataSection>
  )
}

function InstructorSettingsContent() {
  const session = getSession()
  const [form, setForm] = useState({ name: session.name || '', email: session.email || '', currentPassword: '', newPassword: '' })
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')

  async function saveSettings(event) {
    event.preventDefault()
    setSaved('')
    setError('')
    try {
      const data = await apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify(form) })
      localStorage.setItem('cloudnexus_user', JSON.stringify(data.user))
      setForm((current) => ({ ...current, ...data.user, currentPassword: '', newPassword: '' }))
      setSaved(data.message || 'Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update your profile.')
    }
  }

  return (
    <section className="instructor-section">
      <div className="instructor-section-heading">
        <div>
          <span className="instructor-eyebrow">PREFERENCES</span>
          <h2>Settings</h2>
          <p>Update your authenticated CloudNexus profile.</p>
        </div>
      </div>
      <form className="instructor-panel" onSubmit={saveSettings}>
        <div className="instructor-form-grid">
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        </div>
        <div className="instructor-settings-password">
          <h3>Change password</h3>
          <p>Leave these fields blank to keep your current password.</p>
          <div className="instructor-form-grid">
            <label>Current password<input type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} autoComplete="current-password" /></label>
            <label>New password<input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} minLength="8" autoComplete="new-password" /></label>
          </div>
        </div>
        <button type="submit" className="instructor-primary-button">Save settings</button>
        {error && <p className="instructor-form-error" role="alert">{error}</p>}
        {saved && <p className="instructor-form-success" role="status">{saved}</p>}
      </form>
    </section>
  )
}

function InstructorDataSection({ title, description, error, emptyMessage, children }) {
  const hasContent = Children.count(children) > 0
  return (
    <section className="instructor-section">
      <div className="instructor-section-heading">
        <div>
          <span className="instructor-eyebrow">INSTRUCTOR WORKSPACE</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {error ? <div className="instructor-empty-card">{error}</div> : hasContent ? <div className="instructor-course-grid">{children}</div> : <div className="instructor-empty-card">{emptyMessage}</div>}
    </section>
  )
}

export default InstructorDashboard
