import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Layers,
  Clock,
  BarChart3,
  Settings,
  CircleHelp,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  Flame,
  CheckCircle2,
  Star,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Award,
  Cloud,
  Menu,
  X,
  Activity,
  BookMarked,
} from 'lucide-react'

import { apiRequest, getSession, clearSession } from '../lib/api'

// Fallback images for courses without uploaded thumbnails.
const courseImages = {
  'cloud-computing':
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&auto=format&fit=crop&q=80',
  linux:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop&q=80',
  python:
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=700&auto=format&fit=crop&q=80',
  database:
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&auto=format&fit=crop&q=80',
  networking:
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&auto=format&fit=crop&q=80',
  docker:
    'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=700&auto=format&fit=crop&q=80',
  'git-and-github':
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&auto=format&fit=crop&q=80',
}

const defaultCourseImage =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&auto=format&fit=crop&q=80'

function getCourseImage(course) {
  return (
    course?.thumbnailUrl ||
    courseImages[course?.slug] ||
    defaultCourseImage
  )
}

const helpArticles = [
  {
    category: 'Getting Started',
    question: 'How do I start learning on CloudNexus?',
    answer:
      'Open Subjects from your Dashboard, choose a course, and open an available lesson. Follow the study material, watch the lesson video, and complete the quiz when available.',
  },
  {
    category: 'Account',
    question: 'How do I log in to CloudNexus?',
    answer:
      'Open the Login page and enter the email address and password you used when registering. After successful login, you will be redirected to your Dashboard.',
  },
  {
    category: 'Courses',
    question: 'How do I find a course?',
    answer:
      'Open Subjects in your Dashboard or visit the Courses catalogue. Browse the available learning paths or use the search box to find a course by its name or subject.',
  },
  {
    category: 'Lessons',
    question: 'What should I do if a lesson video does not play?',
    answer:
      'Check your internet connection and refresh the lesson page. If the video still does not play, try another browser or return to the course and open the lesson again.',
  },
  {
    category: 'Quizzes',
    question: 'How do I complete a lesson quiz?',
    answer:
      'Open a lesson that includes a quiz, read the question, select your answer, and follow the quiz instructions. Your ability to retry and your results depend on the quiz functionality enabled for that lesson.',
  },
  {
    category: 'Progress',
    question: 'Why does my course progress show zero?',
    answer:
      'Course progress depends on recorded learning activity and completed lessons. If you have just registered or have not completed any tracked lessons, your progress may be zero.',
  },
  {
    category: 'Certificates',
    question: 'When can I receive a course certificate?',
    answer:
      'CloudNexus is intended to provide certificates for completed courses. Certificate availability depends on the certificate-generation functionality being enabled and the course-completion requirements being met.',
  },
  {
    category: 'Payments',
    question: 'Are all courses free?',
    answer:
      'The course catalogue identifies whether a course is free or premium. Premium enrolment requires a verified payment flow; do not assume that a payment has succeeded until the platform confirms it.',
  },
  {
    category: 'Account',
    question: 'How do I log out?',
    answer:
      'Open the Logout option in the Dashboard sidebar. You will be signed out and returned to the public landing page.',
  },
  {
    category: 'Troubleshooting',
    question: 'What should I do if a page is blank?',
    answer:
      'Refresh the page first. If it remains blank, open the browser developer tools with F12, select Console, and check for red JavaScript errors.',
  },
]

function Dashboard() {
  const navigate = useNavigate()
  const user = getSession()

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [allCourses, setAllCourses] = useState([])
  const [catalogueError, setCatalogueError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [helpSearch, setHelpSearch] = useState('')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [pendingScroll, setPendingScroll] = useState('')

  const [settings, setSettings] = useState(() => {
  const defaults = {
    theme: 'light',
    emailReminders: true,
    courseUpdates: true,
    preferredSubjects: ['Cloud Computing', 'Python Programming'],
  }

  try {
    const saved = localStorage.getItem('cloudnexus-settings')
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
  } catch {
    return defaults
  }
})

const [settingsSaved, setSettingsSaved] = useState(false)

const availableSubjects = [
  'Cloud Computing',
  'Linux Fundamentals',
  'Python Programming',
  'Database Fundamentals',
  'Networking Basics',
  'Docker Essentials',
  'Git and GitHub',
]

  useEffect(() => {
    let active = true

    apiRequest('/learning/dashboard')
      .then((result) => {
        if (active) {
          setData({
            ...result,
            enrollments: Array.isArray(result.enrollments)
              ? result.enrollments
              : [],
            recommendations: Array.isArray(result.recommendations)
              ? result.recommendations
              : [],
          })
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load your dashboard.')
        }
      })

    return () => {
      active = false
    }
  }, [])
  

  // Load all published courses for the Subjects section
useEffect(() => {
  let active = true

  apiRequest('/courses')
    .then((result) => {
      if (active) {
        setAllCourses(
          Array.isArray(result.courses) ? result.courses : []
        )
      }
    })
    .catch((err) => {
      if (active) {
        setCatalogueError(
          err.message || 'Unable to load subjects.'
        )
      }
    })

  return () => {
    active = false
  }
}, [])

// Scroll to a Dashboard section after switching back from Settings or Help
useEffect(() => {
  if (!pendingScroll || activeView !== 'dashboard') return

  const timer = window.setTimeout(() => {
    document.getElementById(pendingScroll)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    setPendingScroll('')
  }, 150)

  return () => window.clearTimeout(timer)
}, [activeView, pendingScroll])
  const enrollments = data?.enrollments || []
  const recommendations = data?.recommendations || []

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'Learner'

  const totalLessonsCompleted = enrollments.reduce(
    (total, item) =>
      total +
      (Array.isArray(item.completedLessons)
        ? item.completedLessons.length
        : 0),
    0
  )

  const coursesInProgress = enrollments.filter((item) => {
    const progress = Number(item.progressPercentage) || 0
    return progress > 0 && progress < 100
  }).length

  const averageProgress = enrollments.length
    ? Math.round(
        enrollments.reduce(
          (total, item) =>
            total + (Number(item.progressPercentage) || 0),
          0
        ) / enrollments.length
      )
    : 0

  const filteredEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return enrollments

    return enrollments.filter((item) =>
      (item.course?.title || '').toLowerCase().includes(query)
    )
  }, [enrollments, search])

  const filteredAllCourses = useMemo(() => {
  const query = search.trim().toLowerCase()

  if (!query) return allCourses

  return allCourses.filter((course) =>
    `${course.title || ''} ${course.category || ''} ${
      course.description || ''
    } ${course.level || ''}`
      .toLowerCase()
      .includes(query)
  )
}, [allCourses, search])

const filteredRecommendations = useMemo(() => {
  const query = search.trim().toLowerCase()

  if (!query) return recommendations

  return recommendations.filter((course) =>
    `${course.title || ''} ${course.category || ''} ${
      course.description || ''
    }`
      .toLowerCase()
      .includes(query)
  )
}, [recommendations, search])

const filteredHelpArticles = helpArticles.filter((article) => {
  const query = helpSearch.trim().toLowerCase()

  if (!query) return true

  return (
    article.question.toLowerCase().includes(query) ||
    article.answer.toLowerCase().includes(query) ||
    article.category.toLowerCase().includes(query)
  )
})

  function logout() {
    clearSession()
    navigate('/')
  }
  function saveSettings(event) {
  event.preventDefault()

  try {
    localStorage.setItem('cloudnexus-settings', JSON.stringify(settings))
    setDarkMode(settings.theme === 'dark')
    setSettingsSaved(true)
  } catch {
    setSettingsSaved(false)
  }
}

  function openDashboardSection(section) {
    const isSubpage = section === 'settings' || section === 'help'
    const sectionTargets = {
      learning: 'continue-learning',
      subjects: 'subject-catalogue',
      activity: 'recent-activity',
      performance: 'progress-overview',
    }

    setActiveSection(section)
    setActiveView(isSubpage ? section : 'dashboard')
    setPendingScroll(isSubpage ? '' : (sectionTargets[section] || ''))
    setNotice('')
    setSidebarOpen(false)

    if (isSubpage || section === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!user) {
    return <Navigate to="/login?next=/dashboard" replace />
  }

  return (
    <div className={`dashboard-shell ${darkMode ? 'is-dark' : ''}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        <Link
          to="/"
          className="dashboard-brand"
          aria-label="CloudNexus home"
        >
          <span className="dashboard-brand-icon">
            <Cloud size={34} strokeWidth={2.3} />
          </span>

          <span>
            <strong>
              Cloud<span>Nexus</span>
            </strong>
            <small>L M S</small>
          </span>
        </Link>

        <div className="dashboard-sidebar-label">
          LEARNING SPACE
        </div>

        <nav className="dashboard-side-nav" aria-label="Learning navigation">
          <button
            type="button"
            className={`dashboard-nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => openDashboardSection('dashboard')}
          >
            <Home size={19} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`dashboard-nav-link ${activeSection === 'learning' ? 'active' : ''}`}
            onClick={() => openDashboardSection('learning')}
          >
            <BookOpen size={19} />
            <span>My Learning</span>
          </button>

          <button
            type="button"
            className={`dashboard-nav-link ${activeSection === 'subjects' ? 'active' : ''}`}
            onClick={() => openDashboardSection('subjects')}
          >
            <Layers size={19} />
            <span>Subjects</span>
          </button>

          <button
            type="button"
            className={`dashboard-nav-link ${activeSection === 'activity' ? 'active' : ''}`}
            onClick={() => openDashboardSection('activity')}
          >
            <Clock size={19} />
            <span>My Activity</span>
          </button>

          <button
            type="button"
            className={`dashboard-nav-link ${activeSection === 'performance' ? 'active' : ''}`}
            onClick={() => openDashboardSection('performance')}
          >
            <BarChart3 size={19} />
            <span>Performance</span>
          </button>
        </nav>

        <div className="dashboard-sidebar-label">
          PREFERENCES
        </div>

        <nav className="dashboard-side-nav">
          <button
  type="button"
  className={`dashboard-nav-link ${
    activeView === 'settings' ? 'active' : ''
  }`}
  onClick={() => openDashboardSection('settings')}
>
  <Settings size={19} />
  <span>Settings</span>
</button>

          <button
  type="button"
  className={`dashboard-nav-link ${
    activeView === 'help' ? 'active' : ''
  }`}
  onClick={() => openDashboardSection('help')}
>
  <CircleHelp size={19} />
  <span>Help and Support</span>
</button>

          <button
            type="button"
            className="dashboard-nav-link dashboard-logout"
            onClick={logout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </nav>

        <div className="dashboard-sidebar-promo">
          <div className="dashboard-promo-icon">
            <GraduationCap size={30} />
          </div>

          <strong>Keep Learning.</strong>
          <strong>Keep Growing.</strong>

          <p>
            Small steps every day lead to bigger possibilities.
          </p>

          <Link to="/courses">
            Explore courses <ArrowRight size={14} />
          </Link>
        </div>

        <div className="dashboard-sidebar-footer">
          Learn. Build. Grow.
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="dashboard-main-area">
        {/* TOP BAR */}
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-mobile-menu"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <form
            className="dashboard-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={18} />

            <input
              type="search"
              placeholder="Search courses, lessons, or subjects..."
              aria-label="Search dashboard courses"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                <X size={15} />
              </button>
            )}
          </form>

          <div className="dashboard-topbar-actions">
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="Notifications"
              onClick={() =>
                setNotice('You have no new notifications right now.')
              }
            >
              <Bell size={19} />
              <span className="dashboard-notification-dot" />
            </button>

            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode((current) => !current)}
            >
              {darkMode ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            <div className="dashboard-profile">
              <span className="dashboard-avatar">
                {firstName.charAt(0).toUpperCase()}
              </span>

              <span className="dashboard-profile-info">
                <strong>{user.name || 'Learner'}</strong>
                <small>Student</small>
              </span>
            </div>
          </div>
        </header>

        <main
  className={`dashboard-content ${
    activeView !== 'dashboard' ? 'dashboard-content-subpage' : ''
  }`}
>
  {/* HELP AND SUPPORT PAGE */}
{activeView === 'help' && (
  <section className="dashboard-subpage dashboard-help-page">
    <div className="dashboard-help-hero">
      <span className="dashboard-eyebrow">
        CLOUDNEXUS SUPPORT CENTRE
      </span>

      <h1>How can we help you?</h1>

      <p>
        Find answers about your account, courses, lessons,
        quizzes, progress, and certificates.
      </p>

      <div className="dashboard-help-search">
        <Search size={20} />

        <input
          type="search"
          value={helpSearch}
          onChange={(event) => setHelpSearch(event.target.value)}
          placeholder="Search your question..."
          aria-label="Search help articles"
        />

        {helpSearch && (
          <button
            type="button"
            onClick={() => setHelpSearch('')}
          >
            Clear
          </button>
        )}
      </div>
    </div>

    {/* Quick links */}
    <div className="dashboard-help-quick-links">
      <button
        type="button"
        onClick={() => openDashboardSection('dashboard')}
      >
        <Home size={21} />
        <span>
          <strong>Dashboard</strong>
          <small>Return to your learning overview</small>
        </span>
        <ChevronRight size={18} />
      </button>

      <Link to="/courses">
        <BookOpen size={21} />
        <span>
          <strong>Browse Courses</strong>
          <small>Explore available learning paths</small>
        </span>
        <ChevronRight size={18} />
      </Link>

      <button
        type="button"
        onClick={() => openDashboardSection('settings')}
      >
        <Settings size={21} />
        <span>
          <strong>Account Settings</strong>
          <small>Manage your saved preferences</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>

    {/* Search results and FAQs */}
    <div className="dashboard-help-content">
      <div className="dashboard-help-heading">
        <div>
          <span className="dashboard-eyebrow">
            HELP ARTICLES
          </span>

          <h2>
            {helpSearch.trim()
              ? 'Search results'
              : 'Frequently Asked Questions'}
          </h2>

          <p>
            Select a question to read its answer.
          </p>
        </div>

        <span className="dashboard-help-count">
          {filteredHelpArticles.length}{' '}
          {filteredHelpArticles.length === 1
            ? 'article'
            : 'articles'}
        </span>
      </div>

      {filteredHelpArticles.length > 0 ? (
        <div className="dashboard-help-articles">
          {filteredHelpArticles.map((article) => (
            <details
              className="dashboard-help-article"
              key={article.question}
            >
              <summary>
                <span className="dashboard-help-question-icon">
                  <CircleHelp size={19} />
                </span>

                <span className="dashboard-help-question">
                  <small>{article.category}</small>
                  <strong>{article.question}</strong>
                </span>

                <ChevronRight
                  className="dashboard-help-chevron"
                  size={19}
                />
              </summary>

              <div className="dashboard-help-answer">
                <p>{article.answer}</p>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="dashboard-help-no-results">
          <CircleHelp size={34} />

          <h3>No matching articles found</h3>

          <p>
            Try searching for terms such as login, course, quiz,
            certificate, payment, or video.
          </p>

          <button
            type="button"
            className="dashboard-browse-button"
            onClick={() => setHelpSearch('')}
          >
            View all help articles
          </button>
        </div>
      )}
    </div>

    {/* Support information */}
    <div className="dashboard-help-contact">
      <div className="dashboard-help-contact-icon">
        <CircleHelp size={27} />
      </div>

      <div>
        <h3>Still need help?</h3>

        <p>
          If you encounter a problem that isn't covered above,
          note the page, the action you took, and the exact error
          message so it can be investigated.
        </p>

        <small>
          Direct support-ticket submission has not been connected yet.
        </small>
      </div>
    </div>
  </section>
)}
  {activeView === 'settings' && (
  <section className="dashboard-subpage">
    <div className="dashboard-subpage-heading">
      <span className="dashboard-eyebrow">ACCOUNT PREFERENCES</span>
      <h1>Settings</h1>
      <p>Personalize your CloudNexus learning experience.</p>

      <button
        type="button"
        className="dashboard-browse-button"
        onClick={() => openDashboardSection('dashboard')}
      >
        ← Back to Dashboard
      </button>
    </div>

    <form className="dashboard-settings-form" onSubmit={saveSettings}>
      <article className="dashboard-panel dashboard-settings-card">
        <h2>Account Information</h2>
        <p className="dashboard-settings-description">
          Your account details from CloudNexus.
        </p>

        <div className="dashboard-settings-profile">
          <span className="dashboard-avatar">
            {(user.name || 'L').charAt(0).toUpperCase()}
          </span>

          <div>
            <strong>{user.name || 'Learner'}</strong>
            <small>{user.role || 'Student'}</small>
          </div>
        </div>

        <label className="dashboard-settings-field">
          Full name
          <input value={user.name || ''} readOnly />
        </label>

        <label className="dashboard-settings-field">
          Email address
          <input value={user.email || ''} readOnly />
        </label>

        <p className="dashboard-settings-hint">
          Profile editing and password changes are not enabled yet.
        </p>
      </article>

      <article className="dashboard-panel dashboard-settings-card">
        <h2>Appearance</h2>
        <p className="dashboard-settings-description">
          Choose how your learning dashboard looks.
        </p>

        <label className="dashboard-settings-field">
          Colour theme
          <select
            value={settings.theme}
            onChange={(event) => {
              setSettings({
                ...settings,
                theme: event.target.value,
              })
              setSettingsSaved(false)
            }}
          >
            <option value="light">Light mode</option>
            <option value="dark">Dark mode</option>
          </select>
        </label>
      </article>

      <article className="dashboard-panel dashboard-settings-card">
        <h2>Notifications</h2>
        <p className="dashboard-settings-description">
          Manage your preferred learning reminders.
        </p>

        <label className="dashboard-settings-toggle">
          <span>
            <strong>Learning reminders</strong>
            <small>Receive reminders to continue studying.</small>
          </span>

          <input
            type="checkbox"
            checked={settings.emailReminders}
            onChange={(event) => {
              setSettings({
                ...settings,
                emailReminders: event.target.checked,
              })
              setSettingsSaved(false)
            }}
          />
        </label>

        <label className="dashboard-settings-toggle">
          <span>
            <strong>Course updates</strong>
            <small>Keep your course-update preference enabled.</small>
          </span>

          <input
            type="checkbox"
            checked={settings.courseUpdates}
            onChange={(event) => {
              setSettings({
                ...settings,
                courseUpdates: event.target.checked,
              })
              setSettingsSaved(false)
            }}
          />
        </label>

        <p className="dashboard-settings-hint">
          These options save your preferences; email notifications
          are not sent by the application yet.
        </p>
      </article>

      <article className="dashboard-panel dashboard-settings-card">
        <h2>Learning Preferences</h2>
        <p className="dashboard-settings-description">
          Select the subjects you are interested in learning.
        </p>

        <div className="dashboard-subject-preferences">
          {availableSubjects.map((subject) => (
            <label key={subject}>
              <input
                type="checkbox"
                checked={settings.preferredSubjects.includes(subject)}
                onChange={(event) => {
                  const preferredSubjects = event.target.checked
                    ? [...settings.preferredSubjects, subject]
                    : settings.preferredSubjects.filter(
                        (item) => item !== subject
                      )

                  setSettings({
                    ...settings,
                    preferredSubjects,
                  })
                  setSettingsSaved(false)
                }}
              />

              <span>{subject}</span>
            </label>
          ))}
        </div>
      </article>

      <div className="dashboard-settings-actions">
        {settingsSaved && (
          <span role="status">
            ✓ Settings saved successfully.
          </span>
        )}

        <button type="submit" className="dashboard-browse-button">
          Save Preferences
        </button>
      </div>
    </form>
  </section>
)}
          {/* PAGE HEADING */}
          <div className="dashboard-page-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR LEARNING SPACE
              </span>

              <h1>
                Good day, {firstName}! <span>👋</span>
              </h1>

              <p>
                Keep building your skills. Every lesson is a step
                towards your goals.
              </p>
            </div>

            <Link to="/courses" className="dashboard-browse-button">
              Browse courses <ArrowRight size={16} />
            </Link>
          </div>

          {notice && (
            <div className="dashboard-notice" role="status">
              <span>{notice}</span>

              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setNotice('')}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="dashboard-error" role="alert">
              <strong>We couldn't load your learning data.</strong>
              <p>{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          )}

          {!data && !error && (
            <div className="dashboard-loading">
              <span className="dashboard-loading-spinner" />
              <p>Loading your learning space...</p>
            </div>
          )}

          {data && (
            <>
              {/* STATISTICS */}
              <section
                className="dashboard-stats-grid"
                aria-label="Learning statistics"
              >
                <article className="dashboard-stat-card stat-streak">
                  <div className="dashboard-stat-top">
                    <span className="dashboard-stat-icon">
                      <Flame size={22} />
                    </span>

                    <span className="dashboard-stat-tag">
                      DAILY HABIT
                    </span>
                  </div>

                  <p>Learning streak</p>
                  <h2>—</h2>
                  <small>
                    Start a daily learning habit
                  </small>
                </article>

                <article className="dashboard-stat-card stat-lessons">
                  <div className="dashboard-stat-top">
                    <span className="dashboard-stat-icon">
                      <CheckCircle2 size={22} />
                    </span>

                    <span className="dashboard-stat-tag">
                      COMPLETED
                    </span>
                  </div>

                  <p>Lessons completed</p>
                  <h2>{totalLessonsCompleted}</h2>
                  <small>Based on your enrolled courses</small>
                </article>

                <article className="dashboard-stat-card stat-courses">
                  <div className="dashboard-stat-top">
                    <span className="dashboard-stat-icon">
                      <BookMarked size={22} />
                    </span>

                    <span className="dashboard-stat-tag">
                      IN PROGRESS
                    </span>
                  </div>

                  <p>Courses in progress</p>
                  <h2>{coursesInProgress}</h2>
                  <small>
                    {enrollments.length} enrolled{' '}
                    {enrollments.length === 1 ? 'course' : 'courses'}
                  </small>
                </article>

                <article className="dashboard-stat-card stat-progress">
                  <div className="dashboard-stat-top">
                    <span className="dashboard-stat-icon">
                      <Star size={22} />
                    </span>

                    <span className="dashboard-stat-tag">
                      OVERVIEW
                    </span>
                  </div>

                  <p>Average progress</p>
                  <h2>{averageProgress}%</h2>

                  <div className="dashboard-mini-progress">
                    <span
                      style={{ width: `${averageProgress}%` }}
                    />
                  </div>

                  <small>Across your enrolled courses</small>
                </article>
              </section>

              {/* LEARNING OVERVIEW */}
              <section className="dashboard-overview-grid">
                <article
                  className="dashboard-panel dashboard-progress-panel"
                  id="progress-overview"
                >
                  <div className="dashboard-panel-heading">
                    <div>
                      <h2>Your learning progress</h2>
                      <p>A snapshot of your enrolled courses</p>
                    </div>

                    <Link to="/courses">
                      View courses <ChevronRight size={15} />
                    </Link>
                  </div>

                  <div className="dashboard-progress-content">
                    <div
                      className="dashboard-progress-ring"
                      style={{
                        '--progress': `${averageProgress}%`,
                      }}
                    >
                      <div>
                        <strong>{averageProgress}%</strong>
                        <small>Average progress</small>
                      </div>
                    </div>

                    <div className="dashboard-progress-details">
                      <div>
                        <span className="progress-dot dot-blue" />
                        <span>Enrolled courses</span>
                        <strong>{enrollments.length}</strong>
                      </div>

                      <div>
                        <span className="progress-dot dot-green" />
                        <span>In progress</span>
                        <strong>{coursesInProgress}</strong>
                      </div>

                      <div>
                        <span className="progress-dot dot-purple" />
                        <span>Lessons completed</span>
                        <strong>{totalLessonsCompleted}</strong>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="dashboard-panel dashboard-activity-panel">
                  <div className="dashboard-panel-heading">
                    <div>
                      <h2>Learning activity</h2>
                      <p>Your study history</p>
                    </div>

                    <span className="dashboard-coming-soon">
                      Activity tracking
                    </span>
                  </div>

                  <div className="dashboard-activity-empty">
                    <div className="dashboard-activity-icon">
                      <Activity size={26} />
                    </div>

                    <strong>Your learning journey starts here</strong>

                    <p>
                      Weekly study charts will appear when your
                      study sessions are recorded by the platform.
                    </p>

                    <Link to="/courses">
                      Start learning <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              </section>

              {/* CONTINUE LEARNING */}
              <section
                className="dashboard-section"
                id="continue-learning"
              >
                <div className="dashboard-section-heading">
                  <div>
                    <span className="dashboard-eyebrow">
                      PICK UP WHERE YOU LEFT OFF
                    </span>

                    <h2>Continue learning</h2>

                    <p>
                      Your enrolled courses, all in one place.
                    </p>
                  </div>

                  <Link to="/courses" className="dashboard-view-all">
                    View all courses <ArrowRight size={15} />
                  </Link>
                </div>

                {filteredEnrollments.length > 0 ? (
                  <div className="dashboard-course-grid">
                    {filteredEnrollments.map((item) => {
                      const course = item.course || {}
                      const progress = Math.min(
                        100,
                        Math.max(0, Number(item.progressPercentage) || 0)
                      )

                      return (
                        <article
                          className="dashboard-course-card"
                          key={item._id}
                        >
                          <Link
                            to={`/courses/${course.slug}`}
                            className="dashboard-course-image"
                          >
                            <img
                              src={getCourseImage(course)}
                              alt=""
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src =
                                  defaultCourseImage
                              }}
                            />

                            <span className="dashboard-image-badge">
                              {course.category || 'COURSE'}
                            </span>
                          </Link>

                          <div className="dashboard-course-body">
                            <span className="dashboard-course-level">
                              {course.level || 'Beginner'}
                            </span>

                            <h3>
                              <Link to={`/courses/${course.slug}`}>
                                {course.title}
                              </Link>
                            </h3>

                            <p>
                              {course.description ||
                                'Continue developing your skills with this learning path.'}
                            </p>

                            <div className="dashboard-course-progress-label">
                              <span>Course progress</span>
                              <strong>{progress}%</strong>
                            </div>

                            <div className="dashboard-course-progress">
                              <span
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <Link
                              to={`/courses/${course.slug}`}
                              className="dashboard-continue-link"
                            >
                              Continue learning
                              <ArrowRight size={15} />
                            </Link>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                ) : (
                  <div className="dashboard-empty-card">
                    <div className="dashboard-empty-icon">
                      <BookOpen size={28} />
                    </div>

                    <div>
                      <h3>
                        {search
                          ? 'No enrolled courses match your search'
                          : 'Your learning journey starts here'}
                      </h3>

                      <p>
                        {search
                          ? 'Try another search term or clear the search field.'
                          : 'Explore our learning paths and enrol in a course to see your progress here.'}
                      </p>
                    </div>

                    <Link
                      to="/courses"
                      className="dashboard-browse-button"
                    >
                      Explore courses <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </section>

              {/* ALL SUBJECTS */}
<section
  className="dashboard-section"
  id="subject-catalogue"
>
  <div className="dashboard-section-heading">
    <div>
      <span className="dashboard-eyebrow">
        EXPLORE YOUR OPTIONS
      </span>

      <h2>Explore Subjects</h2>

      <p>
        Choose a learning path and build your IT skills.
      </p>
    </div>

    <Link to="/courses" className="dashboard-view-all">
      Open course catalogue
      <ArrowRight size={15} />
    </Link>
  </div>

  {catalogueError && (
    <div className="dashboard-error" role="alert">
      Unable to load subjects: {catalogueError}
    </div>
  )}

  {!catalogueError && filteredAllCourses.length > 0 && (
    <div className="dashboard-course-grid">
      {filteredAllCourses.map((course) => (
        <article
          className="dashboard-course-card"
          key={course._id}
        >
          <Link
            to={`/courses/${course.slug}`}
            className="dashboard-course-image"
          >
            <img
              src={getCourseImage(course)}
              alt={`${course.title} course`}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = defaultCourseImage
              }}
            />

            <span className="dashboard-image-badge">
              {course.category || 'IT FUNDAMENTALS'}
            </span>
          </Link>

          <div className="dashboard-course-body">
            <span className="dashboard-course-level">
              {course.level || 'Beginner'}
            </span>

            <h3>
              <Link to={`/courses/${course.slug}`}>
                {course.title}
              </Link>
            </h3>

            <p>
              {course.description ||
                'Explore this learning path and develop new skills.'}
            </p>

            <div className="dashboard-course-progress-label">
              <span>
                {course.lessonCount ?? 0}{' '}
                {(course.lessonCount ?? 0) === 1
                  ? 'lesson'
                  : 'lessons'}
              </span>

              <strong>
                {course.isPremium
                  ? `₹${course.price}`
                  : 'Free'}
              </strong>
            </div>

            <Link
              to={`/courses/${course.slug}`}
              className="dashboard-continue-link"
            >
              Explore Subject
              <ArrowRight size={15} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  )}

  {!catalogueError && filteredAllCourses.length === 0 && (
    <div className="dashboard-empty-card">
      <div className="dashboard-empty-icon">
        <BookOpen size={28} />
      </div>

      <div>
        <h3>No matching subjects found</h3>

        <p>
          Try another search term or clear your search.
        </p>
      </div>
    </div>
  )}
</section>

              {/* RECOMMENDATIONS AND RECENT ACTIVITY */}
              <section className="dashboard-bottom-grid">
                <article className="dashboard-panel dashboard-recommendations">
                  <div className="dashboard-panel-heading">
                    <div>
                      <h2>Recommended for you</h2>
                      <p>Discover another learning path</p>
                    </div>

                    <Link to="/courses">
                      Explore <ChevronRight size={15} />
                    </Link>
                  </div>

                  {filteredRecommendations.length > 0 ? (
                    <div className="dashboard-recommendation-list">
                      {filteredRecommendations.slice(0, 4).map((course) => (
                        <Link
                          to={`/courses/${course.slug}`}
                          className="dashboard-recommendation-item"
                          key={course._id}
                        >
                          <img
                            src={getCourseImage(course)}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null
                              event.currentTarget.src = defaultCourseImage
                            }}
                          />

                          <span className="dashboard-recommendation-info">
                            <strong>{course.title}</strong>
                            <small>
                              {course.category || 'Learning path'} ·{' '}
                              {course.level || 'Beginner'}
                            </small>
                          </span>

                          <ChevronRight size={18} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard-inline-empty">
                      No recommendations match your search.
                    </div>
                  )}
                </article>

                <article
                  className="dashboard-panel dashboard-recent-panel"
                  id="recent-activity"
                >
                  <div className="dashboard-panel-heading">
                    <div>
                      <h2>Recent activity</h2>
                      <p>Your latest learning milestones</p>
                    </div>
                  </div>

                  <div className="dashboard-recent-empty">
                    <span>
                      <Clock size={24} />
                    </span>

                    <strong>Your activity will appear here</strong>

                    <p>
                      Completed lessons and learning milestones
                      will be shown when activity tracking is connected.
                    </p>
                  </div>
                </article>
              </section>

              {/* BENEFIT STRIP */}
              <section className="dashboard-benefit-strip">
                <div>
                  <GraduationCap size={24} />
                  <span>
                    <strong>Learn step by step</strong>
                    <small>Build your foundation</small>
                  </span>
                </div>

                <div>
                  <BookOpen size={24} />
                  <span>
                    <strong>Practice regularly</strong>
                    <small>Strengthen your skills</small>
                  </span>
                </div>

                <div>
                  <Award size={24} />
                  <span>
                    <strong>Reach your goals</strong>
                    <small>Celebrate your progress</small>
                  </span>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard