import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest, getSession } from '../lib/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function uploadMedia(file, targetType, targetId, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('targetType', targetType)
    formData.append('targetId', targetId)
    formData.append('file', file)

    request.open('POST', `${API_URL}/media/upload`)
    request.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('cloudnexus_token') || ''}`)
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    })
    request.addEventListener('load', () => {
      const data = JSON.parse(request.responseText || '{}')
      if (request.status >= 200 && request.status < 300) resolve(data)
      else reject(new Error(data.message || 'Media upload failed.'))
    })
    request.addEventListener('error', () => reject(new Error('Network error while uploading media.')))
    request.send(formData)
  })
}

function MediaManager() {
  const session = getSession()
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState(null)
  const [targetType, setTargetType] = useState('course')
  const [courseId, setCourseId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    apiRequest('/courses').then((data) => setCourses(data.courses)).catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!courseId) {
      return
    }
    apiRequest(`/courses/${courses.find((item) => item._id === courseId)?.slug || ''}`)
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message))
  }, [courseId, courses])

  if (!session || !['admin', 'instructor'].includes(session.role)) {
    return <Navigate to="/login?next=/manage-media" replace />
  }

  function chooseType(event) {
    setTargetType(event.target.value)
    setCourseId('')
    setLessonId('')
    setFile(null)
    setStatus('')
    setError('')
  }

  function chooseTarget(event) {
    setLessonId(event.target.value)
    setFile(null)
    setStatus('')
    setError('')
  }

  function chooseFile(event) {
    const selected = event.target.files?.[0]
    if (!selected) return
    const image = targetType === 'course'
    const allowed = image
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowed.includes(selected.type)) {
      setFile(null)
      setError(image ? 'Choose a JPG, PNG, or WebP image.' : 'Choose an MP4, WebM, or QuickTime video.')
      return
    }
    if (selected.size > 250 * 1024 * 1024) {
      setFile(null)
      setError('Files must be 250 MB or smaller.')
      return
    }
    setError('')
    setStatus('')
    setFile(selected)
  }

  async function submit(event) {
    event.preventDefault()
    const targetId = targetType === 'course' ? courseId : lessonId
    if (!targetId || !file) {
      setError('Choose a target and a file first.')
      return
    }
    setBusy(true)
    setProgress(0)
    setStatus('')
    setError('')
    try {
      const data = await uploadMedia(file, targetType, targetId, setProgress)
      setStatus(data.message)
      setFile(null)
      event.target.reset()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const lessons = course?.lessons || []

  return <div className="app">
    <Navbar />
    <main className="media-page">
      <div className="section-heading">
        <span className="badge">INSTRUCTOR MEDIA</span>
        <h1>Manage course media</h1>
        <p>Upload course thumbnails and Cloudinary-hosted lesson videos securely.</p>
      </div>
      <form className="media-card" onSubmit={submit}>
        <label>Media type
          <select value={targetType} onChange={chooseType}>
            <option value="course">Course thumbnail</option>
            <option value="lesson">Lesson video</option>
          </select>
        </label>
        <label>Course
          <select value={courseId} onChange={(event) => {
            setCourseId(event.target.value)
            setLessonId('')
            setFile(null)
            setStatus('')
            setError('')
            apiRequest(`/courses/${courses.find((item) => item._id === event.target.value)?.slug || ''}`).then((data) => setCourse(data.course)).catch((err) => setError(err.message))
          }} required>
            <option value="">Select a course</option>
            {courses.map((item) => <option value={item._id} key={item._id}>{item.title}</option>)}
          </select>
        </label>
        {targetType === 'lesson' && <label>Lesson
          <select value={lessonId} onChange={chooseTarget} required>
            <option value="">Select a lesson</option>
            {lessons.map((lesson) => <option value={lesson._id} key={lesson._id}>{lesson.title}</option>)}
          </select>
        </label>}
        <label>{targetType === 'course' ? 'Thumbnail image' : 'Lesson video'}
          <input type="file" accept={targetType === 'course' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm,video/quicktime'} onChange={chooseFile} required />
        </label>
        {file && <p className="upload-file">{file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB</p>}
        {busy && <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>}
        {busy && <small>Uploading {progress}%</small>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {status && <p className="upload-success" role="status">{status}</p>}
        <button className="primary-btn" disabled={busy}>{busy ? 'Uploading...' : 'Upload media'}</button>
      </form>
    </main>
    <Footer />
  </div>
}

export default MediaManager
