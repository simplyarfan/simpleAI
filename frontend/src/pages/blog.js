import Head from 'next/head';
import Link from 'next/link';
import InfiniteScroll from '../components/reactbits/InfiniteScroll';
import DotGrid from '../components/backgrounds/DotGrid';

export default function Blog() {
  const blogPosts = [
    {
      title: 'The Future of AI Automation',
      excerpt: 'How AI agents are transforming business operations across industries...',
      date: 'October 1, 2025',
      category: 'AI Trends'
    },
    {
      title: '10 Ways to Optimize Your Hiring Process',
      excerpt: 'Learn how CV Intelligence can reduce your time-to-hire by 80%...',
      date: 'September 28, 2025',
      category: 'HR Tech'
    },
    {
      title: 'Detecting Invoice Fraud with AI',
      excerpt: 'Discover how our AI catches fraudulent invoices before they cost you...',
      date: 'September 25, 2025',
      category: 'Finance'
    },
    {
      title: 'Lead Generation in 2025',
      excerpt: 'The complete guide to automated lead discovery and qualification...',
      date: 'September 20, 2025',
      category: 'Sales'
    },
    {
      title: 'Building Trust with AI',
      excerpt: 'How to implement AI while maintaining transparency and ethics...',
      date: 'September 15, 2025',
      category: 'Best Practices'
    },
    {
      title: 'ROI of AI Automation',
      excerpt: 'Calculate the real return on investment from AI agents...',
      date: 'September 10, 2025',
      category: 'Business Strategy'
    }
  ];

  const blogCards = blogPosts.map((post, index) => (
    <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
      <span className="text-sm text-orange-500 font-semibold">{post.category}</span>
      <h3 className="text-2xl font-bold mt-2 mb-3">{post.title}</h3>
      <p className="text-gray-400 mb-4">{post.excerpt}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{post.date}</span>
        <button className="text-orange-500 hover:text-orange-400 font-semibold">
          Read More →
        </button>
      </div>
    </div>
  ));

  return (
    <>
      <Head>
        <title>Blog - Nexus AI Platform</title>
      </Head>

      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <DotGrid 
          dotSize={1.5}
          dotColor="#f97316"
          spacing={40}
          glowRadius={200}
          maxGlowSize={6}
        />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg"></div>
                <span className="text-xl font-bold">Nexus</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-6xl font-bold text-center mb-4">
              Latest <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Insights</span>
            </h1>
            <p className="text-xl text-gray-300 text-center mb-16">
              Stay updated with AI automation trends and best practices
            </p>

            {/* Infinite Scroll Blog Posts */}
            <InfiniteScroll 
              items={blogCards}
              autoplay={true}
              autoplaySpeed={0.3}
              pauseOnHover={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
