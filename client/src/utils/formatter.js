export function useFormatter() {
  function formatDate(rawValue) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    const year = formatOptions.year
    const month = formatOptions.month
    const day = formatOptions.day
    const timeZone = formatOptions.timeZone
    return (new Date(rawValue)).toLocaleDateString(locale)
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
    formatTag,
    tagStyle
  }
}
