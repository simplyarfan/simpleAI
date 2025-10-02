import { useState } from 'react';
import Head from 'next/head';
import StaggeredMenu from '../components/reactbits/StaggeredMenu';
import Aurora from '../components/reactbits/Aurora';
import SplitText from '../components/reactbits/SplitText';
import BlurText from '../components/reactbits/BlurText';
import RotatingText from '../components/reactbits/RotatingText';
import LogoLoop from '../components/reactbits/LogoLoop';
import Cubes from '../components/reactbits/Cubes';
import InfiniteScroll from '../components/reactbits/InfiniteScroll';
import { Star } from 'lucide-react';

export default function TestComponents() {
  return (
    <>
      <Head>
        <title>React Bits Components Test</title>
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* StaggeredMenu Test */}
        <div style={{ height: '100vh', background: '#1a1a1a' }}>
          <StaggeredMenu
            position="right"
            items={[
              { label: 'Home', link: '/', ariaLabel: 'Go to home page' },
              { label: 'About', link: '/about', ariaLabel: 'Learn about us' },
              { label: 'Services', link: '/services', ariaLabel: 'View our services' },
              { label: 'Contact', link: '/contact', ariaLabel: 'Get in touch' }
            ]}
            socialItems={[
              { label: 'Twitter', link: 'https://twitter.com' },
              { label: 'GitHub', link: 'https://github.com' },
              { label: 'LinkedIn', link: 'https://linkedin.com' }
            ]}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#fff"
            openMenuButtonColor="#fff"
            changeMenuColorOnOpen={true}
            colors={['#B19EEF', '#5227FF']}
            logoUrl="/path-to-your-logo.svg"
            accentColor="#ff6b6b"
            onMenuOpen={() => console.log('Menu opened')}
            onMenuClose={() => console.log('Menu closed')}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-4">React Bits Components Test</h1>
              <p className="text-xl text-gray-400">Click the menu button in the top-right corner</p>
            </div>
          </div>
        </div>

        {/* Aurora Test */}
        <section className="relative h-screen flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Aurora 
              colorStops={["#ef4444", "#f97316", "#eab308"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>
          <div className="relative z-10 text-center">
            <h2 className="text-5xl font-bold mb-4">Aurora Background</h2>
            <p className="text-xl text-gray-300">Beautiful gradient waves</p>
          </div>
        </section>

        {/* SplitText Test */}
        <section className="py-32 bg-gray-900">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">SplitText Component</h2>
            <SplitText 
              text="Hello, GSAP!"
              className="text-2xl font-semibold text-center"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
        </section>

        {/* BlurText Test */}
        <section className="py-32 bg-black">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">BlurText Component</h2>
            <BlurText
              text="Isn't this so cool?!"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-2xl mb-8"
            />
          </div>
        </section>

        {/* RotatingText Test */}
        <section className="py-32 bg-gray-900">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">RotatingText Component</h2>
            <div className="text-4xl font-bold">
              <RotatingText 
                texts={['React', 'Bits', 'Is', 'Cool!']}
                mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>
          </div>
        </section>

        {/* LogoLoop Test */}
        <section className="py-32 bg-black">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">LogoLoop Component</h2>
            <LogoLoop 
              logos={[
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
              ]}
              speed={120}
              direction="left"
              logoHeight={48}
              gap={40}
              pauseOnHover={true}
              fadeOut={true}
            />
          </div>
        </section>

        {/* Cubes Test */}
        <section className="py-32 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12">Cubes Component</h2>
            <Cubes 
              gridSize={6}
              maxAngle={45}
              radius={3}
              speed={0.5}
            />
          </div>
        </section>

        {/* InfiniteScroll Test */}
        <section className="py-32 bg-black">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">InfiniteScroll Component</h2>
            <InfiniteScroll 
              width="30rem"
              maxHeight="400px"
              items={[
                { content: <div className="text-center"><Star className="inline w-6 h-6 text-yellow-500 mb-2" /><p className="text-lg">Amazing product! ⭐⭐⭐⭐⭐</p></div> },
                { content: <div className="text-center"><Star className="inline w-6 h-6 text-yellow-500 mb-2" /><p className="text-lg">Best service ever! 🎉</p></div> },
                { content: <div className="text-center"><Star className="inline w-6 h-6 text-yellow-500 mb-2" /><p className="text-lg">Highly recommend! 👍</p></div> },
                { content: <div className="text-center"><Star className="inline w-6 h-6 text-yellow-500 mb-2" /><p className="text-lg">Incredible experience! 🚀</p></div> },
                { content: <div className="text-center"><Star className="inline w-6 h-6 text-yellow-500 mb-2" /><p className="text-lg">Will use again! ✨</p></div> }
              ]}
              itemMinHeight={150}
              autoplay={true}
              autoplaySpeed={0.5}
              autoplayDirection="down"
              pauseOnHover={true}
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-gray-900 text-center">
          <p className="text-gray-400">All React Bits components are working! 🎉</p>
          <p className="text-sm text-gray-500 mt-2">Visit <a href="/" className="text-orange-500 hover:underline">/</a> to go back to the main site</p>
        </footer>
      </div>
    </>
  );
}
