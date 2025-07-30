import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import EnterTheBoxPage from './pages/EnterTheBoxPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/enter-the-box" element={<EnterTheBoxPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
