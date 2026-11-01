import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function Certificate() {
  const { certificateId } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/certificates/verify/${encodeURIComponent(certificateId)}`)
      .then((data) => setCertificate(data.certificate))
      .catch((err) => setError(err.message || 'Unable to load certificate.'))
  }, [certificateId])

  if (error) {
    return (
      <main className="certificate-page">
        <p role="alert">{error}</p>
        <Link to="/student/dashboard">Back to dashboard</Link>
      </main>
    )
  }

  if (!certificate) {
    return <main className="certificate-page">Loading certificate...</main>
  }

  return (
    <main className="certificate-page">
      <div className="certificate-actions">
        <Link to="/student/dashboard">Back to dashboard</Link>
        <button type="button" onClick={() => window.print()}>
          Print certificate
        </button>
      </div>

      <article className="certificate-card">
        <span className="certificate-mark">✦</span>
        <p className="certificate-brand">CLOUD<span>NEXUS</span> LMS</p>
        <p className="certificate-eyebrow">CERTIFICATE OF COMPLETION</p>
        <h1>This certifies that</h1>
        <h2>{certificate.learner?.name}</h2>
        <p>has successfully completed</p>
        <h3>{certificate.course?.title}</h3>
        <p className="certificate-issued">
          Issued {new Date(certificate.issuedAt).toLocaleDateString()}
        </p>
        <p className="certificate-id">Certificate ID: {certificate.certificateId}</p>
      </article>
    </main>
  )
}

export default Certificate
