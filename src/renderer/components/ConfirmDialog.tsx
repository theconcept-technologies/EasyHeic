import React from 'react'
import { useTranslation } from 'react-i18next'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmDialogProps): React.ReactElement | null {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-body">{message}</div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {t('common.yes')}
          </button>
        </div>
      </div>
    </div>
  )
}
