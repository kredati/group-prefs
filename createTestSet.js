let fs = require('fs'),
  json2csv = require('json2csv'),
  randomNameGenerator = require('node-random-name'),
  config = require('./groupConfig.js')

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

fs.writeFile(file, csv, (err) => {
  if (err) throw new Error(err)
  console.log('Successfully generated new random student prefs:')
  console.log(csv)
})
