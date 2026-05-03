import type { ConversionJob, ConversionProgress } from '../shared/types'

export type ElectronAPI = {
  openFiles: () => Promise<{ valid: string[]; invalid: string[] } | null>
  openFolder: () => Promise<string | null>
  openOutputFolder: () => Promise<string | null>
  scanFolder: (folderPath: string, recursive: boolean) => Promise<{ valid: string[]; invalid: string[] }>
  openPath: (folderPath: string) => Promise<void>
  validateHeicFiles: (filePaths: string[]) => Promise<{ valid: string[]; invalid: string[] }>
  previewFile: (filePath: string) => Promise<string | null>
  startConversion: (job: ConversionJob) => Promise<{
    success: string[]
    errors: Array<{ file: string; error: string }>
  }>
  onProgress: (callback: (progress: ConversionProgress) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
