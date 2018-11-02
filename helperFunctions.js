const generateRandomString = () => {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  let index = 6;
  while (index--) {
    let randomNum = Math.floor(Math.random() * Math.floor(chars.length));
    var randomChar = chars[randomNum];
    randomString += randomChar;
  }
  return randomString;
};
const urlsForUser = (id, data) => {
  let usersURLS = {};
  for (let key in data) {
    if (data[key].userID === id) {
      usersURLS[key] = data[key];
    }
  }
  return usersURLS;
};
module.exports.randomUrl = generateRandomString;
module.exports.urlsForUser = urlsForUser;
