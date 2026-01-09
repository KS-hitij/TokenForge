const makeImageSquare = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      img.src = reader.result as string
    }

    img.onload = () => {
      const size = Math.min(img.width, img.height)

      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext("2d")
      if (!ctx) return reject("Canvas error")

      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2

      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size,
        0,
        0,
        size,
        size
      )

      canvas.toBlob((blob) => {
        if (!blob) return reject("Blob error")

        const squareFile = new File([blob], file.name, {
          type: "image/jpeg",
        })

        resolve(squareFile)
      }, "image/jpeg", 0.95)
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
export { makeImageSquare }