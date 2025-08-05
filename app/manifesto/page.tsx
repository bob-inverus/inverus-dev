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
                And in its place came performance, proxies, and plausible deniability.
              </p>

              <p>
                Not a feature.<br />
                Not a filter.<br />
                A <strong>foundation.</strong>
              </p>

              <p>
                A <strong>principle embedded in protocol</strong>,<br />
                <span className="ml-6">a <strong>trust engine</strong> at the root of coordination,</span><br />
                <span className="ml-6">a <strong>signal beneath the noise —</strong></span><br />
                designed not to dominate, but to verify.
              </p>

              <p>
                A new basis for a real internet —<br />
                <strong>owned by no one, available to everyone.</strong>
              </p>

              <p>
                Built from first principles:<br />
                <span className="ml-6"><strong>Observable. Immutable. Shared.</strong></span><br />
                <span className="ml-6"><strong>Mathematical,</strong> not reputational.</span><br />
                <span className="ml-6"><strong>Credibly neutral.</strong> Coordination-first. <strong>Trustless by design.</strong></span>
              </p>

              <p>
                Where identities are not just claimed — but <strong>confirmed.</strong><br />
                Where confidence is not a feeling — but a <strong>provable state.</strong><br />
                Where saying "I'm real" isn't enough —<br />
                <span className="ml-6">because now, <strong>the system can say it back.</strong></span>
              </p>

              <p>
                In an age where machines talk,<br />
                <span className="ml-6">bots transact,</span><br />
                <span className="ml-6">and synthetic media wears a thousand faces,</span><br />
                we must verify not just the <strong>what —</strong> but the <strong>who.</strong><br />
                Not just content — but <strong>context.</strong><br />
                Not just signal — but <strong>source.</strong>
              </p>

              <p>
                This isn't a someday.<br />
                It's <strong>inevitable.</strong>
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
                It needs a <strong>root layer of trust.</strong>
              </p>

              <p>
                Some chose noise.<br />
                Others chose signal.
              </p>

              <p>
                There were always two internets:<br />
                <span className="ml-6">One built to amplify.</span><br />
                <span className="ml-6">One built to verify.</span>
              </p>

              <p>
                Only now...<br />
                <strong>can we tell them apart.</strong>
              </p>

              <p>
                This is not just a better version of what came before.<br />
                <span className="ml-6">It's a new <strong>possibility space —</strong> for systems, societies, and souls.</span>
              </p>

              <p>
                It's not a company.<br />
                It's not a pitch.<br />
                It's a <strong>foundation.</strong>
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
                With signal.<br />
                With sovereignty.<br />
                With trust — made legible.
              </p>

              <p>
                This isn't a conclusion.<br />
                It's a beginning.
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