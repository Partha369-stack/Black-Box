import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BlackBoxLogo from '../components/BlackBoxLogo';

const EnterTheBoxPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const { scrollYProgress } = useScroll();

  // Parallax transforms
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.8, 0.6, 0.4]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const questionsY = useTransform(scrollYProgress, [0, 0.33], ['0%', '-50%']);
  const revealY = useTransform(scrollYProgress, [0.33, 0.66], ['50%', '-50%']);
  const ctaY = useTransform(scrollYProgress, [0.66, 1], ['50%', '0%']);
  const cubeRotation = useTransform(scrollYProgress, [0.33, 0.66], [0, 360]);

  const questions = [
    "Why has the world moved on… but we're still waiting in line?",
    "Why does every country adopt vending machines, but India still lags?",
    "Are we not ready — or just overlooked?"
  ];

  const revealTexts = [
    "We asked the same questions.",
    "Then we built the answer.",
    "Not just a machine. A smarter way to access life."
  ];

  useEffect(() => {
    const questionTimer = setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setTimeout(() => setShowReveal(true), 2000);
      }
    }, 3000);

    return () => clearTimeout(questionTimer);
  }, [currentQuestion, questions.length]);

  useEffect(() => {
    if (showReveal) {
      const ctaTimer = setTimeout(() => setShowCTA(true), 8000);
      return () => clearTimeout(ctaTimer);
    }
  }, [showReveal]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Ambient sound trigger (visual indicator) */}
      <motion.div
        className="fixed top-4 right-4 z-50 w-3 h-3 bg-green-400 rounded-full opacity-30"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        title="Immersive experience active"
      />

      {/* Cinematic vignette */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
      </div>
      {/* Animated Background Pattern with Parallax */}
      <motion.div
        className="fixed inset-0 opacity-10"
        style={{
          opacity: backgroundOpacity,
          y: backgroundY
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
            backgroundSize: '200% 200%'
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </motion.div>

      {/* Section 1: The Question Layer */}
      <section className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="max-w-5xl mx-auto px-8 text-center"
          style={{ y: questionsY }}
        >
          {questions.map((question, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{
                opacity: currentQuestion === index ? 1 : 0,
                y: currentQuestion === index ? 0 : 50,
                scale: currentQuestion === index ? 1 : 0.9
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="relative">
                <motion.h1
                  className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light leading-relaxed px-4"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                      '0 0 30px rgba(147, 51, 234, 0.3)',
                      '0 0 20px rgba(34, 197, 94, 0.3)',
                      '0 0 20px rgba(59, 130, 246, 0.3)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    {question}
                  </span>
                </motion.h1>

                {/* Subtle glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-lg blur-xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>
          ))}

          {/* Question progress indicator */}
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {questions.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentQuestion ? 'bg-blue-400' : 'bg-gray-600'
                }`}
                animate={{ scale: index === currentQuestion ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Section 2: The Reveal */}
      <section className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="text-center"
          style={{ y: revealY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showReveal ? 1 : 0 }}
          transition={{ duration: 2 }}
        >
          {/* 3D Glowing Cube */}
          <motion.div
            className="mb-16 flex justify-center perspective-1000"
            initial={{ scale: 0, rotateX: 0, rotateY: 0 }}
            animate={{
              scale: showReveal ? 1 : 0,
              rotateX: showReveal ? 15 : 0,
              rotateY: showReveal ? 15 : 0
            }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            <div className="relative transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
              {/* Main Cube */}
              <motion.div
                className="w-32 h-32 border-2 border-blue-400/50 rounded-lg relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm"
                style={{ rotateY: cubeRotation }}
                animate={{
                  rotateY: showReveal ? [0, 360] : 0,
                  rotateX: showReveal ? [0, 360] : 0
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: showReveal ? 1 : 0
                }}
              >
                {/* Inner glow */}
                <motion.div
                  className="absolute inset-2 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-md"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Outer glow rings */}
                <motion.div
                  className="absolute inset-0 border-2 border-green-400/30 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',
                      '0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(59, 130, 246, 0.2)',
                      '0 0 30px rgba(147, 51, 234, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)',
                      '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Particle effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${20 + i * 10}%`
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      y: [-20, 20, -20]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                  />
                ))}
              </motion.div>

              {/* Reflection effect */}
              <motion.div
                className="absolute top-full left-0 w-32 h-16 bg-gradient-to-b from-blue-500/10 to-transparent rounded-b-lg transform scale-y-[-1] opacity-30"
                animate={{ opacity: showReveal ? [0.1, 0.3, 0.1] : 0 }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Reveal Text Sequence */}
          <div className="space-y-12">
            {revealTexts.map((text, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{
                  opacity: showReveal ? 1 : 0,
                  y: showReveal ? 0 : 30,
                  scale: showReveal ? 1 : 0.95
                }}
                transition={{
                  duration: 2,
                  delay: showReveal ? 3 + (index * 2.5) : 0,
                  ease: "easeOut"
                }}
              >
                {index === 2 ? (
                  <div className="space-y-6">
                    {/* Logo with particle entrance */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                      animate={{
                        opacity: showReveal ? 1 : 0,
                        scale: showReveal ? 1 : 0.5,
                        rotateY: showReveal ? 0 : 180
                      }}
                      transition={{ duration: 2.5, delay: showReveal ? 8.5 : 0 }}
                    >
                      <BlackBoxLogo size={140} variant="dark" showText={false} />

                      {/* Logo glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-full blur-xl"
                        animate={{
                          opacity: showReveal ? [0, 0.6, 0] : 0,
                          scale: showReveal ? [0.8, 1.2, 0.8] : 0.8
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: showReveal ? 9 : 0 }}
                      />
                    </motion.div>

                    {/* BLACK BOX text with letter-by-letter animation */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: showReveal ? 1 : 0 }}
                      transition={{ delay: showReveal ? 9 : 0 }}
                    >
                      <h2 className="text-6xl md:text-8xl font-black leading-none">
                        {['B', 'L', 'A', 'C', 'K', ' ', 'B', 'O', 'X'].map((letter, letterIndex) => (
                          <motion.span
                            key={letterIndex}
                            className="inline-block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 50, rotateX: 90 }}
                            animate={{
                              opacity: showReveal ? 1 : 0,
                              y: showReveal ? 0 : 50,
                              rotateX: showReveal ? 0 : 90
                            }}
                            transition={{
                              duration: 0.8,
                              delay: showReveal ? 9.5 + (letterIndex * 0.1) : 0,
                              ease: "backOut"
                            }}
                          >
                            {letter === ' ' ? '\u00A0' : letter}
                          </motion.span>
                        ))}
                      </h2>
                    </motion.div>

                    {/* Tagline with typewriter effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: showReveal ? 1 : 0 }}
                      transition={{ delay: showReveal ? 11 : 0 }}
                    >
                      <p className="text-xl md:text-2xl text-gray-300 font-light">
                        <motion.span
                          initial={{ width: 0 }}
                          animate={{ width: showReveal ? "100%" : 0 }}
                          transition={{ duration: 2, delay: showReveal ? 11.5 : 0 }}
                          className="inline-block overflow-hidden whitespace-nowrap"
                        >
                          {text}
                        </motion.span>
                      </p>
                    </motion.div>
                  </div>
                ) : (
                  <motion.p
                    className="text-xl sm:text-2xl md:text-4xl text-gray-200 font-light px-4"
                    animate={{
                      textShadow: showReveal ? [
                        '0 0 10px rgba(255, 255, 255, 0.3)',
                        '0 0 20px rgba(59, 130, 246, 0.3)',
                        '0 0 10px rgba(255, 255, 255, 0.3)'
                      ] : '0 0 0px rgba(255, 255, 255, 0)'
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {text}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 3: CTA Transition */}
      <section className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="text-center max-w-2xl mx-auto px-8"
          style={{ y: ctaY }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: showCTA ? 1 : 0, y: showCTA ? 0 : 50 }}
          transition={{ duration: 2 }}
        >
          {/* Pre-CTA text */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: showCTA ? 1 : 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300 mb-4 px-4">
              Ready to step into the future?
            </h3>
            <p className="text-gray-400 text-base sm:text-lg px-4">
              Experience the revolution in smart access technology
            </p>
          </motion.div>

          {/* Enhanced CTA Button */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: showCTA ? 1 : 0.8,
              opacity: showCTA ? 1 : 0
            }}
            transition={{ duration: 1.5, delay: 1, ease: "backOut" }}
          >
            <motion.button
              className="group relative px-8 sm:px-12 md:px-16 py-4 sm:py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white font-bold text-lg sm:text-xl rounded-xl overflow-hidden transition-all duration-500"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.6), 0 0 100px rgba(147, 51, 234, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: showCTA ? [
                  '0 0 20px rgba(59, 130, 246, 0.4)',
                  '0 0 40px rgba(147, 51, 234, 0.4)',
                  '0 0 20px rgba(59, 130, 246, 0.4)'
                ] : '0 0 0 rgba(59, 130, 246, 0)',
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                boxShadow: { duration: 3, repeat: Infinity },
                backgroundPosition: { duration: 4, repeat: Infinity }
              }}
              style={{ backgroundSize: '200% 100%' }}
            >
              <span className="relative z-10 flex items-center justify-center space-x-3">
                <span>Start the Experience</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </span>

              {/* Button glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Particle effects on hover */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + (i % 3) * 20}%`
                  }}
                  animate={{
                    y: [-10, -30, -10],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.button>

            {/* Button reflection */}
            <motion.div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-full h-8 bg-gradient-to-b from-blue-500/20 to-transparent rounded-b-xl opacity-30 blur-sm"
              animate={{ opacity: showCTA ? [0.1, 0.3, 0.1] : 0 }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Subtitle with fade-in */}
          <motion.div
            className="mt-8 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showCTA ? 1 : 0, y: showCTA ? 0 : 20 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <p className="text-gray-400 text-sm">
              Discover the future of smart access
            </p>
            <motion.div
              className="flex justify-center space-x-4 text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: showCTA ? 1 : 0 }}
              transition={{ duration: 1, delay: 2.5 }}
            >
              <span>• Interactive Demo</span>
              <span>• Real-time Experience</span>
              <span>• Future Technology</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default EnterTheBoxPage;
