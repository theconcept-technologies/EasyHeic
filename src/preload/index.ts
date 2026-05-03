import { contextBridge, ipcRenderer } from 'electron'
import type { ConversionJob, ConversionProgress } from '../shared/types'

contextBridge.exposeInMainWorld('electronAPI', {
  openFiles: (): Promise<{ valid: string[]; invalid: string[] } | null> => ipcRenderer.invoke('dialog:openFiles'),
  openFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:openFolder'),
  openOutputFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:openOutputFolder'),
  scanFolder: (folderPath: string, recursive: boolean): Promise<{ valid: string[]; invalid: string[] }> =>
    ipcRenderer.invoke('fs:scanFolder', folderPath, recursive),
  openPath: (folderPath: string): Promise<void> =>
    ipcRenderer.invoke('shell:openPath', folderPath),
  validateHeicFiles: (filePaths: string[]): Promise<{ valid: string[]; invalid: string[] }> =>
    ipcRenderer.invoke('fs:validateHeicFiles', filePaths),
  previewFile: (filePath: string): Promise<string | null> =>
    ipcRenderer.invoke('convert:preview', filePath),
  startConversion: (
    job: ConversionJob
  ): Promise<{ success: string[]; errors: Array<{ file: string; error: string }> }> =>
    ipcRenderer.invoke('convert:start', job),
  onProgress: (callback: (progress: ConversionProgress) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: ConversionProgress) => {
      callback(progress)
    }
    ipcRenderer.on('convert:progress', handler)
    return () => {
      ipcRenderer.removeListener('convert:progress', handler)
    }
  }
})
