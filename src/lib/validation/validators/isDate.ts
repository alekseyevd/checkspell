export default function isDate(value: string): Boolean {
  const date = new Date(value)
  if (!isNaN(date.getDate())) {
  let month = date.getMonth() + 1
  let monthString = month < 10 ? '0'+month : month
  const day = date.getDate() < 10 ? '0'+ date.getDate() : date.getDate()
  const dateString = `${date.getFullYear()}-${monthString}-${day}`

  if (dateString === value || value === date.toISOString()) {
    return true
  } else {
    return false
  }
  } else {
    return false
  }
}
