// Shared types used by both main/converter and renderer
export interface ConversionJob {
  files: string[]
  outputFolder: string
  format: 'JPEG' | 'PNG'
  quality: number
}

export interface ConversionProgress {
  current: number
  total: number
  currentFile: string
  status: 'running' | 'done' | 'error'
}
