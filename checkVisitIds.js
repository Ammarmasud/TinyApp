function checkVisitIds (visitors, id) {
  for (let visit of visitors) {
    if (visit[1] === id) return 0
  }
  return 1
}

module.exports = checkVisitIds;