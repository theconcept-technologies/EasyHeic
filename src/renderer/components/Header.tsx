import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/appStore'
import ConfirmDialog from './ConfirmDialog'
import appLogo from '../assets/app-logo.png'

interface HeaderProps {
  onReset: () => void
}

export default function Header({ onReset }: HeaderProps): React.ReactElement {
  const { t, i18n } = useTranslation()
  const { selectedFiles, outputFolder, resetConversion } = useAppStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const switchLang = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const hasInputs = selectedFiles.length > 0 || outputFolder !== null

  const handleResetClick = () => {
    if (hasInputs) {
      setShowConfirm(true)
    }
  }

  const handleConfirmReset = () => {
    resetConversion()
    onReset()
    setShowConfirm(false)
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        {/* App logo */}
        <img
          src={appLogo}
          alt="EasyHEIC Logo"
          className="header-logo-img app-icon"
          draggable={false}
        />
        <div>
          <div className="header-title">{t('header.appName')}</div>
          <div className="header-tagline">{t('header.tagline')}</div>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {hasInputs && (
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={handleResetClick} 
            style={{ color: 'var(--color-error)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t('header.restart')}
          </button>
        )}
        <div className="lang-switcher" role="group" aria-label="Language switcher">
          <button
            className={`lang-btn${i18n.language === 'de' ? ' active' : ''}`}
            onClick={() => switchLang('de')}
            aria-pressed={i18n.language === 'de'}
            id="lang-de"
          >
            DE
          </button>
          <button
            className={`lang-btn${i18n.language === 'en' ? ' active' : ''}`}
            onClick={() => switchLang('en')}
            aria-pressed={i18n.language === 'en'}
            id="lang-en"
          >
            EN
          </button>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showConfirm}
        title={t('header.restartConfirmTitle')}
        message={t('header.restartConfirmText')}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowConfirm(false)}
      />
    </header>
  )
}
