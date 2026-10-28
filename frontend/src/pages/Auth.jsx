import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest, saveSession } from '../lib/api'

function Auth({ register = false }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await apiRequest(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(form) })
      saveSession(data)
      navigate(params.get('next') || '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <div className="app"><Navbar /><main className="auth-page">
    <form className="auth-card" onSubmit={submit}>
      <span className="badge">{register ? 'JOIN CLOUDNEXUS' : 'WELCOME BACK'}</span>
      <h1>{register ? 'Create your learner account' : 'Sign in to continue learning'}</h1>
      {register && <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}
      <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-btn" disabled={busy}>{busy ? 'Please wait...' : register ? 'Create account' : 'Sign in'}</button>
      <p>{register ? 'Already have an account?' : 'New to CloudNexus?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create one'}</Link></p>
    </form>
  </main><Footer /></div>
}

export function Login() { return <Auth /> }
export function Register() { return <Auth register /> }
