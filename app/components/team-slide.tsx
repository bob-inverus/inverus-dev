"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

interface TeamSlideProps {
  isOpen: boolean
  onClose: () => void
}

export function TeamSlide({ isOpen, onClose }: TeamSlideProps) {
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
                  onClick={() => window.open('https://www.linkedin.com/in/andrew-odoherty/', '_blank')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/andrew_odoherty.png" 
                      alt="Andrew O'Doherty" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/citi.svg" alt="Citi" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/pwc.svg" alt="PWC" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Andrew O'Doherty</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Architect of Signal & Structure</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Built global custody platforms to move trillions without friction. Now rebuilding trust across human networks.</p>
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
                  onClick={() => window.open('https://www.linkedin.com/in/jimjamesanderson/', '_blank')}
                >
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/jim-anderson.jpg" 
                      alt="Jim Anderson" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/spotify.svg" alt="Spotify" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/about.svg" alt="About.com" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Jim Anderson</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Infrastructure Whisperer</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Co-wrote the architecture of Spotify & About.com. Now surfacing truth by design.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Steven Chrust */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/steven-chrust/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/steven-chrust.jpg" 
                      alt="Steven Chrust" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/centricap.svg" alt="Centricap" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/winstar.svg" alt="Winstar" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Steven Chrust</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Fracture Forger</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Helped wire the first internet. Now ensuring the second one avoids the same cracks.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stephen Rossetter */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/stephen-rossetter/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/stephen-rossetter.jpg" 
                      alt="Stephen Rossetter" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/ey.svg" alt="EY" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/centricap.svg" alt="Centricap" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Stephen Rossetter</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Chief Financial Officer</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Engineered billion-dollar capital flows. Now fortifying digital trust economies.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jeffrey Brodlieb */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/jeffrey-brodlieb/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/jeffrey-brodlieb.jpg" 
                      alt="Jeffrey Brodlieb" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/bcg.svg" alt="BCG" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/ge.svg" alt="GE" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Jeffrey Brodlieb</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Business Strategy</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Crafted strategic transactions at GE Capital. Now architecting growth through trust.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alan Kessman */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/alan-kessman/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/alan-kessman.jpg" 
                      alt="Alan Kessman" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/unimed.svg" alt="Unimed" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/vion.svg" alt="Vion" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Alan Kessman</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Steward of Systems</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Took tech firms public, guided wartime to peacetime. Now guarding the long game of truth.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Larry Leibowitz */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/larry-leibowitz/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/lawrence_leibowitz.png" 
                      alt="Larry Leibowitz" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/nyse.svg" alt="NYSE" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/ubs.svg" alt="UBS" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Larry Leibowitz</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Market Mechanic</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Former COO of NYSE. Spent a career engineering confidence into markets. Now guiding the architecture of digital trust.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* David Bell */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/david-bell/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/david_bell.png" 
                      alt="David Bell" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/google.svg" alt="Google" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/ipg.svg" alt="IPG" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">David Bell</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Brand Signal Theorist</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Shaped iconic brands for decades. Now working to make truth itself feel iconic again.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keith Turco */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/keith-turco/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/keith_turco.png" 
                      alt="Keith Turco" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/madison-logic.svg" alt="Madison Logic" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/broadcom.svg" alt="Broadcom" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Keith Turco</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">GTM Alchemist</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Scaled revenue engines others couldn't. Now catalyzing trust as a category.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tom Saleh */}
                <div className="group relative cursor-pointer" onClick={() => window.open('https://www.linkedin.com/in/tom-saleh/', '_blank')}>
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src="/team/tom_saleh.jpg" 
                      alt="Tom Saleh" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-4">
                      {/* Company Logos - Top */}
                      <div className="flex justify-center items-center gap-6 mb-4 flex-1">
                        <img src="/companies/fasb.svg" alt="FASB" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                        <img src="/companies/nyse.svg" alt="NYSE" className="h-24 w-auto opacity-80 invert dark:invert-0" />
                      </div>
                      
                      {/* Team Member Info - Bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Tom Saleh</p>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Cycle-Honed Instinct</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Read markets before algorithms did. Now investing in architectures that clarify the world.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* You? - Recruiting Card */}
                <div className="group relative">
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
                          <a href="mailto:build@inverus.tech" className="mt-4 inline-block bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold py-2 px-6 rounded-full shadow-lg shadow-blue-600/20 text-base">Send your signal</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>

              {/* Interstitial Quote */}
              <motion.div 
                className="py-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <p className="text-xl italic text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  "Protocols are written by systems; histories are written by people."
                </p>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 