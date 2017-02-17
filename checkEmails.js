function checkEmails (users, email) {
  for (let key of Object.keys(users)) {
    if (users[key]['email'] === email) return key
  }
  return false
}

module.exports = checkEmails;