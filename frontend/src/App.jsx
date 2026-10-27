import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CloudComputing from './pages/CloudComputing'
import CloudLesson from './pages/CloudLesson'
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
      </Routes>
    </BrowserRouter>
  )
}

export default App