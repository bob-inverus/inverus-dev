"use client"

import React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { teamMembers, recruitingCard, teamQuote } from "@/lib/team"

interface TeamSlideProps {
  isOpen: boolean
  onClose: () => void
}

// LinkedIn Icon Component
const LinkedInIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="opacity-80 text-gray-600 dark:text-gray-400">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export function TeamSlide({ isOpen, onClose }: TeamSlideProps) {
  const handleCardClick = (personId: string, linkedinUrl: string) => {
    // Direct LinkedIn opening for all devices
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.3 }
          }}
          className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto"
        >
          {/* Back Arrow */}
          <motion.div
            className="fixed left-8 top-1/2 transform -translate-y-1/2 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={onClose}
              className="group flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors duration-300 cursor-pointer"
              whileHover={{ x: -5 }}
            >
              <motion.div
                animate={{ x: [0, -8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronLeft size={32} className="text-blue-500 group-hover:text-blue-600" />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Team Content */}
          <motion.div
            className="min-h-screen w-full px-2 md:px-4 py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-full max-w-6xl mx-auto">

              {/* Team Grid */}
              <motion.div
                className="grid gap-4 md:gap-8 lg:gap-10 grid-cols-1 lg:grid-cols-3 auto-rows-fr"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      delay: 0.4,
                      staggerChildren: 0.1
                    }
                  }
                }}
              >

                {/* Team Members */}
                {teamMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    className="team-member-card group relative cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95 rounded-lg"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    onClick={() => handleCardClick(member.id, member.linkedinUrl)}
                  >
                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
                      />
                      {/* Hover/Click Overlay - Desktop: hover, Mobile: click to reveal */}
                      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-2 md:p-4 overflow-y-auto">
                        {/* Company Logos - Top */}
                        <div className="flex justify-center items-center gap-2 md:gap-6 mb-2 md:mb-4 flex-1">
                          {member.companies.map((company, index) => (
                            <img 
                              key={index}
                              src={company.logo} 
                              alt={company.name} 
                              className="h-12 md:h-24 w-auto opacity-80 invert dark:invert-0" 
                            />
                          ))}
                        </div>

                        {/* Team Member Info - Bottom */}
                        <div className="mt-auto">
                          <div className="flex items-center gap-1 md:gap-2 mb-1">
                            <p className="text-gray-900 dark:text-gray-100 text-sm md:text-lg font-semibold">{member.name}</p>
                            <LinkedInIcon size={12} />
                          </div>
                          <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1 md:mb-2">{member.title}</p>
                          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-snug mb-1 md:mb-2">{member.description}</p>
                          

                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* You? - Recruiting Card */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                      <div className="text-6xl text-gray-400 dark:text-gray-600">YOU?</div>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Recruiting Info - Bottom */}
                      <div className="mt-auto">
                        <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">You?</p>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">{recruitingCard.title}</p>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                          <p className="mb-4">
                            Ready to <strong>build the future</strong> of trust?<br />
                            We're looking for builders, not resumes.
                          </p>
                          <a 
                            href={`mailto:${recruitingCard.ctaEmail}?subject=I want to join the inVerus team&body=Hi Andrew,%0D%0A%0D%0AI'm interested in joining the inVerus team.%0D%0A%0D%0A`} 
                            className="inline-block bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-blue-600/20 text-base"
                          >
                            {recruitingCard.ctaText}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </motion.div>

              {/* Interstitial Quote */}
              <motion.div
                className="pt-16 pb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <p className="text-xl italic text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  "{teamQuote}"
                </p>
              </motion.div>

              {/* Pulsing Blue Shield Logo - Very Bottom */}
              <motion.div
                className="flex justify-center pb-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <Link href="/" className="inline-flex items-center justify-center">
                  <motion.svg 
                    className="w-8 h-8"
                    width="50" 
                    height="50" 
                    viewBox="0 0 50 50" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <rect width="50" height="50" rx="15" fill="#006DED"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.7366 6.15368C23.9778 6.05228 24.2376 6 24.5 6C24.7624 6 25.0222 6.05228 25.2634 6.15368L37.6518 11.3612C38.3489 11.6542 38.9431 12.1415 39.3605 12.7626C39.7779 13.3836 40.0003 14.1112 40 14.855V27.888C39.9998 30.2322 39.3676 32.5348 38.1675 34.5623C36.9675 36.5898 35.2422 38.2703 33.1664 39.4334L25.461 43.7498C25.1683 43.9138 24.8371 44 24.5 44C24.1629 44 23.8317 43.9138 23.539 43.7498L15.8336 39.4334C13.7573 38.27 12.0316 36.5889 10.8315 34.5607C9.6314 32.5324 8.99955 30.2291 9 27.8842V14.855C9.00008 14.1115 9.22261 13.3844 9.64002 12.7637C10.0574 12.143 10.6514 11.656 11.3482 11.3631L23.7366 6.15368ZM31.6823 22.5437C32.0352 22.1854 32.2305 21.7055 32.2261 21.2073C32.2217 20.7092 32.0179 20.2327 31.6587 19.8804C31.2995 19.5282 30.8135 19.3284 30.3055 19.3241C29.7975 19.3197 29.3081 19.5112 28.9427 19.8573L22.5625 26.1135L20.0573 23.657C19.6919 23.3109 19.2025 23.1194 18.6945 23.1238C18.1865 23.1281 17.7005 23.3279 17.3413 23.6802C16.9821 24.0324 16.7783 24.5089 16.7739 25.007C16.7695 25.5052 16.9648 25.9851 17.3177 26.3434L21.1927 30.1431C21.556 30.4993 22.0487 30.6994 22.5625 30.6994C23.0763 30.6994 23.569 30.4993 23.9323 30.1431L31.6823 22.5437Z" fill="white"/>
                  </motion.svg>
                </Link>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 