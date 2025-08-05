"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function ManifestoPage() {
  return (
    <div className="w-full">
      {/* Back Arrow - Fixed position */}
      <motion.div
        className="fixed left-8 top-1/2 transform -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/">
          <motion.button
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
        </Link>
      </motion.div>

      {/* Full Screen Manifesto Section */}
      <section className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Manifesto Title - Aligned with content */}
          <div className="mb-16">
            <p className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight text-gray-900 dark:text-gray-100 font-[family-name:var(--font-ibm-plex-mono)]">
              The Trust Manifesto
            </p>
          </div>

          {/* Manifesto Content */}
          <div>
            <div className="space-y-8 text-base md:text-lg leading-relaxed font-[family-name:var(--font-ibm-plex-mono)] text-gray-800 dark:text-gray-200">
              
              <p>
                We believed the internet would connect us.<br />
                <span className="ml-6">It did.</span><br />
                <span className="ml-6">But not in the way we imagined.</span>
              </p>

              <p>
                It connected noise to scale.<br />
                <span className="ml-6">Anonymity to power.</span><br />
                <span className="ml-6">Fraud to opportunity.</span>
              </p>

              <p>
                Now it connects billions of signals — with almost no way to know —<br />
                <span className="ml-6"><strong>What's real? Who's real? Can I trust this?</strong></span>
              </p>

              <p>
                Ask yourself:<br />
                <span className="ml-6">When was the last time <strong>you knew — without doubt —</strong> who was on the other side?</span>
              </p>

              <p>
                This isn't a surface glitch.<br />
                <span className="ml-6">It's a <strong>civilizational fracture.</strong></span>
              </p>

              <p>
                In that fracture, we built walls:<br />
                <span className="ml-6">Between people.</span><br />
                <span className="ml-6">Between systems.</span><br />
                <span className="ml-6">Between truth and transaction.</span>
              </p>

              <p>Trust didn't vanish.<br />
                <span className="ml-6"><strong>It atomized.</strong></span><br />
                <span className="ml-6">And in its place came performance, proxies, and plausible deniability.</span>
              </p>

              <p>
                Not a feature.<br />
                <span className="ml-6">Not a filter.</span><br />
                <span className="ml-6">A <strong>foundation.</strong></span>
              </p>

              <p>
                A <strong>principle embedded in protocol</strong>,<br />
                <span className="ml-6">a <strong>trust engine</strong> at the root of coordination,</span><br />
                <span className="ml-6">a <strong>signal beneath the noise —</strong></span><br />
                <span className="ml-6">designed not to dominate, but to verify.</span>
              </p>

              <p>
                A new basis for a real internet —<br />
                <span className="ml-6"><strong>owned by no one, available to everyone.</strong></span>
              </p>

              <p>
                Built from first principles:<br />
                <span className="ml-6"><strong>Observable. Immutable. Shared.</strong></span><br />
                <span className="ml-6"><strong>Mathematical,</strong> not reputational.</span><br />
                <span className="ml-6"><strong>Credibly neutral.</strong> Coordination-first. <strong>Trustless by design.</strong></span>
              </p>

              <p>
                Where identities are not just claimed — but <strong>confirmed.</strong><br />
                <span className="ml-6">Where confidence is not a feeling — but a <strong>provable state.</strong></span><br />
                <span className="ml-6">Where saying "I'm real" isn't enough —</span><br />
                <span className="ml-6">because now, <strong>the system can say it back.</strong></span>
              </p>

              <p>
                In an age where machines talk,<br />
                <span className="ml-6">bots transact,</span><br />
                <span className="ml-6">and synthetic media wears a thousand faces,</span><br />
                <span className="ml-6">we must verify not just the <strong>what —</strong> but the <strong>who.</strong></span><br />
                <span className="ml-6">Not just content — but <strong>context.</strong></span><br />
                <span className="ml-6">Not just signal — but <strong>source.</strong></span>
              </p>

              <p>
                This isn't a someday.<br />
                <span className="ml-6">It's <strong>inevitable.</strong></span>
              </p>

              <p>
                Because the signal was always there —<br />
                <span className="ml-6"><strong>waiting for a system that could listen.</strong></span>
              </p>

              <p>
                And beyond the shadows of noise,<br />
                <span className="ml-6"><strong>truth becomes legible.</strong></span>
              </p>

              <p>
                The internet doesn't need more platforms.<br />
                <span className="ml-6">It needs a <strong>root layer of trust.</strong></span>
              </p>

              <p>
                Some chose noise.<br />
                <span className="ml-6">Others chose signal.</span>
              </p>

              <p>
                There were always two internets:<br />
                <span className="ml-6">One built to amplify.</span><br />
                <span className="ml-6">One built to verify.</span>
              </p>

              <p>
                Only now...<br />
                <span className="ml-6"><strong>can we tell them apart.</strong></span>
              </p>

              <p>
                This is not just a better version of what came before.<br />
                <span className="ml-6">It's a new <strong>possibility space —</strong> for systems, societies, and souls.</span>
              </p>

              <p>
                It's not a company.<br />
                <span className="ml-6">It's not a pitch.<br /></span>
                <span className="ml-6">It's a <strong>foundation.</strong></span>
              </p>

              <p>
                A <strong>principle encoded in protocol</strong>,<br />
                <span className="ml-6">a <strong>system built to remember</strong>,</span><br />
                <span className="ml-6">a <strong>covenant made legible.</strong></span>
              </p>

              <p>
                This isn't a movement of belief.<br />
                <span className="ml-6">It's a movement of <strong>proof.</strong></span>
              </p>

              <p>
                Trust is not a promise.<br />
                <span className="ml-6">It's a <strong>system condition —</strong></span><br />
                <span className="ml-6">engineered, observable, and built to scale.</span>
              </p>

              <p>
                What comes next begins here.<br />
                <span className="ml-6"><strong>With signal.</strong></span><br />
                <span className="ml-6"><strong>With sovereignty.</strong></span><br />
                <span className="ml-6"><strong>With trust </strong> — made legible.</span>
              </p>

              <p>
                This isn't a conclusion.<br />
                <span className="ml-6">It's a beginning.</span>
              </p>

              <p>
                And when trust becomes structure,<br />
                <span className="ml-6">freedom follows.</span>
              </p>

              <p>
                When proof replaces permission,<br />
                <span className="ml-6">people rise.</span>
              </p>

              <p>
                The system was broken.<br />
                <span className="ml-6">We chose to build one worthy of belief.</span>
              </p>

              <p>
                <strong>For every transaction. For every truth.</strong><br />
                <span className="ml-6"><strong>For everyone.</strong></span>
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 