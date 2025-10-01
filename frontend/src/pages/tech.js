import Head from 'next/head';
import Link from 'next/link';
import Cubes from '../components/reactbits/Cubes';
import LogoLoop from '../components/reactbits/LogoLoop';
import { SiReact, SiNextdotjs, SiTailwindcss, SiTypescript, SiPython, SiDocker, SiKubernetes, SiAmazonaws } from 'react-icons/si';

export default function Tech() {
  const techLogos = [
    <SiReact key="react" className="text-6xl text-blue-400" />,
    <SiNextdotjs key="next" className="text-6xl text-white" />,
    <SiTailwindcss key="tailwind" className="text-6xl text-cyan-400" />,
    <SiTypescript key="ts" className="text-6xl text-blue-600" />,
    <SiPython key="python" className="text-6xl text-yellow-400" />,
    <SiDocker key="docker" className="text-6xl text-blue-500" />,
    <SiKubernetes key="k8s" className="text-6xl text-blue-600" />,
    <SiAmazonaws key="aws" className="text-6xl text-orange-400" />
  ];

  return (
    <>
      <Head>
        <title>Our Technology - Nexus AI Platform</title>
      </Head>

      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Cubes Background */}
        <div className="fixed inset-0 flex items-center justify-center opacity-20">
          <Cubes 
            gridSize={8}
            maxAngle={60}
            borderStyle="2px dashed #f97316"
            autoAnimate={true}
          />
        </div>

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
              Built with <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Cutting-Edge</span> Technology
            </h1>
            <p className="text-xl text-gray-300 text-center mb-16">
              Our tech stack powers enterprise-grade AI automation
            </p>

            {/* Logo Loop */}
            <div className="mb-20">
              <LogoLoop 
                logos={techLogos}
                speed={30}
                logoHeight={64}
                gap={60}
                fadeOut={true}
              />
            </div>

            {/* Tech Stack Details */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4">Frontend</h3>
                <ul className="space-y-3 text-gray-400">
                  <li>• Next.js 14 - React framework</li>
                  <li>• TypeScript - Type safety</li>
                  <li>• Tailwind CSS - Styling</li>
                  <li>• Framer Motion - Animations</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4">Backend</h3>
                <ul className="space-y-3 text-gray-400">
                  <li>• Python - Core language</li>
                  <li>• FastAPI - API framework</li>
                  <li>• PostgreSQL - Database</li>
                  <li>• Redis - Caching</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4">AI/ML</h3>
                <ul className="space-y-3 text-gray-400">
                  <li>• OpenAI GPT-4 - Language models</li>
                  <li>• TensorFlow - ML training</li>
                  <li>• Hugging Face - Model hosting</li>
                  <li>• LangChain - Agent orchestration</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4">Infrastructure</h3>
                <ul className="space-y-3 text-gray-400">
                  <li>• AWS - Cloud hosting</li>
                  <li>• Docker - Containerization</li>
                  <li>• Kubernetes - Orchestration</li>
                  <li>• GitHub Actions - CI/CD</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
