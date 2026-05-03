import { ipcMain, dialog, shell } from 'electron'
import { existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { convertFiles, previewHeic } from './converter'
import type { ConversionJob, ConversionProgress } from '../shared/types'
import { BrowserWindow } from 'electron'
import { openSync, readSync, closeSync } from 'fs'

// Check if a file is actually a HEIC/HEIF image by reading its magic bytes
function isValidInputFile(filePath: string): boolean {
  try {
    const fd = openSync(filePath, 'r')
    const buffer = Buffer.alloc(12)
    const bytesRead = readSync(fd, buffer, 0, 12, 0)
    closeSync(fd)
    
    if (bytesRead < 4) return false

    // Check JPEG signature: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true
    
    // Check PNG signature: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true

    if (bytesRead < 12) return false
    
    const ftyp = buffer.toString('ascii', 4, 8)
    if (ftyp !== 'ftyp') return false
    
    const brand = buffer.toString('ascii', 8, 12)
    const validBrands = ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1']
    return validBrands.includes(brand)
  } catch {
    return false
  }
}


// Recursively scan directory for HEIC files
function scanDirectory(dirPath: string, recursive: boolean): { valid: string[], invalid: string[] } {
  const result = { valid: [] as string[], invalid: [] as string[] }

  try {
    const entries = readdirSync(dirPath)
    for (const entry of entries) {
      const fullPath = join(dirPath, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory() && recursive) {
          const subResult = scanDirectory(fullPath, recursive)
          result.valid.push(...subResult.valid)
          result.invalid.push(...subResult.invalid)
        } else if (stat.isFile()) {
          const ext = extname(entry).toLowerCase()
          if (ext === '.heic' || ext === '.heif') {
            if (isValidInputFile(fullPath)) {
              result.valid.push(fullPath)
            } else {
              result.invalid.push(fullPath)
            }
          }
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return result
}

export function registerIpcHandlers(): void {
  // Open file dialog for selecting HEIC files
  ipcMain.handle('dialog:openFiles', async () => {
    const dialogResult = await dialog.showOpenDialog({
      title: 'HEIC Dateien auswählen',
      filters: [{ name: 'HEIC Images', extensions: ['heic', 'heif'] }],
      properties: ['openFile', 'multiSelections']
    })
    if (dialogResult.canceled) return null
    const valid = dialogResult.filePaths.filter(isValidInputFile)
    const invalid = dialogResult.filePaths.filter((f) => !valid.includes(f))
    return { valid, invalid }
  })

  // Open folder dialog for selecting a folder of HEIC files
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Ordner auswählen',
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Open output folder dialog
  ipcMain.handle('dialog:openOutputFolder', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Zielordner auswählen',
      properties: ['openDirectory', 'createDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Scan a folder for HEIC files
  ipcMain.handle('fs:scanFolder', async (_event, folderPath: string, recursive: boolean) => {
    if (!existsSync(folderPath)) return { valid: [], invalid: [] }
    return scanDirectory(folderPath, recursive)
  })

  // Validate a list of files to check if they are real HEIC files or disguised JPEGs/PNGs
  ipcMain.handle('fs:validateHeicFiles', async (_event, filePaths: string[]) => {
    const valid = filePaths.filter(isValidInputFile)
    const invalid = filePaths.filter((f) => !valid.includes(f))
    return { valid, invalid }
  })

  // Open a path in the system file manager
  ipcMain.handle('shell:openPath', async (_event, folderPath: string) => {
    await shell.openPath(folderPath)
  })

  // Start conversion
  ipcMain.handle(
    'convert:start',
    async (
      event,
      job: ConversionJob
    ): Promise<{ success: string[]; errors: Array<{ file: string; error: string }> }> => {
      const window = BrowserWindow.fromWebContents(event.sender)

      const onProgress = (progress: ConversionProgress) => {
        window?.webContents.send('convert:progress', progress)
      }

      return convertFiles(job, onProgress)
    }
  )

  // Generate a base64 preview of a HEIC file
  ipcMain.handle('convert:preview', async (_event, filePath: string) => {
    try {
      return await previewHeic(filePath)
    } catch (error) {
      console.error('Failed to generate preview:', error)
      return null
    }
  })
}
