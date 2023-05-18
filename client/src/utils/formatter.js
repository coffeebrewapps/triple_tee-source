export function useFormatter() {
  function formatDate(rawValue) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    return (new Date(rawValue)).toLocaleDateString(locale)
  }

  function formatLongDate(rawValue) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    return (new Date(rawValue)).toLocaleDateString(locale, { dateStyle: 'full' })
  }

  function formatTimestamp(rawValue) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    return (new Date(rawValue)).toLocaleString(locale)
  }

  function formatTag(record, tag) {
    const includes = (record.includes || {}).tags
    if (includes[tag]) {
      const value = includes[tag] || {}
      return `${value.category}:${value.name}`
    } else {
      return tag
    }
  }

  function tagStyle(record, tag) {
    const includes = (record.includes || {}).tags
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
    formatTag,
    tagStyle
  }
}
