import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/appStore'
import { Check, Image as ImageIcon, FilePlus, FolderPlus, X, XCircle, ArrowRight, Eye, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

interface Props {
  activeStep: number
  onOpen: () => void
  onNext: () => void
}

/** Extract just the filename from a full path (works cross-platform) */
function getBasename(filePath: string): string {
  return filePath.replace(/.*[\\/]/, '')
}

export default function Step1FileSelect({ activeStep, onOpen, onNext }: Props): React.ReactElement {
  const { t } = useTranslation()
  const { selectedFiles, invalidFiles, includeSubfolders, addFiles, removeFile, clearFiles, setIncludeSubfolders, setInvalidFiles } =
    useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [previewBase64, setPreviewBase64] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState<string | null>(null)

  const isActive = activeStep === 1
  const isCompleted = selectedFiles.length > 0
  const stepState = isActive ? 'active' : isCompleted ? 'completed' : ''

  // Filter and add HEIC files from a dropped FileList
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      let files: string[] = []
      for (const item of Array.from(e.dataTransfer.files)) {
        const name = item.name.toLowerCase()
        if (name.endsWith('.heic') || name.endsWith('.heif')) {
          // In Electron, File objects have a `path` property
          const filePath = (item as unknown as { path: string }).path
          if (filePath) files.push(filePath)
        }
      }

      if (files.length > 0) {
        if (window.electronAPI.validateHeicFiles) {
          const result = await window.electronAPI.validateHeicFiles(files)
          if (result.valid.length > 0) addFiles(result.valid)
          if (result.invalid.length > 0) {
            setInvalidFiles([...invalidFiles, ...result.invalid])
          }
        } else {
          addFiles(files)
        }
      }
    },
    [addFiles, invalidFiles, setInvalidFiles]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleSelectFiles = async () => {
    const result = await window.electronAPI.openFiles()
    if (result) {
      if (result.valid.length > 0) addFiles(result.valid)
      if (result.invalid.length > 0) setInvalidFiles([...invalidFiles, ...result.invalid])
    }
  }

  const handleSelectFolder = async () => {
    const folder = await window.electronAPI.openFolder()
    if (folder) {
      const result = await window.electronAPI.scanFolder(folder, includeSubfolders)
      if (result.valid.length > 0) addFiles(result.valid)
      if (result.invalid.length > 0) setInvalidFiles([...invalidFiles, ...result.invalid])
    }
  }

  useEffect(() => {
    if (previewIndex === null || previewIndex < 0 || previewIndex >= selectedFiles.length) {
      if (previewIndex !== null && selectedFiles.length > 0) {
        // Adjust index if out of bounds (e.g. removed last item)
        setPreviewIndex(Math.max(0, selectedFiles.length - 1))
      } else if (selectedFiles.length === 0) {
        setPreviewIndex(null)
      }
      setPreviewBase64(null)
      setIsLoadingPreview(null)
      return
    }

    const file = selectedFiles[previewIndex]
    let isCancelled = false

    const load = async () => {
      setIsLoadingPreview(file)
      try {
        const base64 = await window.electronAPI.previewFile(file)
        if (!isCancelled && base64) {
          setPreviewBase64(base64)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!isCancelled) setIsLoadingPreview(null)
      }
    }
    load()
    return () => { isCancelled = true }
  }, [previewIndex, selectedFiles])

  const handlePreview = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setPreviewIndex(index)
  }

  const fileCount = selectedFiles.length

  return (
    <>
      <section 
        className={`step-card ${stepState}`} 
        aria-label="Step 1: Select files"
        onClick={!isActive ? onOpen : undefined}
      >
        <div className="step-header">
          <div className="step-header-left">
            <div className="step-badge">
              {isCompleted && !isActive ? <Check size={16} strokeWidth={3} /> : '1'}
            </div>
            <div>
              <div className="step-label">{t('steps.step1.label')}</div>
              <div className="step-title">{t('steps.step1.title')}</div>
            </div>
          </div>
          
          {!isActive && isCompleted && (
            <div className="step-summary">
              {t('steps.step1.filesSelected', { count: fileCount })}
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
            {/* Drag & Drop Zone */}
            <div
              className={`dropzone${isDragging ? ' dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleSelectFiles}
              role="button"
              tabIndex={0}
              aria-label="Drop HEIC files here or click to select"
              onKeyDown={(e) => e.key === 'Enter' && handleSelectFiles()}
              id="dropzone"
            >
              <div className="dropzone-icon">
                <ImageIcon size={32} strokeWidth={1.5} />
              </div>
              <div className="dropzone-text">{t('steps.step1.dropzone')}</div>
              <div className="dropzone-or">{t('steps.step1.dropzoneOr')}</div>
            </div>

            {/* Action buttons */}
            <div className="file-actions">
              <button
                className="btn btn-secondary"
                onClick={handleSelectFiles}
                id="btn-select-files"
              >
                <FilePlus size={18} /> {t('steps.step1.selectFiles')}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleSelectFolder}
                id="btn-select-folder"
              >
                <FolderPlus size={18} /> {t('steps.step1.selectFolder')}
              </button>
              {fileCount > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={clearFiles}
                  id="btn-clear-files"
                >
                  <X size={18} /> {t('steps.step1.clearFiles')}
                </button>
              )}
            </div>

            {/* Include subfolders */}
            <label className="checkbox-row" htmlFor="include-subfolders">
              <input
                type="checkbox"
                id="include-subfolders"
                checked={includeSubfolders}
                onChange={(e) => setIncludeSubfolders(e.target.checked)}
              />
              <span className="checkbox-label">{t('steps.step1.includeSubfolders')}</span>
            </label>

            {/* File count + list */}
            {fileCount > 0 && (
              <>
                <div className="file-count-badge">
                  <span className="check-icon"><Check size={16} strokeWidth={3} /></span>
                  {t('steps.step1.filesSelected', { count: fileCount })}
                </div>
                {fileCount <= 100 && (
                  <div className="file-list" aria-label="Selected files">
                    {selectedFiles.map((f, i) => (
                      <div 
                        className="file-list-item" 
                        key={f} 
                        title={`${f} (Doppelklick zum Öffnen)`}
                        onDoubleClick={(e) => handlePreview(e, i)}
                      >
                        <button 
                          className="file-list-item-action preview"
                          onClick={(e) => handlePreview(e, i)}
                          title="Vorschau ansehen"
                          aria-label={`Preview ${getBasename(f)}`}
                          disabled={isLoadingPreview === f}
                        >
                          {isLoadingPreview === f ? <Loader2 size={16} className="spinner-icon" /> : <Eye size={16} />}
                        </button>
                        
                        <span className="file-list-item-name">{getBasename(f)}</span>
                        
                        <button 
                          className="file-list-item-action remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(f)
                          }}
                          title="Datei entfernen"
                          aria-label={`Remove ${getBasename(f)}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {fileCount > 100 && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-placeholder)', marginTop: 'var(--space-2)' }}>
                    (Vorschau auf 100 Dateien begrenzt)
                  </div>
                )}
              </>
            )}

            {/* Invalid files warning */}
            {invalidFiles.length > 0 && (
              <div className="error-list">
                <div className="error-list-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <XCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                    {invalidFiles.length} {invalidFiles.length === 1 ? 'Datei ignoriert (kein gültiges HEIC-Format):' : 'Dateien ignoriert (kein gültiges HEIC-Format):'}
                  </span>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setInvalidFiles([])}
                    style={{ padding: '2px 6px', height: 'auto', minHeight: 0, color: 'inherit' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  {invalidFiles.map((f, i) => (
                    <div key={i} className="error-list-item">
                      {getBasename(f)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Button Footer */}
            <div className="step-footer">
              <div />
              <button 
                className="btn btn-primary" 
                disabled={fileCount === 0}
                onClick={onNext}
              >
                {t('common.next')} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Interactive In-App Preview Modal */}
      {previewIndex !== null && selectedFiles[previewIndex] && (
        <div className="preview-modal-overlay" onClick={() => setPreviewIndex(null)}>
          <div className="preview-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div className="preview-modal-header-left">
                <span className="preview-modal-title">{getBasename(selectedFiles[previewIndex])}</span>
                <span className="preview-modal-count">({previewIndex + 1} / {fileCount})</span>
              </div>
              <button className="preview-modal-close-btn" onClick={() => setPreviewIndex(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="preview-modal-body">
              <button 
                className="preview-nav-btn"
                disabled={fileCount <= 1}
                onClick={() => setPreviewIndex(prev => prev !== null ? (prev > 0 ? prev - 1 : fileCount - 1) : 0)}
              >
                <ChevronLeft size={36} />
              </button>
              
              <div className="preview-image-wrapper">
                {isLoadingPreview === selectedFiles[previewIndex] || !previewBase64 ? (
                  <Loader2 size={48} className="spinner-icon text-placeholder" />
                ) : (
                  <img src={previewBase64} alt="HEIC Preview" className="preview-modal-image" draggable={false} />
                )}
              </div>

              <button 
                className="preview-nav-btn"
                disabled={fileCount <= 1}
                onClick={() => setPreviewIndex(prev => prev !== null ? (prev < fileCount - 1 ? prev + 1 : 0) : 0)}
              >
                <ChevronRight size={36} />
              </button>
            </div>

            <div className="preview-modal-footer">
              <button 
                className="btn btn-ghost" 
                style={{ color: 'var(--color-error)' }}
                onClick={() => {
                  if (window.confirm(t('steps.step1.confirmRemove'))) {
                    removeFile(selectedFiles[previewIndex])
                  }
                }}
              >
                <Trash2 size={18} /> {t('steps.step1.removeFile')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
