import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CloudComputing from './pages/CloudComputing'
import CloudLesson from './pages/CloudLesson'
import Courses from './pages/Courses'
import Dashboard from './pages/Dashboard'
import { Login, Register } from './pages/Auth'
import MediaManager from './pages/MediaManager'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/courses/cloud-computing"
          element={<CloudComputing />}
        />

        <Route
          path="/courses/cloud-computing/:slug"
          element={<CloudLesson />}
        />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CloudComputing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/manage-media" element={<MediaManager />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App