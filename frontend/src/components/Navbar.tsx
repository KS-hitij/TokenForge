import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-2 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <a href="/"><span className="text-xl font-bold text-white cursor-pointer">TokenForge</span></a>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton showBalance={true} />
          <a href="mycoins"><button type='button' className="px-8 py-3 bg-gray-800 text-white font-medium rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            My Coins</button>
          </a>
        </div>
      </div>
    </nav>
  )
}

