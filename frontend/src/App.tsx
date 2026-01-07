import Navbar from './components/Navbar'
import Dashboard from './Dashboard'
import Footer from './components/Footer'
import Home from './Home'
import { Route, Routes } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-linear-to-b flex flex-col justify-between from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App

