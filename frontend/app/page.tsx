import Link from 'next/link'
import { FiPlay, FiBookmark, FiTrendingUp } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-500">
            Dhugaa Media
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/content" className="hover:text-primary-400 transition">Content</Link>
            <Link href="/news" className="hover:text-primary-400 transition">News</Link>
            <Link href="/subscriptions" className="hover:text-primary-400 transition">Subscribe</Link>
            <Link href="/login" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 border border-primary-600 hover:bg-primary-600 rounded-lg transition">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Welcome to <span className="text-primary-500">Dhugaa Media</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Your premier destination for authentic Oromo content. Watch shows, read news, and stay connected with your culture.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/register" 
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 rounded-lg text-lg font-semibold transition flex items-center gap-2"
          >
            <FiPlay className="w-5 h-5" />
            Get Started
          </Link>
          <Link 
            href="/content" 
            className="px-8 py-4 border border-gray-700 hover:border-primary-600 rounded-lg text-lg font-semibold transition"
          >
            Browse Content
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <FiPlay className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
            <p className="text-gray-400">
              Access high-quality shows, documentaries, and entertainment in HD
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <FiBookmark className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Latest News</h3>
            <p className="text-gray-400">
              Stay informed with breaking news and stories from the Oromo community
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <FiTrendingUp className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multiple Tiers</h3>
            <p className="text-gray-400">
              Choose from Free, Premium, Pro, or Enterprise plans to suit your needs
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 Dhugaa Media. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/about" className="text-gray-400 hover:text-white transition">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

