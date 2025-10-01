import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Threads from '../components/reactbits/Threads';
import Particles from '../components/reactbits/Particles';
import Aurora from '../components/reactbits/Aurora';
import Prism from '../components/reactbits/Prism';

export default function Showcase() {
  const [activeBackground, setActiveBackground] = useState('threads');

  const backgrounds = {
    threads: <Threads amplitude={1} distance={0} enableMouseInteraction={true} />,
    particles: <Particles particleCount={200} speed={0.1} moveParticlesOnHover={true} />,
    aurora: <Aurora colorStops={['#3A29FF', '#FF94BA', '#FF3232']} speed={0.5} />,
    prism: <Prism animationType="rotate" timeScale={0.5} />
  };

  return (
    <>
      <Head>
        <title>Background Showcase - Nexus</title>
      </Head>

      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {backgrounds[activeBackground]}

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
              Background <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Showcase</span>
            </h1>
            <p className="text-xl text-gray-300 text-center mb-16">
              Experience our stunning animated backgrounds
            </p>

            {/* Background Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
              {['threads', 'particles', 'aurora', 'prism'].map((bg) => (
                <button
                  key={bg}
                  onClick={() => setActiveBackground(bg)}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeBackground === bg
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl shadow-orange-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {bg.charAt(0).toUpperCase() + bg.slice(1)}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-4">
                {activeBackground.charAt(0).toUpperCase() + activeBackground.slice(1)} Background
              </h2>
              <p className="text-gray-400">
                {activeBackground === 'threads' && 'Flowing thread lines that respond to your mouse movements. Perfect for creating dynamic, interactive experiences.'}
                {activeBackground === 'particles' && 'Floating particles that move away from your cursor. Creates a cosmic, ethereal atmosphere.'}
                {activeBackground === 'aurora' && 'Northern lights inspired gradient animation. Smooth, colorful waves that create a mesmerizing effect.'}
                {activeBackground === 'prism' && 'Rotating prismatic colors in a circular pattern. Hypnotic and visually striking.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
