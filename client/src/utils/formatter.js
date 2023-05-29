import { Liquid } from 'liquidjs'
const liquidEngine = new Liquid();

export function useFormatter() {
  function formatDate(rawValue, timeZone) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    return (new Date(rawValue)).toLocaleDateString(locale, { timeZone })
  }

  function formatLongDate(rawValue, timeZone) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    return (new Date(rawValue)).toLocaleDateString(locale, { timeZone, dateStyle: 'full' })
  }

  function formatTimestamp(rawValue, timeZone) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    return (new Date(rawValue)).toLocaleString(locale, { timeZone })
  }

  function formatShortTime(rawValue, timeZone) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    return (new Date(rawValue)).toLocaleTimeString(locale, { timeZone, timeStyle: 'medium' })
  }

  async function parseTagFormat(formatString, tag) {
    if (formatString) {
      return liquidEngine.parseAndRender(formatString, tag)
    } else {
      return tag
    }
  }

  async function formatTag(record, tag, field, tagFormat) {
    const includes = (record.includes || {})[field] || {}
    if (includes[tag]) {
      const value = includes[tag] || {}
      const formattedValue = await parseTagFormat(tagFormat, value)
      return formattedValue
    } else {
      return tag
    }
  }

  function tagStyle(record, tag, field) {
    const includes = (record.includes || {})[field] || {}
    if (includes[tag]) {
      const color = includes[tag].textColor
      const background = includes[tag].backgroundColor
      const styles = []
      if (color) {
        styles.push(`color: ${color} !important;`)
      }
      if (background) {
        styles.push(`background-color: ${background} !important;`)
      }

      return styles.join('')
    } else {
      return ``
    }
  }

  return {
    formatDate,
    formatLongDate,
    formatTimestamp,
    formatShortTime,
    formatTag,
    tagStyle
  }
}
