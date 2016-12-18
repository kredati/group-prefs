module.exports = (() => {

  class Group {

    constructor(name) {
      this.name = name
      this.members = []
    }

    name() {
      return this.name
    }

    isMember(person) {
      return this.members.includes(person)
    }

    addMember(person) {
      return this.members.push(person)
    }

    groupHappiness() {
      let that = this

      this.members.reduce((happiness, person) => {
        return happiness + person.getRankOf(that)
      }, 0)
    }

    members() {
      return this.members.splice()
    }

  }

  return Group

})()
