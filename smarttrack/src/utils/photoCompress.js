export function compressPhoto(file, maxKB = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const MAX_DIM = 1200
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.9
      const tryCompress = () => {
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const base64 = dataUrl.split(',')[1]
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024)
        if (sizeKB <= maxKB || quality <= 0.1) {
          resolve({ dataUrl, base64, sizeKB })
        } else {
          quality = Math.max(quality - 0.1, 0.1)
          tryCompress()
        }
      }
      tryCompress()
    }
    img.onerror = reject
    img.src = url
  })
}
