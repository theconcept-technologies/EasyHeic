import { useCallback, useEffect } from 'react'
import { useAppStore } from '../store/appStore'


export function useConversion() {
  const {
    selectedFiles,
    outputFolder,
    format,
    quality,
    status,
    progress,
    result,
    setStatus,
    setProgress,
    setResult,
    resetConversion
  } = useAppStore()

  // Register progress listener on mount, clean up on unmount
  useEffect(() => {
    const cleanup = window.electronAPI.onProgress((prog) => {
      setProgress({
        current: prog.current,
        total: prog.total,
        currentFile: prog.currentFile
      })
      if (prog.status === 'done') {
        setStatus('done')
      }
    })
    return cleanup
  }, [setProgress, setStatus])

  const startConversion = useCallback(async () => {
    if (!selectedFiles.length || !outputFolder) return

    setStatus('running')
    setProgress({ current: 0, total: selectedFiles.length, currentFile: '' })

    try {
      const convResult = await window.electronAPI.startConversion({
        files: selectedFiles,
        outputFolder,
        format,
        quality
      })
      setResult(convResult)
      // Status is set to 'done' via progress event
    } catch (err) {
      console.error('Conversion failed:', err)
      setStatus('error')
    }
  }, [selectedFiles, outputFolder, format, quality, setStatus, setProgress, setResult])

  const openOutputFolder = useCallback(async () => {
    if (outputFolder) {
      await window.electronAPI.openPath(outputFolder)
    }
  }, [outputFolder])

  const canConvert = selectedFiles.length > 0 && outputFolder !== null && status !== 'running'

  return {
    status,
    progress,
    result,
    canConvert,
    startConversion,
    openOutputFolder,
    resetConversion
  }
}
