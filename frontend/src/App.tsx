import Navbar from './components/Navbar'
import Dashboard from './Dashboard'
import Footer from './components/Footer'
import Home from './Home'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Create from './Create'
import MyCoins from './MyCoins'

function App() {
  return (
    <div className="min-h-screen bg-linear-to-b w-full flex flex-col justify-between from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<Create />} />
        <Route path="/mycoins" element={<MyCoins />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App

