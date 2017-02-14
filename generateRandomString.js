function generateRandomString() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const shortUrlArr = [];

  for (let i = 0; i < 6; i++) {
    shortUrlArr.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }
  return shortUrlArr.join("")
}

module.exports = generateRandomString;