import React from 'react'
import { motion } from 'framer-motion'

interface BlackBoxLogoProps {
  className?: string
  size?: number | string
  variant?: 'light' | 'dark'
  showText?: boolean
}

const BlackBoxLogo: React.FC<BlackBoxLogoProps> = ({
  className = '',
  size = 48,
  variant = 'light',
  showText = true
}) => {
  const logoSize = typeof size === 'number' ? size : 48
  const logoHeight = logoSize * 0.854 // maintain aspect ratio

  // Floating animation variants
  const floatingAnimation = {
    animate: {
      y: [-8, 8, -8],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const glowAnimation = {
    animate: {
      filter: variant === 'light' ? [
        "drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))",
        "drop-shadow(0 0 16px rgba(0, 0, 0, 0.4))",
        "drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))"
      ] : [
        "drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))",
        "drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))",
        "drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))"
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* ANIMATED FLOATING LOGO */}
      <motion.div 
        className="relative"
        variants={floatingAnimation}
        animate="animate"
      >
        <motion.svg
          width={logoSize}
          height={logoHeight}
          viewBox="0 0 130 111"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block"
          style={{ display: 'block' }}
          variants={glowAnimation}
          animate="animate"
        >
          <g
            transform="translate(0,111) scale(0.1,-0.1)"
            className={variant === 'light' ? 'fill-black' : 'fill-white'}
            stroke="none"
          >
            <path
              d="M445 930 c-98 -60 -190 -119 -203 -131 l-24 -21 7 -241 c6 -206 9 -244 23 -258 29 -29 376 -221 407 -225 25 -4 63 15 223 114 106 66 195 122 199 126 7 7 5 302 -3 421 -3 44 -11 85 -17 92 -21 20 -401 233 -417 233 -9 0-96 -49-195 -110z m330 -81 c69 -39 125 -75 125 -79 0 -8 -241 -160 -253-160 -4 0 -35 17 -69 38 -35 21 -91 53 -126 72 -34 18 -61 37 -60 41 3 10 239 159 251 159 4 0 63 -32 132 -71z m195 -241 c0 -35 3 -101 6 -148 3 -47 1 -90 -3 -96 -10 -14 -300 -194 -312 -194 -11 0 -291 158 -309 174 -12 12 -31 316-20 316 8 0 218 -119 250 -141 23 -17 29 -33 50 -144 12 -69 25 -125 28 -125 3 0 13 57 23 127 9 70 20 130 24 134 13 13 247 159 256 159 4 0 7 -28 7 -62z"
            />
          </g>
        </motion.svg>
      </motion.div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold brand-font leading-none ${
              variant === 'light' ? 'text-black' : 'text-white'
            } ${
              logoSize <= 32 ? 'text-lg' :
              logoSize <= 48 ? 'text-xl' :
              logoSize <= 64 ? 'text-2xl' :
              'text-4xl'
            }`}
          >
            BLACK BOX
          </span>
          <span
            className={`text-xs brand-font-secondary font-medium tracking-wider ${
              variant === 'light' ? 'text-gray-600' : 'text-gray-400'
            } ${logoSize <= 32 ? 'hidden' : ''}`}
          >
            SMART VENDING
          </span>
        </div>
      )}
    </div>
  )
}

export default BlackBoxLogo
