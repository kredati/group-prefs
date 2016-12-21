module.exports = (() => {

  class ResultSet {

    constructor(groupSorter) {
      groupSorter.groups.forEach((group) => {
        if (this.hasOwnProperty(group.name))
          throw new Error(`Trying to store ${group.name} but it already exists`)
        this[group.name] = group.getMembers().map((member) => member.name)
      })

      this.totalHappiness = groupSorter.totalHappiness()

      this.unhappiest = groupSorter.unhappiest()[0].getHappiness()

      this.report = groupSorter.report()
    }

    equals (resultSet) {
      let props = Object.keys(this).filter((prop) => Array.isArray(this[prop])),
        equals = true

      props.forEach((key) => {
        equals = equals && this.areEquivalentGroups(resultSet[key], this[key])
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

  return ResultSet

})()
