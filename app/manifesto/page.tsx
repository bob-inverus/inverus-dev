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
                <span className="ml-6">What's real? Who's real? Can I trust this?</span>
              </p>

              <p className="font-bold">Ask yourself:</p>
              <p>
                <span className="ml-6">When was the last time you knew — without doubt — who was on the other side?</span>
              </p>

              <p>
                This isn't a surface glitch.<br />
                <span className="ml-6">It's a civilizational fracture.</span>
              </p>

              <p>
                In that fracture, we built walls:<br />
                <span className="ml-6">Between people.</span><br />
                <span className="ml-6">Between systems.</span><br />
                <span className="ml-6">Between truth and transaction.</span>
              </p>

              <p>
                Trust didn't vanish.<br />
                <span className="ml-6">It atomized.</span><br />
                And in its place came performance, proxies, and plausible deniability.
              </p>

              <p className="font-bold">
                Not a feature.<br />
                Not a filter.<br />
                A foundation.
              </p>

              <p>
                A principle embedded in protocol,<br />
                <span className="ml-6">a trust engine at the root of coordination,</span><br />
                <span className="ml-6">a signal beneath the noise —</span><br />
                designed not to dominate, but to verify.
              </p>

              <p className="font-bold">
                A new basis for a real internet —<br />
                owned by no one, available to everyone.
              </p>

              <p>
                Built from first principles:<br />
                <span className="ml-6">Observable. Immutable. Shared.</span><br />
                <span className="ml-6">Mathematical, not reputational.</span><br />
                <span className="ml-6">Credibly neutral. Coordination-first. Trustless by design.</span>
              </p>

              <p>
                Where identities are not just claimed — but confirmed.<br />
                Where confidence is not a feeling — but a provable state.<br />
                Where saying "I'm real" isn't enough —<br />
                <span className="ml-6">because now, the system can say it back.</span>
              </p>

              <p>
                In an age where machines talk,<br />
                <span className="ml-6">bots transact,</span><br />
                <span className="ml-6">and synthetic media wears a thousand faces,</span><br />
                we must verify not just the what — but the who.<br />
                Not just content — but context.<br />
                Not just signal — but source.
              </p>

              <p className="font-bold">
                This isn't a someday.<br />
                It's inevitable.
              </p>

              <p>
                Because the signal was always there —<br />
                <span className="ml-6">waiting for a system that could listen.</span>
              </p>

              <p>
                And beyond the shadows of noise,<br />
                <span className="ml-6">truth becomes legible.</span>
              </p>

              <p className="font-bold">
                The internet doesn't need more platforms.<br />
                It needs a root layer of trust.
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

              <p className="font-bold">
                Only now...<br />
                can we tell them apart.
              </p>

              <p>
                This is not just a better version of what came before.<br />
                <span className="ml-6">It's a new possibility space — for systems, societies, and souls.</span>
              </p>

              <p>
                It's not a company.<br />
                It's not a pitch.<br />
                <span className="font-bold">It's a foundation.</span>
              </p>

              <p>
                A principle encoded in protocol,<br />
                <span className="ml-6">a system built to remember,</span><br />
                <span className="ml-6">a covenant made legible.</span>
              </p>

              <p>
                This isn't a movement of belief.<br />
                <span className="ml-6">It's a movement of proof.</span>
              </p>

              <p>
                Trust is not a promise.<br />
                <span className="ml-6">It's a system condition —</span><br />
                <span className="ml-6">engineered, observable, and built to scale.</span>
              </p>

              <p className="font-bold">
                What comes next begins here.<br />
                With signal.<br />
                With sovereignty.<br />
                With trust — made legible.
              </p>

              <p className="font-bold">
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

              <p className="font-bold">
                For every transaction. For every truth.<br />
                For everyone.
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 