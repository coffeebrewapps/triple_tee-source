import { useValidations } from '@/utils/validations'
const {
  isEmpty
} = useValidations()

export function useWorkLogUtils() {
  function formatDuration(ms) {
    const days = Math.floor(ms / 1000 / 60 / 60 / 24)
    const daysInMs = days * 1000 * 60 * 60 * 24

    const hours = Math.floor((ms - daysInMs) / 1000 / 60 / 60)
    const hoursInMs = hours * 1000 * 60 * 60

    const minutes = Math.floor((ms - daysInMs - hoursInMs) / 1000 / 60)
    const minutesInMs = minutes * 1000 * 60

    const seconds = Math.floor((ms - daysInMs - hoursInMs - minutesInMs) / 1000)

    const parts = []

    if (days > 0) {
      parts.push(`${days} d`)
    }

    if (hours > 0) {
      parts.push(`${hours} h`)
    }

    if (minutes > 0) {
      parts.push(`${minutes} m`)
    }

    if (seconds > 0) {
      parts.push(`${seconds} s`)
    }

    return parts.join(' ')
  }

  function calculateDuration(entry) {
    if (isEmpty(entry.endTime)) {
      return ((new Date()) - (new Date(entry.startTime)))
    } else {
      return ((new Date(entry.endTime)) - (new Date(entry.startTime)))
    }
  }

  return {
    formatDuration,
    calculateDuration
  }
}
