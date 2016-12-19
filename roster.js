module.exports = (() => {

  class Roster {

    constructor() {
      this.students = []
    }

    enroll(person) {
      let matches

      matches = this.students.filter((student) => student.name === person.name)

      if (matches.length > 0)
        throw new Error(`Student with name ${person.name} is already enrolled`)

      this.students.push(person)
    }

    getStudent(name) {
      let matches

      matches = this.students.filter((student) => student.name === name)

      if (matches.length > 1)
        throw new Error(`Multiple students with name ${name}`)

      return matches[0]
    }

    getStudents () {
      return this.students.slice()
    }

    size () {
      return this.students.length
    }

    getStudentsByHappiness() {
      return this.students.slice().sort(
        (first, second) => first.getHappiness() - second.getHappiness()
      )
      .map((student) => student.name)
    }
  }

  return Roster

})()
