//generates random 6 char string for id and cookie
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

// return urls of a user
const urlsForUser = (id, data) => {
  let usersURLS = {};
  for (let key in data) {
    if (data[key].userID === id) {
      usersURLS[key] = data[key];
    }
  }
  return usersURLS;
};

// check if visiter  is a unique visiter.
const isUnique = (arr, string) => {
  if (!string) return false;
  if (arr.length === 0) return false;

  let result = arr.map(item => item === string);
  return result.length === 0;
};

//export
module.exports.randomUrl = generateRandomString;
module.exports.urlsForUser = urlsForUser;
module.exports.isUnique = isUnique;
