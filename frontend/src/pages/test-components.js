import Head from 'next/head';
import Link from 'next/link';
import Aurora from '../components/reactbits/Aurora';
import SplitText from '../components/reactbits/SplitText';
import BlurText from '../components/reactbits/BlurText';
import RotatingText from '../components/reactbits/RotatingText';
import LogoLoop from '../components/reactbits/LogoLoop';
import InfiniteScroll from '../components/reactbits/InfiniteScroll';

export default function TestComponents() {
  return (
    <>
      <Head>
        <title>React Bits Components Test</title>
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">React Bits Test</h1>
            <Link href="/" className="text-orange-500 hover:underline">← Back to Home</Link>
          </div>
        </div>

        <div className="pt-20">
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
                { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', alt: 'React' },
                { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', alt: 'Next.js' },
                { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', alt: 'Node.js' },
                { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', alt: 'Python' },
                { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', alt: 'TypeScript' },
                { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', alt: 'JavaScript' }
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


        {/* InfiniteScroll Test */}
        <section className="py-32 bg-black">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">InfiniteScroll Component</h2>
            <p className="text-center text-gray-400 mb-4">Horizontal scrolling testimonials</p>
            <InfiniteScroll 
              items={[
                'Amazing product! ⭐⭐⭐⭐⭐',
                'Best service ever! 🎉',
                'Highly recommend! 👍',
                'Incredible experience! 🚀',
                'Will use again! ✨',
                'Outstanding quality! 💎'
              ]}
              autoplay={true}
              autoplaySpeed={0.5}
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
      </div>
    </>
  );
}
