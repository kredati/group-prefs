module.exports = (() => {

  class Group {

    constructor (name, minSize, maxSize) {
      this.name = name
      this.members = []

      if (minSize > maxSize)
        throw new Error('Minimum size cannot be larger than maxiumum size')

      this.minSize = minSize
      this.maxSize = maxSize
    }

    getName () {
      return this.name
    }

    isMember (person) {
      return this.members.includes(person)
    }

    addMember (person) {
      this.members.push(person)
    }

    removeMember (person) {
      this.members = this.members.filter((member) => {
        return member.name !== person.name
      })
    }

    groupHappiness () {
      let that = this

      return this.members.reduce((happiness, person) => {
        return happiness + person.getRankOf(that)
      }, 0)
    }

    getMembers () {
      return this.members.slice()
    }

    size () {
      return this.members.length
    }

    isTooBig () {
      return this.size() > this.maxSize
    }

    isTooSmall () {
      return (this.size() < this.minSize)
    }

    // Returns how many oversubscribers there are
    over () {
      return this.size() - this.maxSize
    }

    // Returns how many people needed to meet minimum
    under () {
      return this.minSize - this.size()
    }

    space () {
      return this.maxSize - this.size()
    }

    open () {
      return this.space() > 0
    }

    sortByHappiness () {
      this.members.sort(
        (first, second) => first.getHappiness() - second.getHappiness()
      )
    }

    unhappiestMembers () {
      this.sortByHappiness()

      let unhappiest = this.members[this.members.length - 1].getHappiness()

      return this.members.filter(
        (member) => member.getHappiness() >= unhappiest
      )
    }

    nextGroups () {
      let groupMap = {}

      this.members.forEach((member) => {
        let nextGroup = member.getNextGroup()

        if (!groupMap.hasOwnProperty(nextGroup.name))
          groupMap[nextGroup.name] = []

        groupMap[nextGroup.name].push(member)
      })

      return groupMap
    }

  }

  return Group

})()
