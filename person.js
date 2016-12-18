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
      this.prefs.indexOf(group)
    }

    assignTo (group) {
      this.group = group
      group.add(this)
      return group
    }

    removeFrom(group) {
      group.remove(this)
      this.group = null
    }

    getHappiness () {
      this.getRankOf(this.group)
    }

    addGroupAt (group, rank) {
      if (!this.prefs[rank]) this.prefs[rank] = group
      else throw new Error(`Group ${group.name()} exists at rank ${rank}`)
      return [group, rank]
    }

  }

  return Person

})()
