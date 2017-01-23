class ResultSet {

  constructor(groupSorter) {
    this.groups = {}

    groupSorter.groups.forEach((group) => {
      if (this.groups.hasOwnProperty(group.name))
        throw new Error(`Trying to store ${group.name} but it already exists`)
      this.groups[group.name] = group.getMembers().map((member) => member.name)
    })

    this.totalHappiness = groupSorter.totalHappiness()

    this.unhappiest = groupSorter.unhappiest()[0].getHappiness()

    this.report = groupSorter.report()
  }

  equals (resultSet) {
    let groups = Object.keys(this.groups),
      equals = true

    groups.forEach((group) => {
      let equivalent = this.areEquivalentGroups(resultSet.groups[group], this.groups[group])
      equals = equals && equivalent
    })

    return equals
  }

  areEquivalentGroups (group1, group2) {
    let equivalent = true

    group1.forEach((member) => {
      equivalent = equivalent && group2.includes(member)
    })

    group2.forEach((member) => {
      equivalent = equivalent && group1.includes(member)
    })

    return equivalent
  }

  happierThan (resultSet) {
    if (this.totalHappiness < resultSet.totalHappiness) return -1
    if (this.totalHappiness > resultSet.totalHappiness) return 1

    if (this.unhappiest < resultSet.unhappiest) return -1
    if (this.unhappiest > resultSet.unhappiest) return 1

    return 0
  }

}

module.exports = ResultSet
