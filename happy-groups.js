let Group = require('./group.js')
let Person = require('./person.js')

let people = []
let groups = []

groups.push(new Group('Power'))
groups.push(new Group('Knowledge'))

people.push(new Person('Fred', ['Power', 'Knowledge']))
people.push(new Person('John', ['Knowledge', 'Power']))

groups[0].addMember(people[0])
groups[1].addMember(people[1])
