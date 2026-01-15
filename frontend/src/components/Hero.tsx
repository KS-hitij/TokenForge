export default function Hero() {
  return (
    <section className="pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-white">Create tokens in</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">seconds</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Deploy EVM tokens with fair launches. No code required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/create">
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
              Create Token
            </button>
          </a>
          <a href="/dashboard"><button className="px-8 py-3 bg-gray-800 text-white font-medium rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            Browse
          </button></a>
        </div>
      </div>
    </section>
  )
}

