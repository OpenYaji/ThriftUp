export default function Footer() {
  return (
    <footer className="bg-[color:var(--color-text)] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-secondary)] rounded" />
              ThriftUp
            </h3>
            <p className="text-gray-400 text-sm">Revolutionizing circular fashion through community-driven commerce.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Browse Listings
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Active Auctions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Sell Items
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Thrift-Meet Events
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Discussions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Leaderboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 ThriftUp. All rights reserved. Building the circular fashion revolution.</p>
        </div>
      </div>
    </footer>
  )
}
