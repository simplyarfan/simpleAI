import Head from 'next/head';
import Link from 'next/link';
import ScrollStack, { ScrollStackItem } from '../components/reactbits/ScrollStack';
import TiltedCard from '../components/reactbits/TiltedCard';
import DotGrid from '../components/backgrounds/DotGrid';

export default function ProductTour() {
  return (
    <>
      <Head>
        <title>Product Tour - Nexus AI Platform</title>
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

        {/* Hero */}
        <div className="relative z-10 pt-32 pb-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-6xl font-bold mb-6">
              Discover <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Nexus</span>
            </h1>
            <p className="text-xl text-gray-300">
              Scroll to explore how our AI agents transform your business
            </p>
          </div>
        </div>

        {/* Scroll Stack Features */}
        <div className="relative z-10">
          <div className="max-w-5xl mx-auto px-6">
            <ScrollStack>
              <ScrollStackItem>
                <TiltedCard containerHeight="400px" containerWidth="100%">
                  <div className="p-8">
                    <h2 className="text-4xl font-bold mb-4">CV Intelligence</h2>
                    <p className="text-xl text-gray-300 mb-6">
                      Screen 100 CVs in seconds with AI-powered candidate ranking
                    </p>
                    <ul className="space-y-3 text-gray-400">
                      <li>✓ Automatic skill matching</li>
                      <li>✓ Experience analysis</li>
                      <li>✓ Cultural fit scoring</li>
                      <li>✓ Interview scheduling</li>
                    </ul>
                  </div>
                </TiltedCard>
              </ScrollStackItem>

              <ScrollStackItem>
                <TiltedCard containerHeight="400px" containerWidth="100%">
                  <div className="p-8">
                    <h2 className="text-4xl font-bold mb-4">Invoice Processor</h2>
                    <p className="text-xl text-gray-300 mb-6">
                      Extract data instantly with automated fraud detection
                    </p>
                    <ul className="space-y-3 text-gray-400">
                      <li>✓ Real-time processing</li>
                      <li>✓ Fraud detection</li>
                      <li>✓ Automated validation</li>
                      <li>✓ CFO-level insights</li>
                    </ul>
                  </div>
                </TiltedCard>
              </ScrollStackItem>

              <ScrollStackItem>
                <TiltedCard containerHeight="400px" containerWidth="100%">
                  <div className="p-8">
                    <h2 className="text-4xl font-bold mb-4">Lead Generator</h2>
                    <p className="text-xl text-gray-300 mb-6">
                      24/7 automated lead discovery and qualification
                    </p>
                    <ul className="space-y-3 text-gray-400">
                      <li>✓ Continuous lead discovery</li>
                      <li>✓ Smart qualification</li>
                      <li>✓ CRM integration</li>
                      <li>✓ Revenue optimization</li>
                    </ul>
                  </div>
                </TiltedCard>
              </ScrollStackItem>

              <ScrollStackItem>
                <TiltedCard containerHeight="400px" containerWidth="100%">
                  <div className="p-8 text-center">
                    <h2 className="text-5xl font-bold mb-6">Ready to Start?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                      Join thousands of businesses automating with AI
                    </p>
                    <Link href="/signup">
                      <button className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
                        Get Started Free
                      </button>
                    </Link>
                  </div>
                </TiltedCard>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </div>
    </>
  );
}
