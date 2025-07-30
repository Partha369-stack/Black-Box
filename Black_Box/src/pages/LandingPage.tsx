import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Zap, 
  Shield, 
  Smartphone, 
  BarChart3, 
  Wifi, 
  CreditCard,
  ArrowRight,
  CheckCircle,
  Star,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import BlackBoxLogo from '@/components/BlackBoxLogo'
import ThreeTextAnimation from '@/components/ThreeTextAnimation'
import Orb from '@/components/Orb'
import LiquidChrome from '@/components/LiquidChrome'
import IndiaMap from '@react-map/india'

const LandingPage = () => {
  const navigate = useNavigate()
  const [currentSection, setCurrentSection] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  
  const sections = [
    { id: 'hero', title: 'FUTURE', subtitle: 'OF VENDING' },
    { id: 'tech', title: 'SMART', subtitle: 'TECHNOLOGY' },
    { id: 'vision', title: 'THINK', subtitle: 'OUT OF BOX' },
    { id: 'connect', title: 'CONNECT', subtitle: 'WITH US' }
  ]

  const techIcons = [
    { icon: Zap, label: 'IoT' },
    { icon: Shield, label: 'SECURE' },
    { icon: Smartphone, label: 'MOBILE' },
    { icon: BarChart3, label: 'ANALYTICS' },
    { icon: Wifi, label: 'CLOUD' },
    { icon: CreditCard, label: 'PAYMENTS' }
  ]

  const benefits = [
    "24/7 Automated Operations",
    "Reduced Operational Costs",
    "Real-time Inventory Management",
    "Advanced Security Features",
    "Scalable Business Solution",
    "Comprehensive Support"
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const windowHeight = window.innerHeight
      const newSection = Math.floor(scrolled / windowHeight)
      setCurrentSection(Math.min(newSection, sections.length - 1))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])

  return (
    <div ref={containerRef} className="relative">

      {/* Section Indicator */}
      <motion.div
        className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
      >
        {sections.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-8 rounded-full transition-all duration-500 ${
              currentSection === index ? 'bg-white' : 'bg-white/20'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </motion.div>

      {/* Section 1: Hero - FUTURE OF VENDING */}
      <section
        className="h-screen relative overflow-hidden bg-white flex items-start justify-center pt-20"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {/* Liquid Chrome Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          <LiquidChrome
            baseColor={[0.1, 0.1, 0.1]}
            speed={0.3}
            amplitude={0.6}
            frequencyX={2.5}
            frequencyY={1.5}
            interactive={true}
          />
        </div>

        <div className="text-center z-10 mt-16">
          {/* Logo above BLACK BOX */}
          <motion.div
            className="mb-6 relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1
            }}
            transition={{ 
              opacity: { duration: 0.8, delay: 0.3 },
              scale: { duration: 0.8, delay: 0.3 }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 100
            }}
          >
            <BlackBoxLogo size={160} variant="dark" showText={false} />
          </motion.div>

          {/* BLACK BOX Text with Logo Font */}
          <motion.div
            className="mb-8 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 100
            }}
          >
            <h1
              className="text-8xl md:text-9xl font-black brand-font leading-none text-white"
            >
              BLACK BOX
            </h1>
          </motion.div>

          {/* THINK OUT OF BOX */}
          <div className="mb-12 relative">
            <div className="text-lg brand-font font-bold text-white/80 tracking-[0.3em] relative">
              THINK OUT OF BOX
            </div>

            {/* Underline */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-px bg-white/30 w-full" />
          </div>

          {/* Inspirational Quote */}
          <motion.div
            className="text-lg brand-font-secondary font-light italic tracking-wide max-w-2xl mx-auto mb-12"
            style={{
              color: '#CCCCCC',
              textShadow: '0 0 10px rgba(204, 204, 204, 0.3), 0 0 20px rgba(204, 204, 204, 0.2), 0 0 30px rgba(204, 204, 204, 0.1)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 4.5 }}
          >
            "The best way to predict the future is to create it."
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 5 }}
          >
            <motion.button
              className="group relative px-6 py-2 bg-white text-black font-semibold text-sm rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 brand-font"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/enter-the-box')}
            >
              <span className="relative z-10">Enter the Box</span>
              <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>

            <motion.button
              className="group relative px-6 py-2 border border-white/50 text-white font-semibold text-sm rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10 hover:bg-white hover:text-black brand-font"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Learn More</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Section 2: Tech - SMART TECHNOLOGY */}
      <section className="h-screen relative bg-black flex items-center justify-center overflow-hidden">
        {/* Black & White Square Orb Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <Orb
            hoverIntensity={0.6}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
        </div>

        {/* Vending Machine Silhouette Background */}
        <div className="absolute inset-0 opacity-10" style={{ zIndex: 2 }}>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-96 bg-white/20 rounded-lg">
            {/* Machine slots */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-24 h-8 bg-white/20 rounded mx-auto mt-4" />
            ))}
          </div>
        </div>

        {/* Data Flow Lines */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-16 bg-white/20"
              style={{
                left: `${10 + (i * 4)}%`,
                top: `${20 + Math.sin(i) * 30}%`,
              }}
              animate={{
                height: [64, 32, 64],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        <div className="text-center z-10" style={{ position: 'relative', zIndex: 100 }}>
          <motion.h2
            className="text-8xl md:text-9xl font-black brand-font text-white leading-none mb-8"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            SMART
          </motion.h2>

          <motion.div
            className="text-4xl md:text-5xl brand-font-secondary font-light text-white/70 mb-16"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            TECHNOLOGY
          </motion.div>

          {/* Tech Features with Real Vending Context */}
          <div className="relative w-80 h-80 mx-auto">
            {techIcons.map((tech, index) => {
              const angle = (index * 60) * (Math.PI / 180)
              const radius = 120
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius

              const techDescriptions = [
                'INSTANT POWER', 'SECURE TRANSACTIONS', 'REMOTE CONTROL',
                'REAL-TIME DATA', 'CLOUD SYNC', 'MULTI-PAY OPTIONS'
              ]

              return (
                <motion.div
                  key={index}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ x, y }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.2 }}
                >
                  <motion.div
                    className="bg-black/10 backdrop-blur-sm rounded-full p-6 border border-white/20 relative"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(255,255,255,0.1)',
                        '0 0 0 10px rgba(255,255,255,0)',
                        '0 0 0 0 rgba(255,255,255,0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <tech.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <div className="text-white/60 text-xs brand-font-secondary font-bold mt-2 text-center tracking-wider">
                    {tech.label}
                  </div>
                  <div className="text-white/40 text-xs brand-font-secondary mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {techDescriptions[index]}
                  </div>
                </motion.div>
              )
            })}

            {/* Center Vending Machine Icon */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
              viewport={{ once: true }}
            >
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <BlackBoxLogo size={40} variant="dark" showText={false} />
              </div>
            </motion.div>
          </div>

          {/* Tech Stats */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="text-white brand-font-secondary text-xs tracking-wider">
                99.9% UPTIME
              </div>
            </div>
            <div className="text-center">
              <div className="text-black brand-font-secondary text-xs tracking-wider">
                24/7 MONITORING
              </div>
            </div>
            <div className="text-center">
              <div className="text-black brand-font-secondary text-xs tracking-wider">
                REAL-TIME SYNC
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Vision - THINK OUT OF BOX */}
      <section className="h-screen relative bg-black flex items-center justify-center overflow-hidden">
        {/* Traditional vs Smart Vending Visual Metaphor */}
        <div className="absolute left-20 top-1/2 transform -translate-y-1/2">
          {/* Old Box - Traditional Vending */}
          <motion.div
            className="w-24 h-32 bg-white/10 rounded border-2 border-white/20"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="text-xs text-white/40 text-center mt-2 brand-font-secondary">OLD</div>
            {/* Static slots */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-2 bg-white/20 rounded mx-auto mt-2" />
            ))}
          </motion.div>
        </div>

        <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
          {/* Smart Box - Your Innovation */}
          <motion.div
            className="w-24 h-32 bg-white/5 rounded border-2 border-white/30 relative overflow-hidden"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(0,0,0,0.1)',
                '0 0 20px 5px rgba(0,0,0,0.2)',
                '0 0 0 0 rgba(0,0,0,0.1)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-xs text-white/60 text-center mt-2 brand-font-secondary font-bold">SMART</div>
            {/* Dynamic slots with animation */}
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-16 h-2 bg-white/30 rounded mx-auto mt-2"
                animate={{
                  width: [64, 56, 64],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
            {/* IoT indicator */}
            <motion.div
              className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Breaking out of the box visual */}
        <motion.div
          className="absolute top-20 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <div className="w-16 h-16 border-2 border-white/20 border-dashed relative">
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 45, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <div className="text-center z-10 max-w-4xl mx-auto px-8">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <BlackBoxLogo size={80} variant="dark" showText={false} />
          </motion.div>

          <motion.h3
            className="text-8xl md:text-9xl font-black brand-font text-white leading-none mb-4"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            THINK
          </motion.h3>

          <motion.div
            className="text-4xl md:text-5xl brand-font-secondary font-light text-white/70 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
          >
            OUT OF BOX
          </motion.div>

          {/* Innovation Areas */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { word: 'AI POWERED', desc: 'Smart inventory prediction' },
              { word: 'CONTACTLESS', desc: 'Touch-free interactions' },
              { word: 'SUSTAINABLE', desc: 'Eco-friendly operations' }
            ].map((item, index) => (
              <motion.div
                key={item.word}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-white/5 rounded-lg p-6 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <div className="text-lg brand-font font-bold tracking-wider mb-2">
                    {item.word}
                  </div>
                  <div className="text-xs brand-font-secondary opacity-60 group-hover:opacity-80">
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Innovation Stats */}
          <motion.div
            className="mt-12 text-sm brand-font-secondary text-white/50 tracking-wider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            viewport={{ once: true }}
          >
            BEYOND TRADITIONAL • REDEFINING RETAIL • FUTURE-READY
          </motion.div>
        </div>
      </section>

      {/* Section 4: Connect - CONNECT WITH US */}
      <section className="h-screen relative bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
        {/* Network Connection Visual */}
        <div className="absolute inset-0">
          {/* Connection nodes representing locations */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              style={{
                left: `${15 + (i * 6)}%`,
                top: `${20 + Math.sin(i * 0.5) * 40}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Connection lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute h-px bg-white/20"
              style={{
                left: `${20 + (i * 8)}%`,
                top: `${30 + Math.cos(i * 0.7) * 30}%`,
                width: '60px',
                transformOrigin: 'left center',
                rotate: `${i * 15}deg`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scaleX: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="text-center z-10 max-w-4xl mx-auto px-8">
          <motion.h4
            className="text-8xl md:text-9xl font-black brand-font text-white leading-none mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            CONNECT
          </motion.h4>

          <motion.div
            className="text-4xl md:text-5xl brand-font-secondary font-light text-white/70 mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            WITH US
          </motion.div>

          {/* Business Value Proposition */}
          <motion.div
            className="text-lg brand-font-secondary text-white/60 mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to revolutionize your retail space? Join 500+ businesses already earning 40% more revenue with Black Box smart vending solutions.
          </motion.div>

          {/* Contact Methods with Business Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Smartphone,
                label: 'CONSULTATION',
                info: '+1 (555) 123-4567',
                desc: 'Free 30-min strategy call'
              },
              {
                icon: Zap,
                label: 'DEMO REQUEST',
                info: 'hello@blackbox.com',
                desc: 'See our machines in action'
              },
              {
                icon: BarChart3,
                label: 'SHOWROOM',
                info: 'Innovation Drive',
                desc: 'Experience center visit'
              }
            ].map((contact, index) => (
              <motion.div
                key={contact.label}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <contact.icon className="h-8 w-8 text-white mx-auto mb-4" />
                  <div className="text-white brand-font font-bold text-lg mb-2">
                    {contact.label}
                  </div>
                  <div className="text-white/70 brand-font-secondary text-sm mb-2">
                    {contact.info}
                  </div>
                  <div className="text-white/50 brand-font-secondary text-xs">
                    {contact.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ROI Promise */}
          <motion.div
            className="mb-8 text-white/80 brand-font-secondary text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            viewport={{ once: true }}
          >
            ⚡ 6-month ROI guarantee • 🚀 Setup in 48 hours • 📈 Average 40% revenue increase
          </motion.div>

          {/* CTA Button */}
          <motion.button
            className="bg-white text-black px-12 py-4 rounded-full brand-font font-bold text-lg tracking-wider hover:bg-gray-200 transition-colors mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            GET YOUR SMART VENDING QUOTE
          </motion.button>

          {/* Brand Tagline */}
          <motion.div
            className="mt-8 text-white/40 brand-font text-sm tracking-[0.3em]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            viewport={{ once: true }}
          >
            THINK OUT OF BOX
          </motion.div>
        </div>
      </section>


    </div>
  )
}

export default LandingPage
