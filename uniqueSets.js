let Sorter = require('./groupSorter.js'),
  ResultSet = require('./resultSet'),
  parse = require('./prefParser.js'),
  config = require('./groupConfig.js')

let sets = new Array(config.runs).fill(null)

let sort = (info) => {

  console.log(`Beginning sort! Performing ${sets.length} run(s).`)

  let roster = info.roster,
    sorter = new Sorter(roster)

  info.groups.forEach((group) => {
    sorter.addGroup(group)
  })

  sets.forEach((set, id) => {
    sorter.balanceFromTop()
    sets[id] = new ResultSet(sorter)
  })

  let uniqueSets = sets.sort((first, second) => first.happierThan(second))
    .filter((set) => sets[0].happierThan(set) === 0)
    .reduce((uniques, set) => {
      if (uniques.filter((unique) => unique.equals(set)).length === 0)
        uniques.push(set)
      return uniques
    }, sets.slice(0, 1))

  console.log(`SORTED! Into ${uniqueSets.length} unique equally happy groups.`)

  return {sets, uniqueSets}

}

module.exports = (file = 'students.csv') => {
  return new Promise((resolve, reject) => {
    parse(file)
      .then((info) => resolve(sort(info)))
      .catch((err) => reject(err))
  })
}
