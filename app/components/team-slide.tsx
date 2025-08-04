"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

                {/* Andrew O'Doherty */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('andrew', 'https://www.linkedin.com/in/andrew-odoherty/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/andrew_odoherty.png"
                      alt="Andrew O'Doherty"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'andrew' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/citi.svg" alt="Citi" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/pwc.svg" alt="PWC" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Andrew</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">THE OPERATOR</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">From Wall Street to Web3: channels capital-markets discipline into building a verifiable layer for the internet that clears humans, content, and agents at millisecond speed.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Jim Anderson */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('jim', 'https://www.linkedin.com/in/jimjamesanderson/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/jim-anderson.jpg"
                      alt="Jim Anderson"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'jim' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/spotify.svg" alt="Spotify" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/about.svg" alt="About.com" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Jim</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">THE ARCHITECT</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">From Prodigy to co-founding About.com to Spotify's mass rollout, his blueprints reach billions. A go-to advisor for homeland-security tech; his next build lets every digital actor prove it's real.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Steven Chrust */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('steven', 'https://www.linkedin.com/in/steven-chrust/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/steven-chrust.jpg"
                      alt="Steven Chrust"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'steven' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/centricap.svg" alt="Centricap" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/winstar.svg" alt="Winstar" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Steven</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">THE GOVERNOR</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">From Sanford C. Bernstein's research desk to co-founding WinStar's multi-billion IPO, now steering private-equity capital and governance so the Trust Protocol launches with institutional polish.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Stephen Rossetter */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('stephen', 'https://www.linkedin.com/in/stephen-rossetter/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/stephen-rossetter.jpg"
                      alt="Stephen Rossetter"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'stephen' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/ey.svg" alt="EY" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/centricap.svg" alt="Centricap" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Stephen</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">THE CUSTODIAN</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">EY auditor — venture-fund CFO — PE co-founder. Four decades of capital hygiene and board seats now keep balance sheets mission-proof for internet-scale infrastructure.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Jeffrey Brodlieb */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('jeffrey', 'https://www.linkedin.com/in/jeffrey-brodlieb/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/jeffrey-brodlieb.jpg"
                      alt="Jeffrey Brodlieb"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'jeffrey' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/bcg.svg" alt="BCG" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/ge.svg" alt="GE" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Jeffrey</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">THE STRATEGIST</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Private-equity partner and HBS MBA who led GE Capital turnarounds. Launched PREVIEW TV into the nation's fastest-growing subscription network, then advised Fortune 100s at BCG—four decades of strategy distilled.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* David Bell */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('david', 'https://www.linkedin.com/in/david-bell/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/david_bell.png"
                      alt="David Bell"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'david' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/google.svg" alt="Google" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/ipg.svg" alt="IPG" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">David</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">ADVISOR – Brand & Narrative</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Advertising Hall-of-Famer, ex-IPG Chairman. Led two NYSE-listed holding companies, advised AOL & Google in breakout years, and turned Bozell into a top-ten global agency.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Lawrence Leibowitz */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('lawrence', 'https://www.linkedin.com/in/larry-leibowitz/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/lawrence_leibowitz.png"
                      alt="Lawrence Leibowitz"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'lawrence' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/nyse.svg" alt="NYSE" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/ubs.svg" alt="UBS" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Lawrence</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">ADVISOR – Market Structure & Governance</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Former COO of NYSE, led through its $10bn ICE acquisition. Understands how governance, liquidity, and confidence intertwine. Now applies that muscle to make credibility an asset class.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Tom Saleh */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('tom', 'https://www.linkedin.com/in/tom-saleh/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/tom_saleh.jpg"
                      alt="Tom Saleh"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'tom' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/fasb.svg" alt="FASB" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/nyse.svg" alt="NYSE" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Tom</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">ADVISOR – Infrastructure & Compliance</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Built the first automated futures exchange, overhauled FASB's XBRL "intelligent-data" project, and pioneered policy-driven VM security a decade before "zero trust." Seven companies founded, six exits—three decades turning complexity into compliance.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Keith Turco */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('keith', 'https://www.linkedin.com/in/keith-turco/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/keith_turco.png"
                      alt="Keith Turco"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'keith' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/madison-logic.svg" alt="Madison Logic" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/broadcom.svg" alt="Broadcom" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Keith</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">ADVISOR – GTM & Enterprise Growth</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">25-year growth architect: scaled CA Tech, Ogilvy, and Merge. Crafts B2B flywheels so new categories feel inevitable. Built and exited agencies, ran $100m P&Ls, served on AAF & ANA boards.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Alan Kessman */}
                <motion.div
                  className="group relative cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => handleMobileClick('alan', 'https://www.linkedin.com/in/alan-kessman/')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/team/alan-kessman.jpg"
                      alt="Alan Kessman"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 ${clickedMobile === 'alan' ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4`}>
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/unimed.svg" alt="Unimed" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/vion.svg" alt="Vion" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>

                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Alan</p>
                          <LinkedInIcon size={16} />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">ADVISOR – Scale & Capital Markets</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Serial CEO & turnaround specialist. Sixteen boardrooms, countless crises. Led $500m businesses through turnaround, growth, and exit—including the PE sale of Universal Marine Medical.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* You? - Recruiting Card */}
                <motion.div
                  className="group relative"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center justify-center relative">
                    <div className="text-6xl text-gray-400 dark:text-gray-600 mb-4">?</div>
                    {/* Always visible "You?" text */}
                    <div className="text-center">
                      <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">You?</p>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Recruiting Info - Bottom */}
                      <div className="mt-auto">
                        <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">You?</p>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Signal Catalyst</p>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          If you built a bot that crashed the school network just for fun…<br />
                          If you'd rather <strong>create the future</strong>, not copy the past…<br />
                          If you've ever looked at the internet and thought, "I can fix this…"<br />
                          Then we're looking for you.<br />
                          <strong>We don't want your resume.</strong><br />
                          This is about your <strong>signal</strong>.<br />
                          If it resonates, it will find us.
                          <a href="mailto:andrew@inverus.tech" className="mt-4 inline-block bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold py-2 px-6 rounded-full shadow-lg shadow-blue-600/20 text-base">Send your Signal</a>
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
                  "A generational ensemble… forged across cycles, systems, and disciplines… aligned by one mission: to rebuild trust at the protocol layer of the internet."
                </p>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 