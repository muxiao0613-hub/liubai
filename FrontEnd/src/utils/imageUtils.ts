export async function compressImage(file: File, maxSizeKB = 500): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // Scale down if too large
      const maxDim = 1920
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // Try reducing quality until under maxSizeKB
      let quality = 0.85
      let result = canvas.toDataURL('image/jpeg', quality)
      while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
        quality -= 0.1
        result = canvas.toDataURL('image/jpeg', quality)
      }
      resolve(result)
    }
    img.src = url
  })
}

export async function makeThumbnail(base64: string, size = 200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const min = Math.min(img.width, img.height)
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = base64
  })
}

export async function readExifDate(file: File): Promise<string | undefined> {
  try {
    const { default: exifr } = await import('exifr')
    const data = await exifr.parse(file, ['DateTimeOriginal', 'DateTime'])
    const dt: Date | undefined = data?.DateTimeOriginal ?? data?.DateTime
    return dt ? dt.toISOString().split('T')[0] : undefined
  } catch {
    return undefined
  }
}
