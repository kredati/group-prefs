let uniqueSets = require('./uniqueSets.js'),
  config = require('./groupConfig.js'),
  fs = require('fs')

let pickOneOf = (arr) => arr[Math.floor(Math.random() * arr.length)]

let addLine = (file, line) => {
  fs.appendFileSync(file, line)
  fs.appendFileSync(file, '\n')
}

let writeReportFile = (report) => {
  let file = config.reportFile

  fs.writeFileSync(file, 'Here are the results of your sort.\n')
  fs.appendFileSync(file, `Run on ${new Date().toDateString()} at ${new Date().toTimeString()}.\n\n`)

  report.forEach((line) => {
    addLine(file, line)
  })
}

let handleResults = (results) => {
  console.log(`Got ${results.uniqueSets.length} unique happy sets.`)
  console.log(`See ${config.reportFile} for the sort and information.`)

  let finalSort = pickOneOf(results.uniqueSets)

  writeReportFile(finalSort.report)
}

let args = process.argv.slice(2),
  file = (args[0]) ? args[0] : './students.csv'

  if (!fs.existsSync(file)) throw new Error(`Cannot find ${file} to work on.`)

console.log(`Thanks for letting me work on this. Parsing and sorting ${file}.`)

uniqueSets(file).then(handleResults)
  .catch((err) => console.log(err))
