let config = {

  'numStudents': 40,

  'groups': [
    {'name': 'Action', 'min': 4, 'max': 5},
    {'name': 'Bowery', 'min': 4, 'max': 5},
    {'name': 'Container', 'min': 4, 'max': 5},
    {'name': 'Delta', 'min': 4, 'max': 5},
    {'name': 'Excellent', 'min': 4, 'max': 5},
    {'name': 'Foxtrot', 'min': 4, 'max': 5},
    {'name': 'Golf', 'min': 4, 'max': 5},
    {'name': 'Home', 'min': 4, 'max': 5}
  ]

}

let fs = require('fs'),
  json2csv = require('json2csv'),
  randomNameGenerator = require('node-random-name'),
  parseCsv = require('./node-csv.js'),
  Person = require('./person.js')

let args = process.argv.slice(2),
  file = (args[0]) ? args[0] : 'students.csv',
  students = new Array(config.numStudents).fill(null),
  randomName = () => randomNameGenerator({'first': true})

let randomUniqueName = () => {
  let namedStudents = students.filter((student) => student !== null)
    .map((student) => student.name),
    name = randomName()

  while (namedStudents.indexOf(name) > -1) {
    name = randomName()
  }
  return name
}

let randomPrefs = () => {
  let groups = config.groups.map((group) => group.name),
    prefs = []

  while (groups.length > 0) {
    let randomID = Math.floor(Math.random() * groups.length)

    prefs.push(groups[randomID])
    groups.splice(randomID, 1)
  }

  return prefs

}

students.forEach((student, id) => {
  let name = randomUniqueName(),
    prefs = randomPrefs()

  students[id] = {name, prefs}

  console.log(students[id])

})

let fields = ['name'].concat(config.groups.map((group) => group.name))

let studentsExport = students.map((student) => {

  let obj = {}

  obj.name = student.name

  config.groups.map((group) => group.name)
    .forEach((group) => {
      obj[group] = student.prefs.indexOf(group) + 1
    })

  return obj

})

let csv = json2csv({'data': studentsExport, fields})

console.log(csv)

fs.writeFileSync(file, csv)

let isHeader = true,
  importedGroups = [],
  importedStudents = []

let parseHeader = (header) => {
  header.splice(0, 1)
  importedGroups = header
  isHeader = false
}

let parseRow = (row) => {
  let studentName = row.splice(0, 1),
    prefs = []

  row.forEach((ranking, id) => {
    prefs[ranking - 1] = importedGroups[id]
  })

  importedStudents.push(new Person(studentName, prefs))
}

parseCsv.each(file).on('data', (data) => {
    if (isHeader) parseHeader(data)
    else parseRow(data)
  })
  .on('end', () => {
    console.log(`Parsed ${importedStudents.length} students.`)
    console.log(importedStudents)
  })
