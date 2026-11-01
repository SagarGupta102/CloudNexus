
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Award,
  Bell,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'
import { apiRequest, clearSession, getSession } from '../lib/api'
import './AdminDashboard.css'

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: UserCog },
  { id: 'instructors', label: 'Instructor Management', icon: ClipboardList },
  { id: 'students', label: 'Student Management', icon: Users },
  { id: 'courses', label: 'Course Management', icon: BookOpen },
  { id: 'lessons', label: 'Lesson Management', icon: FileText },
  { id: 'enrollments', label: 'Enrollments', icon: FileText },
  { id: 'payments', label: 'Payments', icon: BarChart3 },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function AdminDashboard() {
  const navigate = useNavigate()
  const user = getSession()

  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  })

  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiRequest('/admin/stats')
        setStats(data.stats)
        setStatsError('')
      } catch (error) {
        setStatsError(error.message || 'Unable to load dashboard statistics.')
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [])

  if (!user) {
    return <Navigate to="/login?next=/admin/dashboard" replace />
  }

  if (user.role !== 'admin') {
    return (
      <Navigate
        to={user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'}
        replace
      />
    )
  }

  function logout() {
    clearSession()
    navigate('/login')
  }

  function selectSection(section) {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  const firstName = user.name?.trim()?.split(/\s+/)[0] || 'Admin'
  const activeItem = navigationItems.find((item) => item.id === activeSection)

  return (
    <div className="admin-dashboard">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <span className="admin-brand-mark">✦</span>
          <span>
            <strong>
              Cloud<span>Nexus</span>
            </strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </div>

        <div className="admin-sidebar-label">ADMINISTRATION</div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`admin-nav-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => selectSection(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activeSection === id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-nav-item admin-logout"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <p>Learn. Build. Grow.</p>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-menu-button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="admin-header-copy">
            <span>ADMIN CONSOLE</span>
            <h1>{activeItem?.label || 'Overview'}</h1>
          </div>

          <button
            type="button"
            className="admin-notifications"
            aria-label="Notifications"
            onClick={() => selectSection('overview')}
          >
            <Bell size={19} />
            <span />
          </button>

          <div className="admin-profile">
            <span className="admin-avatar">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.name || 'Admin'}</strong>
              <small>{formatRoleLabel(user.role)}</small>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeSection === 'overview' ? (
            <OverviewContent
              firstName={firstName}
              selectSection={selectSection}
              stats={stats}
              loadingStats={loadingStats}
              statsError={statsError}
            />
          ) : (
            <SectionContent
              section={activeItem}
              selectSection={selectSection}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function formatRoleLabel(role) {
  const labels = {
    admin: 'Administrator',
    instructor: 'Instructor',
    student: 'Student',
  }

  return labels[role] || 'User'
}

function OverviewContent({
  firstName,
  selectSection,
  stats,
  loadingStats,
  statsError,
}) {
  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">PLATFORM OVERVIEW</span>
          <h2>Welcome back, {firstName}.</h2>
          <p>
            Monitor the CloudNexus learning platform and keep its
            community, content, and operations organized.
          </p>
        </div>
        <div className="admin-welcome-art" aria-hidden="true">
          <UserCog size={42} />
        </div>
      </section>

     
      <section className="admin-stat-grid" aria-label="Platform summary">
        <SummaryCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          loading={loadingStats}
        />
        <SummaryCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          loading={loadingStats}
        />
        <SummaryCard
          icon={UserCog}
          label="Total Instructors"
          value={stats.totalInstructors}
          loading={loadingStats}
        />
        <SummaryCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.totalCourses}
          loading={loadingStats}
        />
      </section>


      {statsError && (
        <p className="admin-error">
          Could not load statistics: {statsError}
        </p>
      )}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">PLATFORM HEALTH</span>
            <h2>Platform Overview</h2>
            <p>Live statistics from your CloudNexus database.</p>
          </div>
        </div>

        <div className="admin-overview-panel">
          <div className="admin-overview-icon">
            <BarChart3 size={25} />
          </div>
          <div>
            <h3>
              {loadingStats
                ? 'Loading platform statistics...'
                : statsError
                  ? 'Statistics unavailable'
                  : 'Platform statistics updated'}
            </h3>
            <p>
              {statsError
                ? 'Check your backend connection and admin API.'
                : 'Your dashboard statistics are retrieved from MongoDB through the protected admin API.'}
            </p>
          </div>
        </div>
      </section>

      <section className="admin-panel-grid">
        <EmptyPanel
          eyebrow="USER ACTIVITY"
          title="Recent Registrations"
          icon={Users}
          message="Recent registration details will be connected in the next step."
        />
        <EmptyPanel
          eyebrow="COURSE ACTIVITY"
          title="Course Activity"
          icon={BookOpen}
          message="Course updates and publishing activity will be connected next."
        />
      </section>

      <section className="admin-section">
        <div className="admin-section-heading compact">
          <div>
            <span className="admin-eyebrow">ADMIN TOOLS</span>
            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="admin-actions-grid">
          <ActionButton
            icon={UserCog}
            label="Manage Users"
            description="Review platform accounts"
            onClick={() => selectSection('users')}
          />
          <ActionButton
            icon={BookOpen}
            label="Manage Courses"
            description="Review learning content"
            onClick={() => selectSection('courses')}
          />
        </div>
      </section>
    </>
  )
}

function SectionContent({ section, selectSection }) {
    if (section?.id === 'courses') {
    return <CourseManagementContent />
  }
  if (section?.id === 'lessons') {
    return <LessonApprovalContent />
  }
    if (section?.id === 'instructors') {
    return (
      <DirectoryManagementContent
        endpoint="/admin/instructors"
        dataKey="instructors"
        title="Instructor Management"
        description="Review instructor accounts across CloudNexus."
        eyebrow="INSTRUCTOR ADMINISTRATION"
        icon={UserCog}
        selectSection={selectSection}
      />
    )
  }

  if (section?.id === 'students') {
    return (
      <DirectoryManagementContent
        endpoint="/admin/students"
        dataKey="students"
        title="Student Management"
        description="Review student accounts and learning participation."
        eyebrow="STUDENT ADMINISTRATION"
        icon={Users}
        selectSection={selectSection}
      />
    )
  }
    if (section?.id === 'users') {
    return <UserManagementContent selectSection={selectSection} />
  }
  const sectionDetails = {
    users: {
      eyebrow: 'USER ADMINISTRATION',
      description: 'Review and manage accounts across the CloudNexus platform.',
      message: 'User records will appear here when user management is connected.',
      icon: UserCog,
    },
    instructors: {
      eyebrow: 'INSTRUCTOR ADMINISTRATION',
      description: 'Oversee instructor access and teaching accounts.',
      message: 'Instructor records will appear here when instructor management is connected.',
      icon: ClipboardList,
    },
    students: {
      eyebrow: 'STUDENT ADMINISTRATION',
      description: 'Review student accounts and learning participation.',
      message: 'Student records will appear here when student management is connected.',
      icon: Users,
    },
    courses: {
      eyebrow: 'COURSE ADMINISTRATION',
      description: 'Oversee course content and publishing status.',
      message: 'Course records will appear here when course management is connected.',
      icon: BookOpen,
    },
    enrollments: {
      eyebrow: 'ENROLLMENT ADMINISTRATION',
      description: 'Review enrollment activity across the learning platform.',
      message: 'Enrollment records will appear here when enrollment data is available.',
      icon: FileText,
    },
    payments: {
      eyebrow: 'PAYMENT OPERATIONS',
      description: 'Monitor payment activity and transaction status.',
      message: 'Payment records will appear here when payment integration is connected.',
      icon: BarChart3,
    },
    certificates: {
      eyebrow: 'CERTIFICATE ADMINISTRATION',
      description: 'Review issued certificates and verification activity.',
      message: 'Certificate records will appear here when certificate data is available.',
      icon: Award,
    },
    reports: {
      eyebrow: 'REPORTING & ANALYTICS',
      description: 'Understand platform health through administrative reporting.',
      message: 'Reports and analytics will appear here when reporting is connected.',
      icon: BarChart3,
    },
    settings: {
      eyebrow: 'PLATFORM SETTINGS',
      description: 'Manage administrative preferences and platform configuration.',
      message: 'Settings will appear here when configuration controls are available.',
      icon: Settings,
    },
  }

  const details = sectionDetails[section?.id] || sectionDetails.users
  const Icon = details.icon

  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">{details.eyebrow}</span>
          <h2>{section?.label}</h2>
          <p>{details.description}</p>
        </div>
        <div className="admin-welcome-art" aria-hidden="true">
          <Icon size={42} />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">{details.eyebrow}</span>
            <h2>{section?.label}</h2>
            <p>{details.description}</p>
          </div>
        </div>

        <div className="admin-overview-panel">
          <div className="admin-overview-icon">
            <Icon size={25} />
          </div>
          <div>
            <h3>{section?.label} data</h3>
            <p>{details.message}</p>
          </div>
        </div>
      </section>

      <section className="admin-panel-grid">
        <EmptyPanel
          eyebrow="BACKEND STATUS"
          title="Integration pending"
          icon={Icon}
          message={details.message}
        />
        <EmptyPanel
          eyebrow="NEXT STEP"
          title="Platform data"
          icon={Settings}
          message="This section will be connected to its backend API."
        />
      </section>

      {section?.id !== 'settings' && (
        <section className="admin-section">
          <div className="admin-section-heading compact">
            <div>
              <span className="admin-eyebrow">ADMIN TOOLS</span>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="admin-actions-grid">
            <ActionButton
              icon={LayoutDashboard}
              label="Return to Overview"
              description="View the platform summary"
              onClick={() => selectSection('overview')}
            />
            <ActionButton
              icon={Settings}
              label="Open Settings"
              description="Review administrative preferences"
              onClick={() => selectSection('settings')}
            />
          </div>
        </section>
      )}
    </>
  )
}


function UserManagementContent({ selectSection }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await apiRequest('/admin/users')
        setUsers(data.users || [])
      } catch (err) {
        setError(err.message || 'Unable to load users.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">USER ADMINISTRATION</span>
          <h2>User Management</h2>
          <p>View registered accounts across the CloudNexus platform.</p>
        </div>
        <div className="admin-welcome-art" aria-hidden="true">
          <Users size={42} />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">REGISTERED ACCOUNTS</span>
            <h2>All Users ({users.length})</h2>
            <p>Account details retrieved from your MongoDB database.</p>
          </div>
        </div>

        <div className="admin-panel admin-user-table-panel">
          {loading ? (
            <p className="admin-table-message">Loading users...</p>
          ) : error ? (
            <p className="admin-error">{error}</p>
          ) : users.length === 0 ? (
            <p className="admin-table-message">No registered users found.</p>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name || 'Unnamed User'}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`admin-role-badge ${user.role}`}>
                          {formatRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'Not available'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="admin-actions-grid">
        <ActionButton
          icon={Users}
          label="View Students"
          description="Open student management"
          onClick={() => selectSection('students')}
        />
        <ActionButton
          icon={UserCog}
          label="View Instructors"
          description="Open instructor management"
          onClick={() => selectSection('instructors')}
        />
      </section>
    </>
  )
}


function DirectoryManagementContent({
  endpoint,
  dataKey,
  title,
  description,
  eyebrow,
  icon: Icon,
  selectSection,
}) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRecords() {
      try {
        const data = await apiRequest(endpoint)
        setRecords(data[dataKey] || [])
      } catch (err) {
        setError(err.message || `Unable to load ${title.toLowerCase()}.`)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [endpoint, dataKey, title])

  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="admin-welcome-art" aria-hidden="true">
          <Icon size={42} />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">REGISTERED ACCOUNTS</span>
            <h2>{title} ({records.length})</h2>
            <p>Account records retrieved from MongoDB.</p>
          </div>
        </div>

        <div className="admin-panel admin-user-table-panel">
          {loading ? (
            <p className="admin-table-message">Loading accounts...</p>
          ) : error ? (
            <p className="admin-error">{error}</p>
          ) : records.length === 0 ? (
            <p className="admin-table-message">No accounts found.</p>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td>{record.name || 'Unnamed User'}</td>
                      <td>{record.email}</td>
                      <td>
                        <span className={`admin-role-badge ${record.role}`}>
                          {formatRoleLabel(record.role)}
                        </span>
                      </td>
                      <td>
                        {record.createdAt
                          ? new Date(record.createdAt).toLocaleDateString()
                          : 'Not available'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="admin-actions-grid">
        <ActionButton
          icon={LayoutDashboard}
          label="Return to Overview"
          description="View platform statistics"
          onClick={() => selectSection('overview')}
        />
        <ActionButton
          icon={Users}
          label="View All Users"
          description="Open user management"
          onClick={() => selectSection('users')}
        />
      </section>
    </>
  )
}


function SummaryCard({ icon: Icon, label, value, loading }) {
  return (
    <article className="admin-stat-card">
      <span className="admin-stat-icon">
        <Icon size={20} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{loading ? '...' : value ?? 0}</strong>
        <small>{loading ? 'Loading...' : 'Live platform data'}</small>
      </div>
    </article>
  )
}

function EmptyPanel({ eyebrow, title, icon: Icon, message }) {
  return (
    <article className="admin-panel">
      <div className="admin-section-heading compact">
        <div>
          <span className="admin-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="admin-panel-empty">
        <Icon size={24} />
        <strong>No data available yet</strong>
        <p>{message}</p>
      </div>
    </article>
  )
}

function ActionButton({ icon: Icon, label, description, onClick }) {
  return (
    <button type="button" className="admin-action" onClick={onClick}>
      <span className="admin-action-icon">
        <Icon size={19} />
      </span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <ChevronRight size={17} />
    </button>
  )
}

function LessonApprovalContent() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  async function loadLessons() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/admin/lessons')
      setLessons(Array.isArray(data.lessons) ? data.lessons : [])
    } catch (err) {
      setError(err.message || 'Unable to load lessons.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLessons()
  }, [])

  async function updateApproval(lesson, status) {
    try {
      setUpdatingId(lesson._id)
      setError('')
      setNotice('')
      const data = await apiRequest(`/admin/lessons/${lesson._id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      setLessons((currentLessons) =>
        currentLessons.map((currentLesson) =>
          currentLesson._id === lesson._id
            ? {
                ...currentLesson,
                approvalStatus: data.lesson?.approvalStatus || status,
                isPublished: data.lesson?.isPublished ?? currentLesson.isPublished
              }
            : currentLesson
        )
      )
      setNotice(data.message || `Lesson ${status} successfully.`)
    } catch (err) {
      setError(err.message || 'Unable to update lesson approval.')
    } finally {
      setUpdatingId('')
    }
  }

  const pendingCount = lessons.filter(
    (lesson) => !lesson.approvalStatus || lesson.approvalStatus === 'pending'
  ).length

  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">CONTENT MODERATION</span>
          <h2>Lesson Management</h2>
          <p>Review lessons submitted by instructors and approve or reject them before students can access them.</p>
        </div>
        <div className="admin-welcome-art" aria-hidden="true">
          <FileText size={42} />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">LESSON REVIEW QUEUE</span>
            <h2>All Lessons ({lessons.length})</h2>
            <p>{pendingCount} lesson{pendingCount === 1 ? '' : 's'} waiting for review.</p>
          </div>
          <button type="button" onClick={loadLessons} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {notice && <p className="admin-success" role="status">{notice}</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}

        <div className="admin-panel admin-user-table-panel">
          {loading ? (
            <p className="admin-table-message">Loading lessons...</p>
          ) : error && lessons.length === 0 ? (
            <p className="admin-table-message">Lessons could not be loaded. Check the error above.</p>
          ) : lessons.length === 0 ? (
            <p className="admin-table-message">No instructor lessons have been submitted yet.</p>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-user-table">
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => {
                    const status = lesson.approvalStatus || 'pending'
                    const instructor = lesson.courseDetails?.instructor

                    return (
                      <tr key={lesson._id}>
                        <td>
                          <strong>{lesson.title}</strong>
                          {lesson.description && (
                            <p className="admin-lesson-description">
                              {lesson.description}
                            </p>
                          )}
                        </td>
                        <td>{lesson.course || 'Course unavailable'}</td>
                        <td>
                          {instructor?.name || instructor?.email || 'Not available'}
                        </td>
                        <td>
                          {lesson.createdAt
                            ? new Date(lesson.createdAt).toLocaleDateString()
                            : 'Not available'}
                        </td>
                        <td>
                          <span className={`admin-role-badge ${status}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-lesson-actions">
                            <button
                              type="button"
                              onClick={() => updateApproval(lesson, 'approved')}
                              disabled={updatingId === lesson._id || status === 'approved'}
                            >
                              {updatingId === lesson._id ? 'Saving...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateApproval(lesson, 'rejected')}
                              disabled={updatingId === lesson._id || status === 'rejected'}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default AdminDashboard


function CourseManagementContent() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [price, setPrice] = useState('')
  const [savingId, setSavingId] = useState('')

  async function loadCourses() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/admin/courses')
      setCourses(data.courses || [])
    } catch (err) {
      setError(err.message || 'Unable to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  function startPricingEdit(course) {
    setEditingId(course._id)
    setIsPremium(Boolean(course.isPremium))
    setPrice(course.isPremium ? String(course.price || '') : '')
    setError('')
    setNotice('')
  }

  async function savePricing(course) {
    const numericPrice = Number(price)

    if (isPremium && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
      setError('Enter a valid price greater than ₹0 for a premium course.')
      return
    }

    try {
      setSavingId(course._id)
      setError('')
      setNotice('')

      const data = await apiRequest(`/admin/courses/${course._id}/pricing`, {
        method: 'PATCH',
        body: JSON.stringify({
          isPremium,
          price: isPremium ? numericPrice : 0
        })
      })

      setCourses((current) =>
        current.map((item) =>
          item._id === course._id
            ? { ...item, ...data.course }
            : item
        )
      )

      setEditingId('')
      setNotice(data.message || 'Course pricing updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update course pricing.')
    } finally {
      setSavingId('')
    }
  }

  async function togglePublish(course) {
    try {
      setError('')
      setNotice('')

      await apiRequest(`/admin/courses/${course._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !course.isPublished })
      })

      setNotice(
        course.isPublished
          ? 'Course unpublished successfully.'
          : 'Course published successfully.'
      )

      await loadCourses()
    } catch (err) {
      setError(err.message || 'Unable to update course status.')
    }
  }

  return (
    <section className="admin-user-table-panel">
      <div className="admin-section-heading">
        <div>
          <h2>Course Management</h2>
          <p>Manage course pricing, free or premium access, and publishing status.</p>
        </div>

        <button type="button" onClick={loadCourses} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {notice && (
        <p className="admin-success" role="status">{notice}</p>
      )}

      {error && (
        <p className="admin-error" role="alert">{error}</p>
      )}

      {loading ? (
        <p className="admin-table-message">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="admin-table-message">No courses have been created yet.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Instructor</th>
                <th>Pricing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <strong>{course.title}</strong>
                  </td>

                  <td>{course.category || 'General'}</td>

                  <td>{course.instructor?.name || 'Not assigned'}</td>

                  <td>
                    {editingId === course._id ? (
                      <div className="admin-pricing-editor">
                        <label>
                          <input
                            type="checkbox"
                            checked={isPremium}
                            onChange={(event) => {
                              setIsPremium(event.target.checked)
                              setError('')
                            }}
                          />
                          Premium course
                        </label>

                        {isPremium && (
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            placeholder="Price in ₹"
                            aria-label="Course price in rupees"
                          />
                        )}

                        <div className="admin-lesson-actions">
                          <button
                            type="button"
                            onClick={() => savePricing(course)}
                            disabled={savingId === course._id}
                          >
                            {savingId === course._id ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingId('')}
                            disabled={savingId === course._id}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <strong>
                          {course.isPremium
                            ? `₹${Number(course.price).toLocaleString('en-IN')}`
                            : 'Free'}
                        </strong>
                        <br />
                        <small>
                          {course.isPremium ? 'Premium access' : 'Free access'}
                        </small>
                      </div>
                    )}
                  </td>

                  <td>
                    <span className="admin-role-badge">
                      {course.isPublished ? 'Published' : 'Unpublished'}
                    </span>
                  </td>

                  <td>
                    <div className="admin-lesson-actions">
                      {editingId !== course._id && (
                        <button
                          type="button"
                          onClick={() => startPricingEdit(course)}
                        >
                          Edit Pricing
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => togglePublish(course)}
                        disabled={editingId === course._id}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

