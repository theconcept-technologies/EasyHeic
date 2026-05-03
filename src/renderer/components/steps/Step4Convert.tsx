import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useConversion } from '../../hooks/useConversion'
import { useAppStore } from '../../store/appStore'
import { Check, Zap, CheckCircle2, FolderOpen, RotateCcw, AlertCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

interface Props {
  activeStep: number
  onOpen: () => void
  onBack: () => void
  onReset: () => void
}

export default function Step4Convert({ activeStep, onOpen, onBack, onReset }: Props): React.ReactElement {
  const { t } = useTranslation()
  const { clearFiles } = useAppStore()
  const { status, progress, result, canConvert, startConversion, openOutputFolder, resetConversion } =
    useConversion()

  const isActive = activeStep === 4
  const isDisabled = !canConvert && status !== 'running' && status !== 'done' && status !== 'error'
  const isCompleted = status === 'done'
  const stepState = isActive ? 'active' : isCompleted ? 'completed' : isDisabled ? 'disabled' : ''

  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (status === 'running') {
      setShowOverlay(true)
    } else if (status === 'done' || status === 'error') {
      const timer = setTimeout(() => {
        setShowOverlay(false)
      }, 2500)
      return () => clearTimeout(timer)
    } else {
      setShowOverlay(false)
    }
  }, [status])

  const handleConvertMore = () => {
    resetConversion()
    clearFiles()
    onReset()
  }

  return (
    <section
      id="step4-container"
      className={`step-card ${stepState}`}
      aria-label="Step 4: Convert"
      onClick={!isActive && !isDisabled ? onOpen : undefined}
    >
      <div className="step-header">
        <div className="step-header-left">
          <div className="step-badge">
            {isCompleted && !isActive ? <Check size={16} strokeWidth={3} /> : '4'}
          </div>
          <div>
            <div className="step-label">{t('steps.step4.label')}</div>
            <div className="step-title">{t('steps.step4.title')}</div>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="step-body">
          {/* Default state */}
          {status === 'idle' && (
            <>
              <button
                className="btn btn-primary btn-full"
                onClick={startConversion}
                disabled={!canConvert}
                id="btn-start-convert"
              >
                <Zap size={18} /> {t('steps.step4.button')}
              </button>
              
              {/* Navigation Footer */}
              <div className="step-footer">
                <button className="btn btn-ghost" onClick={onBack}>
                  <ArrowLeft size={18} /> {t('common.back')}
                </button>
                <div />
              </div>
            </>
          )}

          {/* Running/Done/Error state - Full Screen Overlay */}
          {showOverlay && createPortal(
            <div className={`hero-running ${status === 'done' ? 'hero-done' : status === 'error' ? 'hero-error' : ''}`}>
              <div className="hero-icon-wrapper">
                {status === 'running' && <Loader2 size={48} strokeWidth={1.5} />}
                {status === 'done' && <CheckCircle2 size={48} strokeWidth={2} />}
                {status === 'error' && <XCircle size={48} strokeWidth={2} />}
              </div>
              
              <div className="hero-progress-box">
                {status === 'running' ? (
                  <>
                    <div className="hero-progress-header">
                      <span>
                        {t('steps.step4.progress', {
                          current: progress.current,
                          total: progress.total
                        })}
                      </span>
                      <span>
                        {Math.round((progress.current / progress.total) * 100)}%
                      </span>
                    </div>
                    <div className="hero-progress-bar">
                      <div
                        className="hero-progress-fill"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </div>
                    <div className="hero-progress-file">
                      {t('steps.step4.converting', { file: progress.currentFile })}
                    </div>
                  </>
                ) : status === 'done' ? (
                  <div className="hero-result-message success">
                    <h3>{t('steps.step4.done')}</h3>
                    <p>{t('steps.step4.successCount', { count: result?.success.length || 0 })}</p>
                  </div>
                ) : (
                  <div className="hero-result-message error">
                    <h3>{t('errors.conversionFailed')}</h3>
                    <p>{t('steps.step4.errorCount', { count: result?.errors.length || 0 })}</p>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}

          {/* Done state */}
          {status === 'done' && result && (
            <div className="result-container success">
              <div className="result-icon"><CheckCircle2 size={48} color="var(--color-success)" /></div>
              <div className="result-title">{t('steps.step4.done')}</div>
              <div className="result-stats">
                {t('steps.step4.successCount', { count: result.success.length })}
              </div>
              
              <div className="file-actions" style={{ marginTop: 'var(--space-4)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={openOutputFolder}
                  id="btn-open-output"
                >
                  <FolderOpen size={18} /> {t('steps.step4.openFolder')}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConvertMore}
                  id="btn-convert-more"
                >
                  <RotateCcw size={18} /> {t('steps.step4.convertAnother')}
                </button>
              </div>

              {result.errors.length > 0 && (
                <div className="error-list">
                  <strong>{t('steps.step4.errorCount', { count: result.errors.length })}:</strong>
                  {result.errors.map((e, i) => (
                    <div key={i} className="error-item">
                      {e.file}: {e.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="result-container error">
              <div className="result-icon"><XCircle size={48} color="var(--color-error)" /></div>
              <div className="result-title">{t('errors.conversionFailed')}</div>
              <button
                className="btn btn-secondary"
                onClick={handleConvertMore}
                style={{ marginTop: 'var(--space-4)' }}
              >
                <RotateCcw size={18} /> {t('steps.step4.convertAnother')}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
