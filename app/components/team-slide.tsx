"use client"

import { useState } from "react"
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
  const [clickedMobile, setClickedMobile] = useState<string | null>(null)

  const handleMobileClick = (personId: string, linkedinUrl: string) => {
    // Check if mobile (simplified check)
    const isMobile = window.innerWidth < 768
    
    if (isMobile) {
      if (clickedMobile === personId) {
        // Second click on mobile - go to LinkedIn
        window.open(linkedinUrl, '_blank')
        setClickedMobile(null)
      } else {
        // First click on mobile - show bio
        setClickedMobile(personId)
      }
    } else {
      // Desktop - go directly to LinkedIn
      window.open(linkedinUrl, '_blank')
    }
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
            className="min-h-screen w-full px-4 py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-full max-w-6xl mx-auto">

              {/* Team Grid */}
              <motion.div
                className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
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
                    className="group relative cursor-pointer"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    onClick={() => handleMobileClick(member.id, member.linkedinUrl)}
                  >
                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === member.id ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                        {/* Company Logos - Top */}
                        <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                          {member.companies.map((company, index) => (
                            <img 
                              key={index}
                              src={company.logo} 
                              alt={company.name} 
                              className="h-24 w-auto opacity-80 invert dark:invert-0" 
                            />
                          ))}
                        </div>

                        {/* Team Member Info - Bottom */}
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">{member.name}</p>
                            <LinkedInIcon size={16} />
                          </div>
                          <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">{member.title}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{member.description}</p>
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
                      <div className="text-6xl text-gray-400 dark:text-gray-600">?</div>
                      <div className="text-center">
                        <p className="text-gray-900 dark:text-gray-100 text-2xl font-semibold">YOU</p>
                      </div>
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
                className="py-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <p className="text-xl italic text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  "{teamQuote}"
                </p>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 