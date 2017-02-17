function generateRandomString(urls) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const shortUrlArr = [];

  for (let i = 0; i < 6; i++) {
    shortUrlArr.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }

  if (Array.isArray(urls) && urls.indexOf(shortUrlArr.join("")) !== -1) {
    return generateRandomString(urls);
  } else if (!Array.isArray(urls) && urls[shortUrlArr.join("")]) {
    return generateRandomString(urls);
  } else {
    return shortUrlArr.join("");
  }
}

module.exports = generateRandomString;