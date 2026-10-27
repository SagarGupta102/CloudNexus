import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="badge">YOUR CLOUD LEARNING JOURNEY</span>

            <h1>
              Learn Skills.
              <br />
              Build Your <span>Future.</span>
            </h1>

            <p>
              Learn cloud computing, Linux, Python, and databases
              through simple lessons, practical examples, and quizzes.
            </p>

            <div className="hero-buttons">
              <a href="#courses" className="primary-btn">
                Explore Courses →
              </a>
              <a href="#about" className="secondary-btn">
                Learn More
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <h3>4+</h3>
                <p>Learning Paths</p>
              </div>
              <div>
                <h3>Beginner</h3>
                <p>Friendly Content</p>
              </div>
              <div>
                <h3>Learn</h3>
                <p>At Your Pace</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="cloud-card">
              <div className="cloud-symbol">☁️</div>
              <h2>Welcome to CloudNexus</h2>
              <p>Learn. Practice. Grow.</p>

              <div className="learning-item">
                <span>☁️</span>
                <div>
                  <strong>Cloud Computing</strong>
                  <small>Explore cloud technology</small>
                </div>
              </div>

              <div className="learning-item">
                <span>🐧</span>
                <div>
                  <strong>Linux Fundamentals</strong>
                  <small>Learn essential commands</small>
                </div>
              </div>

              <div className="learning-item">
                <span>🐍</span>
                <div>
                  <strong>Python Programming</strong>
                  <small>Start coding step by step</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="courses" id="courses">
          <div className="section-heading">
            <span className="badge">START LEARNING TODAY</span>
            <h2>Explore Your Learning Paths</h2>
            <p>Build your IT foundation one skill at a time.</p>
          </div>

          <div className="course-grid">
            <article className="course-card">
              <div className="course-icon">☁️</div>
              <h3>Cloud Computing</h3>
              <p>
                Understand cloud concepts, AWS services, and cloud
                infrastructure from the basics.
              </p>
              <a href="/courses/cloud-computing">Explore Path →</a>
            </article>

            <article className="course-card">
              <div className="course-icon">🐧</div>
              <h3>Linux</h3>
              <p>
                Practice Linux commands, file management, permissions,
                and essential system operations.
              </p>
              <a href="/courses/linux">Explore Path →</a>
            </article>

            <article className="course-card">
              <div className="course-icon">🐍</div>
              <h3>Python</h3>
              <p>
                Learn variables, conditions, loops, functions, and
                programming through practical examples.
              </p>
              <a href="/courses/python">Explore Path →</a>
            </article>

            <article className="course-card">
              <div className="course-icon">🗄️</div>
              <h3>Database</h3>
              <p>
                Understand how databases store, organize, and manage
                information.
              </p>
              <a href="/courses/database">Explore Path →</a>
            </article>
          </div>
        </section>

        <section className="about" id="about">
          <h2>Your Journey Starts Here</h2>
          <p>
            Learn new concepts, practice your skills, and grow your
            confidence with CloudNexus.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home