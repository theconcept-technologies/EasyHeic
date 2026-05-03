import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/appStore'
import { Check, FolderPlus, Folder, ArrowRight, ArrowLeft } from 'lucide-react'

interface Props {
  activeStep: number
  onOpen: () => void
  onNext: () => void
  onBack: () => void
}

export default function Step2OutputFolder({ activeStep, onOpen, onNext, onBack }: Props): React.ReactElement {
  const { t } = useTranslation()
  const { outputFolder, setOutputFolder, selectedFiles } = useAppStore()

  const isDisabled = selectedFiles.length === 0
  const isActive = activeStep === 2
  const isCompleted = outputFolder !== null
  const stepState = isActive ? 'active' : isCompleted ? 'completed' : isDisabled ? 'disabled' : ''

  const handleSelectFolder = async () => {
    if (isDisabled) return
    const folder = await window.electronAPI.openOutputFolder()
    if (folder) setOutputFolder(folder)
  }

  return (
    <section
      className={`step-card ${stepState}`}
      aria-label="Step 2: Select output folder"
      onClick={!isActive && !isDisabled ? onOpen : undefined}
    >
      <div className="step-header">
        <div className="step-header-left">
          <div className="step-badge">
            {isCompleted && !isActive ? <Check size={16} strokeWidth={3} /> : '2'}
          </div>
          <div>
            <div className="step-label">{t('steps.step2.label')}</div>
            <div className="step-title">{t('steps.step2.title')}</div>
          </div>
        </div>

        {!isActive && isCompleted && (
          <div className="step-summary">
            {outputFolder}
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
          <button
            className="btn btn-secondary btn-full"
            onClick={handleSelectFolder}
            disabled={isDisabled}
            id="btn-select-output"
            aria-label="Select output folder"
          >
            <FolderPlus size={18} /> {t('steps.step2.button')}
          </button>

          {outputFolder ? (
            <div className="folder-path" aria-label="Selected output folder">
              <span className="folder-icon"><Folder size={18} /></span>
              <span>{outputFolder}</span>
            </div>
          ) : (
            !isDisabled && (
              <div className="folder-path" style={{ color: 'var(--color-text-placeholder)' }}>
                <span className="folder-icon"><Folder size={18} /></span>
                <span>{t('steps.step2.noFolder')}</span>
              </div>
            )
          )}

          {/* Navigation Footer */}
          <div className="step-footer">
            <button className="btn btn-ghost" onClick={onBack}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button 
              className="btn btn-primary" 
              disabled={!outputFolder}
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
