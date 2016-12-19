module.exports = (() => {

  class GroupController {

    constructor(roster) {
      this.groups = []
      this.roster = roster
    }

    addGroup(group) {
      if (this.groupExists(group.name))
        throw new Error(`Group ${group.name} already exists`)

      this.groups.push(group)
      this.sortByGroupSize()
    }

    groupExists(name) {
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
      let over = this.getSortedByOver()

      let mostOver = over[0].over()

      if (mostOver <= 0) return []

      return over.filter((group) => group.over() === mostOver)
    }

    mostSpace () {
      let space = this.getSortedBySpace()

      let mostSpace = space[0].space()

      return space.filter((group) => group.space() === mostSpace)
    }

    withSpace () {
      return this.groups.filter((group) => group.space() > 0)
    }

    mostUnder () {
      let under = this.getSortedByUnder()

      let mostUnder = under[0].under()

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

    popularity (group) {
      return this.roster.getStudents().reduce((score, student) => {
        return score + student.getRankOf(group)
      }, 0)
    }

    getGroupsByPopularity () {
      return this.groups.slice().sort((first, second) => {
        return this.popularity(first) - this.popularity(second)
      })
    }

    validateRosterNumbers () {
      if (this.roster.size() < this.minimumTotalPlaces()) return false
      if (this.roster.size() > this.maximumTotalPlaces()) return false
      return true
    }

    // This algorithm should minimize unhappiness
    balanceFromBottom () {
      let groups = this.getGroupsByPopularity().reverse()
      let members = this.roster.getStudents().slice()
      console.log('Members array is:')
      console.log(members.map((member) => member.name))

      // First pull the minimum number of members for each group
      console.log('Beginning pull, parsing through each group')
      groups.forEach((group) => {
        console.log(`Working through ${group.name}
          of minimum size ${group.minSize}`)
        let newMembers = []
        let rankedMembers = this.sortByRankOf(members, group)

        console.log(`Members ranked by order of ${group.name}:`)
        console.log(rankedMembers.map((member) => member.name))

        let memberNumber = 0

        console.log(`Member number is ${memberNumber}`)

        while (newMembers.length < group.minSize) {
          if (!rankedMembers[memberNumber].assigned()) {
            console.log(`${rankedMembers[memberNumber].name} is unassigned`)
            console.log(`Adding person to ${group.name}`)
            newMembers.push(rankedMembers[memberNumber])
            console.log('New members are now:')
            console.log(newMembers.map((member) => member.name))
          }
          memberNumber += 1
          console.log(`Member number is now ${memberNumber}`);
        }

        console.log(`Adding new members to ${group.name}`)
        newMembers.forEach((member) => member.assignTo(group))

        console.log(`${group.name} now has members:`)
        console.log(group.getMembers().map((member) => member.name))
        console.log(`${group.name} happiness is ${group.groupHappiness()}`)
      })

      // Then sort all unassigned members to groups
      // Start with the user who has the least preferred open group
      // And then work your way up from there
      // This is computationally intensive, because it resorts each iteration
      console.log('NOW ASSIGNING UNASSIGNED MEMBERS')
      let unassigned = this.getUnassignedByLowestRankedOpen()

      console.log('Unassigned students now include:')
      console.log(unassigned.map((student) => student.name))

      while (unassigned.length > 0) {
        let currentStudent = unassigned[0]

        console.log(`Now assigning ${currentStudent.name}`)
        console.log(`Lowest open rank is ${currentStudent.lowestOpenRank()}`)
        console.log(`to ${currentStudent.lowestRankedOpenGroup().name}`)
        currentStudent.assignTo(currentStudent.lowestRankedOpenGroup())

        unassigned = this.getUnassignedByLowestRankedOpen()
      }

      return this.totalHappiness()

    }

    getUnassignedByLowestRankedOpen () {
      let unassigned = this.getUnassigned()

      return unassigned.sort(
        (first, second) => first.lowestOpenRank() - second.lowestOpenRank()
      )
    }

    getUnassigned () {
      return this.roster.getStudents()
        .slice()
        .filter((student) => !student.assigned())
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
      // First, pull students into any undersubscribed groups
      this.pull()

      // Next, push students away from any oversubscribed
      this.push()
    }

    pull () {
      console.log('Pulling students in.')
      let under = this.mostUnder()

      console.log(`Most under is: ${under.map((group) => group.name)}`)

      if (under.length === 0) return true

      under.forEach((group) => {
        this.pullInLowestRank(group)
      })

      return this.pull()
    }

    pullInLowestRank (group) {
      console.log(`Pulling into ${group.name}`)

      let over = this.getMembersInOversubscribedGroups()

      console.log(`Oversubscribed members are
        ${over.map((student) => student.name)}`)

      while (group.isTooSmall()) {
        let ranked = this.sortByRankOf(over, group)

        console.log(`Ranked from happiest to least in ${group.name}:`)
        console.log(`${ranked.map((student) => student.name)}`)

        let happiest = ranked.filter(
          (member) => member.getRankOf(group) === ranked[0].getRankOf(group)
        )

        console.log(`Happiest in group are
          ${happiest.map((student) => student.name)}`)

        let pulled = this.pickOneOf(happiest)

        console.log(`Pulling ${pulled.name} into ${group.name}`)

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

      console.log(`There are ${over.length} members in oversubscribed groups.`)
      console.log(`${over.map((group) => group.name)}`)

      if (over.length === 0) return true

      let spacious = this.pickOneOf(this.happiestSpaces(over, this.withSpace()))

      console.log(`A group with space is ${spacious.name}`)

      let ranked = this.sortByRankOf(over, spacious)

      let happiest = ranked.filter(
        (member) => member.getRankOf(spacious) === ranked[0].getRankOf(spacious))

      let pushed = this.pickOneOf(happiest)

      //console.log(`Members like spacious in order ${over.map((group) => group.name)}`)
      console.log(`Assigning ${pushed.name} to ${spacious.name}`)

      pushed.assignTo(spacious)

      console.log('Rerunning push().')
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

    // Randomly chooses an element of an array
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

  }

  return GroupController

})()
