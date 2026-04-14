import { useState, useEffect } from 'react'
import './DemoModal.css'
import { translations, type Lang } from '../i18n'

type Profile = 'creator' | 'viewer' | 'other' | null

interface Props {
  isOpen: boolean
  onClose: () => void
  lang: Lang
}

export default function DemoModal({ isOpen, onClose, lang }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<Profile>(null)
  const [qualifier, setQualifier] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const t = translations[lang]

  const creatorSizes = ['< 100', '100 – 1K', '1K – 10K', '10K+']
  const viewerFrequencies = [t.modalDaily, t.modalFewTimes, t.modalOccasionally]
  const profileLabels: Record<NonNullable<Profile>, string> = {
    creator: t.modalCreator,
    viewer: t.modalViewer,
    other: t.modalOther,
  }

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
          <h2 className="modal-title">{t.modalTitle}</h2>
          <p className="modal-subtitle">{t.modalSubtitle}</p>
        </div>

        <form id="modal-demo-form" className="modal-form" onSubmit={handleSubmit}>

          <div className="modal-field">
            <label className="modal-label">{t.modalName}</label>
            <input
              className="modal-input"
              type="text"
              placeholder={t.modalNamePlaceholder}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">{t.modalEmail}</label>
            <input
              className="modal-input"
              type="email"
              placeholder={t.modalEmailPlaceholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">{t.modalProfile}</label>
            <div className="modal-pills">
              {(['creator', 'viewer', 'other'] as NonNullable<Profile>[]).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`modal-pill ${profile === p ? 'modal-pill-active' : ''}`}
                  onClick={() => handleProfileChange(p)}
                >
                  {profileLabels[p]}
                </button>
              ))}
            </div>
          </div>

          {profile === 'creator' && (
            <div className="modal-field">
              <label className="modal-label">{t.modalAudienceSize}</label>
              <div className="modal-pills modal-pills-4">
                {creatorSizes.map(s => (
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
              <label className="modal-label">{t.modalWatchFreq}</label>
              <div className="modal-pills">
                {viewerFrequencies.map(f => (
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
              <label className="modal-label">{t.modalTellMore}</label>
              <textarea
                className="modal-input modal-textarea"
                placeholder={t.modalTellMorePlaceholder}
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                rows={3}
              />
            </div>
          )}

        </form>

        <div className="modal-cta-section">
          <button type="submit" form="modal-demo-form" className="btn btn-cta modal-cta-btn">
            {t.modalCta}
          </button>
          <p className="modal-trust">{t.modalTrust}</p>
        </div>

      </div>
    </div>
  )
}
