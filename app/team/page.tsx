"use client"

import Link from "next/link"

export default function TeamPage() {
  return (
    <div className="w-full">
      {/* Full Screen Team Section */}
      <section className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">


          {/* Team Grid */}
          <div className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            
            {/* Andrew O'Doherty */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Andrew" 
                  alt="Andrew O'Doherty" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Andrew O'Doherty</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Architect of Signal & Structure</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=Custody" alt="Custody Platform" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Global" alt="Global Finance" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Built global custody platforms to move trillions without friction. Now rebuilding trust across human networks.</p>
                </div>
              </div>
            </div>

            {/* Jim Anderson */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Jim" 
                  alt="Jim Anderson" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Jim Anderson</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Infrastructure Whisperer</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/40x16?text=Spotify" alt="Spotify" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/40x16?text=About" alt="About.com" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Co-wrote the architecture of Spotify & About.com. Now surfacing truth by design.</p>
                </div>
              </div>
            </div>

            {/* Steven Chrust */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Steven" 
                  alt="Steven Chrust" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Steven Chrust</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Fracture Forger</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=ARPA" alt="ARPANET" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Web1" alt="Early Web" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Helped wire the first internet. Now ensuring the second one avoids the same cracks.</p>
                </div>
              </div>
            </div>

            {/* Stephen Rossetter */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Stephen" 
                  alt="Stephen Rossetter" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Stephen Rossetter</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Chief Financial Officer</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=Capital" alt="Capital Markets" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Flow" alt="Capital Flow" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Engineered billion-dollar capital flows. Now fortifying digital trust economies.</p>
                </div>
              </div>
            </div>

            {/* Jeffrey Brodlieb */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Jeffrey" 
                  alt="Jeffrey Brodlieb" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Jeffrey Brodlieb</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Business Strategy</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=GE" alt="General Electric" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Capital" alt="GE Capital" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Crafted strategic transactions at GE Capital. Now architecting growth through trust.</p>
                </div>
              </div>
            </div>

            {/* Alan Kessman */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Alan" 
                  alt="Alan Kessman" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Alan Kessman</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Steward of Systems</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=Tech" alt="Tech Firms" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=IPO" alt="Public Offerings" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Took tech firms public, guided wartime to peacetime. Now guarding the long game of truth.</p>
                </div>
              </div>
            </div>

            {/* Larry Leibowitz */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Larry" 
                  alt="Larry Leibowitz" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Larry Leibowitz</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Market Mechanic</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/40x16?text=NYSE" alt="New York Stock Exchange" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=COO" alt="Chief Operating Officer" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Former COO of NYSE. Spent a career engineering confidence into markets. Now guiding the architecture of digital trust.</p>
                </div>
              </div>
            </div>

            {/* David Bell */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=David" 
                  alt="David Bell" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">David Bell</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Brand Signal Theorist</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=Brand" alt="Brand Agency" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Iconic" alt="Iconic Brands" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Shaped iconic brands for decades. Now working to make truth itself feel iconic again.</p>
                </div>
              </div>
            </div>

            {/* Keith Turco */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Keith" 
                  alt="Keith Turco" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Keith Turco</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">GTM Alchemist</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=GTM" alt="Go-to-Market" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Revenue" alt="Revenue Growth" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Scaled revenue engines others couldn't. Now catalyzing trust as a category.</p>
                </div>
              </div>
            </div>

            {/* Alan Kessman (duplicate from HTML) */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Alan" 
                  alt="Alan Kessman" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Alan Kessman</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Steward of Systems</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=Tech" alt="Tech Firms" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=IPO" alt="Public Offerings" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Took tech firms public, guided wartime to peacetime. Now guarding the long game of truth.</p>
                </div>
              </div>
            </div>

            {/* Tom Saleh */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src="https://placehold.co/400x400?text=Tom" 
                  alt="Tom Saleh" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">Tom Saleh</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Cycle-Honed Instinct</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=Markets" alt="Market Analysis" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Invest" alt="Investment" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">Read markets before algorithms did. Now investing in architectures that clarify the world.</p>
                </div>
              </div>
            </div>

            {/* You? - Recruiting Card */}
            <div className="group relative">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-6xl text-gray-400 dark:text-gray-600">?</div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 overflow-y-auto">
                  <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">You?</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Signal Catalyst</p>
                  <div className="flex gap-2 mb-3">
                    <img src="https://placehold.co/32x16?text=Future" alt="Future Tech" className="h-4 opacity-70 filter grayscale" />
                    <img src="https://placehold.co/32x16?text=Signal" alt="Signal" className="h-4 opacity-70 filter grayscale" />
                  </div>
                  <details className="text-sm text-gray-700 dark:text-gray-300">
                    <summary className="cursor-pointer underline">Join the ensemble →</summary>
                    <div className="mt-2 leading-relaxed">
                      If you built a bot that crashed the school network just for fun…<br />
                      If you'd rather <strong>create the future</strong>, not copy the past…<br />
                      If you've ever looked at the internet and thought, "I can fix this…"<br />
                      Then we're looking for you.<br />
                      <strong>We don't want your resume.</strong><br />
                      This is about your <strong>signal</strong>.<br />
                      If it resonates, it will find us.
                      <a href="mailto:build@inverus.tech" className="mt-4 inline-block bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold py-2 px-6 rounded-full shadow-lg shadow-blue-600/20 text-base">Send your signal</a>
                    </div>
                  </details>
                </div>
              </div>
            </div>

          </div>

          {/* Interstitial Quote */}
          <div className="py-16 text-center">
            <p className="text-xl italic text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              "Protocols are written by systems; histories are written by people."
            </p>
          </div>

        </div>
      </section>
    </div>
  )
} 