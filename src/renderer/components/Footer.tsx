import React from 'react'
import { useTranslation } from 'react-i18next'
import { HelpCircle, Globe } from 'lucide-react'
import tctLogo from '../assets/tct-logo-new-sm.png'

export default function Footer(): React.ReactElement {
  const { t, i18n } = useTranslation()

  // Use the current language to determine the URL
  const lang = i18n.language === 'de' ? 'de' : 'en'
  const contactUrl = `https://www.theconcept-technologies.com/${lang}/contact`
  const websiteUrl = `https://www.theconcept-technologies.com`

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <a 
            href={websiteUrl} 
            target="_blank" 
            rel="noreferrer"
            className="company-link"
            title={t('footer.companyName')}
          >
            <span className="developed-by">{t('footer.developedBy')}</span>
            <img src={tctLogo} alt="Logo" className="footer-logo" draggable={false} />
            <span className="company-name">{t('footer.companyName')}</span>
          </a>
        </div>
        
        <div className="footer-right">
          <a 
            href={contactUrl} 
            target="_blank" 
            rel="noreferrer"
            className="footer-btn"
          >
            <HelpCircle size={14} />
            <span>{t('footer.helpAndSupport')}</span>
          </a>
          <a 
            href={websiteUrl} 
            target="_blank" 
            rel="noreferrer"
            className="footer-btn"
          >
            <Globe size={14} />
            <span>{t('footer.website')}</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
