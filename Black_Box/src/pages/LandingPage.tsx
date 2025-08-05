import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import BlackBoxLogo from '@/components/BlackBoxLogo'
import { useContactForm } from '@/hooks/useContactForm'

const LandingPage = () => {
  const navigate = useNavigate()
  const [currentSection, setCurrentSection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Contact form state
  const { formData, formState, updateField, submitForm, resetStatus } = useContactForm()
  
  const sections = [
    { id: 'hero', title: 'FUTURE', subtitle: 'OF VENDING', bgColor: 'white' },
    { id: 'about', title: 'ABOUT', subtitle: 'US', bgColor: 'black' },
    { id: 'howitworks', title: 'HOW IT', subtitle: 'WORKS', bgColor: 'white' },
    { id: 'connect', title: 'CONNECT', subtitle: 'WITH US', bgColor: 'black' }
  ]


  useEffect(() => {
    let isThrottled = false;

    const handleScroll = () => {
      if (isThrottled) return;
      isThrottled = true;

      requestAnimationFrame(() => {
        if (containerRef.current) {
          const scrolled = containerRef.current.scrollTop;
          const windowHeight = window.innerHeight;
          const newSection = Math.floor(scrolled / windowHeight);
          setCurrentSection(Math.min(newSection, sections.length - 1));
        }
        isThrottled = false;
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToSection = (sectionIndex: number) => {
    if (containerRef.current) {
      const targetScrollTop = sectionIndex * window.innerHeight
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    }
  }

  // Get adaptive colors for current section
  const currentSectionBg = sections[currentSection]?.bgColor || 'white'
  const indicatorColor = currentSectionBg === 'black' ? 'white' : 'black'
  const tooltipBgColor = currentSectionBg === 'black' ? 'white' : 'black'
  const tooltipTextColor = currentSectionBg === 'black' ? 'black' : 'white'

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="relative">

        <div 
          ref={containerRef} 
          className="relative h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        >
        {/* Section Indicator */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-3">
          {sections.map((section, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => scrollToSection(index)}
            >
              <div
                className={`w-2 h-8 rounded-full transition-all duration-500 hover:scale-110`}
                style={{
                  backgroundColor: currentSection === index 
                    ? indicatorColor 
                    : indicatorColor === 'white' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                }}
              />
              {/* Tooltip */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div 
                  className="px-3 py-1 rounded text-xs whitespace-nowrap brand-font"
                  style={{
                    backgroundColor: tooltipBgColor,
                    color: tooltipTextColor
                  }}
                >
                  {section.title}
                  {section.subtitle && (
                    <div className="text-xs opacity-70">{section.subtitle}</div>
                  )}
                </div>
                <div 
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45"
                  style={{ backgroundColor: tooltipBgColor }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 1: Hero - FUTURE OF VENDING */}
        <section className="h-screen relative overflow-hidden bg-white flex items-start justify-center snap-start" style={{ paddingTop: '12vh' }}>

          <div className="text-center relative z-20 pointer-events-none">
            {/* Centered Floating Logo */}
            <div className="flex justify-center items-center mb-8 relative">
              <div className="relative">
                <BlackBoxLogo size={180} variant="light" showText={false} />
              </div>
            </div>

            {/* BLACK BOX Text */}
            <div className="mb-8 relative">
              <h1
                className="text-8xl md:text-9xl font-black brand-font leading-none text-black tracking-wider"
                style={{
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6)',
                  filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.7))',
                  letterSpacing: '0.1em'
                }}
              >
                BLACK BOX
              </h1>
            </div>

            {/* THINK OUT OF BOX */}
            <div className="mb-12 relative">
              <div 
                className="text-lg brand-font font-bold text-black/80 tracking-[0.3em] relative"
                style={{
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.5)',
                  filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))'
                }}
              >
                THINK OUT OF BOX
              </div>
              {/* Static Underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-px bg-black/30 w-full"></div>
            </div>

            {/* Inspirational Quote */}
            <div
              className="text-lg brand-font-secondary font-light italic tracking-wide max-w-2xl mx-auto mb-12"
              style={{
                color: '#1a1a1a',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6)',
                filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.7))'
              }}
            >
              "The best way to predict the future is to create it."
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pointer-events-auto">
              <button
                className="group relative px-6 py-2 bg-black text-white font-semibold text-sm rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20 brand-font pointer-events-auto"
                onClick={() => scrollToSection(1)}
              >
                <span className="relative z-10">About Us</span>
                <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                className="group relative px-6 py-2 border border-black/50 text-black font-semibold text-sm rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/10 hover:bg-black hover:text-white brand-font pointer-events-auto"
                onClick={() => scrollToSection(3)}
              >
                <span className="relative z-10">Contact Us</span>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-black/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-black/50 rounded-full mt-2"></div>
            </div>
          </div>
        </section>

        {/* Section 2: About Us */}
        <section className="h-screen relative bg-black flex items-center justify-center overflow-hidden snap-start">
          <div className="text-center relative z-10 max-w-4xl mx-auto px-8">
            {/* Logo positioned in top-left corner of content area */}
            <div className="absolute -top-8 -left-4 z-20">
              <div className="relative">
                <BlackBoxLogo size={100} variant="dark" showText={false} />
              </div>
            </div>
            
            <h4 className="text-8xl md:text-9xl font-black brand-font text-white leading-none mb-4">
              ABOUT
            </h4>
            <div className="text-4xl md:text-5xl brand-font-secondary font-light text-white/70 mb-16">
              US
            </div>

            {/* Mission Statement */}
            <div className="text-xl brand-font-secondary text-white/70 mb-16 max-w-3xl mx-auto leading-relaxed">
              Black Box – A Box That Thinks. It's a 24/7 silent seller that doesn't sleep, doesn't argue, doesn't judge. It just works — with a tap, a scan, and a smile.
            </div>

            {/* About Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  label: 'GLOBAL IMPACT',
                  info: 'Worldwide Presence',
                  desc: 'Vending solutions serving millions globally'
                },
                {
                  label: 'INNOVATION',
                  info: 'Smart Technology',
                  desc: 'AI-powered inventory and contactless payments'
                },
                {
                  label: 'MISSION',
                  info: 'Future Ready',
                  desc: 'Building tomorrow\'s retail ecosystem today'
                }
              ].map((item, _) => (
                <div
                  key={item.label}
                  className="group cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 group-hover:bg-white group-hover:border-white transition-all duration-300 h-48 flex flex-col justify-center">
                    <div className="text-white group-hover:text-black brand-font font-bold text-xl mb-3 transition-colors duration-300">
                      {item.label}
                    </div>
                    <div className="text-white/80 group-hover:text-black/80 brand-font-secondary text-base mb-3 transition-colors duration-300">
                      {item.info}
                    </div>
                    <div className="text-white/60 group-hover:text-black/60 brand-font-secondary text-sm transition-colors duration-300">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Innovation Stats */}
            <div className="mb-8 text-white/80 brand-font-secondary text-base">
              ✨ Smart Solutions • 🌍 Global Reach • 🚀 Future Innovation
            </div>

            {/* Tagline */}
            <div className="mt-8 text-white/40 brand-font text-sm tracking-[0.3em]">
              THINK OUT OF BOX
            </div>
          </div>
        </section>
        {/* Section 3: How It Works */}
        <section className="h-screen relative bg-white flex items-center justify-center overflow-hidden snap-start">
          
          <div className="text-center relative z-10 max-w-4xl mx-auto px-8">
            {/* Logo positioned in top-left corner of content area */}
            <div className="absolute -top-8 -left-4 z-20">
              <div className="relative">
                <BlackBoxLogo size={100} variant="light" showText={false} />
              </div>
            </div>
            
            <h3 className="text-8xl md:text-9xl font-black brand-font text-black leading-none mb-4">
              HOW IT
            </h3>
            <div className="text-4xl md:text-5xl brand-font-secondary font-light text-black/70 mb-16">
              WORKS
            </div>

            {/* Subtitle */}
            <div className="text-xl brand-font-secondary text-black/70 mb-16 max-w-3xl mx-auto leading-relaxed">
              Using a Black Box is simpler than ordering tea. Experience the future of retail with our smart vending solutions.
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              {[
                {
                  step: 'SELECT',
                  number: '01',
                  description: 'Browse products on the touchscreen. Choose what you want from snacks, drinks, or essentials.'
                },
                {
                  step: 'PAY',
                  number: '02',
                  description: 'Scan UPI QR code or tap your card. Quick, secure, contactless payment in seconds.'
                },
                {
                  step: 'ENJOY',
                  number: '03',
                  description: 'Grab your product instantly. No waiting, no queues, no hassle. Just pure convenience.'
                }
              ].map((item, _) => (
                <div
                  key={item.step}
                  className="group cursor-pointer text-center transition-all duration-500 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="bg-white border-2 border-black/10 rounded-xl p-6 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-500 h-full flex flex-col justify-center shadow-md group-hover:shadow-xl group-hover:shadow-black/15 relative overflow-hidden">
                    {/* Step Number */}
                    <div className="absolute top-3 right-3 text-4xl font-black text-black/5 group-hover:text-white/10 transition-colors duration-500 brand-font">
                      {item.number}
                    </div>
                    
                    {/* Step Title */}
                    <div className="text-2xl brand-font font-black mb-3 text-black group-hover:text-white transition-colors duration-500 tracking-wider relative z-10">
                      {item.step}
                    </div>
                    
                    {/* Decorative Line */}
                    <div className="w-10 h-0.5 bg-black/20 group-hover:bg-white/40 mx-auto mb-3 transition-colors duration-500"></div>
                    
                    {/* Description */}
                    <div className="text-sm md:text-base brand-font-secondary text-black/70 group-hover:text-white/80 transition-colors duration-500 leading-relaxed relative z-10">
                      {item.description}
                    </div>
                    
                    {/* Hover Accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/5 group-hover:from-white/5 group-hover:to-white/0 transition-all duration-500"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Message */}
            <div className="text-center max-w-4xl mx-auto mb-4">
              <div className="text-base brand-font-secondary text-black/80 mb-2 leading-relaxed">
                Whether it's a quick snack, hygiene kit, or last-minute cable —<br />
                Black Box is built for speed, trust, and ease.
              </div>
              <div className="text-sm brand-font font-bold text-black/90">
                Try it once. You'll never go back to traditional shops.
              </div>
            </div>

            {/* Bottom tagline */}
            <div className="mt-4 text-xs brand-font-secondary text-black/50 tracking-wider">
              SIMPLE • FAST • SMART
            </div>
          </div>
        </section>
        {/* Section 4: Connect */}
        <section className="h-screen relative bg-black flex items-center justify-center overflow-hidden snap-start py-8">
          
          <div className="text-center relative z-10 max-w-5xl mx-auto px-6">
            {/* Logo positioned in top-left corner of content area */}
            <div className="absolute -top-8 -left-4 z-20">
              <div className="relative">
                <BlackBoxLogo size={100} variant="dark" showText={false} />
              </div>
            </div>
            
            <h4 className="text-6xl md:text-7xl font-black brand-font text-white leading-none mb-3">
              CONNECT
            </h4>
            <div className="text-2xl md:text-3xl brand-font-secondary font-light text-white/70 mb-8">
              WITH US
            </div>

            {/* Contact Form */}
            <div className="max-w-4xl mx-auto">
              <div className="text-lg text-white/70 mb-6 leading-relaxed font-sans">
                Have any questions about Black Box? We're here to help! Reach out for any queries or support.
              </div>

              {/* Success Message */}
              {formState.isSuccess && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-md">
                  <div className="text-green-300 font-semibold mb-2">✓ Message Sent Successfully!</div>
                  <div className="text-green-200 text-sm">Thank you for reaching out. We'll get back to you within 24 hours.</div>
                </div>
              )}

              {/* Error Message */}
              {formState.error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-md">
                  <div className="text-red-300 font-semibold mb-2">⚠ Error</div>
                  <div className="text-red-200 text-sm">{formState.error}</div>
                </div>
              )}

              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                submitForm()
              }}>
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all duration-300 text-sm font-sans"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all duration-300 text-sm font-sans"
                      required
                    />
                  </div>
                </div>

                {/* Subject and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={(e) => updateField('subject', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all duration-300 text-sm font-sans"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all duration-300 text-sm font-sans"
                    />
                  </div>
                </div>

                {/* Query Type Selection */}
                <div>
                  <select 
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all duration-300 text-sm font-sans"
                    value={formData.query_type}
                    onChange={(e) => updateField('query_type', e.target.value)}
                    required
                  >
                    <option value="" className="bg-black text-white">What can we help you with?</option>
                    <option value="location" className="bg-black text-white">Find Black Box Near Me</option>
                    <option value="products" className="bg-black text-white">Product Availability</option>
                    <option value="support" className="bg-black text-white">Customer Support</option>
                    <option value="feedback" className="bg-black text-white">Feedback & Suggestions</option>
                    <option value="general" className="bg-black text-white">General Inquiry</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <textarea
                    rows={3}
                    placeholder="Tell us your query or share your feedback..."
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all duration-300 text-sm font-sans resize-none"
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formState.isLoading}
                    className={`w-full py-3 rounded-md font-bold text-base tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 font-sans ${
                      formState.isLoading 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.01]'
                    }`}
                  >
                    {formState.isLoading ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        </div>

        {/* Footer - Outside snap container */}
        <footer className="bg-black text-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Top Footer Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="relative mr-4">
                    <BlackBoxLogo size={60} variant="dark" showText={false} />
                  </div>
                  <div>
                    <div className="text-2xl font-black brand-font text-white">
                      BLACK BOX
                    </div>
                    <div className="text-sm brand-font-secondary text-white/60">
                      THINK OUT OF BOX
                    </div>
                  </div>
                </div>
                <p className="text-white/70 brand-font-secondary text-sm leading-relaxed mb-6 max-w-md">
                  Revolutionary vending solutions powered by AI technology. Experience the future of retail with contactless payments, smart inventory, and 24/7 availability.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="text-xs text-white">f</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="text-xs text-white">t</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="text-xs text-white">in</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="text-xs text-white">ig</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold brand-font text-sm mb-4 tracking-wider">QUICK LINKS</h3>
                <ul className="space-y-3">
                  <li><span onClick={() => scrollToSection(1)} className="text-white/70 hover:text-white transition-colors text-xs brand-font-secondary cursor-pointer">About Us</span></li>
                  <li><span onClick={() => scrollToSection(2)} className="text-white/70 hover:text-white transition-colors text-xs brand-font-secondary cursor-pointer">How It Works</span></li>
                  <li><span onClick={() => scrollToSection(3)} className="text-white/70 hover:text-white transition-colors text-xs brand-font-secondary cursor-pointer">Support</span></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-white font-bold brand-font text-sm mb-4 tracking-wider">CONTACT</h3>
                <div className="space-y-3">
                  <div className="text-white/70 text-xs brand-font-secondary">
                    <div className="mb-1 text-white/90 font-semibold">Email</div>
                    <div>black369box@gmail.com</div>
                  </div>
                  <div className="text-white/70 text-xs brand-font-secondary">
                    <div className="mb-1 text-white/90 font-semibold">Phone</div>
                    <div>+91 9163331360</div>
                  </div>
                  <div className="text-white/70 text-xs brand-font-secondary">
                    <div className="mb-1 text-white/90 font-semibold">Address</div>
                    <div>Virtual Operations<br />Available Worldwide</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/20 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Copyright */}
                <div className="text-white/50 text-xs brand-font-secondary mb-4 md:mb-0">
                  © {new Date().getFullYear()} Black Box. All rights reserved. | Revolutionizing retail technology.
                </div>
                
                {/* Legal Links */}
                <div className="flex space-x-6">
                  <span onClick={() => navigate('/privacy-policy')} className="text-white/50 hover:text-white/80 transition-colors text-xs brand-font-secondary cursor-pointer">Privacy Policy</span>
                  <span onClick={() => navigate('/terms-of-service')} className="text-white/50 hover:text-white/80 transition-colors text-xs brand-font-secondary cursor-pointer">Terms of Service</span>
                  <span onClick={() => navigate('/cookie-policy')} className="text-white/50 hover:text-white/80 transition-colors text-xs brand-font-secondary cursor-pointer">Cookie Policy</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default LandingPage
