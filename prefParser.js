let csv = require('./node-csv'),
  Roster = require('./roster.js'),
  Person = require('./person.js'),
  Group = require('./group.js'),
  config = require('./groupConfig.js')

let groupInfo = config.groups.reduce((map, group) => {
    let min = group.min,
      max = group.max

    map[group.name] = {min, max}
    return map
  }, {})

let isHeader = true,
  groups = [],
  roster = new Roster()

let parseHeader = (header) => {
  header.splice(0, 1)
  groups = header.map((group) => {
    return new Group(group, groupInfo[group].min, groupInfo[group].max)
  })
  isHeader = false
}

let parseRow = (row) => {
  let studentName = row.splice(0, 1),
    prefs = []

  row.forEach((ranking, id) => {
    prefs[ranking - 1] = groups[id]
  })

  roster.enroll(new Person(studentName, prefs))

  console.log(roster.students[roster.students.length - 1])
}

let parse = (file, callback) => {

  csv.each(file).on('data', (data) => {
      if (isHeader) parseHeader(data)
      else parseRow(data)
    })
    .on('end', () => {

      console.log(`Parsed ${roster.size} students.`)
      console.log(roster.getStudents())

      callback({groups, roster})
    })
}

module.exports = parse
