import { readFile, writeFile, existsSync } from 'fs'
import { promisify } from 'util'
import { join, basename, extname } from 'path'
import convert from 'heic-convert'
import type { ConversionJob, ConversionProgress } from '../shared/types'

export type { ConversionJob, ConversionProgress }

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

/**
 * Generate a safe output path that never overwrites existing files.
 * Strategy: filename_converted.jpg → filename_converted_2.jpg → ...
 */
function getSafeOutputPath(outputFolder: string, sourceFile: string, format: 'JPEG' | 'PNG'): string {
  const ext = format === 'JPEG' ? '.jpg' : '.png'
  const baseName = basename(sourceFile, extname(sourceFile))
  const candidate = join(outputFolder, `${baseName}_converted${ext}`)

  if (!existsSync(candidate)) return candidate

  let counter = 2
  while (true) {
    const numbered = join(outputFolder, `${baseName}_converted_${counter}${ext}`)
    if (!existsSync(numbered)) return numbered
    counter++
  }
}

/**
 * Convert a single HEIC file to the target format.
 */
async function convertSingleFile(
  sourceFile: string,
  outputPath: string,
  format: 'JPEG' | 'PNG',
  quality: number
): Promise<void> {
  const inputBuffer = await readFileAsync(sourceFile)

  // Check magic bytes to see if it's actually already a JPEG or PNG
  const isJpeg = inputBuffer[0] === 0xFF && inputBuffer[1] === 0xD8 && inputBuffer[2] === 0xFF
  const isPng = inputBuffer[0] === 0x89 && inputBuffer[1] === 0x50 && inputBuffer[2] === 0x4E && inputBuffer[3] === 0x47

  if (isJpeg || isPng) {
    // If it's already a standard image, load with nativeImage to convert if needed, or just copy
    const img = nativeImage.createFromBuffer(inputBuffer)
    if (img.isEmpty()) throw new Error('Invalid image buffer')
    
    if (format === 'JPEG') {
      await writeFileAsync(outputPath, img.toJPEG(quality))
    } else {
      await writeFileAsync(outputPath, img.toPNG())
    }
    return
  }

  const outputBuffer = await convert({
    buffer: inputBuffer as unknown as ArrayBuffer,
    format: format === 'JPEG' ? 'JPEG' : 'PNG',
    quality: format === 'JPEG' ? quality / 100 : undefined
  })

  await writeFileAsync(outputPath, Buffer.from(outputBuffer))
}

/**
 * Convert all files in the job, reporting progress via the callback.
 */
export async function convertFiles(
  job: ConversionJob,
  onProgress: (progress: ConversionProgress) => void
): Promise<{ success: string[]; errors: Array<{ file: string; error: string }> }> {
  const success: string[] = []
  const errors: Array<{ file: string; error: string }> = []
  const total = job.files.length

  for (let i = 0; i < job.files.length; i++) {
    const sourceFile = job.files[i]
    const currentFile = basename(sourceFile)

    onProgress({
      current: i,
      total,
      currentFile,
      status: 'running'
    })

    try {
      const outputPath = getSafeOutputPath(job.outputFolder, sourceFile, job.format)
      await convertSingleFile(sourceFile, outputPath, job.format, job.quality)
      success.push(outputPath)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push({ file: currentFile, error: message })
    }
  }

  onProgress({
    current: total,
    total,
    currentFile: '',
    status: 'done'
  })

  return { success, errors }
}

import { nativeImage } from 'electron'

/**
 * Generate a quick low-quality JPEG base64 preview of a HEIC file for in-app display.
 */
export async function previewHeic(sourceFile: string): Promise<string> {
  try {
    // 1. Ultra-fast native OS thumbnail generation (macOS/Windows native API)
    const maxSize = { width: 800, height: 800 }
    const img = await nativeImage.createThumbnailFromPath(sourceFile, maxSize)
    if (!img.isEmpty()) {
      return img.toDataURL()
    }
  } catch (err) {
    console.log('Native thumbnail failed, falling back to heic-convert', err)
  }

  // 2. Fallback to heic-convert (slower, synchronous WASM decoding)
  const inputBuffer = await readFileAsync(sourceFile)

  // Check if it's actually a JPEG/PNG disguised as HEIC
  const isJpeg = inputBuffer[0] === 0xFF && inputBuffer[1] === 0xD8 && inputBuffer[2] === 0xFF
  const isPng = inputBuffer[0] === 0x89 && inputBuffer[1] === 0x50 && inputBuffer[2] === 0x4E && inputBuffer[3] === 0x47
  
  if (isJpeg || isPng) {
    const img = nativeImage.createFromBuffer(inputBuffer)
    return img.toDataURL()
  }

  const outputBuffer = await convert({
    buffer: inputBuffer as unknown as ArrayBuffer,
    format: 'JPEG',
    quality: 0.3 // Even lower quality for faster fallback preview
  })

  const base64 = Buffer.from(outputBuffer).toString('base64')
  return `data:image/jpeg;base64,${base64}`
}
