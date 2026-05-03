declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: ArrayBuffer
    format: 'JPEG' | 'PNG'
    quality?: number
  }

  function convert(options: ConvertOptions): Promise<ArrayBuffer>
  export = convert
}
