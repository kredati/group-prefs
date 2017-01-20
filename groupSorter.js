module.exports = (() => {

  class GroupSorter {

    constructor(roster, groups) {
      this.groups = (groups) ? groups : []
      this.roster = roster
    }

    addGroup(group) {
      if (this.groupExists(group.name))
        throw new Error(`Group ${group.name} already exists`)

      this.groups.push(group)
      this.sortByGroupSize()
    }

    groupExists (name) {
      let matches

      matches = this.groups.filter((group) => group.name === name)
      return (matches.length > 0)
    }

    getGroup (name) {
      let matches = this.groups.filter((group) => group.name === name)

      if (matches.length > 1)
        throw new Error(`More than one Group with name ${name} exists`)
      return (matches.length) ? matches[0] : null
    }

    sortByGroupSize () {
      this.groups.sort((first, second) => first.size() - second.size())
    }

    largestGroups () {
      let largestSize = this.groups[this.groups.length - 1].size()

      return this.groups.filter((group) => group.size() >= largestSize)
    }

    getSortedByOver () {
      return this.groups.slice().sort(
        (first, second) => second.over() - first.over()
      )
    }

    getSortedByUnder () {
      return this.groups.slice().sort(
        (first, second) => second.under() - first.under()
      )
    }

    getSortedBySpace () {
      return this.groups.slice().sort(
        (first, second) => second.space() - first.space()
      )
    }

    mostOver () {
      let over = this.getSortedByOver(),
        mostOver = over[0].over()

      if (mostOver <= 0) return []
      return over.filter((group) => group.over() === mostOver)
    }

    mostSpace () {
      let space = this.getSortedBySpace(),
        mostSpace = space[0].space()

      return space.filter((group) => group.space() === mostSpace)
    }

    withSpace () {
      return this.groups.filter((group) => group.space() > 0)
    }

    mostUnder () {
      let under = this.getSortedByUnder(),
        mostUnder = under[0].under()

      if (mostUnder <= 0) return []
      return under.filter((group) => group.under() === mostUnder)
    }

    smallestGroups () {
      let smallestSize = this.groups[0].size()

      return this.groups.filter((group) => group.size() <= smallestSize)
    }

    totalHappiness () {
      return this.groups.reduce((happiness, group) => {
        return happiness + group.groupHappiness()
      }, 0)
    }

    minimumTotalPlaces () {
      return this.groups.reduce((places, group) => {
        return places + group.minSize
      }, 0)
    }

    maximumTotalPlaces () {
      return this.groups.reduce((places, group) => {
        return places + group.maxSize
      }, 0)
    }

    validateRosterNumbers () {
      if (this.roster.size() < this.minimumTotalPlaces()) return false
      if (this.roster.size() > this.maximumTotalPlaces()) return false
      return true
    }

    // This algorithm should maximize happiness
    balanceFromTop () {
      this.assignAllToTopChoice()
      this.rebalance()
    }

    assignAllToTopChoice () {
      this.roster.getStudents().forEach((student) => student.assignToFirst())
    }

    rebalance () {
      this.pull()
      this.push()
      //console.log(this.report())
    }

    pull () {
      //console.log('Running pull.')
      let under = this.mostUnder()

      if (under.length === 0) {
        //console.log('Completed pull.')
        return true
      }

      //console.log(`Most under are: ${under.map((group) => group.name)}`)

      under.forEach((group) => this.pullInLeastUnhappy(group))

      return this.pull()
    }

    pullInLeastUnhappy (group) {
      //console.log(`Pulling students into ${group.name},
        //which needs ${group.under()} students.`)

      while (group.isTooSmall()) {
        let over = this.getMembersInOversubscribedGroups(),
          ranked = this.sortByRankOf(over, group),
          leastUnhappy = ranked.filter(
            (member) => member.getRankOf(group) === ranked[0].getRankOf(group)
          ),
          pulled = this.pickOneOf(leastUnhappy)

        /*console.log(`Students in oversubscribed groups are:
          ${over.map((student) => student.name)}.
          Least unhappy in ${group.name} are
          ${leastUnhappy.map((student) => student.name)}.`)

        console.log(`Pulling ${pulled.name} into ${group.name},
          with rank of ${pulled.getRankOf(group)}.`)*/

        pulled.assignTo(group)
      }
    }

    sortByRankOf (members, group) {
      return members.slice().sort((first, second) => {
        return first.getRankOf(group) - second.getRankOf(group)
      })
    }

    membersInGroups (groups) {
      return groups.reduce((members, group) => {
        return members.concat(group.getMembers())
      }, [])
    }

    getMembersInOversubscribedGroups () {
      let oversubscribed = this.groups.filter((group) => group.isTooBig())

      return this.membersInGroups(oversubscribed)
    }

    push () {

      let over = this.membersInGroups(this.mostOver())

      /*console.log(`There are ${over.length} members in oversubscribed groups.
        ${over.map((group) => group.name)}`)*/

      if (over.length === 0) return true

      let spacious = this.pickOneOf(
        this.mostSpacious(
          this.happiestSpaces(over, this.withSpace())
        )
      )

      let ranked = this.sortByRankOf(over, spacious),
        happiest = ranked.filter((member) => {
          return member.getRankOf(spacious) === ranked[0].getRankOf(spacious)
        }),
        pushed = this.pickOneOf(happiest)

      /*console.log(`A group with space is ${spacious.name}.
        Members like spacious in order ${ranked.map((group) => group.name)}.
        Assigning ${pushed.name} to ${spacious.name}.`)*/

      pushed.assignTo(spacious)

      //console.log('Rerunning push().')
      return this.push()
    }

    happiestSpaces (members, groups) {
      let happiest = []
      let happiestRank = this.groups.length

      groups.forEach((group) => {
        members.forEach((member) => {
          let rank = member.getRankOf(group)

          if (rank < happiestRank) {
            happiest = []
            happiest.push(group)
            happiestRank = rank
          } else if (rank === happiestRank) happiest.push(group)
        })
      })

      return happiest
    }

    mostSpacious (groups) {
      let spacious = groups.slice().sort(
        (first, second) => second.space() - first.space()
      )

      let mostSpacious = spacious[0].space()

      return spacious.filter(
        (spaciousGroup) => spaciousGroup.space() === mostSpacious
      )
    }

    pickOneOf (arr) {
      return arr[Math.floor(Math.random() * arr.length)]
    }

    averageHappiness() {
      return this.totalHappiness() / this.roster.size()
    }

    getGroupsByHappiness () {
      return this.groups.slice().sort(
        (first, second) => first.groupHappiness() - second.groupHappiness())
        .map((group) => group.name)
    }

    report () {
      let report = (`Completed rebalancing. Here is some information:
        Total happiness is ${this.totalHappiness()}.\n`)

      this.groups.forEach((group) => {
        report = report.concat(`${group.name} has ${group.size()} members.
          Min is ${group.minSize}, max is ${group.maxSize}.
          Group happiness is ${group.groupHappiness()}.\n`)

        report = report.concat('Group members are:\n')
        group.getMembers().forEach((member) => {
          report = report.concat(`${member.name} (${member.getHappiness()}).\n`)
        })
      })

      report = report.concat('Unhappiest member(s):')
      this.unhappiest().forEach((member) => {
        report = report.concat(`${member.name}
          has happines of ${member.getHappiness()}
          in ${member.memberOf().name}`)
      })

      return report
    }

    unhappiest () {
      let membersSortedByHappiness = this.roster.getStudents().sort(
        (first, second) => second.getHappiness() - first.getHappiness()
      ),
      leastHappy = membersSortedByHappiness[0].getHappiness()

      return membersSortedByHappiness.filter(
        (member) => member.getHappiness() === leastHappy
      )
    }

  }

  return GroupSorter

})()
