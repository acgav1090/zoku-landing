import { useState, useEffect } from 'react'
import './DemoModal.css'

type Profile = 'creator' | 'viewer' | 'other' | null

const CREATOR_SIZES = ['< 100', '100 – 1K', '1K – 10K', '10K+']
const VIEWER_FREQUENCIES = ['DAILY', 'FEW TIMES A WEEK', 'OCCASIONALLY']

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function DemoModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<Profile>(null)
  const [qualifier, setQualifier] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName('')
      setEmail('')
      setProfile(null)
      setQualifier(null)
      setOtherText('')
    }
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleProfileChange = (p: Profile) => {
    setProfile(p)
    setQualifier(null)
    setOtherText('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, email, profile, qualifier, otherText })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-top">
          <h2 className="modal-title">JOIN THE FIGHT!</h2>
          <p className="modal-subtitle">Join creators and viewers shaping the future of streaming.</p>
        </div>

        <form id="modal-demo-form" className="modal-form" onSubmit={handleSubmit}>

          <div className="modal-field">
            <label className="modal-label">NAME</label>
            <input
              className="modal-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">EMAIL</label>
            <input
              className="modal-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">I AM A</label>
            <div className="modal-pills">
              {(['creator', 'viewer', 'other'] as NonNullable<Profile>[]).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`modal-pill ${profile === p ? 'modal-pill-active' : ''}`}
                  onClick={() => handleProfileChange(p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {profile === 'creator' && (
            <div className="modal-field">
              <label className="modal-label">HOW BIG IS YOUR AUDIENCE?</label>
              <div className="modal-pills modal-pills-4">
                {CREATOR_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`modal-pill ${qualifier === s ? 'modal-pill-active' : ''}`}
                    onClick={() => setQualifier(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {profile === 'viewer' && (
            <div className="modal-field">
              <label className="modal-label">HOW OFTEN DO YOU WATCH?</label>
              <div className="modal-pills">
                {VIEWER_FREQUENCIES.map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`modal-pill ${qualifier === f ? 'modal-pill-active' : ''}`}
                    onClick={() => setQualifier(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {profile === 'other' && (
            <div className="modal-field">
              <label className="modal-label">TELL US A BIT MORE</label>
              <textarea
                className="modal-input modal-textarea"
                placeholder="What brings you here?"
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                rows={3}
              />
            </div>
          )}

        </form>

        <div className="modal-cta-section">
          <button type="submit" form="modal-demo-form" className="btn btn-cta modal-cta-btn">
            JOIN EARLY ACCESS →
          </button>
          <p className="modal-trust">Free beta · Spots are limited</p>
        </div>

      </div>
    </div>
  )
}
