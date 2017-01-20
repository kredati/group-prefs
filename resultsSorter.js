module.exports = (sets) => {

  sets.sort((first, second) => first.happierThan(second))

  return sets

}
