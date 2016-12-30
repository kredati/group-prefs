let Sorter = require('./groupSorter.js'),
  ResultSet = require('./resultSet'),
  parse = require('./prefParser.js')

let sets = new Array(10).fill(null)

let sort = (info) => {

  let roster = info.roster,
    sorter = new Sorter(roster)

  info.groups.forEach((group) => {
    sorter.addGroup(group)
  })

  sets.forEach((set, id) => {
    sorter.balanceFromTop()
    sets[id] = new ResultSet(sorter)
  })

}

module.exports = () => {

  parse('students.csv', sort)

  return sets

}
