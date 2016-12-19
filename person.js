module.exports = (function () {

  class Person {

    constructor (name, prefs) {
      this.prefs = (prefs) ? prefs : []
      this.name = name
    }

    first () {
      return this.prefs[0]
    }

    getName () {
      this.name
    }

    next (step) {
      this.prefs[step + 1]
    }

    getPrefs () {
      this.prefs.slice()
    }

    getRankOf (group) {
      return this.prefs.indexOf(group)
    }

    assignTo (group) {
      if (this.group) this.removeFrom(this.group)
      return this.addTo(group)
    }

    addTo (group) {
      this.group = group
      group.addMember(this)
      return this.group
    }

    removeFrom (group) {
      group.removeMember(this)
      this.group = null
    }

    memberOf () {
      return this.group
    }

    getHappiness () {
      return this.getRankOf(this.group)
    }

    addGroupAt (group, rank) {
      if (!this.prefs[rank]) this.prefs[rank] = group
      else throw new Error(`Group ${group.name()} exists at rank ${rank}`)
      return [group, rank]
    }

    getNextGroup () {
      let nextRank = this.getRankOf(this.group) + 1

      if (nextRank >= this.prefs.length)
        throw new Error(`Asked ${this.name} for preference lower than lowest.`)

      return this.prefs[nextRank]
    }

    assignToFirst () {
      this.assignTo(this.first())
      return this.memberOf(this.first())
    }

    assigned () {
      return Boolean(this.group)
    }

    lowestRankedOpenGroup () {
      return this.prefs[this.lowestOpenRank()]
    }

    lowestOpenRank () {
      let rank = 0

      while (!this.prefs[rank].open()) rank += 1

      return rank
    }

  }

  return Person

})()
