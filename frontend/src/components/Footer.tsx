export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-gray-800  bottom-0  w-full">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">T</span>
          </div>
          <span className="text-gray-400 text-sm">TokenForge</span>
        </div>
        <p className="text-gray-500 text-sm">© 2024 TokenForge</p>
      </div>
    </footer>
  )
}

