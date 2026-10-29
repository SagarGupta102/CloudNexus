import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const courses = [
  {
    title: 'Cloud Computing',
    category: 'CLOUD TECHNOLOGY',
    description:
      'Explore cloud concepts, AWS services, and modern cloud infrastructure.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    level: 'Beginner',
    lessons: 'Cloud learning path',
    icon: '☁',
    color: 'blue',
    link: '/courses/cloud-computing',
  },
  {
    title: 'Linux Fundamentals',
    category: 'OPERATING SYSTEMS',
    description:
      'Learn Linux commands, file management, permissions, and system basics.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    level: 'Beginner',
    lessons: 'Linux learning path',
    icon: '⌘',
    color: 'purple',
    link: '/courses',
  },
  {
    title: 'Python Programming',
    category: 'PROGRAMMING',
    description:
      'Understand programming fundamentals with examples and practical exercises.',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
    level: 'Beginner',
    lessons: 'Python learning path',
    icon: 'Py',
    color: 'green',
    link: '/courses',
  },
  {
    title: 'Networking Basics',
    category: 'NETWORKING',
    description:
      'Discover IP addresses, networking concepts, protocols, and connectivity.',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    level: 'Beginner',
    lessons: 'Networking learning path',
    icon: '↗',
    color: 'orange',
    link: '/courses',
  },
]

const features = [
  {
    icon: '▤',
    title: 'Learn at Your Pace',
    description:
      'Study clear explanations and follow a learning path that suits your schedule.',
  },
  {
    icon: '✓',
    title: 'Practice as You Learn',
    description:
      'Test your understanding with quizzes and practical exercises along the way.',
  },
  {
    icon: '↗',
    title: 'Track Your Progress',
    description:
      'See your learning activity, completed lessons, and personal milestones.',
  },
  {
    icon: '★',
    title: 'Celebrate Achievements',
    description:
      'Work towards completing courses and earning certificates when available.',
  },
]

function Home() {
    const location = useLocation()

  useEffect(() => {
    if (location.hash === '#about') {
      const timer = window.setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)

      return () => window.clearTimeout(timer)
    }
  }, [location.hash])
  return (
    <div className="landing-page">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <div className="landing-hero-content">
              <span className="landing-eyebrow">
                ✦ YOUR NEXT CHAPTER STARTS HERE
              </span>

              <h1>
                Learn Skills.
                <br />
                Build Your <span>Future.</span>
              </h1>

              <p className="landing-hero-description">
                Build your IT foundation with beginner-friendly lessons,
                practical examples, and interactive learning experiences.
                Start learning cloud computing, Linux, Python, and more.
              </p>

              <div className="landing-hero-actions">
                <Link to="/courses" className="landing-primary-button">
                  Explore Courses <span aria-hidden="true">→</span>
                </Link>

                <Link to="/register" className="landing-secondary-button">
                  Start Learning
                </Link>
              </div>

              <div className="landing-trust">
                <div className="landing-avatar-stack" aria-hidden="true">
                  <span>A</span>
                  <span>L</span>
                  <span>P</span>
                  <span>+</span>
                </div>

                <div>
                  <strong>Start your learning journey</strong>
                  <small>One skill. One lesson. One step forward.</small>
                </div>
              </div>

              <div className="landing-quick-stats">
                <div>
                  <strong>7</strong>
                  <span>Learning paths</span>
                </div>

                <div>
                  <strong>Beginner</strong>
                  <span>Friendly lessons</span>
                </div>

                <div>
                  <strong>Learn</strong>
                  <span>At your own pace</span>
                </div>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="landing-hero-visual">
              <div className="landing-hero-orb landing-hero-orb-one" />
              <div className="landing-hero-orb landing-hero-orb-two" />

              <div className="landing-main-image">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=85"
                  alt="Students learning together"
                />

                <div className="landing-image-caption">
                  <span className="landing-caption-icon">✦</span>
                  <div>
                    <strong>Your future starts with learning</strong>
                    <small>Learn. Build. Grow.</small>
                  </div>
                </div>
              </div>

              <div className="landing-floating-card landing-float-top">
                <span className="landing-floating-icon">✓</span>
                <div>
                  <strong>Keep progressing</strong>
                  <small>One lesson at a time</small>
                </div>
              </div>

              <div className="landing-floating-card landing-float-bottom">
                <span className="landing-floating-icon purple">↗</span>
                <div>
                  <strong>Build real skills</strong>
                  <small>Learn through practice</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COURSE SECTION */}
        <section className="landing-courses" id="courses">
          <div className="landing-section-heading">
            <span className="landing-eyebrow">EXPLORE & DISCOVER</span>

            <h2>
              Find Your Next <span>Learning Path</span>
            </h2>

            <p>
              Start with the fundamentals and gradually build skills for
              your IT journey.
            </p>
          </div>

          <div className="landing-course-grid">
            {courses.map((course) => (
              <article className="landing-course-card" key={course.title}>
                <Link
                  to={course.link}
                  className="landing-course-image"
                  aria-label={`Explore ${course.title}`}
                >
                  <img src={course.image} alt="" loading="lazy" />

                  <span className={`landing-course-icon ${course.color}`}>
                    {course.icon}
                  </span>

                  <span className="landing-level-badge">
                    {course.level}
                  </span>
                </Link>

                <div className="landing-course-body">
                  <span className="landing-course-category">
                    {course.category}
                  </span>

                  <h3>
                    <Link to={course.link}>{course.title}</Link>
                  </h3>

                  <p>{course.description}</p>

                  <div className="landing-course-meta">
                    <span>▤ &nbsp;{course.lessons}</span>
                    <span>◷ &nbsp;Self-paced</span>
                  </div>

                  <Link to={course.link} className="landing-course-link">
                    Explore Path <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="landing-all-courses">
            <Link to="/courses" className="landing-outline-button">
              View All Courses <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="landing-features" id="about">
          <div className="landing-section-heading">
            <span className="landing-eyebrow">A BETTER WAY TO LEARN</span>

            <h2>
              Learning That Moves You <span>Forward</span>
            </h2>

            <p>
              Build knowledge, practise consistently, and see your progress
              as you move through your learning journey.
            </p>
          </div>

          <div className="landing-feature-grid">
            {features.map((feature, index) => (
              <article className="landing-feature-card" key={feature.title}>
                <div className={`landing-feature-icon feature-${index + 1}`}>
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="landing-cta">
          <div className="landing-cta-content">
            <span className="landing-cta-label">YOUR JOURNEY STARTS NOW</span>

            <h2>Small Steps Today. Bigger Possibilities Tomorrow.</h2>

            <p>
              Create your account and take the next step towards your IT
              learning goals.
            </p>

            <Link to="/register" className="landing-cta-button">
              Get Started <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="landing-cta-decoration" aria-hidden="true">
            <span>✦</span>
            <span>＋</span>
            <span>◈</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home