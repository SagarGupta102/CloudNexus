import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest, saveSession } from '../lib/api'

function Auth({ register = false }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const data = await apiRequest(
        `/auth/${register ? 'register' : 'login'}`,
        {
          method: 'POST',
          body: JSON.stringify(form),
        }
      )

      if (register) {
  navigate('/login?registered=1', { replace: true })
  return
}

      saveSession(data)

      navigate(params.get('next') || '/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app auth-layout">
      <Navbar />

      <main className="auth-main">
        {/* Left: Branding and illustration */}
        <section className="auth-visual-panel">
          <div className="auth-visual-content">
            <span className="auth-welcome-badge">
              <span>✦</span> LEARN. BUILD. GROW.
            </span>

            <h1>
              Your next skill
              <br />
              starts <span>here.</span>
            </h1>

            <p className="auth-visual-description">
              Build your IT foundation with structured learning paths,
              practical examples, and lessons designed to help you grow
              with confidence.
            </p>

            <div className="auth-learning-illustration">
              <div className="auth-art-circle auth-art-circle-one" />
              <div className="auth-art-circle auth-art-circle-two" />

              <div className="auth-art-window">
                <div className="auth-art-window-header">
                  <span />
                  <span />
                  <span />
                  <small>YOUR LEARNING SPACE</small>
                </div>

                <div className="auth-art-window-content">
                  <div className="auth-art-icon">
                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M18 43H46C52 43 56 39 56 33C56 27 51 23 45 23C43 15 36 10 28 12C21 13 17 19 16 26C9 26 5 30 5 35C5 40 10 43 18 43Z"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M32 30V53M24 45L32 53L40 45"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="auth-art-title">
                    <strong>CloudNexus LMS</strong>
                    <small>Your journey to new skills</small>
                  </div>

                  <div className="auth-art-progress">
                    <div className="auth-art-progress-label">
                      <span>Learning journey</span>
                      <strong>Keep going!</strong>
                    </div>

                    <div className="auth-art-progress-track">
                      <span />
                    </div>
                  </div>

                  <div className="auth-art-subjects">
                    <span>☁ Cloud</span>
                    <span>⌘ Linux</span>
                    <span>Py Python</span>
                  </div>
                </div>
              </div>

              <div className="auth-art-floating auth-art-floating-top">
                <span className="auth-art-floating-icon green">✓</span>
                <div>
                  <strong>Keep learning</strong>
                  <small>One step at a time</small>
                </div>
              </div>

              <div className="auth-art-floating auth-art-floating-bottom">
                <span className="auth-art-floating-icon purple">✦</span>
                <div>
                  <strong>Build your future</strong>
                  <small>Skills for tomorrow</small>
                </div>
              </div>
            </div>

            <div className="auth-visual-benefits">
              <div>
                <span>✓</span>
                Beginner-friendly lessons
              </div>

              <div>
                <span>✓</span>
                Learn at your own pace
              </div>

              <div>
                <span>✓</span>
                Track your progress
              </div>
            </div>
          </div>
        </section>

        {/* Right: Login or registration form */}
        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-form-heading">
              <span className="auth-form-eyebrow">
                {register ? 'JOIN OUR LEARNING COMMUNITY' : 'WELCOME BACK'}
              </span>

              <h2>
                {register ? 'Create your account' : 'Welcome back!'}
              </h2>

              <p>
                {register
                  ? 'Start your learning journey with CloudNexus.'
                  : 'Sign in to continue where you left off.'}
              </p>
            </div>

            {!register && params.get('registered') === '1' && (
  <div className="auth-success-message" role="status">
    Account created successfully! Please sign in to continue.
  </div>
)}

            <form className="auth-modern-form" onSubmit={submit}>
              {register && (
                <label className="auth-field">
                  <span>Full name</span>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </label>
              )}

              <label className="auth-field">
                <span>Email address</span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>

              <label className="auth-field">
                <span>Password</span>

                <input
                  type="password"
                  name="password"
                  placeholder={
                    register
                      ? 'Create a password (8+ characters)'
                      : 'Enter your password'
                  }
                  autoComplete={
                    register ? 'new-password' : 'current-password'
                  }
                  minLength={register ? 8 : undefined}
                  required
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
              </label>

              {error && (
                <div className="auth-error-message" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button
                className="auth-submit-button"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? 'Please wait...'
                  : register
                    ? 'Create account'
                    : 'Sign in'}

                {!busy && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="auth-form-divider">
              <span />
              <small>YOUR LEARNING JOURNEY</small>
              <span />
            </div>

            <p className="auth-switch">
              {register
                ? 'Already have an account?'
                : "Don't have an account yet?"}

              {' '}

              <Link to={register ? '/login' : '/register'}>
                {register ? 'Sign in' : 'Create an account'}
              </Link>
            </p>

            <div className="auth-security-note">
              <span aria-hidden="true">✓</span>
              Secure access to your CloudNexus learning account
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export function Login() {
  return <Auth />
}

export function Register() {
  return <Auth register />
}