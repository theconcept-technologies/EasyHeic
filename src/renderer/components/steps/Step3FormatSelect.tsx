import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore, OutputFormat } from '../../store/appStore'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'

interface Props {
  activeStep: number
  onOpen: () => void
  onNext: () => void
  onBack: () => void
}

export default function Step3FormatSelect({ activeStep, onOpen, onNext, onBack }: Props): React.ReactElement {
  const { t } = useTranslation()
  const { format, quality, setFormat, setQuality, selectedFiles, outputFolder } = useAppStore()

  const isDisabled = selectedFiles.length === 0 || !outputFolder
  const isActive = activeStep === 3
  // Step 3 is completed if it's not active and we have advanced past it
  const isCompleted = activeStep > 3
  const stepState = isActive ? 'active' : isCompleted ? 'completed' : isDisabled ? 'disabled' : ''

  const formats: { id: OutputFormat; label: string; desc: string }[] = [
    { id: 'JPEG', label: 'JPEG', desc: '· Kleinere Datei' },
    { id: 'PNG', label: 'PNG', desc: '· Verlustfrei' }
  ]

  return (
    <section
      className={`step-card ${stepState}`}
      aria-label="Step 3: Choose format"
      onClick={!isActive && !isDisabled ? onOpen : undefined}
    >
      <div className="step-header">
        <div className="step-header-left">
          <div className="step-badge">
            {isCompleted && !isActive ? <Check size={16} strokeWidth={3} /> : '3'}
          </div>
          <div>
            <div className="step-label">{t('steps.step3.label')}</div>
            <div className="step-title">{t('steps.step3.title')}</div>
          </div>
        </div>

        {!isActive && isCompleted && (
          <div className="step-summary">
            {format === 'JPEG' ? `JPEG (${quality}%)` : 'PNG'}
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
            >
              {t('steps.step1.edit')}
            </button>
          </div>
        )}
      </div>

      {isActive && (
        <div className="step-body">
          {/* Format toggle */}
          <div className="format-toggle" role="radiogroup" aria-label="Output format">
            {formats.map((f) => (
              <label
                key={f.id}
                className={`format-option${format === f.id ? ' selected' : ''}`}
                htmlFor={`format-${f.id.toLowerCase()}`}
                aria-checked={format === f.id}
              >
                <input
                  type="radio"
                  id={`format-${f.id.toLowerCase()}`}
                  name="format"
                  value={f.id}
                  checked={format === f.id}
                  onChange={() => !isDisabled && setFormat(f.id)}
                  disabled={isDisabled}
                />
                <div className="format-name">{f.label}</div>
                <div className="format-desc">{f.desc}</div>
              </label>
            ))}
          </div>

          {/* Quality slider — only for JPEG */}
          {format === 'JPEG' && (
            <div className="quality-section">
              <div className="quality-header">
                <span className="quality-label">{t('steps.step3.quality')}</span>
                <span className="quality-value">{quality}%</span>
              </div>
              <input
                type="range"
                id="quality-slider"
                className="quality-slider"
                min={70}
                max={100}
                step={1}
                value={quality}
                style={{ '--value': quality } as React.CSSProperties}
                onChange={(e) => setQuality(Number(e.target.value))}
                disabled={isDisabled}
                aria-label="JPEG quality"
                aria-valuemin={70}
                aria-valuemax={100}
                aria-valuenow={quality}
              />
              <div className="quality-hint">{t('steps.step3.qualityHint')}</div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="step-footer">
            <button className="btn btn-ghost" onClick={onBack}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={onNext}
            >
              {t('common.next')} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
