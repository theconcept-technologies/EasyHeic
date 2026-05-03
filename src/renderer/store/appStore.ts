import { create } from 'zustand'

export type OutputFormat = 'JPEG' | 'PNG'

export type ConversionStatus = 'idle' | 'running' | 'done' | 'error'

export interface ConversionResult {
  success: string[]
  errors: Array<{ file: string; error: string }>
}

export interface ConversionProgressState {
  current: number
  total: number
  currentFile: string
}

interface AppState {
  // Step 1: Files
  selectedFiles: string[]
  invalidFiles: string[]
  includeSubfolders: boolean
  setSelectedFiles: (files: string[]) => void
  addFiles: (files: string[]) => void
  setInvalidFiles: (files: string[]) => void
  removeFile: (file: string) => void
  clearFiles: () => void
  setIncludeSubfolders: (value: boolean) => void

  // Step 2: Output folder
  outputFolder: string | null
  setOutputFolder: (folder: string) => void

  // Step 3: Format & quality
  format: OutputFormat
  quality: number
  setFormat: (format: OutputFormat) => void
  setQuality: (quality: number) => void

  // Step 4: Conversion state
  status: ConversionStatus
  progress: ConversionProgressState
  result: ConversionResult | null
  setStatus: (status: ConversionStatus) => void
  setProgress: (progress: ConversionProgressState) => void
  setResult: (result: ConversionResult) => void
  resetConversion: () => void
  resetStatusOnly: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Files
  selectedFiles: [],
  invalidFiles: [],
  includeSubfolders: false,
  setSelectedFiles: (files) => set((state) => ({ 
    selectedFiles: files,
    ...(state.status === 'done' || state.status === 'error' ? { status: 'idle', result: null } : {})
  })),
  setInvalidFiles: (files) => set({ invalidFiles: files }),
  addFiles: (files) =>
    set((state) => ({
      selectedFiles: [...new Set([...state.selectedFiles, ...files])],
      ...(state.status === 'done' || state.status === 'error' ? { status: 'idle', result: null } : {})
    })),
  removeFile: (file) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((f) => f !== file),
      ...(state.status === 'done' || state.status === 'error' ? { status: 'idle', result: null } : {})
    })),
  clearFiles: () => set({ selectedFiles: [], invalidFiles: [] }),
  setIncludeSubfolders: (value) => set((state) => ({ 
    includeSubfolders: value,
    ...(state.status === 'done' || state.status === 'error' ? { status: 'idle', result: null } : {})
  })),

  // Output folder
  outputFolder: null,
  setOutputFolder: (folder) => set((state) => ({ 
    outputFolder: folder,
    ...(state.status === 'done' || state.status === 'error' ? { status: 'idle', result: null } : {})
  })),

  // Format & quality
  format: 'JPEG',
  quality: 90,
  setFormat: (format) => set((state) => ({ 
    format,
    ...(state.status === 'done' || state.status === 'error' ? { status: 'idle', result: null } : {})
  })),
  setQuality: (quality) => set((state) => ({ 
    quality,
    ...(state.status === 'done' || state.status === 'error' ? { status: 'idle', result: null } : {})
  })),

  // Conversion state
  status: 'idle',
  progress: { current: 0, total: 0, currentFile: '' },
  result: null,
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  resetConversion: () =>
    set({
      status: 'idle',
      progress: { current: 0, total: 0, currentFile: '' },
      result: null,
      selectedFiles: [],
      invalidFiles: [],
      outputFolder: null
    }),
  resetStatusOnly: () =>
    set({
      status: 'idle',
      progress: { current: 0, total: 0, currentFile: '' },
      result: null
    })
}))
