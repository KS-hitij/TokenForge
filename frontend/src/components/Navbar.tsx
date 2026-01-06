import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold text-white">TokenForge</span>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton  />
        </div>
      </div>
    </nav>
  )
}

