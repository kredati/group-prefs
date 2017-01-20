let happyGroups = require('./happy-groups.js')

let sets

happyGroups().then((unique) => {
    sets = unique
  })
  .catch((err) => console.log(err))
