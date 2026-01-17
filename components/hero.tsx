export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-secondary to-primary py-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Discover Rare Vintage Fashion</h1>
        <p className="text-xl md:text-2xl mb-8 text-black max-w-2xl mx-auto text-balance">
          Connect with collectors, bid on exclusive pieces, and join thrift-meet events in the circular fashion
          revolution.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:opacity-90 transition">
            Explore Marketplace
          </button>
          <button className="px-8 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition border border-white">
            Join Community
          </button>
        </div>
      </div>
    </section>
  )
}
