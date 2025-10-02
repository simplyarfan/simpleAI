import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Brain, Users, BarChart3, Rocket, Target, Award, TrendingUp } from 'lucide-react';
import DotGrid from '../components/backgrounds/DotGrid';
import RotatingText from '../components/reactbits/RotatingText';
import LogoLoop from '../components/reactbits/LogoLoop';
import StaggeredMenu from '../components/reactbits/StaggeredMenu';
import GradientText from '../components/text/GradientText';

export default function About() {
  return (
    <>
      <Head>
        <title>About - Nexus AI Platform</title>
        <meta name="description" content="Learn about Nexus and our mission to democratize AI access for businesses worldwide." />
      </Head>

      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Dot Grid Background */}
        <DotGrid 
          dotSize={1.5}
          dotColor="rgba(249, 115, 22, 0.4)"
          backgroundColor="transparent"
          spacing={40}
        />



        {/* StaggeredMenu Navigation */}
        <div style={{ height: '100vh', background: '#1a1a1a' }}>
          <StaggeredMenu
            position="right"
            items={[
              { label: 'Home', link: '/', ariaLabel: 'Go to home page' },
              { label: 'Features', link: '/features', ariaLabel: 'View features' },
              { label: 'About', link: '/about', ariaLabel: 'About us' },
              { label: 'Contact', link: '/contact', ariaLabel: 'Contact us' }
            ]}
            socialItems={[
              { label: 'GitHub', link: 'https://github.com' },
              { label: 'Twitter', link: 'https://twitter.com' },
              { label: 'LinkedIn', link: 'https://linkedin.com' }
            ]}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#fff"
            openMenuButtonColor="#fff"
            changeMenuColorOnOpen={true}
            colors={['#B19EEF', '#5227FF']}
            accentColor="#ff6b6b"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Building the Future of
                  <br />
                  <div className="inline-block bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-sm px-8 py-4 rounded-2xl border border-orange-500/30 mt-4">
                    <RotatingText 
                      words={['Artificial Intelligence', 'Business Automation', 'Smart Solutions', 'Digital Innovation']}
                      className="text-5xl md:text-6xl bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-bold"
                    />
                  </div>
                </h1>
                <p className="text-xl text-gray-400 max-w-4xl mx-auto">
                  We're on a mission to make advanced AI accessible to every business, empowering innovation and driving positive change across industries.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-400 mb-6">
                    We believe artificial intelligence has the power to solve humanity's greatest challenges. Our mission is to democratize access to advanced AI capabilities, making them simple, secure, and affordable for businesses of all sizes.
                  </p>
                  <p className="text-lg text-gray-400">
                    From startups to Fortune 500 companies, we're empowering organizations to harness the transformative power of AI, driving innovation and creating a better future for everyone.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-12 text-white text-center"
                >
                  <Rocket className="w-16 h-16 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Innovation First</h3>
                  <p className="text-orange-100">
                    We push the boundaries of what's possible with AI, constantly exploring new frontiers in machine learning and artificial intelligence.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
                <p className="text-lg text-gray-400">The principles that guide everything we do</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Target,
                    title: "Innovation First",
                    description: "We push the boundaries of what's possible with AI, constantly exploring new frontiers.",
                    gradient: "from-blue-500 to-indigo-600"
                  },
                  {
                    icon: Users,
                    title: "People-Centric",
                    description: "Our technology serves humanity. We build AI solutions that augment human capabilities.",
                    gradient: "from-purple-500 to-pink-600"
                  },
                  {
                    icon: Award,
                    title: "Ethical AI",
                    description: "We're committed to responsible AI development with transparency and fairness at the core.",
                    gradient: "from-green-500 to-emerald-600"
                  },
                  {
                    icon: TrendingUp,
                    title: "Global Impact",
                    description: "We believe AI should benefit everyone. Our platform democratizes access worldwide.",
                    gradient: "from-orange-500 to-red-600"
                  }
                ].map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                    }}
                    className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Journey Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
                <p className="text-lg text-gray-400">Key milestones in our mission to democratize AI</p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-orange-500 to-red-600"></div>
                
                <div className="space-y-16">
                  {[
                    { year: "2019", title: "Company Founded", description: "Started with a vision to democratize AI access for businesses worldwide.", side: "left" },
                    { year: "2020", title: "Series A Funding", description: "Raised funding to accelerate product development and team expansion.", side: "right" },
                    { year: "2021", title: "Global Expansion", description: "Launched in 25 countries with localized AI models and support.", side: "left" },
                    { year: "2022", title: "Enterprise Milestone", description: "Reached 100+ enterprise clients including Fortune 500 companies.", side: "right" },
                    { year: "2024", title: "Market Leader", description: "Became the leading AI platform with 50,000+ active developers.", side: "left" }
                  ].map((milestone, index) => (
                    <motion.div
                      key={milestone.year}
                      initial={{ opacity: 0, x: milestone.side === 'left' ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="relative flex items-center"
                    >
                      {milestone.side === 'left' ? (
                        <>
                          <div className="flex-1 text-right pr-8">
                            <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                            <p className="text-gray-400">{milestone.description}</p>
                          </div>
                          <div className="w-4 h-4 bg-orange-500 rounded-full relative z-10"></div>
                          <div className="flex-1 pl-8">
                            <div className="text-sm font-semibold text-orange-500">{milestone.year}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 text-right pr-8">
                            <div className="text-sm font-semibold text-orange-500">{milestone.year}</div>
                          </div>
                          <div className="w-4 h-4 bg-orange-500 rounded-full relative z-10"></div>
                          <div className="flex-1 pl-8">
                            <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                            <p className="text-gray-400">{milestone.description}</p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="py-20 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Powered By</h2>
                <p className="text-lg text-gray-400">Cutting-edge technologies we use</p>
              </div>

              <LogoLoop 
                logos={[
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
                  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg'
                ]}
                speed={30}
              />
            </div>
          </section>


          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-y border-orange-500/20">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Join Us on This Journey
                </h2>
                <p className="text-lg text-gray-400 mb-6">
                  Be part of the AI revolution and transform your business today.
                </p>
                <Link href="/auth/register">
                  <button className="group relative px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 overflow-hidden">
                    <span className="relative z-10">Start Your Free Trial</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 bg-black border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
                  </div>
                  <span className="text-lg font-bold text-white">Nexus</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  © 2025 Nexus. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
