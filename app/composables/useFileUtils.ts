export function useFileUtils() {
    function formatFileSize(bytes: number): string {
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }

      return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    function formatTimeLeft(expiresAt: string): string {
      const now = new Date()
      const expiration = new Date(expiresAt)
      const diff = expiration.getTime() - now.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      if (days > 0) {
        return `${days} days left`
      }
      return `${hours} hours left`
    }

    return {
      formatFileSize,
      formatTimeLeft
    }
  }