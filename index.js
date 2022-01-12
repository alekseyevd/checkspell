//console.log(Date.parse('sdfsf 2022'))

const isISO = "2018-08-01"
const date = new Date(isISO)

if (!isNaN(date)) {
  let month = date.getMonth() + 1
  month = month < 10 ? '0'+month : month
  const day = date.getDate() < 10 ? '0'+ date.getDate() : date.getDate()
  const dateString = `${date.getFullYear()}-${month}-${day}`

  if (dateString === isISO || isISO === date.toISOString()){
  console.log("Valid date");
  } else {
    console.log("Invalid date");
  }
} else {
  console.log("Invalid date");
}
