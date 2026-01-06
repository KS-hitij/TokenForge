export default function TokenGrid() {
  const tokens = [
    { name: 'PEPE', symbol: 'PEPE', price: '$0.000001', change: '+245%' },
    { name: 'DOGE', symbol: 'DOGE', price: '$0.000045', change: '+89%' },
    { name: 'WIF', symbol: 'WIF', price: '$0.000003', change: '+156%' },
  ]

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Trending</h2>
          <a href="#" className="text-cyan-400 text-sm hover:underline">View all</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tokens.map((token) => (
            <div key={token.symbol} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {token.symbol[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{token.name}</h3>
                    <span className="text-gray-500 text-xs">{token.symbol}</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {token.change}
                </span>
              </div>
              <p className="text-white font-mono text-lg">{token.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

