import { useState, useEffect, useRef } from 'react'
import './App.css'
import CRTEffect from './components/CRTEffect'
import DemoModal from './components/DemoModal'

/* ===== SHARED INTERSECTION OBSERVER ===== */
const revealCallbacks = new WeakMap<Element, (isIntersecting: boolean) => void>()

let sharedObserver: IntersectionObserver | null = null
function getSharedObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cb = revealCallbacks.get(entry.target)
          cb?.(entry.isIntersecting)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
  }
  return sharedObserver
}

/* ===== SCROLL REVEAL HOOK ===== */
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = getSharedObserver()
    revealCallbacks.set(el, (isVisible) => {
      if (isVisible) {
        el.classList.add('revealed')
      } else {
        el.classList.remove('revealed')
      }
    })

    observer.observe(el)
    return () => {
      observer.unobserve(el)
      revealCallbacks.delete(el)
    }
  }, [])

  return ref
}

/* ===== STAGGER CHILDREN ON SCROLL ===== */
function useStaggerReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = getSharedObserver()
    revealCallbacks.set(el, (isVisible) => {
      if (isVisible) {
        el.classList.add('stagger-revealed')
      } else {
        el.classList.remove('stagger-revealed')
      }
    })

    observer.observe(el)
    return () => {
      observer.unobserve(el)
      revealCallbacks.delete(el)
    }
  }, [])

  return ref
}

function AnimatedKPI({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState('0')
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const match = value.match(/^([<>]?)(\d+)(\.?\d*)([\w%+]*)$/)
          if (!match) { setDisplay(value); return }

          const prefix = match[1]
          const target = parseInt(match[2], 10)
          const decimal = match[3]
          const suffix = match[4]
          const duration = 1500
          const start = performance.now()

          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = Math.round(target * eased)
            setDisplay(`${prefix}${current}${decimal}${suffix}`)
            if (progress < 1) requestAnimationFrame(tick)
          }

          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref} className="problem-kpi">{display}</span>
}

function Navbar({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="logo">
          <span className="logo-jp">ゾク</span>
          <span className="logo-text">ZOKU</span>
        </a>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#creators">For Creators</a>
          <a href="#faq">FAQ</a>
        </div>
        <button className="btn btn-cta" onClick={onOpenModal}>JOIN EARLY ACCESS →</button>
      </div>
    </nav>
  )
}

function Hero({ onOpenModal }: { onOpenModal: () => void }) {
  const contentRef = useScrollReveal<HTMLDivElement>()
  const visualRef = useScrollReveal<HTMLDivElement>()

  return (
    <section className="hero">
      <div className="hero-inner">
        <div ref={contentRef} className="hero-content reveal-fade-up">
          <p className="hero-badge">Welcome to the Zoku.tv</p>
          <h1 className="hero-title">
            TRANSFORM YOUR STREAM INTO A COMMUNITY BATTLE ARENA.
          </h1>
          <p className="hero-subtitle">
            Zoku transforms passive viewers into active communities that compete through
            interactive live battles, leaderboards, and recurring formats.
          </p>
          <div className="hero-buttons">
            <div className="hero-btn-group">
              <button className="btn btn-cta btn-lg" onClick={onOpenModal}>
                JOIN EARLY ACCESS →
              </button>
              <span className="btn-caption">Early access for creators</span>
            </div>
            <div className="hero-btn-group">
              <button className="btn btn-outline btn-lg" onClick={onOpenModal}>
                Join the Waitlist
              </button>
              <span className="btn-caption">Limited beta</span>
            </div>
          </div>
          <p className="hero-note">For creators, agencies, and partners</p>
        </div>
        <div ref={visualRef} className="hero-visual reveal-fade-up reveal-delay-1">
          <img
            src="/hero-mockup.png"
            alt="Zoku Arena — live stream battle interface with Blue and Red teams competing"
            className="hero-mockup-img"
          />
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  const problems = [
    {
      kpi: '12M+',
      title: 'STREAMERS',
      description: "Everyone is fighting for attention. Standing out has never been harder."
    },
    {
      kpi: '560M+',
      title: 'VIEWERS',
      description: "Most viewers are passive. They watch, but don't interact."
    },
    {
      kpi: '<10%',
      title: 'ENGAGEMENT',
      description: "Streaming lacks formats that turn viewers into active players."
    }
  ]

  const titleRef = useScrollReveal<HTMLHeadingElement>()
  const cardsRef = useStaggerReveal<HTMLDivElement>()
  const taglineRef = useScrollReveal<HTMLParagraphElement>()

  return (
    <section className="problem-section">
      <div className="container">
        <h2 ref={titleRef} className="section-title-large neon-blue reveal-fade-up">
          STREAMING IS MASSIVE!<br />
          ENGAGEMENT IS BROKEN
        </h2>
        <div ref={cardsRef} className="problem-cards stagger-children">
          {problems.map((p, i) => (
            <div key={i} className="problem-card">
              <AnimatedKPI value={p.kpi} />
              <h3 className="problem-card-title">{p.title}</h3>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
        <p ref={taglineRef} className="problem-tagline reveal-fade-up">
          <em>Your viewers shouldn't just watch. They should play.</em>
        </p>
      </div>
    </section>
  )
}

function IconSwords() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="4" height="4" fill="#ff6b95"/>
      <rect x="6" y="6" width="4" height="4" fill="#ff6b95"/>
      <rect x="10" y="10" width="4" height="4" fill="#ff6b95"/>
      <rect x="2" y="10" width="4" height="4" fill="#ff6b95"/>
      <rect x="2" y="14" width="4" height="4" fill="#ff6b95"/>
      <rect x="14" y="14" width="4" height="4" fill="#ffffff"/>
      <rect x="18" y="18" width="4" height="4" fill="#00e5ff"/>
      <rect x="22" y="22" width="4" height="4" fill="#00e5ff"/>
      <rect x="26" y="26" width="4" height="4" fill="#00e5ff"/>
      <rect x="26" y="18" width="4" height="4" fill="#00e5ff"/>
      <rect x="26" y="14" width="4" height="4" fill="#00e5ff"/>
    </svg>
  )
}

function IconLoop() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="8" y="4" width="16" height="4" fill="#00e5ff"/>
      <rect x="4" y="4" width="4" height="4" fill="#00e5ff"/>
      <rect x="24" y="0" width="4" height="4" fill="#00e5ff"/>
      <rect x="24" y="8" width="4" height="4" fill="#00e5ff"/>
      <rect x="4" y="12" width="4" height="4" fill="#ffffff"/>
      <rect x="24" y="16" width="4" height="4" fill="#ffffff"/>
      <rect x="4" y="24" width="16" height="4" fill="#ff6b95"/>
      <rect x="24" y="24" width="4" height="4" fill="#ff6b95"/>
      <rect x="4" y="20" width="4" height="4" fill="#ff6b95"/>
      <rect x="4" y="28" width="4" height="4" fill="#ff6b95"/>
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="22" width="6" height="8" fill="#ff6b95"/>
      <rect x="10" y="16" width="6" height="14" fill="#00e5ff"/>
      <rect x="18" y="10" width="6" height="20" fill="#ff6b95"/>
      <rect x="26" y="2" width="6" height="28" fill="#00e5ff"/>
      <rect x="0" y="30" width="32" height="2" fill="#9ca3af"/>
    </svg>
  )
}

function IconGamepad() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="6" width="28" height="20" rx="4" fill="#12131a" stroke="#ff6b95" strokeWidth="2"/>
      <rect x="6" y="12" width="8" height="8" fill="#00e5ff"/>
      <rect x="22" y="12" width="4" height="4" rx="2" fill="#ff6b95"/>
      <rect x="22" y="18" width="4" height="4" rx="2" fill="#00e5ff"/>
      <rect x="10" y="26" width="4" height="4" rx="1" fill="#9ca3af"/>
      <rect x="18" y="26" width="4" height="4" rx="1" fill="#9ca3af"/>
    </svg>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: <IconSwords />,
      title: 'Community Battles',
      description: 'Pick a side. Your viewers become players in real-time team vs team showdowns between streamers.'
    },
    {
      icon: <IconLoop />,
      title: 'Real-Time Interaction',
      description: 'Chat commands, abilities, and live actions that let viewers shape the outcome as it happens.'
    },
    {
      icon: <IconChart />,
      title: 'Rankings & Progression',
      description: 'Leaderboards, XP, and rewards that track every viewer\'s journey and keep them coming back.'
    },
    {
      icon: <IconGamepad />,
      title: 'Plug & Play',
      description: 'Connect your channel in seconds. No setup friction, no complex config. Works with Twitch, YouTube, Kick and more.'
    }
  ]

  const titleRef = useScrollReveal<HTMLHeadingElement>()
  const gridRef = useStaggerReveal<HTMLDivElement>()

  return (
    <section id="product" className="features-section">
      <div className="container">
        <h2 ref={titleRef} className="section-title-large neon-rose reveal-fade-up">
          EVERYTHING YOU NEED TO TURN STREAMS INTO ARENAS
        </h2>
        <div ref={gridRef} className="features-grid stagger-children">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Create a Battle', desc: 'Link your Twitch, YouTube, or Kick channel in seconds.', img: '/step1.png', imgBorder: false },
    { num: '02', title: 'Support Your Streamer', desc: 'The viewers select their team.', img: '/step2.png', imgBorder: true },
    { num: '03', title: 'Live Battle', desc: 'The fight between the communities begins!', img: '/image-1.png', imgBorder: false },
    { num: '04', title: 'Best Community Wins!', desc: 'One community wins the match, the leaderboard updates.', img: '/step4.png', imgBorder: false }
  ]

  const titleRef = useScrollReveal<HTMLHeadingElement>()
  const gridRef = useStaggerReveal<HTMLDivElement>()

  return (
    <section id="how-it-works" className="how-section">
      <div className="container">
        <h2 ref={titleRef} className="section-title-large neon-blue reveal-fade-up">
          FROM STREAM TO ARENA IN 4 STEPS
        </h2>
        <div ref={gridRef} className="steps-grid-v2 stagger-children">
          {steps.map((s, i) => (
            <div key={i} className="step-card-v2">
              <div className="step-content">
                <span className="step-num">{s.num}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
              <img src={s.img} alt={s.title} className={`step-img ${s.imgBorder ? 'step-img-border' : ''}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitsSection({ onOpenModal }: { onOpenModal: () => void }) {
  const statements = [
    { id: 'ENGAGE', text: 'TURN PASSIVE VIEWERS INTO RECURRING COMPETITORS', accent: 'cyan' },
    { id: 'GROW', text: 'BUILD RITUALS AND RIVALRIES THAT BRING THEM BACK EVERY STREAM', accent: 'rose' },
    { id: 'CONVERT', text: 'CREATE FORMATS BRANDS WANT TO SPONSOR', accent: 'cyan' }
  ]

  const titleBlockRef = useScrollReveal<HTMLDivElement>()
  const cardsRef = useStaggerReveal<HTMLDivElement>()
  const outputRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLButtonElement>()

  return (
    <section id="creators" className="benefits-section">
      <div className="container">
        <div ref={titleBlockRef} className="benefits-title-block reveal-fade-up">
          <h2 className="benefits-title">
            <span className="neon-blue">YOUR COMMUNITY</span>
            <br />
            <span className="neon-rose">YOUR COMPETITIVE ADVANTAGE</span>
          </h2>
          <p className="benefits-subtitle">
            Your community is more than an audience. It's a competitive force. Whether you're building a weekly rivalry or a one-off event, Zoku turns every stream into a battleground.
          </p>
        </div>
        <div ref={cardsRef} className="staggered-cards stagger-children-slide">
          {statements.map((s, i) => (
            <div key={i} className={`stagger-row ${i % 2 === 0 ? 'stagger-end' : 'stagger-start'}`}>
              <div className={`stagger-card stagger-accent-${s.accent}`}>
                <span className="stagger-id">{s.id}</span>
                <p className="stagger-text">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={outputRef} className="benefits-output reveal-fade-up">
          <span className="output-label">&gt;&gt;&gt;&gt; OUTPUT:</span>
          <span className="output-text">&gt;&gt;&gt; A COMMUNITY THAT FIGHTS, RETURNS, AND GROWS.</span>
        </div>
        <button ref={ctaRef} className="btn btn-cta reveal-scale-up" onClick={onOpenModal}>JOIN EARLY ACCESS →</button>
      </div>
    </section>
  )
}

function TeamSection() {
  const members = [
    {
      name: 'David Chamma - CEO, CFO',
      tag: '#SoftSkilled',
      photo: '/David.png',
      bio: `• FORMER SENIOR PRODUCT MANAGER AT CONTENTSQUARE (200 → 2500 EMPLOYEES) → 4 HIGH-GROWTH WEB & MOBILE PRODUCTS
• SENIOR PRODUCT MANAGER AT REMYAI (AI REAL ESTATE PARIS / NYC)
• DAUPHINE (APPLIED MATHEMATICS), MSC ESSEC, CENTRALESUPÉLEC (DATA SCIENCE)
• STRATEGIC VISION, PRODUCT & DATA-DRIVEN`
    },
    {
      name: 'Alfredo Castro - COO, CPO',
      tag: '#OSSans17',
      photo: '/Alfredo.png',
      bio: `• HEAD OF DESIGN AT JUSMUNDI
• FORMER DIRECTOR OF PRODUCT DESIGN AT CONTENTSQUARE (200 → 2500 EMPLOYEES) → 7 WEB PRODUCTS
• LEAD PRODUCT DESIGNER AT OCUS (AI IMAGE GENERATOR / MODERATOR)
• STRATEGIC PRODUCT DESIGN VISION, & DATA-DRIVEN`
    },
    {
      name: 'Ron Chamma - CTO',
      tag: '#DanyNoob',
      photo: '/Ron.png',
      bio: `• SENIOR PRODUCT ENGINEER (FULL-STACK) AT INATO (HEALTHCARE TECH START-UP)
• FORMER PAYFIT (FULL STACK ENGINEER)
• MSC ESSEC
• SEO, PRODUCT ENGINEERING, MOBILE APPS`
    }
  ]

  const titleRef = useScrollReveal<HTMLHeadingElement>()
  const gridRef = useStaggerReveal<HTMLDivElement>()

  return (
    <section className="team-section">
      <div className="container">
        <h2 ref={titleRef} className="team-title reveal-fade-up">OUR TEAM</h2>
        <div ref={gridRef} className="team-grid stagger-children">
          {members.map((m, i) => (
            <div key={i} className="team-col">
              <img src={m.photo} alt={m.name} className="team-photo" />
              <div className="team-info">
                <h3 className="team-name">{m.name}</h3>
                <p className="team-tag">{m.tag}</p>
              </div>
              <p className="team-bio">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const titleRef = useScrollReveal<HTMLHeadingElement>()
  const listRef = useStaggerReveal<HTMLDivElement>()

  const questions = [
    { q: 'Who is Zoku for?', a: 'Zoku is built for streamers, content creators, agencies, and brands who want to transform passive viewers into engaged, competitive communities.' },
    { q: 'Do viewers need to install anything?', a: 'No! Viewers participate directly through chat commands and browser overlays. Zero friction, instant engagement.' },
    { q: 'Is it only for gaming?', a: 'Not at all. While gaming communities love it, Zoku works for any live content — talk shows, music streams, sports watch parties, and more.' },
    { q: 'Can it support sponsored formats?', a: 'Yes. Zoku supports branded battles, sponsored events, and custom integrations for agencies and brands looking to activate streaming audiences.' },
    { q: 'How much does it cost?', a: 'Zoku is free during the beta period. We will introduce premium features for power users and agencies in the future.' }
  ]

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <h2 ref={titleRef} className="section-title-large neon-blue reveal-fade-up">FREQUENTLY ASKED QUESTIONS</h2>
        <div ref={listRef} className="faq-list stagger-children">
          {questions.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? 'faq-open' : ''}`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                <span className="faq-toggle">{openIndex === i ? '−' : '+'}</span>
              </div>
              {openIndex === i && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ onOpenModal }: { onOpenModal: () => void }) {
  const titleRef = useScrollReveal<HTMLHeadingElement>()
  const subtitleRef = useScrollReveal<HTMLParagraphElement>()
  const buttonsRef = useScrollReveal<HTMLDivElement>()

  return (
    <section id="cta" className="final-cta">
      <div className="container">
        <h2 ref={titleRef} className="section-title-large neon-rose reveal-fade-up">
          BRING COMPETITIVE ENERGY<br />
          TO YOUR COMMUNITY
        </h2>
        <p ref={subtitleRef} className="cta-subtitle reveal-fade-up reveal-delay-1">
          Join the creators and communities building the future
          of interactive live entertainment.
        </p>
        <div ref={buttonsRef} className="hero-buttons reveal-scale-up reveal-delay-2" style={{ justifyContent: 'center' }}>
          <button className="btn btn-cta btn-lg" onClick={onOpenModal}>
            JOIN EARLY ACCESS →
          </button>
          <button className="btn btn-outline btn-lg" onClick={onOpenModal}>
            Join the Waitlist
          </button>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <a href="/" className="logo">
          <span className="logo-jp">ゾク</span>
          <span className="logo-text">ZOKU</span>
        </a>
        <div className="footer-right">
          <span className="beta-badge">BETA</span>
          <span>© 2026 Zoku.tv. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

function CRTMetadata() {
  return (
    <div className="crt-metadata">
      <div className="crt-metadata-inner">
        <span className="crt-label crt-label-left">ストリーム・アリーナ</span>
        <span className="crt-label crt-label-right">English</span>
      </div>
    </div>
  )
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <CRTEffect />
      <CRTMetadata />
      <Navbar onOpenModal={openModal} />
      <Hero onOpenModal={openModal} />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <BenefitsSection onOpenModal={openModal} />
      <TeamSection />
      <FAQ />
      <FinalCTA onOpenModal={openModal} />
      <Footer />
      <DemoModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}

export default App
