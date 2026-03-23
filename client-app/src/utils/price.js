export function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return '0'
  }

  const stringValue = String(value).trim()

  if (!stringValue) {
    return '0'
  }

  const normalized = stringValue.replace(/,/g, '')

  if (!/^[-+]?\d+(\.\d+)?$/.test(normalized)) {
    return stringValue
  }

  const numericValue = Number(normalized)

  if (!Number.isFinite(numericValue)) {
    return '0'
  }

  return numericValue
    .toFixed(7)
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
}
