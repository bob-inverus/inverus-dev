"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { FloatingChatInput } from "@/app/components/floating-chat-input"

export default function ManifestoPage() {
  const handleChatSubmit = (message: string) => {
    // Redirect to main chat with the message
    window.location.href = `/?message=${encodeURIComponent(message)}`
  }

  return (
    <div className="w-full">
      {/* Full Screen Manifesto Section */}
      <section className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-16">
            {/* Back to Home Link - Left aligned */}
            <div className="mb-12">
              <Link 
                href="/" 
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm"
              >
                ← Back to Home
              </Link>
            </div>
            
            {/* Manifesto Title - Centered with IBM Plex Mono */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight text-gray-900 dark:text-gray-100 mb-16 font-[family-name:var(--font-ibm-plex-mono)]">
                The Trust Manifesto
              </h1>
            </div>
          </div>

          {/* Manifesto Content */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12 text-base md:text-lg leading-relaxed font-[family-name:var(--font-ibm-plex-mono)]">
              
                             {/* Section 1 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">We believed the internet would <strong>connect</strong> us.</p>
                 <p className="ml-6 mb-2">It did.</p>
                 <p className="ml-6 mb-6">But not in the way we imagined.</p>
                 <p className="mb-2">It connected <strong>noise to scale</strong>.</p>
                 <p className="ml-6 mb-2"><strong>Anonymity to power</strong>.</p>
                 <p className="ml-6 mb-6"><strong>Fraud to opportunity</strong>.</p>
                 <p className="mb-2">Now it connects billions of signals — with almost no way to know —</p>
                 <p className="ml-6 mb-2"><strong>What's real? Who's real? Can I trust this?</strong></p>
                 <p className="mb-2">Ask yourself:</p>
                 <p className="ml-6 mb-8">When was the last time you knew — <strong>without doubt</strong> — who was on the other side?</p>
               </div>

                             {/* Section 2 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">This isn't a surface glitch.</p>
                 <p className="ml-6 mb-6">It's a <strong>civilizational fracture</strong>.</p>
                 <p className="mb-2">In that fracture, we built <strong>walls</strong>:</p>
                 <p className="ml-6 mb-2">Between people.</p>
                 <p className="ml-6 mb-2">Between systems.</p>
                 <p className="ml-6 mb-6">Between truth and transaction.</p>
                 <p className="mb-2">Trust didn't vanish.</p>
                 <p className="ml-6 mb-2">It <strong>atomized</strong>.</p>
                 <p className="ml-6 mb-8">And in its place came <strong>performance, proxies, and plausible deniability</strong>.</p>
               </div>

                             {/* Section 3 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">Not a feature.</p>
                 <p className="ml-6 mb-2">Not a filter.</p>
                 <p className="ml-6 mb-6"><strong>A foundation</strong>.</p>
                 <p className="mb-2">A principle embedded in protocol,</p>
                 <p className="ml-6 mb-2">a <strong>trust engine</strong> at the root of coordination,</p>
                 <p className="ml-6 mb-2">a <strong>signal beneath the noise</strong> —</p>
                 <p className="ml-6 mb-6">designed not to dominate, but to <strong>verify</strong>.</p>
                 <p className="mb-2">A new basis for a <strong>real internet</strong> —</p>
                 <p className="ml-6 mb-8"><strong>owned by no one, available to everyone</strong>.</p>
               </div>
 
               {/* Section 4 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">Built from <strong>first principles</strong>:</p>
                 <p className="ml-6 mb-2"><strong>Observable. Immutable. Shared</strong>.</p>
                 <p className="ml-6 mb-2"><strong>Mathematical, not reputational</strong>.</p>
                 <p className="ml-6 mb-8"><strong>Credibly neutral. Coordination-first. Trustless by design</strong>.</p>
               </div>

                             {/* Section 5 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">Where identities are not just <strong>claimed</strong> — but <strong>confirmed</strong>.</p>
                 <p className="ml-6 mb-2">Where confidence is not a feeling — but a <strong>provable state</strong>.</p>
                 <p className="ml-6 mb-2">Where saying "I'm real" isn't enough —</p>
                 <p className="ml-6 mb-8">because now, <strong>the system can say it back</strong>.</p>
               </div>
 
               {/* Section 6 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">In an age where <strong>machines talk</strong>,</p>
                 <p className="ml-6 mb-2"><strong>bots transact</strong>,</p>
                 <p className="ml-6 mb-2">and <strong>synthetic media wears a thousand faces</strong>,</p>
                 <p className="ml-6 mb-2">we must verify not just the <strong>what</strong> — but the <strong>who</strong>.</p>
                 <p className="ml-6 mb-2">Not just <strong>content</strong> — but <strong>context</strong>.</p>
                 <p className="ml-6 mb-8">Not just <strong>signal</strong> — but <strong>source</strong>.</p>
               </div>

                             {/* Section 7 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">This isn't a someday.</p>
                 <p className="ml-6 mb-6">It's <strong>inevitable</strong>.</p>
                 <p className="mb-2">Because the <strong>signal</strong> was always there —</p>
                 <p className="ml-6 mb-6">waiting for a system that could <strong>listen</strong>.</p>
                 <p className="mb-2">And beyond the shadows of noise,</p>
                 <p className="ml-6 mb-8"><strong>truth becomes legible</strong>.</p>
               </div>
 
               {/* Section 8 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">The internet doesn't need more platforms.</p>
                 <p className="ml-6 mb-6">It needs a <strong>root layer of trust</strong>.</p>
                 <p className="mb-2">Some chose <strong>noise</strong>.</p>
                 <p className="ml-6 mb-6">Others chose <strong>signal</strong>.</p>
                 <p className="mb-2">There were always <strong>two internets</strong>:</p>
                 <p className="ml-6 mb-2">One built to <strong>amplify</strong>.</p>
                 <p className="ml-6 mb-6">One built to <strong>verify</strong>.</p>
                 <p className="mb-2">Only now...</p>
                 <p className="ml-6 mb-8">can we tell them apart.</p>
               </div>

                             {/* Section 9 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">This is not just a better version of what came before.</p>
                 <p className="ml-6 mb-8">It's a <strong>new possibility space</strong> — for systems, societies, and souls.</p>
               </div>
 
               {/* Section 10 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">It's not a company.</p>
                 <p className="ml-6 mb-2">It's not a pitch.</p>
                 <p className="ml-6 mb-6">It's a <strong>foundation</strong>.</p>
                 <p className="mb-2">A <strong>principle encoded in protocol</strong>,</p>
                 <p className="ml-6 mb-2">a <strong>system built to remember</strong>,</p>
                 <p className="ml-6 mb-8">a <strong>covenant made legible</strong>.</p>
               </div>
 
               {/* Section 11 */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">This isn't a movement of belief.</p>
                 <p className="ml-6 mb-6">It's a <strong>movement of proof</strong>.</p>
                 <p className="mb-2">Trust is not a promise.</p>
                 <p className="ml-6 mb-2">It's a <strong>system condition</strong> —</p>
                 <p className="ml-6 mb-6"><strong>engineered, observable, and built to scale</strong>.</p>
                 <p className="mb-2">What comes next begins here.</p>
                 <p className="ml-6 mb-2">With <strong>signal</strong>.</p>
                 <p className="ml-6 mb-2">With <strong>sovereignty</strong>.</p>
                 <p className="ml-6 mb-8">With <strong>trust — made legible</strong>.</p>
               </div>

                             {/* Section 12 - Final */}
               <div className="text-gray-800 dark:text-gray-200">
                 <p className="mb-2">This isn't a conclusion.</p>
                 <p className="ml-6 mb-6">It's a <strong>beginning</strong>.</p>
                 <p className="mb-2">And when <strong>trust becomes structure</strong>,</p>
                 <p className="ml-6 mb-6"><strong>freedom follows</strong>.</p>
                 <p className="mb-2">When <strong>proof replaces permission</strong>,</p>
                 <p className="ml-6 mb-6"><strong>people rise</strong>.</p>
                 <p className="mb-2">The system was broken.</p>
                 <p className="ml-6 mb-6">We chose to build one <strong>worthy of belief</strong>.</p>
                 <p className="mb-2">For every transaction. For every truth.</p>
                 <p className="ml-6 mb-6"><strong>For everyone</strong>.</p>
               </div>

            </div>
          </div>
                 </div>

       </section>

       {/* Floating Chat Input */}
       <FloatingChatInput 
         placeholder="Ask about the manifesto..." 
         onSubmit={handleChatSubmit}
       />
     </div>
   )
 } 